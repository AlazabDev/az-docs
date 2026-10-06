import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GRAPH = "https://graph.facebook.com/v20.0";
const MEDIA_TYPES = ["document", "image", "video", "audio", "sticker"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const digits = (s?: string | null) => (s ?? "").replace(/\D/g, "").slice(-9);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  // Meta webhook verification
  if (req.method === "GET") {
    const ok = url.searchParams.get("hub.mode") === "subscribe" &&
      url.searchParams.get("hub.verify_token") === Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    return ok
      ? new Response(url.searchParams.get("hub.challenge") ?? "", { headers: corsHeaders })
      : new Response("Forbidden", { status: 403, headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  if (!token) return json({ error: "WHATSAPP_ACCESS_TOKEN missing" }, 500);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const { data: projects } = await supabase.from("projects").select("id, client_phone, status");
  let saved = 0;

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value ?? {};
      const contacts = value.contacts ?? [];
      for (const msg of value.messages ?? []) {
        const type = msg?.type;
        if (!MEDIA_TYPES.includes(type)) continue;
        const media = msg[type];
        if (!media?.id) continue;

        const { data: exists } = await supabase.from("files").select("id")
          .eq("source", "whatsapp").eq("source_reference", msg.id).maybeSingle();
        if (exists) continue;

        try {
          const metaRes = await fetch(`${GRAPH}/${media.id}`, { headers: { Authorization: `Bearer ${token}` } });
          const meta = await metaRes.json();
          if (!metaRes.ok || !meta.url) throw new Error(JSON.stringify(meta));
          const fileRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
          if (!fileRes.ok) throw new Error(`download ${fileRes.status}`);
          const blob = await fileRes.blob();

          const mime = media.mime_type ?? meta.mime_type ?? "application/octet-stream";
          const ext = mime.split("/")[1]?.split(";")[0] ?? "bin";
          const name = media.filename ?? `whatsapp-${type}-${msg.id.slice(-8)}.${ext}`;
          const match = projects?.find((p) => p.client_phone && digits(p.client_phone) === digits(msg.from) && p.status !== "cancelled");
          const folder = match?.id ?? "inbox";
          const path = `${folder}/${Date.now()}-${name.replace(/[^\w.\-\u0600-\u06FF]/g, "_")}`;

          const { error: upErr } = await supabase.storage.from("project-files").upload(path, blob, { contentType: mime });
          if (upErr) throw upErr;

          const sender = contacts.find((c: any) => c.wa_id === msg.from)?.profile?.name ?? null;
          const { data: file, error } = await supabase.from("files").insert({
            project_id: match?.id ?? null,
            name, file_url: path, file_type: mime, file_size: blob.size,
            source: "whatsapp", source_reference: msg.id,
            metadata: { from: msg.from, sender_name: sender, caption: media.caption ?? null },
          }).select().single();
          if (error) throw error;

          await supabase.from("activity_logs").insert({
            project_id: match?.id ?? null, file_id: file.id, action: "file_uploaded", source: "whatsapp",
            details: { fileName: name, from: msg.from, sender },
          });
          saved++;
        } catch (e) {
          console.error("whatsapp media error", msg.id, e);
        }
      }
    }
  }
  return json({ ok: true, saved });
});
