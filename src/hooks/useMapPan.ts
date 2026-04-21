import { useCallback, useEffect, useRef, useState } from "react";

interface UseMapPanOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  initialZoom?: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

const distance = (a: React.Touch, b: React.Touch) => {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
};

/**
 * Encapsulates zoom state, pan/drag touch handlers, pinch-to-zoom, and
 * lat/lng → pixel projection for the mock map. Returns ready-to-spread touch
 * handlers and a `project` helper that converts geo coordinates to canvas
 * pixels using the current zoom + pan.
 */
export const useMapPan = (
  center: LatLng,
  mapWidth: number,
  mapHeight: number,
  options: UseMapPanOptions = {}
) => {
  const {
    minZoom = 0.5,
    maxZoom = 3,
    zoomStep = 0.25,
    initialZoom = 1,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Pinch state lives in a ref so rapid touchmove events don't thrash React.
  // We capture the midpoint (in map-local coords) and the pan/zoom at gesture
  // start so we can keep that point pinned under the user's fingers.
  const pinchRef = useRef<
    | {
        startDist: number;
        startZoom: number;
        startPan: { x: number; y: number };
        // Midpoint relative to the map element's top-left at gesture start.
        midX: number;
        midY: number;
      }
    | null
  >(null);
  // The map element, captured on touchstart, so we can convert client → local coords.
  const mapElRef = useRef<HTMLElement | null>(null);

  // Animation frame ref so a new recenter call cancels any in-flight animation.
  const animRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
  }, []);

  const clampZoom = useCallback(
    (z: number) => Math.min(maxZoom, Math.max(minZoom, z)),
    [minZoom, maxZoom]
  );

  // Limit pan so the map center stays within ~half the viewport in any direction.
  // This keeps pins reachable while preventing infinite off-screen drag.
  const clampPan = useCallback(
    (p: { x: number; y: number }) => {
      const maxX = mapWidth / 2;
      const maxY = mapHeight / 2;
      return {
        x: Math.min(maxX, Math.max(-maxX, p.x)),
        y: Math.min(maxY, Math.max(-maxY, p.y)),
      };
    },
    [mapWidth, mapHeight]
  );

  const zoomIn = useCallback(
    () => setZoom((z) => clampZoom(z + zoomStep)),
    [clampZoom, zoomStep]
  );
  const zoomOut = useCallback(
    () => setZoom((z) => clampZoom(z - zoomStep)),
    [clampZoom, zoomStep]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Begin pinch
        pinchRef.current = {
          startDist: distance(e.touches[0], e.touches[1]),
          startZoom: zoom,
        };
        setDragging(false);
      } else if (e.touches.length === 1) {
        pinchRef.current = null;
        setDragging(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setPanStart(pan);
      }
    },
    [pan, zoom]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const dist = distance(e.touches[0], e.touches[1]);
        const ratio = dist / pinchRef.current.startDist;
        setZoom(clampZoom(pinchRef.current.startZoom * ratio));
        return;
      }
      if (dragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - dragStart.x;
        const dy = e.touches[0].clientY - dragStart.y;
        setPan(clampPan({ x: panStart.x + dx, y: panStart.y + dy }));
      }
    },
    [dragging, dragStart, panStart, clampZoom, clampPan]
  );

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    // End pinch when fewer than 2 fingers remain.
    if (e.touches.length < 2) {
      pinchRef.current = null;
    }
    if (e.touches.length === 0) {
      setDragging(false);
    }
  }, []);

  const project = useCallback(
    (lat: number, lng: number) => {
      const scale = 3500 * zoom;
      const x = (lng - center.lng) * scale + mapWidth / 2 + pan.x;
      const y = (center.lat - lat) * scale + mapHeight / 2 + pan.y;
      return { x, y };
    },
    [zoom, pan.x, pan.y, center.lat, center.lng, mapWidth, mapHeight]
  );

  // Smoothly animate pan → {0,0} and zoom → initialZoom over ~350ms.
  const recenter = useCallback(() => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);

    const startPan = pan;
    const startZoom = zoom;
    const targetZoom = initialZoom;
    const duration = 350;
    const startTime = performance.now();
    // ease-out cubic
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const k = ease(t);
      setPan({ x: startPan.x * (1 - k), y: startPan.y * (1 - k) });
      setZoom(startZoom + (targetZoom - startZoom) * k);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }, [pan, zoom, initialZoom]);

  const isCentered = pan.x === 0 && pan.y === 0 && zoom === initialZoom;

  return {
    zoom,
    pan,
    minZoom,
    maxZoom,
    zoomIn,
    zoomOut,
    recenter,
    isCentered,
    project,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
