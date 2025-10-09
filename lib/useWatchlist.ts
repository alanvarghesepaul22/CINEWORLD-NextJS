import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem, TMDBMovie, TMDBTVShow } from './types';
import { toast } from 'sonner';

// Helper function to safely get watchlist from localStorage
function getWatchlistFromStorage(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('watchlist');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Watchlist data is not an array, resetting to empty');
      localStorage.removeItem('watchlist');
      return [];
    }
    
    // Validate each item has the expected WatchlistItem shape
    const isValidWatchlist = parsed.every((item: unknown) => 
      typeof item === 'object' &&
      item !== null &&
      typeof (item as WatchlistItem).id === 'number' &&
      ((item as WatchlistItem).type === 'movie' || (item as WatchlistItem).type === 'tv') &&
      typeof (item as WatchlistItem).title === 'string' &&
      ((item as WatchlistItem).poster_path === null || typeof (item as WatchlistItem).poster_path === 'string') &&
      typeof (item as WatchlistItem).addedAt === 'string'
    );
    
    if (!isValidWatchlist) {
      console.warn('Watchlist contains invalid items, resetting to empty');
      localStorage.removeItem('watchlist');
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse watchlist from localStorage:', error);
    localStorage.removeItem('watchlist');
    return [];
  }
}

// Helper function to save watchlist to localStorage and notify all listeners
function saveWatchlistToStorage(watchlist: WatchlistItem[]) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  
  // Dispatch custom event to notify all components
  window.dispatchEvent(new CustomEvent('watchlistChanged', { 
    detail: { watchlist } 
  }));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const loadWatchlist = () => {
      const stored = getWatchlistFromStorage();
      setWatchlist(stored);
      setIsLoading(false);
    };
    
    loadWatchlist();
  }, []);

  // Listen for watchlist changes from other components/tabs
  useEffect(() => {
    const handleWatchlistChange = () => {
      // Always read fresh data from localStorage to ensure sync
      const freshWatchlist = getWatchlistFromStorage();
      setWatchlist(freshWatchlist);
    };

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleWatchlistChange);
    
    // Listen for custom events (changes from same tab)
    window.addEventListener('watchlistChanged', handleWatchlistChange);

    return () => {
      window.removeEventListener('storage', handleWatchlistChange);
      window.removeEventListener('watchlistChanged', handleWatchlistChange);
    };
  }, []);

  const addToWatchlist = useCallback((item: TMDBMovie | TMDBTVShow) => {
    // Always read fresh data from localStorage to avoid stale state
    const currentWatchlist = getWatchlistFromStorage();
    
    const isTV = 'name' in item;
    const watchlistItem: WatchlistItem = {
      id: item.id,
      type: isTV ? 'tv' : 'movie',
      title: isTV ? item.name : item.title,
      poster_path: item.poster_path,
      addedAt: new Date().toISOString(),
    };

    // Check if already exists (check both id and type to handle movies/series with same id)
    const existingIndex = currentWatchlist.findIndex(
      w => w.id === item.id && w.type === watchlistItem.type
    );
    
    if (existingIndex >= 0) {
      toast.info('Already in watchlist');
      return;
    }

    const updated = [...currentWatchlist, watchlistItem];
    setWatchlist(updated);
    saveWatchlistToStorage(updated);
    
    toast.success('Added to watchlist');
  }, []);

  const removeFromWatchlist = useCallback((id: number, type?: 'movie' | 'tv') => {
    // Always read fresh data from localStorage to avoid stale state
    const currentWatchlist = getWatchlistFromStorage();
    
    // If type is provided, filter by both id and type
    // Otherwise, filter by id only (for backward compatibility)
    const updated = type 
      ? currentWatchlist.filter(item => !(item.id === id && item.type === type))
      : currentWatchlist.filter(item => item.id !== id);
    
    setWatchlist(updated);
    saveWatchlistToStorage(updated);
    
    toast.success('Removed from watchlist');
  }, []);

  const isInWatchlist = useCallback((id: number, type?: 'movie' | 'tv') => {
    // Always check against current state
    if (type) {
      return watchlist.some(item => item.id === id && item.type === type);
    }
    return watchlist.some(item => item.id === id);
  }, [watchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoading,
  };
}