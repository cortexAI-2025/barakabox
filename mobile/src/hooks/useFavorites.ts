import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@barakabox:favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    });
  }, []);

  const persist = async (next: Set<string>) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const toggle = useCallback((offerId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(offerId)) next.delete(offerId);
      else next.add(offerId);
      persist(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((offerId: string) => favorites.has(offerId), [favorites]);

  return { favorites, toggle, isFavorite };
};
