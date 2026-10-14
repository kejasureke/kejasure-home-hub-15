import { useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/despia";

/**
 * App-wide native gestures:
 * 1. Swipe from the left edge on any screen → taps that screen's back/close button
 *    (falls back to the hardware-back stack, e.g. returning to the Home tab).
 * 2. Drag any bottom sheet down from near its top → closes it like a native sheet.
 */
const BACK_ICONS = ["lucide-arrow-left", "lucide-chevron-left"];
const CLOSE_ICONS = ["lucide-x"];

function topOverlay(): HTMLElement | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let best: HTMLElement | null = null;
  let bestZ = -Infinity;
  document.querySelectorAll<HTMLElement>(".fixed").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < vw * 0.9 || r.height < vh * 0.6) return;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.pointerEvents === "none") return;
    const z = parseInt(cs.zIndex) || 0;
    if (z >= bestZ) {
      bestZ = z;
      best = el;
    }
  });
  return best;
}

function findButton(root: HTMLElement, icons: string[]): HTMLElement | null {
  const sel = icons.map((c) => `button svg.${c}`).join(",");
  const svg = root.querySelector(sel);
  return (svg?.closest("button") as HTMLElement) ?? null;
}

const NativeGestures = () => {
  const [edgeDx, setEdgeDx] = useState(0);
  const edge = useRef<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });
  const sheet = useRef<{ el: HTMLElement; y: number; dy: number } | null>(null);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Edge swipe-back
      if (t.clientX <= 22) {
        edge.current = { x: t.clientX, y: t.clientY, on: true };
        return;
      }
      // Bottom sheet drag
      const target = e.target as HTMLElement;
      const el = target.closest<HTMLElement>(".rounded-t-3xl");
      if (!el || !el.parentElement?.classList.contains("fixed")) return;
      if (target.closest("input,textarea,select,[data-no-drag]")) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < window.innerHeight - 4) return; // not bottom-anchored
      if (el.scrollTop > 0) return;
      if (t.clientY - r.top > 120 && el.scrollHeight > el.clientHeight) return;
      sheet.current = { el, y: t.clientY, dy: 0 };
    };

    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (edge.current.on) {
        const dx = t.clientX - edge.current.x;
        const dy = Math.abs(t.clientY - edge.current.y);
        if (dy > 50 && dy > dx) {
          edge.current.on = false;
          setEdgeDx(0);
          return;
        }
        setEdgeDx(Math.max(0, Math.min(dx, 120)));
        return;
      }
      const s = sheet.current;
      if (!s) return;
      const dy = t.clientY - s.y;
      if (dy < 0 || s.el.scrollTop > 0) {
        s.el.style.transform = "";
        s.dy = 0;
        return;
      }
      s.dy = dy;
      s.el.style.transition = "none";
      s.el.style.transform = `translateY(${dy}px)`;
    };

    const onEnd = () => {
      if (edge.current.on) {
        edge.current.on = false;
        setEdgeDx((dx) => {
          if (dx >= 80) {
            haptic("light");
            const overlay = topOverlay();
            const btn = overlay && (findButton(overlay, BACK_ICONS) || findButton(overlay, CLOSE_ICONS));
            if (btn) btn.click();
            else document.dispatchEvent(new Event("backbutton"));
          }
          return 0;
        });
        return;
      }
      const s = sheet.current;
      sheet.current = null;
      if (!s) return;
      s.el.style.transition = "transform 220ms ease-out";
      if (s.dy > 110) {
        haptic("light");
        s.el.style.transform = "translateY(100%)";
        const backdrop = s.el.parentElement;
        setTimeout(() => {
          const closeBtn = findButton(s.el, CLOSE_ICONS);
          if (backdrop) backdrop.click();
          // If the backdrop didn't close it, try the sheet's X button.
          setTimeout(() => {
            if (document.contains(s.el)) {
              if (closeBtn) closeBtn.click();
              else s.el.style.transform = "";
            }
          }, 60);
        }, 180);
      } else {
        s.el.style.transform = "";
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  if (edgeDx <= 0) return null;
  const p = Math.min(1, edgeDx / 80);
  return (
    <div
      className="pointer-events-none fixed top-1/2 left-0 z-[200] -translate-y-1/2"
      style={{ transform: `translate(${edgeDx * 0.4 - 20}px, -50%)`, opacity: p }}
    >
      <div className={`w-10 h-10 rounded-full card-shadow flex items-center justify-center ${p >= 1 ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </div>
    </div>
  );
};

export default NativeGestures;
