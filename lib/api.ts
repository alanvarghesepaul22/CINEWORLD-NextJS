import {
  TMDBTrendingResponse,
  TMDBMovieResponse,
  TMDBTVResponse,
  TMDBGenresResponse,
  TMDBSearchResponse,
  TMDBMovieDetail,
  TMDBTVDetail,
} from "./types";

// Support both legacy API_KEY and new ACCESS_TOKEN for backward compatibility
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

// Validate environment configuration
const validateEnvironment = () => {
  if (!ACCESS_TOKEN) {
    throw new Error(
      "TMDB Access Token not configured. Please set TMDB_ACCESS_TOKEN environment variable."
    );
  }
  
  if (ACCESS_TOKEN.length < 10) {
    throw new Error(
      "TMDB Access Token appears to be invalid (too short). Please check your TMDB_ACCESS_TOKEN environment variable."
    );
  }
};

const checkAccessToken = () => {
  validateEnvironment();
};

const getHeaders = () => ({
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  accept: "application/json",
});

// Robust fetch wrapper with retry logic and better error handling
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for more stable connection
    
    try {
      // Add Next.js revalidation for server-side calls
      const fetchOptions: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          ...getHeaders(), // Always include auth headers
          ...options.headers,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
        },
      };

      // Add revalidation for server-side calls (Next.js SSR/SSG)
      if (typeof window === 'undefined') {
        fetchOptions.next = { revalidate: 3600 }; // 1 hour revalidation for server-side calls
      }
      
      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Enhanced error classification
      const error_ = error as Error & { code?: string; name?: string; message?: string };
      const isRetryable = 
        error instanceof TypeError || 
        error_.code === 'ECONNRESET' ||
        error_.code === 'ETIMEDOUT' ||
        error_.code === 'ECONNREFUSED' ||
        error_.code === 'ENOTFOUND' ||
        error_.code === 'EAI_AGAIN' ||
        error_.name === 'AbortError' ||
        error_.name === 'TimeoutError' ||
        // Retry on 5xx server errors and some 4xx errors
        (error_.message?.includes('500') || 
         error_.message?.includes('502') || 
         error_.message?.includes('503') || 
         error_.message?.includes('504') ||
         error_.message?.includes('429')); // Rate limit
      
      if (attempt === maxRetries || !isRetryable) {
        console.error(`TMDB API fetch failed after ${attempt} attempts for ${url}:`, {
          error: error.message,
          code: error_.code,
          name: error_.name,
        });
        throw error;
      }
      
      // Exponential backoff with jitter: 1s + random, 2s + random, 4s + random
      const baseDelay = Math.pow(2, attempt - 1) * 1000;
      const jitter = Math.random() * 1000; // Add up to 1 second of jitter
      const delay = baseDelay + jitter;
      
      console.warn(`TMDB API attempt ${attempt}/${maxRetries} failed for ${url}, retrying in ${Math.round(delay)}ms:`, {
        error: error.message,
        code: error_.code,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All retry attempts failed');
}

// Function overloads for getDetails
function getDetails(mediaType: "movie", id: number): Promise<TMDBMovieDetail>;
function getDetails(mediaType: "tv", id: number): Promise<TMDBTVDetail>;

async function getDetails(
  mediaType: "movie" | "tv",
  id: number
): Promise<TMDBMovieDetail | TMDBTVDetail> {
  checkAccessToken();
  
  // Validate that the ID is a positive integer
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ${mediaType} ID: ${id}. ID must be a positive integer.`);
  }
  
  const response = await fetchWithRetry(`${BASE_URL}/${mediaType}/${id}`, {
    headers: getHeaders(),
  });
  return response.json();
}

export const api = {
  // Trending
  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "day",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    const response = await fetchWithRetry(
      `${BASE_URL}/trending/${mediaType}/${timeWindow}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Popular
  async getPopular(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    const response = await fetchWithRetry(
      `${BASE_URL}/${mediaType}/popular?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Top Rated
  async getTopRated(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    const response = await fetchWithRetry(
      `${BASE_URL}/${mediaType}/top_rated?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Now Playing / On The Air
  async getNowPlaying(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const endpoint = mediaType === "movie" ? "now_playing" : "on_the_air";
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    const response = await fetchWithRetry(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Upcoming / Airing Today
  async getUpcoming(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const endpoint = mediaType === "movie" ? "upcoming" : "airing_today";
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    const response = await fetchWithRetry(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Genres
  async getGenres(mediaType: "movie" | "tv"): Promise<TMDBGenresResponse> {
    checkAccessToken();
    const response = await fetchWithRetry(`${BASE_URL}/genre/${mediaType}/list`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // Discover with filters
  async discover(
    mediaType: "movie" | "tv",
    params: {
      page?: number;
      genre?: string;
      sortBy?: string;
      year?: number;
      language?: string;
      minRating?: number;
    } = {}
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      ...(params.genre && { with_genres: params.genre }),
      ...(params.sortBy && { sort_by: params.sortBy }),
      ...(params.year && { year: params.year.toString() }),
      ...(params.language && { with_original_language: params.language }),
      ...(params.minRating && {
        "vote_average.gte": params.minRating.toString(),
      }),
    });

    const response = await fetchWithRetry(
      `${BASE_URL}/discover/${mediaType}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    return response.json();
  },

  // Search
  async search(
    query: string,
    mediaType?: "movie" | "tv",
    page = 1
  ): Promise<TMDBSearchResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      query,
      page: page.toString(),
    });

    const response = await fetchWithRetry(`${BASE_URL}/search/multi?${searchParams}`, {
      headers: getHeaders(),
    });
    return response.json();
  },

  // Get details with type-safe overloads
  getDetails,

  // Generic method to get media with category and filters
  async getMedia<T extends "movie" | "tv">(
    mediaType: T,
    options: {
      category?: "popular" | "top_rated" | "now_playing" | "upcoming" | "on_the_air" | "airing_today" | "trending";
      page?: number;
      genre?: string;
      year?: number;
      sortBy?: string;
      timeWindow?: "day" | "week";
    } = {}
  ): Promise<T extends "movie" ? TMDBMovieResponse : TMDBTVResponse> {
    checkAccessToken();
    
    const { 
      category = "popular", 
      page = 1, 
      genre, 
      year, 
      sortBy,
      timeWindow = "day" 
    } = options;

    // If we have filters (genre, year, custom sortBy), use discover API
    if (genre || year || (sortBy && sortBy !== 'popularity.desc')) {
      const params: Record<string, string> = { 
        page: page.toString(),
        sort_by: sortBy || 'popularity.desc'
      };
      if (genre) params.with_genres = genre;
      if (year) {
        if (mediaType === 'movie') {
          params.year = year.toString();
        } else {
          params.first_air_date_year = year.toString();
        }
      }
      
      const searchParams = new URLSearchParams(params);
      const response = await fetchWithRetry(
        `${BASE_URL}/discover/${mediaType}?${searchParams}`,
        { headers: getHeaders() }
      );
      const data = await response.json();
      return data as T extends "movie" ? TMDBMovieResponse : TMDBTVResponse;
    }

    // Otherwise use category-specific endpoints
    let endpoint = '';
    const searchParams = new URLSearchParams({ page: page.toString() });

    switch (category) {
      case 'popular':
        endpoint = `${BASE_URL}/${mediaType}/popular`;
        break;
      case 'top_rated':
        endpoint = `${BASE_URL}/${mediaType}/top_rated`;
        break;
      case 'now_playing':
        endpoint = mediaType === 'movie' 
          ? `${BASE_URL}/movie/now_playing`
          : `${BASE_URL}/tv/on_the_air`;
        break;
      case 'upcoming':
        endpoint = mediaType === 'movie' 
          ? `${BASE_URL}/movie/upcoming`
          : `${BASE_URL}/tv/airing_today`;
        break;
      case 'on_the_air':
        endpoint = `${BASE_URL}/tv/on_the_air`;
        break;
      case 'airing_today':
        endpoint = `${BASE_URL}/tv/airing_today`;
        break;
      case 'trending':
        endpoint = `${BASE_URL}/trending/${mediaType}/${timeWindow}`;
        break;
      default:
        endpoint = `${BASE_URL}/${mediaType}/popular`;
    }

    const response = await fetchWithRetry(
      `${endpoint}?${searchParams}`,
      { headers: getHeaders() }
    );
    const data = await response.json();
    return data as T extends "movie" ? TMDBMovieResponse : TMDBTVResponse;
  },

  // Health check utility
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    try {
      checkAccessToken();
      await fetchWithRetry(`${BASE_URL}/configuration`, {
        headers: getHeaders(),
      });
      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};
