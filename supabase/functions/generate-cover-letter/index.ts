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
    const { jobDescription, userName, userSkills, refinePrompt, existingLetter } = await req.json();

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Job description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (jobDescription.length > 5000) {
      return new Response(JSON.stringify({ error: "Job description too long (max 5000 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userName && (typeof userName !== "string" || userName.length > 100)) {
      return new Response(JSON.stringify({ error: "Name too long (max 100 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userSkills && (typeof userSkills !== "string" || userSkills.length > 1000)) {
      return new Response(JSON.stringify({ error: "Skills description too long (max 1000 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (refinePrompt && (typeof refinePrompt !== "string" || refinePrompt.length > 2000)) {
      return new Response(JSON.stringify({ error: "Refinement prompt too long (max 2000 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingLetter && (typeof existingLetter !== "string" || existingLetter.length > 10000)) {
      return new Response(JSON.stringify({ error: "Existing letter too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("Lovable API key not configured");
      throw new Error("AI service unavailable");
    }

    const isRefine = refinePrompt && existingLetter;

    const systemPrompt = isRefine
      ? `You are a professional cover letter editor. The user has an existing cover letter and wants you to refine it based on their instructions. Apply the requested changes while maintaining professionalism and structure. Return ONLY the updated cover letter text, no extra commentary.`
      : `You are a professional cover letter writer. Given a job description, generate a compelling, personalized cover letter that:
- Is professional and well-structured with proper greeting, body paragraphs, and closing
- Highlights relevant skills and experience that match the job requirements
- Shows enthusiasm for the role and company
- Is concise (around 300-400 words)
- Uses a confident but not arrogant tone
- Includes placeholders like [Your Name], [Your Address], [Date], [Company Address] where personal details are needed
${userName ? `- Use the name "${userName}" instead of [Your Name]` : ""}
${userSkills ? `- Emphasize these skills/experience: ${userSkills}` : ""}

Return ONLY the cover letter text, no extra commentary.`;

    const userMessage = isRefine
      ? `Here is the current cover letter:\n\n${existingLetter}\n\nJob description for context:\n\n${jobDescription}\n\nPlease apply these changes:\n${refinePrompt}`
      : `Generate a cover letter for this job description:\n\n${jobDescription}`;

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
          { role: "user", content: userMessage },
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate cover letter" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Cover letter generation error:", e);
    const msg = e instanceof Error ? e.message : "";
    const safeMessages = ["AI service unavailable"];
    const clientMessage = safeMessages.includes(msg) ? msg : "Failed to generate cover letter. Please try again.";
    return new Response(
      JSON.stringify({ error: clientMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
