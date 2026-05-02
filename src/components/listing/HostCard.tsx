import { ShieldCheck, Clock, Home, MessageCircle, Lock } from "lucide-react";
import type { Property } from "@/data/mockData";

interface HostCardProps {
  property: Property;
}

// Deterministic mock host derived from property id
const FIRST = ["James", "Mary", "Peter", "Grace", "David", "Faith", "Samuel", "Joy", "Brian", "Mercy"];
const LAST = ["Mwangi", "Otieno", "Wanjiku", "Kamau", "Achieng", "Njoroge", "Hassan", "Kiprop", "Akinyi", "Mutua"];
const AVATARS = ["👨🏾", "👩🏾", "🧑🏾", "👨🏿", "👩🏿"];

const hashCode = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const HostCard = ({ property }: HostCardProps) => {
  const h = hashCode(property.id);
  const first = FIRST[h % FIRST.length];
  const last = LAST[(h >> 3) % LAST.length];
  const avatar = AVATARS[(h >> 5) % AVATARS.length];
  const listingsCount = 1 + (h % 12);
  const memberYear = 2019 + (h % 6);
  const isAgency = listingsCount >= 6;
  const displayName = isAgency ? `${last} Properties` : `${first} ${last}`;

  return (
    <div className="mb-5 p-4 rounded-2xl bg-card card-shadow border border-border">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl shrink-0">
          {isAgency ? "🏢" : avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            {property.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isAgency ? "Verified Agency" : "Hosted by"} · Member since {memberYear}
          </p>
        </div>
        <button
          disabled
          title="Contact available after booking is accepted"
          className="px-3 py-2 rounded-xl bg-muted text-[11px] font-semibold text-muted-foreground flex items-center gap-1 cursor-not-allowed"
        >
          <Lock className="w-3 h-3" />
          Message
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <Home className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-[11px] font-semibold">{listingsCount}</p>
          <p className="text-[9px] text-muted-foreground">Listings</p>
        </div>
        <div className="text-center">
          <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-[11px] font-semibold">{property.landlordResponseTime}</p>
          <p className="text-[9px] text-muted-foreground">Response</p>
        </div>
        <div className="text-center">
          <MessageCircle className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
          <p className="text-[11px] font-semibold capitalize">{property.landlordResponseSpeed}</p>
          <p className="text-[9px] text-muted-foreground">Speed</p>
        </div>
      </div>
    </div>
  );
};

export default HostCard;
