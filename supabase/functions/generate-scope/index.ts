import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { projectType, pages, cmsNeeded, integrations, animations, urgency, maintenance, scopeItems } = await req.json();

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

    const systemPrompt = `You are a professional freelance project scope writer. Given project details, generate clear, detailed, and professional scope descriptions that freelancers can use in client proposals.

Your output should be a JSON array of strings, where each string is a detailed scope item. Expand brief bullet points into professional, specific scope descriptions. Each item should be 1-2 sentences. Generate 8-12 scope items.

Focus on:
- Being specific about deliverables
- Using professional language
- Including technical details relevant to the project type
- Covering all aspects of the project (design, development, testing, deployment)

Return ONLY a valid JSON array of strings. No other text.`;

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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
