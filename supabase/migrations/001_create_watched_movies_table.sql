-- Create watched_movies table for storing user's watched movie data
CREATE TABLE IF NOT EXISTS watched_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  movie_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  vote_average REAL NOT NULL,
  genre_ids INTEGER[] DEFAULT '{}',
  added_at BIGINT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  user_rating INTEGER CHECK (user_rating >= 0 AND user_rating <= 5),
  comment TEXT CHECK (LENGTH(comment) <= 140),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one entry per user per movie
  UNIQUE(user_id, movie_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_updated_at ON watched_movies(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_watched_movies_is_favorite ON watched_movies(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Enable Row Level Security
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only access their own data
CREATE POLICY "Users can only access their own watched movies"
  ON watched_movies
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_watched_movies_updated_at
  BEFORE UPDATE ON watched_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
