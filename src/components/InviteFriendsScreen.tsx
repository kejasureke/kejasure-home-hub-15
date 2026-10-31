import { ArrowLeft, Gift, Copy, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { haptic } from "@/lib/despia";

const InviteFriendsScreen = ({ onBack }: { onBack: () => void }) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  useHardwareBack(true, triggerClose);
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ joined: 0, rewarded: 0 });
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.rpc("my_referral_code");
      if (c) setCode(String(c));
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsBusiness((roles ?? []).some((r) => ["landlord", "agency", "host", "service_provider"].includes(r.role as string)));
      const { data } = await supabase.from("referrals").select("status").eq("referrer_id", u.user.id);
      setStats({ joined: data?.length ?? 0, rewarded: data?.filter((r) => r.status === "rewarded").length ?? 0 });
    })();
  }, []);

  const link = code ? `https://kejasureapp.lovable.app/?ref=${code}` : "";
  const text = `Natafuta keja bila scams? Join KejaSure, verified people only. ${link}`;

  const share = async () => {
    haptic("light");
    try {
      if (navigator.share) await navigator.share({ title: "KejaSure", text });
      else { await navigator.clipboard.writeText(text); toast.success("Invite copied"); }
    } catch {}
  };

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 pb-3 pt-safe-compact flex items-center gap-3">
        <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">Invite friends</h1>
      </div>

      <div className="px-4 py-6 pb-32 space-y-5">
        <div className="p-5 rounded-3xl gradient-trust text-primary-foreground text-center">
          <Gift className="w-10 h-10 mx-auto mb-2" />
          <p className="text-lg font-bold">{isBusiness ? "Free boosts & free months" : "Get a free 24h pass"}</p>
          <p className="text-xs opacity-90 mt-1">For every friend who joins with your link and buys any plan. No limit.</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
          <p className="text-xs font-bold">What you earn</p>
          {isBusiness ? (
            <>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tenant buys 24 Hours</span><span className="font-semibold">6h free boost</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tenant buys 3 Days</span><span className="font-semibold">12h free boost</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tenant buys 7 Days</span><span className="font-semibold">24h free boost</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Landlord, agency, host or provider subscribes</span><span className="font-semibold text-accent">1 free month</span></div>
            </>
          ) : (
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Any friend buys a plan</span><span className="font-semibold">Free 24h pass</span></div>
          )}
          <p className="text-[10px] text-muted-foreground pt-1">
            {isBusiness ? "Boosts go to your newest live listing — or are saved for your next one. " : ""}Anyone can invite anyone. Your friend signs up with their phone number as usual, picks their role, and the reward lands the moment they pay.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-[11px] text-muted-foreground mb-1">Your invite code</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold tracking-widest">{code || "••••••••"}</p>
            <button
              onClick={async () => { await navigator.clipboard.writeText(link); haptic("success"); toast.success("Link copied"); }}
              disabled={!code}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
              aria-label="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button onClick={share} disabled={!code} className="w-full h-12 rounded-xl gradient-trust text-sm font-bold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50">
          <Share2 className="w-4 h-4" /> Share invite
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Users className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{stats.joined}</p>
            <p className="text-[10px] text-muted-foreground">Friends joined</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Gift className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-xl font-bold">{stats.rewarded}</p>
            <p className="text-[10px] text-muted-foreground">Rewards earned</p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          A pass only counts once your friend pays for a plan. Signing up alone doesn't earn one.
        </p>
      </div>
    </div>
  );
};

export default InviteFriendsScreen;
