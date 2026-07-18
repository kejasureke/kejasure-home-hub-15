import { useEffect } from "react";

/**
 * Registers a handler for the Android hardware back button (Despia dispatches
 * a `backbutton` event on `document`). Handlers are stacked LIFO so the most
 * recently opened overlay handles the press first. Returns nothing; cleanup
 * happens on unmount.
 *
 * Example:
 *   useHardwareBack(active, () => setOpen(false));
 */
type BackHandler = () => boolean | void;

const stack: BackHandler[] = [];

if (typeof document !== "undefined") {
  document.addEventListener("backbutton", (e) => {
    const handler = stack[stack.length - 1];
    if (!handler) return;
    // Prevent Despia's default behavior (which would exit the app).
    e.preventDefault?.();
    const consumed = handler();
    // If a handler explicitly returns false, allow the next in stack to run.
    if (consumed === false && stack.length > 1) {
      const prev = stack[stack.length - 2];
      prev?.();
    }
  });
}

export const useHardwareBack = (active: boolean, handler: BackHandler) => {
  useEffect(() => {
    if (!active) return;
    stack.push(handler);
    return () => {
      const idx = stack.lastIndexOf(handler);
      if (idx >= 0) stack.splice(idx, 1);
    };
  }, [active, handler]);
};

export default useHardwareBack;
