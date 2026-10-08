import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Daraja STK callback — no user JWT; Safaricom calls this endpoint.
// Trust is established by matching the CheckoutRequestID to a pending payment row.

interface CallbackItem { Name: string; Value?: string | number }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    const cb = payload?.Body?.stkCallback
    if (!cb?.CheckoutRequestID) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: payment } = await admin
      .from('mpesa_payments')
      .select('*')
      .eq('checkout_request_id', cb.CheckoutRequestID)
      .single()

    if (!payment || payment.status !== 'pending') {
      // Unknown or already processed — ack so Daraja stops retrying
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (cb.ResultCode !== 0) {
      await admin.from('mpesa_payments').update({
        status: 'failed',
        result_desc: String(cb.ResultDesc ?? 'Failed'),
      }).eq('id', payment.id)

      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Success — extract receipt
    const items: CallbackItem[] = cb.CallbackMetadata?.Item ?? []
    const get = (name: string) => items.find((i) => i.Name === name)?.Value
    const receipt = String(get('MpesaReceiptNumber') ?? '')
    const paidAmount = Number(get('Amount') ?? 0)

    if (paidAmount < payment.price_kes) {
      await admin.from('mpesa_payments').update({
        status: 'failed',
        mpesa_receipt: receipt,
        result_desc: `Amount mismatch: paid ${paidAmount}, expected ${payment.price_kes}`,
      }).eq('id', payment.id)

      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await admin.from('mpesa_payments').update({
      status: 'success',
      mpesa_receipt: receipt,
      result_desc: String(cb.ResultDesc ?? 'Success'),
    }).eq('id', payment.id)

    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + payment.duration_days * 24 * 60 * 60 * 1000)

    if (payment.kind === 'boost' && payment.listing_id) {
      await admin.from('boost_purchases').insert({
        listing_id: payment.listing_id,
        user_id: payment.user_id,
        package: payment.plan_name,
        price_kes: payment.price_kes,
        starts_at: startsAt.toISOString(),
        expires_at: endsAt.toISOString(),
        mpesa_receipt: receipt,
      })
      await admin.from('listings').update({ boost_expires_at: endsAt.toISOString() }).eq('id', payment.listing_id)
    } else if (payment.kind === 'subscription') {
      // Find or create the matching plan, then activate the subscription
      let planId: string | null = null
      const { data: plan } = await admin
        .from('subscription_plans')
        .select('id')
        .eq('tier', payment.plan_name)
        .maybeSingle()
      if (plan) {
        planId = plan.id
      } else {
        const VALID_ROLES = ['tenant', 'landlord', 'agency', 'host', 'service_provider']
        const planRole = VALID_ROLES.includes(payment.role) ? payment.role : 'tenant'
        const { data: newPlan } = await admin.from('subscription_plans').insert({
          role: planRole,
          tier: payment.plan_name,
          price_kes: payment.price_kes,
        }).select('id').single()
        planId = newPlan?.id ?? null
      }
      if (planId) {
        // Expire any current active subscription for this user, then activate the new one
        await admin.from('subscriptions')
          .update({ status: 'expired' })
          .eq('user_id', payment.user_id)
          .eq('status', 'active')
        await admin.from('subscriptions').insert({
          user_id: payment.user_id,
          plan_id: planId,
          status: 'active',
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          mpesa_receipt: receipt,
        })
      }
    }

    // Notify the user
    await admin.from('notifications').insert({
      user_id: payment.user_id,
      type: 'payment',
      title: 'Payment confirmed',
      body: `${payment.plan_name} activated. Receipt ${receipt}.`,
      deep_link: payment.kind === 'boost' ? `/listing/${payment.listing_id}` : '/settings/subscription',
    })

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    // Always 200 to Daraja so it doesn't retry malformed payloads forever
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
