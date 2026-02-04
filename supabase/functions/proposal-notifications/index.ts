import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  proposalId: string;
  type: "view" | "sign";
  clientSignature?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalId, type, clientSignature }: NotificationRequest = await req.json();

    if (!proposalId || !type) {
      throw new Error("Missing required fields: proposalId and type");
    }

    // SECURITY: First verify the proposal exists and is public using anon client
    // This prevents unauthorized access to private proposals and email spam attacks
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: proposalCheck, error: checkError } = await anonClient
      .from("proposals")
      .select("id, is_public, user_id")
      .eq("id", proposalId)
      .eq("is_public", true)
      .single();

    if (checkError || !proposalCheck) {
      console.error("Proposal not found or not public:", checkError);
      return new Response(
        JSON.stringify({ success: false, error: "Proposal not found or not public" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role for fetching additional data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the proposal with pricing details
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("id, project_type, pricing_result, user_id")
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      console.error("Error fetching proposal:", proposalError);
      throw new Error("Proposal not found");
    }

    // Fetch the proposal owner's profile to get their email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", proposal.user_id)
      .single();

    if (profileError || !profile?.email) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Could not find owner email");
    }

    // Get branding for personalization
    const { data: branding } = await supabase
      .from("branding_settings")
      .select("company_name")
      .eq("user_id", proposal.user_id)
      .single();

    const ownerEmail = profile.email;
    const ownerName = profile.full_name || "there";
    const companyName = branding?.company_name || "ProposalGene";
    const proposalValue = proposal.pricing_result?.recommendedPrice || 0;
    const projectType = proposal.project_type;

    let subject: string;
    let htmlContent: string;

    if (type === "view") {
      subject = `👀 Someone viewed your ${projectType} proposal`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📬 Proposal Viewed!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Hey ${ownerName}! 👋</p>
              <p style="font-size: 16px;">Great news! A potential client just viewed your <strong>${projectType}</strong> proposal worth <strong>$${proposalValue.toLocaleString()}</strong>.</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;">
                <p style="margin: 0; color: #666;">💡 <strong>Pro tip:</strong> Follow up within 24 hours while your proposal is fresh in their mind!</p>
              </div>
              <p style="font-size: 14px; color: #666;">Keep creating amazing proposals! 🚀</p>
              <p style="font-size: 14px; color: #666;">— The ${companyName} Team</p>
            </div>
          </body>
        </html>
      `;
    } else {
      // type === "sign"
      subject = `🎉 Your ${projectType} proposal was signed!`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2EB67D 0%, #36C5F0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Proposal Signed!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Congratulations, ${ownerName}! 🥳</p>
              <p style="font-size: 16px;">Your <strong>${projectType}</strong> proposal has been officially signed${clientSignature ? ` by <strong>${clientSignature.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong>` : ""}!</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Project Value</p>
                <p style="font-size: 32px; font-weight: bold; color: #2EB67D; margin: 0;">$${proposalValue.toLocaleString()}</p>
              </div>
              <div style="background: #fff3cd; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">📋 <strong>Next steps:</strong> Reach out to your client to discuss project kickoff and payment details.</p>
              </div>
              <p style="font-size: 14px; color: #666;">Here's to your success! 🚀</p>
              <p style="font-size: 14px; color: #666;">— The ${companyName} Team</p>
            </div>
          </body>
        </html>
      `;
    }

    // Send the email
    const { error: emailError } = await resend.emails.send({
      from: "ProposalGene <notifications@proposalgene.lovable.app>",
      to: [ownerEmail],
      subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log(`Successfully sent ${type} notification to ${ownerEmail} for proposal ${proposalId}`);

    return new Response(
      JSON.stringify({ success: true, message: `${type} notification sent` }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in proposal-notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
