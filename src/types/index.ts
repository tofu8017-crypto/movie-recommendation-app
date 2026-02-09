export interface WatchedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  addedAt: number;
  isFavorite?: boolean;
  userRating?: number; // 0-5 stars
  comment?: string; // Max ~140 characters
}
