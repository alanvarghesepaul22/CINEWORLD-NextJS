"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import { Button } from "@/components/ui/button";
import { Play, Pause, PlayIcon } from "lucide-react";
import { PageLoading } from "../loading/PageLoading";

const Hero = () => {
  const [slides, setSlides] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [announceText, setAnnounceText] = useState("");
  const router = useRouter();

  // Fetch hero slides data
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        // Try to fetch both movie and TV data with individual error handling
        const [movieResult, tvResult] = await Promise.allSettled([
          api.getPopular("movie", 1),
          api.getPopular("tv", 1),
        ]);

        const movieData =
          movieResult.status === "fulfilled"
            ? movieResult.value.results.slice(0, 4)
            : [];
        const tvData =
          tvResult.status === "fulfilled"
            ? tvResult.value.results.slice(0, 3)
            : [];

        // Log any failures for debugging
        if (movieResult.status === "rejected") {
          console.warn(
            "Failed to fetch popular movies for hero:",
            movieResult.reason
          );
        }
        if (tvResult.status === "rejected") {
          console.warn(
            "Failed to fetch popular TV shows for hero:",
            tvResult.reason
          );
        }

        // Combine available data
        const combined = [...movieData, ...tvData];

        // If we have no data at all, return some fallback data or empty array
        if (combined.length === 0) {
          console.warn("No hero slides data available, using empty array");
          setSlides([]);
          return;
        }

        // Validate and normalize dates to timestamps
        const getValidTimestamp = (
          dateStr: string | null | undefined
        ): number => {
          if (!dateStr || dateStr.trim() === "") {
            return Number.NEGATIVE_INFINITY; // Sort invalid dates to end
          }
          const timestamp = Date.parse(dateStr);
          return isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
        };

        const sortedSlides = combined.sort((a, b) => {
          // Extract candidate date strings
          const dateStringA =
            "release_date" in a ? a.release_date : a.first_air_date;
          const dateStringB =
            "release_date" in b ? b.release_date : b.first_air_date;

          const timestampA = getValidTimestamp(dateStringA);
          const timestampB = getValidTimestamp(dateStringB);

          return timestampB - timestampA; // Latest first
        });

        setSlides(sortedSlides);
      } catch (error) {
        console.error("Critical error in fetchHeroSlides:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  // Reset currentIndex if it becomes invalid when slides array changes
  useEffect(() => {
    if (slides && slides.length > 0) {
      setCurrentIndex((ci) => (ci >= slides.length ? 0 : ci));
    }
  }, [slides]);

  // Announce slide changes for screen readers
  useEffect(() => {
    if (slides && slides.length > 0) {
      const currentSlide = slides[currentIndex];
      const isTV = "name" in currentSlide;
      const title = isTV ? currentSlide.name : currentSlide.title;
      setAnnounceText(
        `Now showing: ${title}, slide ${currentIndex + 1} of ${slides.length}`
      );
    }
  }, [currentIndex, slides]);

  // Auto-slide functionality - change slides every 10 seconds when not paused
  useEffect(() => {
    if (!slides || slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [slides, isPaused]);

  // Early return after all hooks are called
  if (loading) {
    return <PageLoading>Wait a moment...</PageLoading>;
  }

  if (!slides || slides.length === 0) {
    return <div className="relative h-screen w-full bg-black" />;
  }

  const currentSlide = slides[currentIndex];
  const isTV = "name" in currentSlide;
  const title = isTV ? currentSlide.name : currentSlide.title;
  const href = isTV
    ? `/series/${currentSlide.id}`
    : `/movie/${currentSlide.id}`;

  // Construct full TMDB image URL with fallback
  const backdropUrl = currentSlide.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`
    : "https://i.imgur.com/wjVuAGb.png"; // Fallback image

  async function handlePlay(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    try {
      await router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  }

  // Handle mouse interactions for accessibility
  const handleMouseEnter = () => {
    if (slides.length > 1) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (slides.length > 1) {
      setIsPaused(false);
    }
  };

  // Handle focus events for accessibility
  const handleFocus = () => {
    if (slides.length > 1) {
      setIsPaused(true);
    }
  };

  const handleBlur = () => {
    if (slides.length > 1) {
      setIsPaused(false);
    }
  };

  // Toggle pause state
  const togglePause = () => {
    if (slides.length > 1) {
      setIsPaused(!isPaused);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (slides.length <= 1) return;

    // Only handle keys when the hero container itself has focus, not child elements
    if (event.currentTarget !== event.target) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? slides.length - 1 : prevIndex - 1
        );
        break;
      case "ArrowRight":
        event.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        togglePause();
        break;
    }
  };

  return (
    <div
      className="hero-carousel-focus relative h-screen w-full overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Hero carousel"
    >
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
            alt={`${title || "Featured content"} backdrop image`}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.error("Failed to load image:", backdropUrl);
              // Fallback to placeholder image
              e.currentTarget.src = "https://i.imgur.com/wjVuAGb.png";
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

            <WatchlistButton media={currentSlide} variant="hero" />
          </motion.div>
        </motion.div>
      </div>

      {/* Slide indicators and pause/play control */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
        {/* Slide dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-black ${
                index === currentIndex
                  ? "bg-theme-primary"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Pause/Play control - only show if multiple slides */}
        {slides.length > 1 && (
          <button
            onClick={togglePause}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-black"
            aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
            aria-pressed={isPaused}
          >
            {isPaused ? (
              <PlayIcon className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Pause indicator */}
      {isPaused && slides.length > 1 && (
        <div className="absolute top-8 right-8 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 z-20">
          <Pause className="h-3 w-3" />
          <span>Paused</span>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceText}
      </div>
    </div>
  );
};

export default Hero;
