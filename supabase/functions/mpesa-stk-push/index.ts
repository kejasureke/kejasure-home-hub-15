import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3'

const BodySchema = z.object({
  kind: z.enum(['subscription', 'boost']),
  planName: z.string().min(1).max(100),
  role: z.string().max(50).optional(),
  price: z.number().int().positive().max(1_000_000),
  durationDays: z.number().int().positive().max(365),
  listingId: z.string().uuid().optional(),
  phone: z.string().regex(/^(?:\+?254|0)?(7|1)\d{8}$/, 'Invalid Kenyan phone number'),
})

const DARAJA_BASE = 'https://api.safaricom.co.ke'

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, '')
  if (p.startsWith('0')) p = '254' + p.slice(1)
  if (p.startsWith('7') || p.startsWith('1')) p = '254' + p
  return p
}

async function getAccessToken(key: string, secret: string): Promise<string> {
  const res = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: 'Basic ' + btoa(`${key}:${secret}`) },
  })
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Require a signed-in user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { kind, planName, role, price, durationDays, listingId, phone } = parsed.data

    // For boosts with a listing attached, verify the caller owns it
    if (kind === 'boost' && listingId) {
      const { data: listing } = await admin.from('listings').select('owner_id').eq('id', listingId).single()
      if (!listing || listing.owner_id !== user.id) {
        return new Response(JSON.stringify({ error: 'You can only boost your own listings' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const shortcode = Deno.env.get('MPESA_SHORTCODE')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
      return new Response(JSON.stringify({ error: 'M-Pesa is not configured yet' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const mpesaPhone = normalizePhone(phone)
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`

    const accessToken = await getAccessToken(consumerKey, consumerSecret)

    const stkRes = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: price,
        PartyA: mpesaPhone,
        PartyB: shortcode,
        PhoneNumber: mpesaPhone,
        CallBackURL: callbackUrl,
        AccountReference: `KejaSure ${planName}`.slice(0, 12),
        TransactionDesc: `KejaSure ${kind}: ${planName}`.slice(0, 13),
      }),
    })
    const stkData = await stkRes.json()

    if (!stkRes.ok || stkData.ResponseCode !== '0') {
      return new Response(JSON.stringify({ error: stkData.errorMessage || stkData.ResponseDescription || 'STK push rejected by M-Pesa' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Record the pending payment
    const { data: payment, error: insertErr } = await admin.from('mpesa_payments').insert({
      user_id: user.id,
      kind,
      plan_name: planName,
      role: role ?? null,
      price_kes: price,
      duration_days: durationDays,
      listing_id: listingId ?? null,
      phone: mpesaPhone,
      status: 'pending',
      merchant_request_id: stkData.MerchantRequestID,
      checkout_request_id: stkData.CheckoutRequestID,
    }).select('id').single()

    if (insertErr) throw insertErr

    return new Response(JSON.stringify({ paymentId: payment.id, checkoutRequestId: stkData.CheckoutRequestID }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unexpected error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
