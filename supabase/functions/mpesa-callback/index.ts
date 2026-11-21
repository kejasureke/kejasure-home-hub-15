import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Daraja STK callback — no user JWT; Safaricom calls this endpoint.
// The callback body is never trusted on its own: every result is confirmed with
// Safaricom's STK Push Query API before a payment is marked paid or failed.

interface CallbackItem { Name: string; Value?: string | number }

const DARAJA_BASE = 'https://api.safaricom.co.ke'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Ask Safaricom for the real result. Returns 'success' | 'failed' | null (not known yet). */
async function confirmWithSafaricom(checkoutRequestId: string): Promise<{ result: 'success' | 'failed' | null; desc?: string }> {
  const key = Deno.env.get('MPESA_CONSUMER_KEY')
  const secret = Deno.env.get('MPESA_CONSUMER_SECRET')
  const shortcode = Deno.env.get('MPESA_SHORTCODE')
  const passkey = Deno.env.get('MPESA_PASSKEY')
  if (!key || !secret || !shortcode || !passkey) return { result: null }

  const authRes = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: 'Basic ' + btoa(`${key}:${secret}`) },
  })
  if (!authRes.ok) return { result: null }
  const { access_token } = await authRes.json()

  for (let attempt = 0; attempt < 3; attempt++) {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const res = await fetch(`${DARAJA_BASE}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: btoa(`${shortcode}${passkey}${timestamp}`),
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && String(data.ResponseCode) === '0' && data.ResultCode !== undefined) {
      return String(data.ResultCode) === '0'
        ? { result: 'success', desc: data.ResultDesc }
        : { result: 'failed', desc: data.ResultDesc }
    }
    // Still processing or a temporary error: wait and ask again.
    await sleep(3000)
  }
  return { result: null }
}

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

    // Confirm the outcome with Safaricom; ignore what the request body claims.
    const confirmed = await confirmWithSafaricom(payment.checkout_request_id)
    if (confirmed.result === null) {
      // Could not confirm yet — leave the payment pending.
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (confirmed.result === 'failed') {
      await admin.from('mpesa_payments').update({
        status: 'failed',
        result_desc: String(confirmed.desc ?? 'Failed').slice(0, 200),
      }).eq('id', payment.id).eq('status', 'pending')

      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Confirmed paid. The amount charged was set by the server when the payment started.
    const items: CallbackItem[] = cb.CallbackMetadata?.Item ?? []
    const get = (name: string) => items.find((i) => i.Name === name)?.Value
    const receipt = String(get('MpesaReceiptNumber') ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 20)

    // Only one request can move this payment from pending to success.
    const { data: claimed } = await admin.from('mpesa_payments').update({
      status: 'success',
      mpesa_receipt: receipt || null,
      result_desc: String(confirmed.desc ?? 'Success').slice(0, 200),
    }).eq('id', payment.id).eq('status', 'pending').select('id')
    if (!claimed?.length) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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
      const name = String(payment.plan_name).toLowerCase()
      const boostKind = name.includes('silver') ? 'silver' : name.includes('gold') ? 'gold' : (name.includes('hot') ? 'hotdeal' : 'silver')
      await admin.from('listings').update({ boost_expires_at: endsAt.toISOString(), boost_kind: boostKind }).eq('id', payment.listing_id)
    } else if (payment.kind === 'subscription') {
      // Find the matching plan (plans are never created from payment data), then activate the subscription
      let planId: string | null = null
      // Tier names repeat across provider types ("Pro"), so match on role + tier.
      const ROLE_ALIASES: Record<string, string> = { stayhost: 'host', serviceprovider: 'service_provider' }
      const VALID_ROLES = ['tenant', 'landlord', 'agency', 'host', 'service_provider']
      const rawRole = ROLE_ALIASES[payment.role] ?? payment.role
      const planRole = VALID_ROLES.includes(rawRole) ? rawRole : 'tenant'
      const { data: plan } = await admin
        .from('subscription_plans')
        .select('id')
        .eq('role', planRole)
        .eq('tier', payment.plan_name)
        .maybeSingle()
      if (plan) {
        planId = plan.id
      } else {
        console.error('Paid plan not found', { paymentId: payment.id })
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
      body: receipt ? `${payment.plan_name} activated. Receipt ${receipt}.` : `${payment.plan_name} activated.`,
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
