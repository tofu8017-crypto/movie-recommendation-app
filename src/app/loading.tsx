import { MovieGridSkeleton } from "@/components/movie/MovieCardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div>
      <section className="flex flex-col items-center py-12 sm:py-16">
        <Skeleton className="mb-4 h-12 w-12 rounded-full" />
        <Skeleton className="mb-3 h-10 w-72" />
        <Skeleton className="mb-8 h-5 w-64" />
        <Skeleton className="h-16 w-full max-w-lg rounded-2xl" />
      </section>
      <section className="mb-12">
        <Skeleton className="mb-4 h-7 w-32" />
        <MovieGridSkeleton />
      </section>
    </div>
  );
}
