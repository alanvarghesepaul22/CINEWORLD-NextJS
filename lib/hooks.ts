import useSWR from 'swr';
import { api } from './api';
import { TMDBTrendingResponse, TMDBGenresResponse, TMDBSearchResponse } from './types';

// Custom hooks for TMDB API
export function useTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day', page = 1) {
  return useSWR<TMDBTrendingResponse>(
    `${mediaType}/${timeWindow}/${page}`,
    () => api.getTrending(mediaType, timeWindow, page),
    { revalidateOnFocus: false }
  );
}

export function usePopular(mediaType: 'movie' | 'tv', page = 1) {
  return useCategoryData(mediaType, 'popular', page);
}

export function useTopRated(mediaType: 'movie' | 'tv', page = 1) {
  return useCategoryData(mediaType, 'top_rated', page);
}

export function useNowPlaying(mediaType: 'movie' | 'tv', page = 1) {
  return useCategoryData(mediaType, 'now_playing', page);
}

export function useUpcoming(mediaType: 'movie' | 'tv', page = 1) {
  return useCategoryData(mediaType, 'upcoming', page);
}

export function useGenres(mediaType: 'movie' | 'tv') {
  return useSWR<TMDBGenresResponse>(
    `genres/${mediaType}`,
    () => api.getGenres(mediaType),
    { revalidateOnFocus: false }
  );
}

export function useDiscover(mediaType: 'movie' | 'tv', params: {
  page?: number;
  genre?: string;
  sortBy?: string;
  year?: number;
  language?: string;
  minRating?: number;
} = {}) {
  const key = `discover/${mediaType}/${JSON.stringify(params)}`;
  return useSWR<TMDBTrendingResponse>(
    key,
    () => api.discover(mediaType, params),
    { revalidateOnFocus: false }
  );
}

export function useSearch(query: string, mediaType?: 'movie' | 'tv', page = 1) {
  const key = query ? `search/${query}/${mediaType || 'all'}/${page}` : null;
  return useSWR<TMDBSearchResponse>(
    key,
    () => api.search(query, mediaType, page),
    { revalidateOnFocus: false }
  );
}

export function useCategoryData(
  mediaType: 'movie' | 'tv', 
  category: 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'on_the_air' | 'airing_today', 
  page = 1
) {
  const key = `category/${mediaType}/${category}/${page}`;
  
  return useSWR<TMDBTrendingResponse>(
    key,
    () => {
      switch (category) {
        case 'popular':
          return api.getPopular(mediaType, page);
        case 'top_rated':
          return api.getTopRated(mediaType, page);
        case 'now_playing':
        case 'on_the_air':
          return api.getNowPlaying(mediaType, page);
        case 'upcoming':
        case 'airing_today':
          return api.getUpcoming(mediaType, page);
        default:
          throw new Error(`Unknown category: ${category}`);
      }
    },
    { revalidateOnFocus: false }
  );
}