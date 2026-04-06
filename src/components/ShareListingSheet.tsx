import { X, Copy, MessageCircle, Share2, Check } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/mockData";

interface ShareListingSheetProps {
  property: Property;
  onClose: () => void;
}

const ShareListingSheet = ({ property, onClose }: ShareListingSheetProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://kejasure.co.ke/listing/${property.id}`;
  const shareText = `Check out this property on KejaSure: ${property.title} - KES ${new Intl.NumberFormat("en-KE").format(property.price)}${property.priceUnit} in ${property.estate}, ${property.county}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { label: "WhatsApp", icon: "💬", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`) },
    { label: "Twitter/X", icon: "🐦", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`) },
    { label: "Facebook", icon: "📘", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`) },
    { label: "SMS", icon: "📱", action: () => window.open(`sms:?body=${encodeURIComponent(shareText + " " + shareUrl)}`) },
    { label: "Email", icon: "📧", action: () => window.open(`mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-h-[80vh] overflow-y-auto bg-card rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-1">Share Listing</h3>
        <p className="text-xs text-muted-foreground mb-5 line-clamp-1">{property.title}</p>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {copied ? <Check className="w-5 h-5 text-trust" /> : <Copy className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{copied ? "Link Copied!" : "Copy Link"}</p>
            <p className="text-xs text-muted-foreground truncate">{shareUrl}</p>
          </div>
        </button>

        {/* Share options */}
        <div className="flex flex-wrap justify-around gap-3 pb-2">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="flex flex-col items-center gap-1.5 p-2"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
                {opt.icon}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShareListingSheet;
