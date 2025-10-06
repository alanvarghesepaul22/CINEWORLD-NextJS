// TMDB API Types

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  origin_country: string[]
  original_language: string
  original_name: string
  popularity: number
}

export interface TMDBTrendingResponse {
  page: number
  results: (TMDBMovie | TMDBTVShow)[]
  total_pages: number
  total_results: number
}

/**
 * Genre interface for TMDB API responses.
 * Represents genres returned directly from TMDB with a required numeric ID.
 */
export interface TMDBGenre {
  id: number
  name: string
}

/**
 * Genre interface for internal use in detailed movie/TV responses.
 * Used when genres are processed internally where ID may be absent.
 */
export interface Genre {
  id?: number
  name: string
}

export interface TMDBProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface TMDBProductionCountry {
  iso_3166_1: string
  name: string
}

export interface TMDBSpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface TMDBMovieDetail extends Omit<TMDBMovie, 'genre_ids'> {
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
  } | null
  budget: number
  genres: Genre[]
  homepage: string | null
  imdb_id: string | null
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  revenue: number
  runtime: number | null
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline: string | null
}

export interface TMDBCreatedBy {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string | null
}

export interface TMDBNetwork {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface TMDBSeason {
  air_date: string | null
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  vote_average: number
}

/**
 * Episode summary interface for TMDB TV detail responses.
 * Represents episode information for last_episode_to_air and next_episode_to_air fields.
 */
export interface EpisodeSummary {
  id: number
  name: string
  overview: string
  vote_average: number
  vote_count: number
  air_date: string
  episode_number: number
  episode_type: string
  production_code: string
  runtime: number | null
  season_number: number
  show_id: number
  still_path: string | null
}

export interface TMDBTVDetail extends Omit<TMDBTVShow, 'genre_ids'> {
  created_by: TMDBCreatedBy[]
  episode_run_time: number[]
  genres: Genre[]
  homepage: string
  in_production: boolean
  languages: string[]
  last_air_date: string | null
  last_episode_to_air: EpisodeSummary | null
  networks: TMDBNetwork[]
  next_episode_to_air: EpisodeSummary | null
  number_of_episodes: number
  number_of_seasons: number
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  seasons: TMDBSeason[]
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline: string
  type: string
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[]
}

export interface TMDBSearchResponse {
  page: number
  results: (TMDBMovie | TMDBTVShow)[]
  total_pages: number
  total_results: number
}

// Watchlist types
export interface WatchlistItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  addedAt: string
}

// Resume watching types
export interface ResumeData {
  id: number
  type: 'movie' | 'tv'
  progress: number // percentage 0-100
  lastWatched: string
}