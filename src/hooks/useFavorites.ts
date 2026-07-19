import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { haptic } from "@/lib/despia";



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
      const removing = prev.includes(id);
      const next = removing ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("favorites-updated"));

      if (removing) {
        haptic("light");
        toast("Removed from Saved", { description: "Property removed from your favorites" });
      } else {
        haptic("success");
        toast.success("Saved!", { description: "Property added to your favorites" });
      }


      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
};
