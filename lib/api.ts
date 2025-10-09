import {
  TMDBTrendingResponse,
  TMDBMovieResponse,
  TMDBTVResponse,
  TMDBGenresResponse,
  TMDBSearchResponse,
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBSeasonDetail,
  TMDBEpisodeDetail,
} from "./types";

// Support both legacy API_KEY and new ACCESS_TOKEN for backward compatibility
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Validate environment configuration
const validateEnvironment = () => {
  if (!ACCESS_TOKEN && !API_KEY) {
    throw new Error(
      "TMDB credentials not configured. Please set either TMDB_ACCESS_TOKEN or API_KEY environment variable."
    );
  }

  if (ACCESS_TOKEN && ACCESS_TOKEN.length < 10) {
    throw new Error(
      "TMDB Access Token appears to be invalid (too short). Please check your TMDB_ACCESS_TOKEN environment variable."
    );
  }

  if (API_KEY && API_KEY.length < 10) {
    throw new Error(
      "TMDB API Key appears to be invalid (too short). Please check your API_KEY environment variable."
    );
  }
};

const checkAccessToken = () => {
  validateEnvironment();
};

const getHeaders = () => ({
  ...(ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}` } : {}),
  accept: "application/json",
});

// Request deduplication cache to prevent duplicate simultaneous requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingRequests = new Map<string, Promise<any>>();

// Simple fetch wrapper with single call and proper error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAPI(
  url: string,
  options: RequestInit = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  // Modify URL to include API key if using legacy authentication
  let requestUrl = url;
  if (!ACCESS_TOKEN && API_KEY) {
    requestUrl += `${requestUrl.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  }

  // Request deduplication - if same request is in flight, return the pending promise
  const cacheKey = `${requestUrl}:${JSON.stringify(options)}`;
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      // Add Next.js revalidation for server-side calls
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          ...getHeaders(), // Always include auth headers
          ...options.headers,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
        },
      };

      // Add revalidation for server-side calls (Next.js SSR/SSG)
      if (typeof window === 'undefined') {
        fetchOptions.next = { revalidate: 1800 }; // 30 minutes revalidation for server-side calls
      }

      const response = await fetch(requestUrl, fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const error = new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`) as Error & { 
          status: number;
          code: string;
        };
        error.status = response.status;
        
        // Set appropriate error codes
        switch (response.status) {
          case 404:
            error.code = 'NOT_FOUND';
            break;
          case 401:
            error.code = 'UNAUTHORIZED';
            break;
          case 403:
            error.code = 'FORBIDDEN';
            break;
          case 429:
            error.code = 'RATE_LIMITED';
            break;
          case 500:
            error.code = 'SERVER_ERROR';
            break;
          default:
            error.code = 'API_ERROR';
        }
        
        throw error;
      }
      
      return response.json();
    } catch (error) {
      const error_ = error as Error & { code?: string; status?: number };
      
      // Handle network errors (fetch failed, timeout, etc.)
      if (!error_.status) {
        const networkError = new Error('Network error or API unavailable') as Error & { 
          status: number;
          code: string;
        };
        networkError.status = 0;
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  })();

  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);

  try {
    const response = await requestPromise;
    return response;
  } finally {
    // Clean up the pending request after a short delay to allow deduplication
    setTimeout(() => pendingRequests.delete(cacheKey), 1000);
  }
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
  
  try {
    return await fetchAPI(`${BASE_URL}/${mediaType}/${id}`, {
      headers: getHeaders(),
    });
  } catch (error) {
    const error_ = error as Error & { status?: number; code?: string };
    
    // Throw a specific error for 404 not found
    if (error_.status === 404) {
      const notFoundError = new Error(`${mediaType === 'movie' ? 'Movie' : 'TV Show'} not found`) as Error & { 
        status: number; 
        code: string;
      };
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      throw notFoundError;
    }
    
    // Re-throw other errors as-is
    throw error;
  }
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
    return await fetchAPI(
      `${BASE_URL}/trending/${mediaType}/${timeWindow}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
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
    return await fetchAPI(
      `${BASE_URL}/${mediaType}/popular?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
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
    return await fetchAPI(
      `${BASE_URL}/${mediaType}/top_rated?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
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
    return await fetchAPI(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
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
    return await fetchAPI(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Genres
  async getGenres(): Promise<TMDBGenresResponse> {
    checkAccessToken();
    return await fetchAPI(`${BASE_URL}/genre/movie/list`, {
      headers: getHeaders(),
    });
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

    return await fetchAPI(
      `${BASE_URL}/discover/${mediaType}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
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

    return await fetchAPI(`${BASE_URL}/search/multi?${searchParams}`, {
      headers: getHeaders(),
    });
  },

  // Get details with type-safe overloads
  getDetails,

  // Get season details
  async getSeasonDetails(
    seriesId: number,
    seasonNumber: number
  ): Promise<TMDBSeasonDetail> {
    checkAccessToken();
    
    // Validate that the IDs are positive integers
    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      throw new Error(`Invalid series ID: ${seriesId}. ID must be a positive integer.`);
    }
    
    if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
      throw new Error(`Invalid season number: ${seasonNumber}. Season number must be a non-negative integer.`);
    }
    
    try {
      const result = await fetchAPI(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`, {
        headers: getHeaders(),
      });
      return result;
    } catch (error) {
      const error_ = error as Error & { status?: number };
      
      // Throw a specific error for 404 not found
      if (error_.status === 404) {
        const notFoundError = new Error(`Season ${seasonNumber} of series ${seriesId} not found`) as Error & { 
          status: number; 
          code: string;
        };
        notFoundError.status = 404;
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  },

  // Get episode details
  async getEpisodeDetails(
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<TMDBEpisodeDetail> {
    checkAccessToken();
    
    // Validate that the IDs are positive integers
    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      throw new Error(`Invalid series ID: ${seriesId}. ID must be a positive integer.`);
    }
    
    if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
      throw new Error(`Invalid season number: ${seasonNumber}. Season number must be a non-negative integer.`);
    }
    
    if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
      throw new Error(`Invalid episode number: ${episodeNumber}. Episode number must be a positive integer.`);
    }
    
    try {
      const result = await fetchAPI(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, {
        headers: getHeaders(),
      });
      return result;
    } catch (error) {
      const error_ = error as Error & { status?: number };
      
      // Throw a specific error for 404 not found
      if (error_.status === 404) {
        const notFoundError = new Error(`Episode ${episodeNumber} of season ${seasonNumber} for series ${seriesId} not found`) as Error & { 
          status: number; 
          code: string;
        };
        notFoundError.status = 404;
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  },

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
      const data = await fetchAPI(
        `${BASE_URL}/discover/${mediaType}?${searchParams}`,
        { headers: getHeaders() }
      );
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

    const data = await fetchAPI(
      `${endpoint}?${searchParams}`,
      { headers: getHeaders() }
    );
    return data as T extends "movie" ? TMDBMovieResponse : TMDBTVResponse;
  },

  // Health check utility
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    try {
      checkAccessToken();
      await fetchAPI(`${BASE_URL}/configuration`, {
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
