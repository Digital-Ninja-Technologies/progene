import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: 30 requests per hour per user
    const { data: rateLimitCount } = await supabaseClient.rpc("check_rate_limit", {
      p_identifier: userData.user.id,
      p_action: "generate_scope",
      p_max_requests: 30,
      p_window_seconds: 3600,
    });

    if (rateLimitCount && rateLimitCount > 30) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { projectType, pages, cmsNeeded, integrations, animations, urgency, maintenance, scopeItems, tone } = await req.json();

    if (!projectType || typeof projectType !== "string") {
      return new Response(JSON.stringify({ error: "Project type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneGuides: Record<string, string> = {
      professional: "Use polished, formal language suitable for corporate clients. Confident and authoritative.",
      friendly: "Use warm, approachable, human language. Write like a real person, not a template. Avoid stiff corporate jargon.",
      conversational: "Use casual, plain-spoken language — as if talking to a peer over coffee. Contractions are welcome.",
      concise: "Keep every line short and punchy. Strip all filler words. Maximum signal, minimum words.",
    };
    const selectedTone = (typeof tone === "string" && toneGuides[tone]) ? tone : "professional";

    const systemPrompt = `You are a freelance project scope writer. Given project details, generate clear scope descriptions a freelancer can paste straight into a client proposal.

TONE: ${selectedTone.toUpperCase()} — ${toneGuides[selectedTone]}

Output: a JSON array of strings. Each string is one scope item, 1–2 sentences. Generate 8–12 items.

Rules:
- Sound human. Avoid robotic phrases like "leverage synergies", "robust solution", "cutting-edge". 
- Be specific about what the freelancer will actually deliver.
- Mention relevant technical details for the project type when useful, but never at the cost of clarity.
- Cover the full arc of the project (kickoff, design/strategy, build/execution, review, handoff).
- Write so a non-technical client can understand it.

Return ONLY a valid JSON array of strings. No prose, no markdown.`;

    const userPrompt = `Project Details:
- Type: ${projectType}
- Pages: ${pages}
- CMS Needed: ${cmsNeeded ? "Yes" : "No"}
- Integrations: ${integrations?.length > 0 ? integrations.join(", ") : "None"}
- Animations: ${animations ? "Yes" : "No"}
- Urgency: ${urgency}
- Maintenance included: ${maintenance ? "Yes" : "No"}
${scopeItems?.length > 0 ? `\nExisting scope items to expand:\n${scopeItems.map((s: string) => `- ${s}`).join("\n")}` : ""}

Generate detailed, professional scope items for this project proposal.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON array from the response
    let scopeResult: string[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      scopeResult = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      // Fallback: split by newlines if JSON parsing fails
      scopeResult = content.split("\n").filter((line: string) => line.trim().length > 0).map((line: string) => line.replace(/^[-•*]\s*/, "").trim());
    }

    return new Response(JSON.stringify({ scope: scopeResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-scope error:", error);
    const msg = error instanceof Error ? error.message : "";
    const safeMessages = ["AI service unavailable", "Rate limit exceeded. Please try again later."];
    const clientMessage = safeMessages.includes(msg) ? msg : "Failed to generate scope. Please try again.";
    return new Response(
      JSON.stringify({ error: clientMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
