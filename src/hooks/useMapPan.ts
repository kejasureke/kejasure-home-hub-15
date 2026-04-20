import { useCallback, useState } from "react";

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

/**
 * Encapsulates zoom state, pan/drag touch handlers, and lat/lng → pixel
 * projection for the mock map. Returns ready-to-spread touch handlers and a
 * `project` helper that converts geo coordinates to canvas pixels using the
 * current zoom + pan.
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

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(maxZoom, z + zoomStep)),
    [maxZoom, zoomStep]
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(minZoom, z - zoomStep)),
    [minZoom, zoomStep]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setDragging(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setPanStart(pan);
      }
    },
    [pan]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - dragStart.x;
        const dy = e.touches[0].clientY - dragStart.y;
        setPan({ x: panStart.x + dx, y: panStart.y + dy });
      }
    },
    [dragging, dragStart, panStart]
  );

  const onTouchEnd = useCallback(() => setDragging(false), []);

  const project = useCallback(
    (lat: number, lng: number) => {
      const scale = 3500 * zoom;
      const x = (lng - center.lng) * scale + mapWidth / 2 + pan.x;
      const y = (center.lat - lat) * scale + mapHeight / 2 + pan.y;
      return { x, y };
    },
    [zoom, pan.x, pan.y, center.lat, center.lng, mapWidth, mapHeight]
  );

  return {
    zoom,
    pan,
    minZoom,
    maxZoom,
    zoomIn,
    zoomOut,
    project,
    touchHandlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
