export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-800 ${className}`} />
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);
