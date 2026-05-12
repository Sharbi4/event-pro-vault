// Lovable AI support chat with auto-escalation to human via email.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ESCALATION_EMAIL = "atlasmom421@gmail.com";

const SYSTEM_PROMPT = `You are the friendly AI support agent for EventPro (Vendibook) — a marketplace where customers ("Bookers") book Event Pros (mobile food vendors, caterers, bartenders, dessert tables, taco trucks, etc.) for events.

You can confidently answer questions about how the website works, including: browsing, searching, booking, packages, pricing, fees, cancellations, refunds, deposits, payments (card or cash), payouts, disputes, reviews, messaging, accounts/auth, becoming an Event Pro, Stripe Connect onboarding, and the Learn Hub.

Core facts you MUST know:
- Platform fee is 12.9% (shown to Bookers as a service fee; deducted from Event Pros as commission).
- Cancellation policies (3 tiers chosen per package): Flexible, Standard (default), Strict.
  • Flexible: 48h+ full refund, 24–48h 50%, <24h no refund.
  • Standard: 7d+ full, 3–7d 50%, <72h no refund.
  • Strict: 14d+ full, 7–14d 50%, <7d no refund.
  Refund amounts always shown at checkout.
- Deposits are non-refundable except (a) Event Pro cancels (full refund), or (b) Booker cancels within 1 hour of booking AND event is 7+ days away.
- Platform fees: NOT refunded if Booker cancels; REFUNDED if Event Pro cancels.
- Payouts to Event Pros begin 24 hours after the event/booking ends (held to allow dispute window).
- Disputes: customers have a 24-hour window after event end to report issues; this pauses payout for admin review.
- Cash bookings: Booker pays the Event Pro directly at the event; refunds for cash bookings are between the two parties.
- Email/password and Google sign-in are supported. Verification email is sent on signup.
- Stripe Connect is required for Event Pros to receive online payouts.
- Messaging on-platform auto-masks phone numbers, emails, and URLs to keep transactions on EventPro.
- Helpful pages: /browse (find Event Pros), /learn (Learn Hub), /faq, /support, /cancellation-policy, /become-pro (start as an Event Pro), /dashboard (manage bookings).

Style:
- Be warm, concise, and specific. Use short paragraphs and bullet lists when helpful.
- Never invent prices, policies, or features that aren't documented above.
- Always link to /faq, /support, /learn, or /cancellation-policy when relevant.

ESCALATION POLICY:
You have one tool: escalate_to_human. Call it ONLY when:
1. The user explicitly asks to be connected to Event Pro Support, a specialist, or a representative.
2. The question involves a specific booking issue, refund dispute, payout problem, account access, or anything requiring private data you can't see.
3. You don't know the answer with confidence and a generic FAQ link won't solve it.

When you escalate, briefly tell the user "I've forwarded this to Event Pro Support — a specialist will follow up with you shortly." Do NOT promise specific response times. Never mention email addresses, inbox names, or internal routing details.`;

interface ChatRequest {
  message: string;
}

// ---- PII masking ----
// Mask emails, phone numbers, credit-card-like numbers, URLs, and long digit sequences
// before persisting any user/assistant content to the debug log.
function maskPII(input: string): string {
  if (!input) return input;
  let s = String(input);
  // Emails
  s = s.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
  // URLs (http/https/www)
  s = s.replace(/\b(?:https?:\/\/|www\.)[^\s]+/gi, "[url]");
  // Credit-card-like (13-19 digits, optional spaces/dashes)
  s = s.replace(/\b(?:\d[ -]?){13,19}\b/g, "[card]");
  // Phone numbers (international or local, 7-15 digits with separators)
  s = s.replace(/(?:\+?\d{1,3}[ .\-])?(?:\(?\d{2,4}\)?[ .\-]?)?\d{3,4}[ .\-]?\d{3,4}/g, (m) => {
    const digits = m.replace(/\D/g, "");
    return digits.length >= 7 ? "[phone]" : m;
  });
  // Long bare digit sequences (IDs, SSN-like)
  s = s.replace(/\b\d{7,}\b/g, "[number]");
  // Truncate very long content
  if (s.length > 4000) s = s.slice(0, 4000) + "…[truncated]";
  return s;
}

