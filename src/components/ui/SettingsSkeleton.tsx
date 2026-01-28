export function SettingsSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Card 1 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full mt-4"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-28 mb-4"></div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Card 3 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-4"></div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-40 mb-4"></div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
              <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}