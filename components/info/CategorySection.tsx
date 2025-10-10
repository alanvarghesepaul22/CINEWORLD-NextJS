"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useCategoryData } from "@/lib/hooks";
import MediaCard from "../display/MediaCard";
import SectionHeader from "../layout/SectionHeader";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CategorySectionProps {
  title: string;
  mediaType: "movie" | "tv";
  category:
    | "popular"
    | "top_rated"
    | "now_playing"
    | "upcoming"
    | "on_the_air"
    | "airing_today";
  seeAllHref: string;
}

const CategorySection = ({
  title,
  mediaType,
  category,
  seeAllHref,
}: CategorySectionProps) => {
  const page = 1;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useCategoryData(mediaType, category, page);

  const results: (TMDBMovie | TMDBTVShow)[] = data?.results || [];
  const hasError = !!error;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth =
        window.innerWidth >= 768 ? 200 : window.innerWidth >= 640 ? 180 : 160;
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth =
        window.innerWidth >= 768 ? 200 : window.innerWidth >= 640 ? 180 : 160;
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide horizontal-scroll pl-4 sm:pl-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] bg-gray-800 animate-pulse rounded-lg" />
            </div>
          ))}
          <div className="flex-shrink-0 w-4 sm:w-6"></div>
        </div>
      </div>
    );
  }

  const showEmptyState = hasError || results.length === 0;

  let displayData: (TMDBMovie | TMDBTVShow)[];

  if (hasError) {
    console.warn(
      `CategorySection API error for ${mediaType}/${category}:`,
      error
    );
    displayData = [];
  } else {
    displayData = results;
  }

  return (
    <div className="mb-12">
      <SectionHeader className="mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link href={seeAllHref}>
          <Button
            variant="ghost"
            className="text-theme-primary hover:text-theme-primary hover:bg-gray-700/20 transition-colors"
          >
            See All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </SectionHeader>

      {showEmptyState ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          {hasError ? (
            <div className="text-center">
              <p className="text-lg mb-2">
                Failed to load {mediaType === "movie" ? "movies" : "TV shows"}
              </p>
              <p className="text-sm">
                Please check your internet connection and try again
              </p>
            </div>
          ) : (
            <p className="text-lg">
              No {mediaType === "movie" ? "movies" : "TV shows"} available at
              the moment.
            </p>
          )}
        </div>
      ) : (
        <div className="relative section-hover">
          {/* Left Arrow Button with gradient background - Hidden on mobile, visible on desktop */}
          <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-bg-black via-bg-black/80 to-transparent z-20 hidden md:block pointer-events-none"></div>
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:scale-110 chevron-btn-left border border-white/20"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Right Arrow Button with gradient background - Hidden on mobile, visible on desktop */}
          <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-bg-black via-bg-black/80 to-transparent z-20 hidden md:block pointer-events-none"></div>
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:scale-110 chevron-btn-right border border-white/20"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide horizontal-scroll touch-scroll pl-4 sm:pl-0"
          >
            {displayData.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 scroll-snap-align-start"
              >
                <MediaCard media={item} variant="horizontal" />
              </div>
            ))}
            {/* Add some padding at the end for better mobile scrolling */}
            <div className="flex-shrink-0 w-4 sm:w-6"></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategorySection;
