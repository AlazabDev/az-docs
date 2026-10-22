import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "npm:@aws-sdk/client-s3@3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BUCKET_RE = /^[a-z0-9][a-z0-9.\-]{1,61}[a-z0-9]$/;
const safePath = (p: string) => !p.includes("..") && !p.startsWith("/") && !p.includes("\0");

const s3 = new S3Client({
  endpoint: Deno.env.get("MINIO_ENDPOINT") ?? "https://minio.alazab.cloud",
  region: Deno.env.get("MINIO_REGION") ?? "us-east-1",
  credentials: {
    accessKeyId: Deno.env.get("MINIO_ACCESS_KEY")!,
    secretAccessKey: Deno.env.get("MINIO_SECRET_KEY")!,
  },
  forcePathStyle: true,
});

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list-buckets") }),
  z.object({
    action: z.literal("list"),
    bucket: z.string().regex(BUCKET_RE),
    prefix: z.string().max(1024).refine(safePath).optional().default(""),
  }),
  z.object({
    action: z.literal("url"),
    bucket: z.string().regex(BUCKET_RE),
    key: z.string().min(1).max(1024).refine(safePath),
    download: z.boolean().optional().default(false),
  }),
  z.object({
    action: z.literal("upload-url"),
    bucket: z.string().regex(BUCKET_RE),
    key: z.string().min(1).max(1024).refine(safePath),
    contentType: z.string().max(255).optional(),
  }),
  z.object({
    action: z.literal("delete"),
    bucket: z.string().regex(BUCKET_RE),
    key: z.string().min(1).max(1024).refine(safePath),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Require a signed-in employee
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth?.user) return json({ error: "يجب تسجيل الدخول" }, 401);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) return json({ error: "طلب غير صالح" }, 400);
  const cmd = parsed.data;

  try {
    switch (cmd.action) {
      case "list-buckets": {
        const res = await s3.send(new ListBucketsCommand({}));
        return json({
          buckets: (res.Buckets ?? []).map((b) => ({ name: b.Name, creationDate: b.CreationDate })),
        });
      }
      case "list": {
        const prefix = cmd.prefix === "" || cmd.prefix.endsWith("/") ? cmd.prefix : `${cmd.prefix}/`;
        const res = await s3.send(
          new ListObjectsV2Command({ Bucket: cmd.bucket, Prefix: prefix, Delimiter: "/", MaxKeys: 500 })
        );
        return json({
          prefix,
          folders: (res.CommonPrefixes ?? []).map((p) => p.Prefix).filter((p): p is string => !!p),
          objects: (res.Contents ?? [])
            .filter((o) => o.Key && o.Key !== prefix)
            .map((o) => ({ key: o.Key!, size: o.Size ?? 0, lastModified: o.LastModified ?? null })),
          truncated: !!res.IsTruncated,
        });
      }
      case "url": {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: cmd.bucket,
            Key: cmd.key,
            ...(cmd.download ? { ResponseContentDisposition: "attachment" } : {}),
          }),
          { expiresIn: 3600 }
        );
        return json({ url });
      }
      case "upload-url": {
        const url = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: cmd.bucket,
            Key: cmd.key,
            ...(cmd.contentType ? { ContentType: cmd.contentType } : {}),
          }),
          { expiresIn: 3600 }
        );
        return json({ url });
      }
      case "delete": {
        await s3.send(new DeleteObjectCommand({ Bucket: cmd.bucket, Key: cmd.key }));
        return json({ ok: true });
      }
    }
  } catch (e) {
    console.error("minio-storage error", e);
    const msg = e instanceof Error ? e.message : String(e);
    const notFound = /NoSuchBucket|The specified bucket does not exist/i.test(msg);
    return json(
      { error: notFound ? "هذا المجلد (الدلو) غير موجود في مخزن العزب" : "تعذر تنفيذ العملية على مخزن العزب" },
      notFound ? 404 : 500
    );
  }
});
