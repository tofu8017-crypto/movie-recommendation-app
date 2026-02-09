import { Skeleton } from "@/components/ui/Skeleton";

export default function MovieDetailLoading() {
  return (
    <div>
      <Skeleton className="-mx-4 -mt-6 mb-8 h-64 sm:h-80 md:h-96" />
      <div className="flex flex-col gap-8 sm:flex-row">
        <Skeleton className="mx-auto aspect-[2/3] w-48 rounded-xl sm:w-64" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-8 w-2/3" />
          <Skeleton className="mb-4 h-4 w-1/3" />
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="mb-4 h-5 w-48" />
          <Skeleton className="mb-6 h-10 w-40 rounded-full" />
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </div>
  );
}