async function callLovableAI(messages: any[], tools: any[]) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      tools,
      tool_choice: "auto",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text}`);
  }
  return await res.json();
}

async function sendEscalationEmail(args: {
  userEmail: string;
  userName: string;
  userId: string;
  conversationId: string;
  reason: string;
  transcript: { role: string; content: string }[];
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.warn("Supabase env missing — escalation email skipped");
    return { ok: false, reason: "no_supabase_env" };
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({
      templateName: "support-escalation",
      recipientEmail: ESCALATION_EMAIL,
      replyTo: args.userEmail,
      data: {
        userName: args.userName,
        userEmail: args.userEmail,
        reason: args.reason,
        transcript: args.transcript,
        userId: args.userId,
        conversationId: args.conversationId,
      },
      idempotencyKey: `support-escalation-${args.conversationId}-${Date.now()}`,
      purpose: "transactional",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("send-transactional-email failed", res.status, text);
    return { ok: false, reason: text };
  }
  return { ok: true };
}

const MODEL_ID = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const requestId =
    (globalThis.crypto?.randomUUID?.() as string | undefined) ?? `req-${Date.now()}`;
  const startedAt = Date.now();

  const logCtx: {
    admin?: ReturnType<typeof createClient>;
    conversationId?: string;
    userId?: string;
    userMessage?: string;
    historyLength?: number;
  } = {};

  const writeLog = async (fields: Record<string, unknown>) => {
    try {
      if (!logCtx.admin) return;
      await logCtx.admin.from("support_chat_logs").insert({
        request_id: requestId,
        conversation_id: logCtx.conversationId ?? null,
        user_id: logCtx.userId ?? null,
        user_message_masked: logCtx.userMessage ? maskPII(logCtx.userMessage) : null,
        history_length: logCtx.historyLength ?? null,
        model: MODEL_ID,
        latency_ms: Date.now() - startedAt,
        ...fields,
      });
    } catch (e) {
      console.error("support_chat_logs insert failed", e);
    }
  };

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;
    const admin = createClient(supabaseUrl, serviceKey);
    logCtx.admin = admin;
    logCtx.userId = user.id;

    const body = (await req.json()) as ChatRequest;
    const userMessage = (body.message ?? "").toString().trim();
    if (!userMessage || userMessage.length > 4000) {
      await writeLog({ status: "invalid_input", error_message: "empty or oversize message" });
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    logCtx.userMessage = userMessage;

    // Ensure conversation exists (one per user)
    let { data: convo } = await admin
      .from("support_conversations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!convo) {
      const { data: created, error: createErr } = await admin
        .from("support_conversations")
        .insert({ user_id: user.id })
        .select("*")
        .single();
      if (createErr) throw createErr;
      convo = created;
    }
    logCtx.conversationId = convo.id;

    // Load last 20 messages for context
    const { data: history } = await admin
      .from("support_messages")
      .select("role, content")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true })
      .limit(20);

    logCtx.historyLength = (history ?? []).length;

    // Store user message
    await admin.from("support_messages").insert({
      conversation_id: convo.id,
      role: "user",
      content: userMessage,
    });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "escalate_to_human",
          description:
            "Forward this question to a human teammate via email when the AI cannot help confidently or the user asks for a human.",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "Short summary of why this needs a human and what the user wants.",
              },
            },
            required: ["reason"],
          },
        },
      },
    ];

    const aiStartedAt = Date.now();
    let aiRes: any;
    try {
      aiRes = await callLovableAI(messages, tools);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      await writeLog({
        status: "ai_error",
        error_message: errMsg,
        metadata: { aiLatencyMs: Date.now() - aiStartedAt },
      });
      throw e;
    }

    const aiLatencyMs = Date.now() - aiStartedAt;
    const choice = aiRes.choices?.[0];
    const toolCalls = choice?.message?.tool_calls ?? [];
    let assistantText: string = choice?.message?.content ?? "";
    let escalated = false;
    let escalationReason: string | null = null;
    const usage = aiRes.usage ?? {};

    if (toolCalls.length > 0) {
      const call = toolCalls[0];
      const reason = (() => {
        try { return JSON.parse(call.function.arguments || "{}").reason ?? "Manual escalation"; }
        catch { return "Manual escalation"; }
      })();
      escalationReason = reason;
      let deliveryStatus = "failed";
      let deliveryError: string | null = null;
      let deliveryMetadata: Record<string, unknown> = {};
      try {
        const transcript = messages
          .filter((m: any) => m.role !== "system")
          .map((m: any) => ({ role: m.role, content: String(m.content ?? "") }));

        const emailRes = await sendEscalationEmail({
          userEmail: user.email ?? "unknown",
          userName: (user.user_metadata?.full_name as string) || user.email || "User",
          userId: user.id,
          conversationId: convo.id,
          reason,
          transcript,
        });
        escalated = emailRes.ok;
        deliveryStatus = emailRes.ok ? "sent" : "failed";
        if (!emailRes.ok) deliveryError = String((emailRes as any).reason ?? "unknown");
        deliveryMetadata = { transcriptLength: transcript.length };
      } catch (e) {
        console.error("Escalation parse/send failed", e);
        deliveryError = e instanceof Error ? e.message : String(e);
      }

      // Audit log
      const { error: logErr } = await admin.from("support_escalations").insert({
        conversation_id: convo.id,
        user_id: user.id,
        user_email: user.email ?? null,
        reason,
        delivery_status: deliveryStatus,
        delivery_error: deliveryError,
        delivery_metadata: deliveryMetadata,
      });
      if (logErr) console.error("support_escalations insert failed", logErr);

      assistantText =
        assistantText ||
        "I've forwarded this to Event Pro Support — a specialist will follow up with you shortly. In the meantime, anything else I can help clarify?";

      await admin
        .from("support_conversations")
        .update({ escalated_at: new Date().toISOString() })
        .eq("id", convo.id);
    }

    // Store assistant reply
    await admin.from("support_messages").insert({
      conversation_id: convo.id,
      role: "assistant",
      content: assistantText,
      escalated,
    });

    await admin
      .from("support_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", convo.id);

    // Structured debug log (PII-masked)
    await writeLog({
      status: "ok",
      assistant_reply_masked: maskPII(assistantText),
      escalated,
      escalation_reason: escalationReason,
      prompt_tokens: usage.prompt_tokens ?? null,
      completion_tokens: usage.completion_tokens ?? null,
      total_tokens: usage.total_tokens ?? null,
      metadata: {
        aiLatencyMs,
        toolCallCount: toolCalls.length,
        finishReason: choice?.finish_reason ?? null,
        userMessageLength: userMessage.length,
      },
    });

    return new Response(
      JSON.stringify({ reply: assistantText, escalated, conversationId: convo.id, requestId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    const errMsg = err instanceof Error ? err.message : String(err);
    await writeLog({ status: "error", error_message: errMsg });
    return new Response(
      JSON.stringify({ error: errMsg, requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
