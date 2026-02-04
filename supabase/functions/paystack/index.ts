import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Plan configurations (amounts in kobo for NGN)
const PLANS = {
  pro: {
    name: 'Pro',
    amount: 1900, // $19 in cents (will be converted based on currency)
    interval: 'monthly',
    description: 'Unlimited proposals, templates, and branding'
  },
  agency: {
    name: 'Agency',
    amount: 4900, // $49 in cents
    interval: 'monthly',
    description: 'Everything in Pro plus team features and priority support'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY is not configured');
    return new Response(
      JSON.stringify({ error: 'Payment service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase environment variables not configured');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    if (path === 'initialize') {
      // Initialize a subscription payment
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { plan, email, callback_url } = await req.json();
      
      if (!plan || !PLANS[plan as keyof typeof PLANS]) {
        return new Response(
          JSON.stringify({ error: 'Invalid plan selected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const selectedPlan = PLANS[plan as keyof typeof PLANS];
      const reference = `sub_${userId}_${plan}_${Date.now()}`;

      console.log(`Initializing payment for user ${userId}, plan: ${plan}`);

      // Initialize Paystack transaction
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: selectedPlan.amount * 100, // Convert to kobo/cents
          currency: 'USD',
          reference,
          callback_url: callback_url || `${url.origin}/paystack/verify`,
          metadata: {
            user_id: userId,
            plan,
            custom_fields: [
              {
                display_name: 'Plan',
                variable_name: 'plan',
                value: selectedPlan.name
              }
            ]
          },
          // Enable subscription
          plan: plan, // This will be a plan code if we create plans in Paystack
          channels: ['card'],
        }),
      });

      const paystackData = await paystackResponse.json();
      console.log('Paystack initialize response:', paystackData);

      if (!paystackData.status) {
        return new Response(
          JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create pending subscription record
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: plan,
        status: 'pending',
      }, { onConflict: 'user_id' });

      return new Response(
        JSON.stringify({
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === 'verify') {
      // Verify a transaction
      const { reference } = await req.json();
      
      if (!reference) {
        return new Response(
          JSON.stringify({ error: 'Reference is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Verifying transaction: ${reference}`);

      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      const verifyData = await verifyResponse.json();
      console.log('Paystack verify response:', verifyData);

      if (!verifyData.status || verifyData.data.status !== 'success') {
        return new Response(
          JSON.stringify({ error: 'Payment verification failed', details: verifyData }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { metadata, customer, amount } = verifyData.data;
      const userIdFromMeta = metadata?.user_id;
      const plan = metadata?.plan;

      if (!userIdFromMeta || !plan) {
        return new Response(
          JSON.stringify({ error: 'Invalid transaction metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate subscription period (1 month from now)
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Update subscription to active
      const { error: subError } = await supabase.from('subscriptions').upsert({
        user_id: userIdFromMeta,
        plan: plan,
        status: 'active',
        paystack_customer_code: customer?.customer_code,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'user_id' });

      if (subError) {
        console.error('Error updating subscription:', subError);
      }

      // Record payment
      await supabase.from('payment_history').insert({
        user_id: userIdFromMeta,
        amount: amount / 100,
        currency: 'USD',
        status: 'success',
        paystack_reference: reference,
        paystack_transaction_id: verifyData.data.id?.toString(),
      });

      // Update profile
      await supabase.from('profiles').update({
        is_premium: true,
        subscription_plan: plan,
      }).eq('user_id', userIdFromMeta);

      return new Response(
        JSON.stringify({ success: true, plan, status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === 'subscription') {
      // Get current subscription status
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      return new Response(
        JSON.stringify({ subscription: subscription || { plan: 'free', status: 'active' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === 'cancel') {
      // Cancel subscription
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase.from('subscriptions').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      }).eq('user_id', userId);

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to cancel subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update profile
      await supabase.from('profiles').update({
        is_premium: false,
        subscription_plan: 'free',
      }).eq('user_id', userId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === 'webhook') {
      // Handle Paystack webhooks
      const payload = await req.json();
      const event = payload.event;

      console.log('Webhook received:', event);

      if (event === 'subscription.disable') {
        const customerCode = payload.data?.customer?.customer_code;
        if (customerCode) {
          await supabase.from('subscriptions').update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          }).eq('paystack_customer_code', customerCode);
        }
      }

      if (event === 'charge.success') {
        const metadata = payload.data?.metadata;
        if (metadata?.user_id) {
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await supabase.from('subscriptions').update({
            status: 'active',
            current_period_end: periodEnd.toISOString(),
          }).eq('user_id', metadata.user_id);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in paystack function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
