"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WatchlistItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
        const isValidWatchlist = parsed.every((item: any) => 
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'number' &&
          (item.type === 'movie' || item.type === 'tv') &&
          typeof item.title === 'string' &&
          (item.poster_path === null || typeof item.poster_path === 'string') &&
          typeof item.addedAt === 'string'
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

  const removeFromWatchlist = (id: number) => {
    const updated = watchlist.filter(item => item.id !== id);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
    toast.success('Removed from watchlist');
  };

  // Show loading state while reading from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  // Show empty state only after loading is complete
  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Watchlist is Empty</h1>
          <p className="text-gray-600 mb-8">Start adding movies and TV shows to your watchlist!</p>
          <Link href="/">
            <Button>Browse Content</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {watchlist.map((item) => (
          <div key={item.id} className="relative group">
            <Link href={item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`}>
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 hover:opacity-75 transition-opacity">
                <Image
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '/movieCard.jpg'}
                  alt={item.title}
                  width={342}
                  height={513}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeFromWatchlist(item.id)}
                className="p-1 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="mt-2 text-sm font-medium truncate">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}