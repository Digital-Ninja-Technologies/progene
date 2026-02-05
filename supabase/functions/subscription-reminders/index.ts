import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase environment variables not configured');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const resend = new Resend(RESEND_API_KEY);

  try {
    // Get subscriptions expiring in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    console.log('Checking for subscriptions expiring between now and', threeDaysFromNow.toISOString());

    // Get active subscriptions that will expire soon
    const { data: expiringSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan,
        status,
        current_period_end
      `)
      .eq('status', 'active')
      .neq('plan', 'free')
      .lte('current_period_end', threeDaysFromNow.toISOString())
      .gte('current_period_end', new Date().toISOString());

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expiring subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailsSent = 0;
    const errors: string[] = [];

    for (const subscription of expiringSubscriptions) {
      // Get user profile with email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', subscription.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.error(`No profile/email found for user ${subscription.user_id}`);
        continue;
      }

      const expiryDate = new Date(subscription.current_period_end!);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      const planName = subscription.plan === 'pro' ? 'Pro' : 'Agency';
      const planPrice = subscription.plan === 'pro' ? '₦15,000' : '₦35,000';

      const urgencyText = daysUntilExpiry <= 1 
        ? 'expires tomorrow' 
        : `expires in ${daysUntilExpiry} days`;

      console.log(`Sending reminder to ${profile.email} - ${planName} plan ${urgencyText}`);

      try {
        const { error: emailError } = await resend.emails.send({
          from: 'Progene <noreply@resend.dev>',
          to: [profile.email],
          subject: `Your ${planName} subscription ${urgencyText}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Renewal Reminder</h1>
              </div>
              
              <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Hi ${profile.full_name || 'there'},</p>
                
                <p style="font-size: 16px;">
                  Your <strong>${planName}</strong> subscription ${urgencyText} on 
                  <strong>${expiryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Subscription Details</h3>
                  <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
                  <p style="margin: 5px 0;"><strong>Price:</strong> ${planPrice}/month</p>
                  <p style="margin: 5px 0;"><strong>Expiry:</strong> ${expiryDate.toLocaleDateString()}</p>
                </div>
                
                <p style="font-size: 16px;">
                  To continue enjoying unlimited proposals, custom branding, and all premium features, 
                  please ensure your payment method is up to date.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://progene.lovable.app/settings?tab=billing" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Manage Subscription
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  If you have any questions or need assistance, feel free to reach out to our support team.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  You're receiving this email because you have an active subscription with Progene.
                  <br>
                  © ${new Date().getFullYear()} Progene. All rights reserved.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          errors.push(`${profile.email}: ${emailError.message}`);
        } else {
          emailsSent++;
          console.log(`Successfully sent reminder to ${profile.email}`);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Error sending email to ${profile.email}:`, errorMessage);
        errors.push(`${profile.email}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reminder check complete',
        total: expiringSubscriptions.length,
        sent: emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in subscription-reminders function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
