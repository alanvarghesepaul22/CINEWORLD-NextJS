"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WatchlistItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/title/PageTitle';
import MediaCard from '@/components/display/MediaCard';
import ResponsiveGrid from '@/components/layout/ResponsiveGrid';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('watchlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate that parsed data is an array
        if (!Array.isArray(parsed)) {
          console.warn('Watchlist data is not an array, resetting to empty');
          localStorage.removeItem('watchlist');
          setIsLoading(false);
          return;
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
        
        if (isValidWatchlist) {
          setWatchlist(parsed);
        } else {
          console.warn('Watchlist contains invalid items, resetting to empty');
          localStorage.removeItem('watchlist');
        }
      }
    } catch (error) {
      console.error('Failed to parse watchlist from localStorage:', error);
      // Remove corrupted data
      localStorage.removeItem('watchlist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage changes to update watchlist when modified from MediaCard
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('watchlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlist(parsed);
          }
        } else {
          setWatchlist([]);
        }
      } catch (error) {
        console.error('Failed to parse watchlist from localStorage:', error);
        setWatchlist([]);
      }
    };

    // Listen for storage events (when localStorage is changed in other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events we'll dispatch when localStorage changes
    window.addEventListener('watchlistChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistChanged', handleStorageChange);
    };
  }, []);

  // Convert WatchlistItem to TMDBMovie/TMDBTVShow format for MediaCard
  const convertWatchlistItemToMedia = (item: WatchlistItem) => {
    if (item.type === 'movie') {
      return {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: null, // WatchlistItem doesn't store backdrop_path
        release_date: item.addedAt.split('T')[0], // Use addedAt as fallback
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        original_language: '',
        original_title: item.title,
        popularity: 0,
        video: false,
        overview: ''
      };
    } else {
      return {
        id: item.id,
        name: item.title,
        poster_path: item.poster_path,
        backdrop_path: null, // WatchlistItem doesn't store backdrop_path
        first_air_date: item.addedAt.split('T')[0], // Use addedAt as fallback
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        origin_country: [],
        original_language: '',
        original_name: item.title,
        popularity: 0,
        overview: ''
      };
    }
  };

  // Show loading state while reading from localStorage
  if (isLoading) {
    return (
      <div className="app-bg-enhanced mt-24">
        <PageTitle segments={[
          { text: "My " },
          { text: "Watch", isPrimary: true },
          { text: "list" }
        ]} />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your watchlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state only after loading is complete
  if (watchlist.length === 0) {
    return (
      <div className="app-bg-enhanced mt-24">
        <PageTitle segments={[
          { text: "My " },
          { text: "Watch", isPrimary: true },
          { text: "list" }
        ]} />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Your Watchlist is Empty</h2>
            <p className="text-gray-400 mb-8">Start adding movies and TV shows to your watchlist!</p>
            <Link href="/">
              <Button>Browse Content</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle segments={[
        { text: "My " },
        { text: "Watch", isPrimary: true },
        { text: "list" }
      ]} />
      <ResponsiveGrid>
        {watchlist.map((item) => (
          <MediaCard
            key={`${item.type}-${item.id}`}
            media={convertWatchlistItemToMedia(item)}
          />
        ))}
      </ResponsiveGrid>
    </div>
  );
}