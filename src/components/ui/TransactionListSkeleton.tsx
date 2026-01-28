export function TransactionListSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, index) => (
          <TransactionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function TransactionCardSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* Title and profit */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg">
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
}