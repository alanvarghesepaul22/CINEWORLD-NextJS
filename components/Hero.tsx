"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TMDBMovie, TMDBTVShow } from '@/lib/types';
import { useWatchlist } from '@/lib/useWatchlist';
import { Button } from '@/components/ui/button';
import { Play, Info, Plus, Check } from 'lucide-react';

interface HeroProps {
  slides: (TMDBMovie | TMDBTVShow)[];
}

export default function Hero({ slides }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Reset currentIndex if it becomes invalid when slides array changes
  useEffect(() => {
    if (slides && slides.length > 0) {
      setCurrentIndex(ci => ci >= slides.length ? 0 : ci);
    }
  }, [slides]);

  // Early return after all hooks are called
  if (!slides || slides.length === 0) {
    return <div className="relative h-screen w-full bg-black" />;
  }


  const currentSlide = slides[currentIndex];
  const isTV = 'name' in currentSlide;
  const title = isTV ? currentSlide.name : currentSlide.title;
  const href = isTV ? `/series/${currentSlide.id}` : `/movie/${currentSlide.id}`;
  
  // Construct full TMDB image URL with fallback
  const backdropUrl = currentSlide.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`
    : 'https://i.imgur.com/wjVuAGb.png'; // Fallback image

  async function handlePlay(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();
    try {
      await router.push(href);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }
  function handleWatchlistToggle(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    if (isInWatchlist(currentSlide.id)) {
      removeFromWatchlist(currentSlide.id);
    } else {
      addToWatchlist(currentSlide);
    }
  }

  const isInWatchlistState = isInWatchlist(currentSlide.id);
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={backdropUrl}
            alt={`${title || 'Featured content'} backdrop image`}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.error('Failed to load image:', backdropUrl);
              // Fallback to placeholder image
              e.currentTarget.src = 'https://i.imgur.com/wjVuAGb.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-white"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl mb-8 line-clamp-3"
          >
            {currentSlide.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-3"
          >
            <Button 
              size="default" 
              className="bg-theme-primary hover:bg-light-primary text-black font-semibold px-6 py-2"
              onClick={handlePlay}
              aria-label={`Play ${title}`}
            >
              <Play className="mr-2 h-4 w-4" />
              Play
            </Button>

            <Link href={href}>
              <Button size="default" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-6 py-2">
                <Info className="mr-2 h-4 w-4" />
                More Info
              </Button>
            </Link>

            <Button 
              size="default" 
              variant="ghost" 
              className={`px-6 py-2 transition-all duration-200 ${
                isInWatchlistState 
                  ? 'text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30' 
                  : 'text-white hover:bg-white/20 hover:text-black'
              }`}
              onClick={handleWatchlistToggle}
              aria-pressed={isInWatchlistState}
              aria-label={isInWatchlistState ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlistState ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Watchlist
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-theme-primary' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}