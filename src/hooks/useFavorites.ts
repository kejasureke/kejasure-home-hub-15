import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "kejasure_favorites";

const getFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavorites);

  // Sync across multiple hook instances via storage event + custom event
  useEffect(() => {
    const sync = () => setFavoriteIds(getFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener("favorites-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("favorites-updated", sync);
    };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("favorites-updated"));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
};
