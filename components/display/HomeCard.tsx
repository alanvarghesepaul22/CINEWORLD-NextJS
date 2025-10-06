"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useWatchlist } from "@/lib/useWatchlist";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

// Type guard function using a reliable discriminant
function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return 'first_air_date' in item && item.first_air_date !== undefined;
}

interface HomeCardsProps {
  MovieCard: TMDBMovie | TMDBTVShow;
}

const HomeCards: React.FC<HomeCardsProps> = ({ MovieCard }) => {
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();
  
  const isTV = isTVShow(MovieCard);
  const href = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;
  const titleVal = isTV ? MovieCard.name : MovieCard.title;
  
  const poster_path = MovieCard.poster_path ? `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}` : "https://i.imgur.com/wjVuAGb.png";
  const inWatchlist = isInWatchlist(MovieCard.id);
  
  return (
    <div className="w-[160px] sm:w-[180px] md:w-[200px] bg-grey shadow-lg group relative rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={href} title={titleVal} className="block w-full">
        <div className="aspect-[2/3] w-full relative">
          <Image
            src={poster_path}
            alt={titleVal}
            width={200}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
            unoptimized
          />
        </div>
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant={inWatchlist ? "secondary" : "default"}
          onClick={() => {
            if (inWatchlist) {
              removeFromWatchlist(MovieCard.id);
            } else {
              addToWatchlist(MovieCard);
            }
          }}
          className="p-1 h-8 w-8"
        >
          {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default HomeCards;
