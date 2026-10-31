import { useState, useRef } from "react";
import { Copy, Check, Mail, MessageSquare, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { haptic } from "@/lib/despia";
import { translate } from "@/lib/language";

const APP_URL = "https://kejasureapp.lovable.app";
const APP_TEXT =
  "Pata Keja, Be Sure 🇰🇪 — I'm using KejaSure to find verified rentals across Kenya. Try it: ";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.465-1.21.288-1.91.198-.188 3.636-3.325 3.696-3.61.004-.027.006-.063-.027-.09a.25.25 0 00-.163-.055c-.078.003-.13.012-.196.03-.084.02-1.42.904-4.01 2.653-.38.26-.724.39-1.024.383-.337-.008-.986-.574-.903-1.174.05-.354.517-.72.92-1.012.59-.423 1.186-.86 1.803-1.302.87-.612 1.53-.99 2.07-1.002.063-.001.13 0 .197.003.667.028 1.936.408 2.686.77z" />
  </svg>
);

interface ShareKejaSureSheetProps {
  onClose: () => void;
}

const ShareKejaSureSheet = ({ onClose }: ShareKejaSureSheetProps) => {
  const { closing, triggerClose } = useOverlayClose(onClose);
  useHardwareBack(true, triggerClose);
  const [copied, setCopied] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragOffset = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const open = (url: string) => {
    haptic("light");
    window.open(url, "_blank", "noopener");
  };

  const copyLink = async () => {
    haptic("success");
    try {
      await navigator.clipboard.writeText(APP_URL);
    } catch {
      /* Clipboard can be blocked; the link is still on screen. */
    }
    setCopied(true);
    toast.success(translate("Link copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    haptic("light");
    if (!navigator.share) {
      copyLink();
      return;
    }
    try {
      await navigator.share({ title: "KejaSure", text: APP_TEXT + APP_URL, url: APP_URL });
    } catch {
      /* The person closed the system sheet. */
    }
  };

  const options = [
    {
      label: "WhatsApp",
      color: "bg-[#25D366] text-white",
      icon: <WhatsAppIcon className="w-[18px] h-[18px]" />,
      action: () => open(`https://wa.me/?text=${encodeURIComponent(APP_TEXT + APP_URL)}`),
    },
    {
      label: "X",
      color: "bg-black dark:bg-white dark:text-black text-white",
      icon: <XIcon className="w-[15px] h-[15px]" />,
      action: () =>
        open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(APP_TEXT)}&url=${encodeURIComponent(APP_URL)}`,
        ),
    },
    {
      label: "Facebook",
      color: "bg-[#1877F2] text-white",
      icon: <FacebookIcon className="w-[18px] h-[18px]" />,
      action: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`),
    },
    {
      label: "Telegram",
      color: "bg-[#229ED9] text-white",
      icon: <TelegramIcon className="w-[18px] h-[18px]" />,
      action: () => open(`https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(APP_TEXT)}`),
    },
    {
      label: "SMS",
      color: "bg-primary text-primary-foreground",
      icon: <MessageSquare className="w-[16px] h-[16px]" />,
      action: () => open(`sms:?body=${encodeURIComponent(APP_TEXT + APP_URL)}`),
    },
    {
      label: "Email",
      color: "bg-muted text-foreground",
      icon: <Mail className="w-[16px] h-[16px]" />,
      action: () =>
        open(
          `mailto:?subject=${encodeURIComponent("KejaSure")}&body=${encodeURIComponent(APP_TEXT + APP_URL)}`,
        ),
    },
    {
      label: translate("More"),
      color: "bg-secondary text-foreground",
      icon: <MoreHorizontal className="w-[18px] h-[18px]" />,
      action: nativeShare,
    },
  ];

  const onDragStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const onDragMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy <= 0) return;
    dragOffset.current = dy;
    if (sheetRef.current) sheetRef.current.style.transform = `translateY(${dy}px)`;
  };

  const onDragEnd = () => {
    const dy = dragOffset.current;
    dragStartY.current = null;
    dragOffset.current = 0;
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dy > 90) triggerClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end bg-foreground/40 backdrop-blur-sm ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={triggerClose}
    >
      <div
        ref={sheetRef}
        className={`w-full max-w-lg mx-auto bg-background rounded-t-3xl safe-bottom pb-4 transition-transform duration-200 ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center pt-3 pb-2 touch-none cursor-grab"
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-3" onTouchMove={onDragMove} onTouchEnd={onDragEnd}>
          <h3 className="text-base font-bold">{translate("Share KejaSure")}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {translate("Pick where to send it, or copy the link")}
          </p>
        </div>

        <div className="px-5 grid grid-cols-4 gap-y-4 gap-x-2 pb-4">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${opt.color}`}
              >
                {opt.icon}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={copyLink}
          className="mx-5 mb-2 w-[calc(100%-2.5rem)] flex items-center gap-3 p-3 rounded-xl bg-secondary active:bg-secondary/70"
        >
          <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {copied ? <Check className="w-4 h-4 text-trust" /> : <Copy className="w-4 h-4 text-primary" />}
          </span>
          <span className="flex-1 text-left min-w-0">
            <span className="block text-sm font-semibold">{copied ? translate("Link copied") : translate("Copy link")}</span>
            <span className="block text-[10px] text-muted-foreground truncate">{APP_URL}</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ShareKejaSureSheet;
