import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 submissions per hour
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Initialize Supabase client with service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit
    const { data: rateLimitCount, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
      p_identifier: clientIP,
      p_action: "contact_form",
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue without rate limiting if there's an error
    } else if (rateLimitCount > RATE_LIMIT_MAX_REQUESTS) {
      console.warn("Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
      console.error("Field length exceeded");
      return new Response(
        JSON.stringify({ error: "Field length exceeded" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending contact email from:", email, "Subject:", subject);

    // Store the submission in the database
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        subject,
        message,
        status: "new",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Error storing contact submission:", dbError);
      // Continue with email sending even if DB insert fails
    } else {
      console.log("Contact submission stored with ID:", submission?.id);
    }

    // HTML escape helper for email content
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Send email to the business owner
    const ownerEmailResponse = await resend.emails.send({
      from: "ProposalGene Contact <onboarding@resend.dev>",
      to: ["Ifeoluwa.designs@gmail.com"],
      reply_to: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
                New Contact Form Submission
              </h1>
              
              <div style="margin-bottom: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">From:</p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin: 0;">
                  ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;
                </p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Subject:</p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 500; margin: 0;">
                  ${escapeHtml(subject)}
                </p>
              </div>
              
              <div style="margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Message:</p>
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px;">
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${escapeHtml(message)}
                  </p>
                </div>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <a href="mailto:${escapeHtml(email)}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                  Reply to ${escapeHtml(name)}
                </a>
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              This email was sent from the ProposalGene contact form.
            </p>
          </body>
        </html>
      `,
    });

    console.log("Contact email sent to owner:", ownerEmailResponse);

    // Send confirmation email to the sender
    const confirmationEmailResponse = await resend.emails.send({
      from: "ProposalGene <onboarding@resend.dev>",
      to: [email],
      subject: `We received your message: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 50%; line-height: 64px; font-size: 28px;">
                  ✓
                </div>
              </div>
              
              <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px; text-align: center;">
                Thanks for reaching out, ${escapeHtml(name)}!
              </h1>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                We've received your message and will get back to you as soon as possible, typically within 24-48 hours.
              </p>
              
              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">
                  Your Message
                </h2>
                
                <div style="margin-bottom: 16px;">
                  <p style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Subject:</p>
                  <p style="color: #1f2937; font-size: 15px; font-weight: 500; margin: 0;">
                    ${escapeHtml(subject)}
                  </p>
                </div>
                
                <div>
                  <p style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">Message:</p>
                  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                    ${escapeHtml(message)}
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                  In the meantime, feel free to explore what ProposalGene can do for you:
                </p>
                <a href="https://progene.lovable.app" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                  Visit ProposalGene
                </a>
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              This is an automated confirmation from ProposalGene. Please don't reply to this email.
            </p>
          </body>
        </html>
      `,
    });

    console.log("Confirmation email sent to sender:", confirmationEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      ownerEmail: ownerEmailResponse,
      confirmationEmail: confirmationEmailResponse 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);