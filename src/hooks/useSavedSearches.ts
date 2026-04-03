import { useState, useCallback } from "react";

export interface SavedSearch {
  id: string;
  label: string;
  county: string;
  subcounty: string;
  estate: string;
  segment: string;
  createdAt: number;
}

const STORAGE_KEY = "kejasure_saved_searches";

export const useSavedSearches = () => {
  const [searches, setSearches] = useState<SavedSearch[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const saveSearch = useCallback((search: Omit<SavedSearch, "id" | "createdAt">) => {
    setSearches((prev) => {
      const newSearch: SavedSearch = {
        ...search,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      const next = [newSearch, ...prev].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { searches, saveSearch, removeSearch };
};
