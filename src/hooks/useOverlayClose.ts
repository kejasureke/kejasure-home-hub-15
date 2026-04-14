import { useState, useCallback } from "react";

/**
 * Hook to manage overlay close animation.
 * Returns { closing, triggerClose } — use `closing` to toggle the CSS class,
 * and call `triggerClose` instead of the raw `onClose`/`onBack`.
 */
export function useOverlayClose(onClose: () => void, duration = 250) {
  const [closing, setClosing] = useState(false);

  const triggerClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, duration);
  }, [onClose, duration]);

  return { closing, triggerClose };
}
