import { useState, useEffect } from 'react';
import { WatchlistItem, TMDBMovie, TMDBTVShow } from './types';
import { toast } from 'sonner';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      setWatchlist(JSON.parse(stored));
    }
  }, []);

  const addToWatchlist = (item: TMDBMovie | TMDBTVShow) => {
    const isTV = 'name' in item;
    const watchlistItem: WatchlistItem = {
      id: item.id,
      type: isTV ? 'tv' : 'movie',
      title: isTV ? item.name : item.title,
      poster_path: item.poster_path,
      addedAt: new Date().toISOString(),
    };

    const existingIndex = watchlist.findIndex(w => w.id === item.id);
    if (existingIndex >= 0) {
      toast.info('Already in watchlist');
      return;
    }

    const updated = [...watchlist, watchlistItem];
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('watchlistChanged'));
    
    toast.success('Added to watchlist');
  };

  const removeFromWatchlist = (id: number) => {
    const updated = watchlist.filter(item => item.id !== id);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('watchlistChanged'));
    
    toast.success('Removed from watchlist');
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some(item => item.id === id);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}