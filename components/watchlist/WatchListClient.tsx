"use client";
import Link from "next/link";
import { WatchlistItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import MediaCard from "@/components/display/MediaCard";
import ResponsiveGrid from "@/components/layout/ResponsiveGrid";
import { useWatchlist } from "@/lib/useWatchlist";

const WatchListClient = () => {
  const { watchlist, isLoading } = useWatchlist();

  // Convert WatchlistItem to TMDBMovie/TMDBTVShow format for MediaCard
  const convertWatchlistItemToMedia = (item: WatchlistItem) => {
    if (item.type === "movie") {
      return {
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: null, // WatchlistItem doesn't store backdrop_path
        release_date: item.addedAt.split("T")[0], // Use addedAt as fallback
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        original_language: "",
        original_title: item.title,
        popularity: 0,
        video: false,
        overview: "",
      };
    } else {
      return {
        id: item.id,
        name: item.title,
        poster_path: item.poster_path,
        backdrop_path: null, // WatchlistItem doesn't store backdrop_path
        first_air_date: item.addedAt.split("T")[0], // Use addedAt as fallback
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        adult: false,
        origin_country: [],
        original_language: "",
        original_name: item.title,
        popularity: 0,
        overview: "",
      };
    }
  };

  // Show loading state while reading from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  // Show empty state only after loading is complete
  if (watchlist.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Your Watchlist is Empty
          </h2>
          <p className="text-gray-400 mb-8">
            Start adding movies and TV shows to your watchlist!
          </p>
          <Link href="/">
            <Button>Browse Content</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveGrid>
      {watchlist.map((item) => (
        <MediaCard
          key={`${item.type}-${item.id}`}
          media={convertWatchlistItemToMedia(item)}
        />
      ))}
    </ResponsiveGrid>
  );
};
export default WatchListClient;
