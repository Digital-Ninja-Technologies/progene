import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POLAR_API = "https://api.polar.sh/v1";

async function polarFetch(path: string, options: RequestInit = {}) {
  const token = Deno.env.get("POLAR_ACCESS_TOKEN");
  if (!token) throw new Error("POLAR_ACCESS_TOKEN not configured");

  const resp = await fetch(`${POLAR_API}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Polar API error ${resp.status}: ${body}`);
  }

  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    if (!data.user) throw new Error("Authentication required");

    // List existing products
    const products = await polarFetch("/products/?limit=50");
    const existingNames = products.items.map((p: any) => p.name);

    const results: any = { existing: existingNames, created: [] };

    // Create Pro benefit if needed
    let proBenefitId: string | null = null;
    let agencyBenefitId: string | null = null;

    const benefits = await polarFetch("/benefits/?limit=50");
    const existingBenefits = benefits.items;

    const proBenefit = existingBenefits.find((b: any) => b.description === "Pro Access");
    if (proBenefit) {
      proBenefitId = proBenefit.id;
    } else {
      const created = await polarFetch("/benefits/", {
        method: "POST",
        body: JSON.stringify({
          type: "custom",
          description: "Pro Access",
          properties: { note: "Unlocks unlimited proposals, all templates, custom branding, client portal, and analytics." },
        }),
      });
      proBenefitId = created.id;
    }

    const agencyBenefit = existingBenefits.find((b: any) => b.description === "Agency Access");
    if (agencyBenefit) {
      agencyBenefitId = agencyBenefit.id;
    } else {
      const created = await polarFetch("/benefits/", {
        method: "POST",
        body: JSON.stringify({
          type: "custom",
          description: "Agency Access",
          properties: { note: "Everything in Pro plus team collaboration, priority support, API access, and white-label exports." },
        }),
      });
      agencyBenefitId = created.id;
    }

    // Create Pro product if not exists
    if (!existingNames.includes("Pro")) {
      const pro = await polarFetch("/products/", {
        method: "POST",
        body: JSON.stringify({
          name: "Pro",
          description: "For growing freelancers — unlimited proposals, all templates, custom branding, client portal, and analytics.",
          prices: [{ type: "recurring", amount_type: "fixed", price_amount: 1500, price_currency: "usd", recurring_interval: "month" }],
        }),
      });
      // Attach benefit
      await polarFetch(`/products/${pro.id}/benefits`, {
        method: "POST",
        body: JSON.stringify({ benefits: [proBenefitId] }),
      });
      results.created.push({ name: "Pro", id: pro.id });
    }

    // Create Agency product if not exists
    if (!existingNames.includes("Agency")) {
      const agency = await polarFetch("/products/", {
        method: "POST",
        body: JSON.stringify({
          name: "Agency",
          description: "For teams and agencies — everything in Pro plus team collaboration, priority support, API access, and white-label exports.",
          prices: [{ type: "recurring", amount_type: "fixed", price_amount: 3500, price_currency: "usd", recurring_interval: "month" }],
        }),
      });
      await polarFetch(`/products/${agency.id}/benefits`, {
        method: "POST",
        body: JSON.stringify({ benefits: [agencyBenefitId] }),
      });
      results.created.push({ name: "Agency", id: agency.id });
    }

    // Return all product info
    const allProducts = await polarFetch("/products/?limit=50");
    results.products = allProducts.items.map((p: any) => ({
      id: p.id,
      name: p.name,
      prices: p.prices?.map((pr: any) => ({ id: pr.id, amount: pr.price_amount, currency: pr.price_currency, interval: pr.recurring_interval })),
    }));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POLAR-SETUP] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
