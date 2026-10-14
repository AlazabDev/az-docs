import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";
const DOC_TYPES = ["مخطط معماري", "مخطط إنشائي", "صورة موقع", "عقد", "فاتورة", "عرض سعر", "هوية/مستند شخصي", "رخصة/تصريح", "مراسلة", "أخرى"];
const RUN_HEADER = "X-Lovable-AIG-Run-ID";

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...extra, "Content-Type": "application/json" } });

const toBase64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "يجب تسجيل الدخول" }, 401);

  let fileId: string | undefined;
  try { fileId = (await req.json())?.fileId; } catch { /* ignore */ }
  if (typeof fileId !== "string" || !/^[0-9a-f-]{36}$/i.test(fileId)) return json({ error: "معرّف الملف غير صالح" }, 400);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "خدمة الذكاء الاصطناعي غير مفعلة" }, 500);

  const { data: file } = await userClient.from("files").select("*").eq("id", fileId).maybeSingle();
  if (!file) return json({ error: "الملف غير موجود" }, 404);
  const { data: projects } = await userClient.from("projects").select("id, name, client_name, client_phone, description, status");

  const { data: blob, error: dlErr } = await userClient.storage.from("project-files").download(file.file_url);
  if (dlErr || !blob) return json({ error: "تعذر تحميل الملف" }, 500);
  const mime = file.file_type || blob.type || "application/octet-stream";
  const tooBig = blob.size > 15 * 1024 * 1024;

  const meta = (file.metadata ?? {}) as Record<string, unknown>;
  const context = `اسم الملف: ${file.name}\nالنوع: ${mime}\nالمرسل: ${meta.sender_name ?? "غير معروف"} (${meta.from ?? "-"})\nالتعليق: ${meta.caption ?? "-"}\n\nالمشاريع المتاحة:\n${(projects ?? []).map((p) => `- id=${p.id} | ${p.name} | العميل: ${p.client_name} | هاتف: ${p.client_phone ?? "-"} | ${p.status} | ${p.description ?? ""}`).join("\n") || "لا توجد مشاريع"}`;

  const content: Record<string, unknown>[] = [{ type: "input_text", text: context }];
  if (!tooBig) {
    const b64 = toBase64(await blob.arrayBuffer());
    if (mime.startsWith("image/")) content.push({ type: "input_image", image_url: `data:${mime};base64,${b64}` });
    else if (mime === "application/pdf") content.push({ type: "input_file", filename: file.name, file_data: `data:${mime};base64,${b64}` });
    else if (mime.startsWith("text/")) content.push({ type: "input_text", text: (await blob.text()).slice(0, 20000) });
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["project_id", "document_type", "confidence", "summary", "reason"],
    properties: {
      project_id: { type: ["string", "null"], description: "id of the best matching project, or null" },
      document_type: { type: "string", enum: DOC_TYPES },
      confidence: { type: "number", description: "0 to 1" },
      summary: { type: "string", description: "ملخص قصير لمحتوى الملف بالعربية" },
      reason: { type: "string", description: "سبب اختيار المشروع ونوع المستند بالعربية" },
    },
  };

  const res = await fetch(GATEWAY, {
    method: "POST",
    signal: req.signal,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      instructions: "أنت مساعد أرشفة لشركة العزب للخدمات المعمارية. حلّل الملف الوارد من واتساب واقترح المشروع الأنسب من القائمة (طابق رقم المرسل مع هاتف العميل، أو الأسماء والمحتوى) ونوع المستند. إن لم يكن هناك تطابق واضح أعد project_id = null.",
      input: [{ role: "user", content }],
      text: { format: { type: "json_schema", name: "file_analysis", strict: true, schema } },
    }),
  });
  const runId = res.headers.get(RUN_HEADER);
  const extra = runId ? { [RUN_HEADER]: runId } : {};
  if (!res.ok || !res.body) {
    const t = await res.text();
    console.error("gateway", res.status, t);
    const msg = res.status === 429 ? "تم تجاوز حد الطلبات، حاول لاحقاً" : res.status === 402 ? "رصيد الذكاء الاصطناعي غير كافٍ" : "تعذر تحليل الملف";
    return json({ error: msg }, res.status, extra);
  }

  // Consume SSE stream server-side and collect the final text
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "", text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
        if (ev.type === "response.failed" || ev.type === "error") console.error("stream error", d);
      } catch { /* partial */ }
    }
  }

  let result: any;
  try { result = JSON.parse(text); } catch { return json({ error: "لم يتمكن النموذج من تحليل الملف" }, 502, extra); }
  if (result.project_id && !(projects ?? []).some((p) => p.id === result.project_id)) result.project_id = null;

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  await admin.from("files").update({ metadata: { ...meta, ai_analysis: { ...result, analyzed_at: new Date().toISOString() } } }).eq("id", fileId);

  return json(result, 200, extra);
});
