"use client";

/**
 * Skeleton loading primitives.
 * Use these while content is loading or providers are hydrating.
 */

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

/**
 * Full page skeleton matching the app layout.
 * Shown during provider hydration to prevent flash.
 */
export default function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Navbar skeleton */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-5xl mx-auto glass-nav px-4 sm:px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonCircle className="w-7 h-7" />
            <SkeletonLine className="w-12 h-4" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <SkeletonLine className="w-20 h-4" />
            <SkeletonLine className="w-16 h-4" />
            <SkeletonLine className="w-16 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonCircle className="w-8 h-8" />
            <SkeletonCircle className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="pt-28 sm:pt-32 pb-6 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <SkeletonLine className="w-48 h-7 !rounded-full" />
          </div>
          {/* Title */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <SkeletonLine className="w-72 sm:w-96 h-10" />
            <SkeletonLine className="w-56 sm:w-80 h-5" />
          </div>
          {/* Form card */}
          <SkeletonCard className="w-full h-80 sm:h-96" />
        </div>
      </div>
    </div>
  );
}
