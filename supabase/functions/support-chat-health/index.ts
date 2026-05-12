// Health check for the support-chat agent deployment.
// - Verifies required env vars
// - Pings Lovable AI gateway with a tiny prompt
// - Verifies DB connectivity (support_chat_logs reachable)
// - Logs failures to support_chat_logs (status='health_*')
// Public endpoint (safe: no user data, no secrets returned).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL_ID = "google/gemini-2.5-flash";
const HEALTH_PROMPT = "Reply with the single word: OK";
const AI_TIMEOUT_MS = 10_000;

type CheckResult = {
  name: string;
  ok: boolean;
  latency_ms: number;
  detail?: string;
};

async function pingAI(apiKey: string): Promise<CheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [{ role: "user", content: HEALTH_PROMPT }],
        max_tokens: 16,
      }),
    });
    const latency_ms = Date.now() - start;
    if (!res.ok) {
      const text = (await res.text()).slice(0, 500);
      return { name: "ai_gateway", ok: false, latency_ms, detail: `${res.status}: ${text}` };
    }
    const json = await res.json();
    const reply = (json.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) {
      return { name: "ai_gateway", ok: false, latency_ms, detail: "empty reply" };
    }
    return { name: "ai_gateway", ok: true, latency_ms, detail: reply.slice(0, 100) };
  } catch (e) {
    return {
      name: "ai_gateway",
      ok: false,
      latency_ms: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(t);
  }
}

async function pingDB(admin: ReturnType<typeof createClient>): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await admin
      .from("support_chat_logs")
      .select("id", { count: "exact", head: true })
      .limit(1);
    const latency_ms = Date.now() - start;
    if (error) return { name: "database", ok: false, latency_ms, detail: error.message };
    return { name: "database", ok: true, latency_ms };
  } catch (e) {
    return {
      name: "database",
      ok: false,
      latency_ms: Date.now() - start,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const startedAt = Date.now();
  const requestId =
    (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `health-${Date.now()}`;
  const checks: CheckResult[] = [];

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("LOVABLE_API_KEY");

  // Env check
  const envOk = Boolean(supabaseUrl && serviceKey && apiKey);
  checks.push({
    name: "env",
    ok: envOk,
    latency_ms: 0,
    detail: envOk
      ? "all secrets present"
      : [
          !supabaseUrl && "SUPABASE_URL",
          !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
          !apiKey && "LOVABLE_API_KEY",
        ]
          .filter(Boolean)
          .join(", ") + " missing",
  });

  let admin: ReturnType<typeof createClient> | null = null;
  if (supabaseUrl && serviceKey) {
    admin = createClient(supabaseUrl, serviceKey);
    checks.push(await pingDB(admin));
  } else {
    checks.push({ name: "database", ok: false, latency_ms: 0, detail: "skipped (no env)" });
  }

  if (apiKey) {
    checks.push(await pingAI(apiKey));
  } else {
    checks.push({ name: "ai_gateway", ok: false, latency_ms: 0, detail: "skipped (no env)" });
  }

  const overallOk = checks.every((c) => c.ok);
  const totalMs = Date.now() - startedAt;

  // Log failures (and a heartbeat on success) to support_chat_logs for auditing
  if (admin) {
    try {
      const failed = checks.filter((c) => !c.ok);
      await admin.from("support_chat_logs").insert({
        request_id: requestId,
        status: overallOk ? "health_ok" : "health_failed",
        model: MODEL_ID,
        latency_ms: totalMs,
        error_message: failed.length
          ? failed.map((c) => `${c.name}: ${c.detail ?? "failed"}`).join(" | ")
          : null,
        metadata: { checks, source: "support-chat-health" },
      });
    } catch (e) {
      console.error("health log insert failed", e);
    }
  }

  return new Response(
    JSON.stringify({
      ok: overallOk,
      requestId,
      checkedAt: new Date().toISOString(),
      totalLatencyMs: totalMs,
      checks,
    }),
    {
      status: overallOk ? 200 : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
