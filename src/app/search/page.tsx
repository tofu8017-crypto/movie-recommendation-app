import { searchMoviesWithFallback, searchPeopleWithFallback } from "@/lib/tmdb/endpoints";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { DirectorCard } from "@/components/movie/DirectorCard";
import { SearchX } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return {
    title: q
      ? `「${q}」の検索結果 | おすすめな映画をおしえてくれるやつ`
      : "映画を検索 | おすすめな映画をおしえてくれるやつ",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  if (!q) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-foreground">映画を検索</h1>
        <SearchInput size="large" autoFocus />
      </div>
    );
  }

  const [movieResults, personResults] = await Promise.all([
    searchMoviesWithFallback(q, page),
    page === 1 ? searchPeopleWithFallback(q) : null,
  ]);

  const directors =
    personResults?.results.filter(
      (p) => p.known_for_department === "Directing"
    ) || [];

  const actors =
    personResults?.results.filter(
      (p) => p.known_for_department === "Acting"
    ) || [];

  const hasResults =
    movieResults.results.length > 0 ||
    directors.length > 0 ||
    actors.length > 0;

  const personSummary = [
    directors.length > 0 ? `${directors.length}人の監督` : "",
    actors.length > 0 ? `${actors.length}人の俳優` : "",
  ]
    .filter(Boolean)
    .join("、");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        「{q}」の検索結果
      </h1>
      <p className="mb-6 text-sm text-foreground-secondary">
        {movieResults.total_results}件の映画
        {personSummary && `、${personSummary}`}
        が見つかりました
      </p>

      {hasResults ? (
        <>
          {/* Directors */}
          {directors.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-foreground">監督</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {directors.slice(0, 5).map((director) => (
                  <DirectorCard key={director.id} person={director} type="director" />
                ))}
              </div>
            </section>
          )}

          {/* Actors */}
          {actors.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-foreground">俳優</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {actors.slice(0, 5).map((actor) => (
                  <DirectorCard key={actor.id} person={actor} type="actor" />
                ))}
              </div>
            </section>
          )}

          {/* Hint when no people found but movies exist */}
          {directors.length === 0 && actors.length === 0 && page === 1 && (
            <p className="mb-6 text-xs text-foreground-secondary">
              監督・俳優が見つからない場合は、英語名やフルネームで検索してみてください（例: &quot;Shyamalan&quot;, &quot;M・ナイト・シャマラン&quot;）
            </p>
          )}

          {/* Movies */}
          {movieResults.results.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-foreground">映画</h2>
              <MovieGrid movies={movieResults.results} />
            </section>
          )}

          {/* Pagination */}
          {movieResults.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
                  className="rounded-lg bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  前のページ
                </Link>
              )}
              <span className="text-sm text-foreground-secondary">
                {page} / {movieResults.total_pages}
              </span>
              {page < movieResults.total_pages && (
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
                  className="rounded-lg bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  次のページ
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="見つかりませんでした"
          description="別のキーワードや英語名で検索してみてください。人物名はフルネームだとヒットしやすいです"
          actionLabel="ホームに戻る"
          actionHref="/"
        />
      )}
    </div>
  );
}
