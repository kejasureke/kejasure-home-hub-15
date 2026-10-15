import { supabase } from "@/integrations/supabase/client";

const KEY = "kejasure_pending_ref";

/** Remember ?ref=CODE from an invite link until the user has an account. */
export function captureReferralFromUrl() {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[A-Za-z0-9]{8}$/.test(ref)) localStorage.setItem(KEY, ref.toUpperCase());
  } catch {}
}

/** Link the signed-in user to their inviter once. Safe to call repeatedly. */
export async function claimPendingReferral() {
  const code = localStorage.getItem(KEY);
  if (!code) return;
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return;
  const { error } = await supabase.rpc("claim_referral", { _code: code });
  if (!error) localStorage.removeItem(KEY);
}

captureReferralFromUrl();
supabase.auth.onAuthStateChange((_e, session) => {
  if (session) setTimeout(() => { claimPendingReferral(); }, 0);
});
