export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
}

export interface TMDBMovieDetail extends Omit<TMDBMovie, "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
  homepage: string;
  imdb_id: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  similar?: TMDBMovieListResponse;
  recommendations?: TMDBMovieListResponse;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBMovieListResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenreListResponse {
  genres: { id: number; name: string }[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: TMDBMovie[];
}

export interface TMDBPersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  movie_credits?: {
    cast: (TMDBMovie & { character: string })[];
    crew: (TMDBMovie & { job: string; department: string })[];
  };
}

export interface TMDBPersonListResponse {
  page: number;
  results: TMDBPerson[];
  total_pages: number;
  total_results: number;
}
