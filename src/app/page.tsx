import { getPopularMovies, getNowPlayingMovies } from "@/lib/tmdb/endpoints";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { SearchInput } from "@/components/ui/SearchInput";
import { Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [popular, nowPlaying] = await Promise.all([
    getPopularMovies(),
    getNowPlayingMovies(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center py-12 text-center sm:py-16">
        <Film className="mb-4 h-12 w-12 text-primary" />
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
          おすすめな映画を
          <br className="sm:hidden" />
          おしえてくれるやつ
        </h1>
        <p className="mb-8 max-w-md text-foreground-secondary">
          観た映画を記録して、あなたにぴったりの次の一本を見つけよう
        </p>
        <div className="w-full max-w-lg">
          <SearchInput size="large" autoFocus />
        </div>
      </section>

      {/* Popular */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-foreground">人気の映画</h2>
        <MovieGrid movies={popular.results.slice(0, 10)} />
      </section>

      {/* Now Playing */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-foreground">最近公開</h2>
        <MovieGrid movies={nowPlaying.results.slice(0, 10)} />
      </section>
    </div>
  );
}
