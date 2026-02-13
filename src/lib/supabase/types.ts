export type Database = {
  public: {
    Tables: {
      watched_movies: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path: string | null;
          vote_average: number;
          genre_ids: number[];
          added_at: number;
          is_favorite: boolean;
          user_rating: number | null;
          comment: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          title: string;
          poster_path?: string | null;
          vote_average: number;
          genre_ids?: number[];
          added_at: number;
          is_favorite?: boolean;
          user_rating?: number | null;
          comment?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: number;
          title?: string;
          poster_path?: string | null;
          vote_average?: number;
          genre_ids?: number[];
          added_at?: number;
          is_favorite?: boolean;
          user_rating?: number | null;
          comment?: string | null;
          updated_at?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type WatchedMovieRow = Database["public"]["Tables"]["watched_movies"]["Row"];
export type WatchedMovieInsert = Database["public"]["Tables"]["watched_movies"]["Insert"];
export type WatchedMovieUpdate = Database["public"]["Tables"]["watched_movies"]["Update"];
