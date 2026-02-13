import { supabase } from "./client";
import type { WatchedMovie } from "@/types";
import type { WatchedMovieInsert, WatchedMovieUpdate } from "./types";

// Convert LocalStorage WatchedMovie to Supabase format
function toSupabaseFormat(
  movie: WatchedMovie,
  userId: string
): WatchedMovieInsert {
  return {
    user_id: userId,
    movie_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    genre_ids: movie.genre_ids || [],
    added_at: movie.addedAt,
    is_favorite: movie.isFavorite || false,
    user_rating: movie.userRating || null,
    comment: movie.comment || null,
  };
}

// Convert Supabase row to LocalStorage WatchedMovie format
function fromSupabaseFormat(row: any): WatchedMovie {
  return {
    id: row.movie_id,
    title: row.title,
    poster_path: row.poster_path,
    vote_average: row.vote_average,
    genre_ids: row.genre_ids || [],
    addedAt: row.added_at,
    isFavorite: row.is_favorite,
    userRating: row.user_rating,
    comment: row.comment,
  };
}

// Fetch all watched movies for a user
export async function fetchWatchedMovies(
  userId: string
): Promise<WatchedMovie[]> {
  const { data, error } = await supabase
    .from("watched_movies")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching watched movies:", error);
    throw error;
  }

  return data.map(fromSupabaseFormat);
}

// Sync local movies to cloud
export async function syncMoviesToCloud(
  userId: string,
  movies: WatchedMovie[]
): Promise<void> {
  // Use upsert to insert new and update existing
  const supabaseMovies = movies.map((movie) =>
    toSupabaseFormat(movie, userId)
  );

  const { error } = await supabase
    .from("watched_movies")
    .upsert(supabaseMovies, {
      onConflict: "user_id,movie_id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Error syncing movies to cloud:", error);
    throw error;
  }
}

// Add or update a single movie
export async function upsertMovie(
  userId: string,
  movie: WatchedMovie
): Promise<void> {
  const { error } = await supabase
    .from("watched_movies")
    .upsert(toSupabaseFormat(movie, userId), {
      onConflict: "user_id,movie_id",
    });

  if (error) {
    console.error("Error upserting movie:", error);
    throw error;
  }
}

// Delete a movie
export async function deleteMovie(
  userId: string,
  movieId: number
): Promise<void> {
  const { error } = await supabase
    .from("watched_movies")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) {
    console.error("Error deleting movie:", error);
    throw error;
  }
}

// Get last sync timestamp
export async function getLastSyncTimestamp(
  userId: string
): Promise<Date | null> {
  const { data, error } = await supabase
    .from("watched_movies")
    .select("updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return new Date(data.updated_at);
}
