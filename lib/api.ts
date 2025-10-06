import {
  TMDBMovie,
  TMDBTVShow,
  TMDBTrendingResponse,
  TMDBGenresResponse,
  TMDBSearchResponse,
  TMDBMovieDetail,
  TMDBTVDetail,
} from "./types";

// Support both legacy API_KEY and new ACCESS_TOKEN for backward compatibility
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

const checkAccessToken = () => {
  if (!ACCESS_TOKEN) {
    throw new Error(
      "TMDB Access Token not configured. Please set TMDB_ACCESS_TOKEN environment variable."
    );
  }
};

const getHeaders = () => ({
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  accept: "application/json",
});

// Function overloads for getDetails
function getDetails(mediaType: "movie", id: number): Promise<TMDBMovieDetail>;
function getDetails(mediaType: "tv", id: number): Promise<TMDBTVDetail>;

async function getDetails(
  mediaType: "movie" | "tv",
  id: number
): Promise<TMDBMovieDetail | TMDBTVDetail> {
  checkAccessToken();
  const response = await fetch(`${BASE_URL}/${mediaType}/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch details");
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
    const response = await fetch(
      `${BASE_URL}/trending/${mediaType}/${timeWindow}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch trending data");
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
    const response = await fetch(
      `${BASE_URL}/${mediaType}/popular?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch popular data");
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
    const response = await fetch(
      `${BASE_URL}/${mediaType}/top_rated?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch top rated data");
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
    const response = await fetch(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch now playing data");
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
    const response = await fetch(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch upcoming data");
    return response.json();
  },

  // Genres
  async getGenres(mediaType: "movie" | "tv"): Promise<TMDBGenresResponse> {
    checkAccessToken();
    const response = await fetch(`${BASE_URL}/genre/${mediaType}/list`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch genres");
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

    const response = await fetch(
      `${BASE_URL}/discover/${mediaType}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch discover data");
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

    const response = await fetch(`${BASE_URL}/search/multi?${searchParams}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to search");
    return response.json();
  },

  // Get details with type-safe overloads
  getDetails,
};
