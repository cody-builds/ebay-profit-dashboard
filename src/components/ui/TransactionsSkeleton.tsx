export function TransactionsSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-3 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Row Skeletons */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
              <div className="col-span-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div className="col-span-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div className="col-span-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div className="col-span-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
              </div>
              <div className="col-span-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-6"></div>
              </div>
              <div className="col-span-1">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}