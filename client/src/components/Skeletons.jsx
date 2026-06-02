// Skeleton placeholders shown while data is loading. They mirror the real
// layout so the page doesn't jump when content arrives.

export function ProfileSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]" aria-hidden>
      <div className="skeleton h-16" />
      <div className="px-6 pb-6">
        <div className="-mt-9 flex items-end gap-4">
          <div className="skeleton size-[88px] shrink-0 rounded-2xl border-4 border-surface" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-full max-w-md rounded" />
          <div className="grid grid-cols-3 gap-2">
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
            <div className="skeleton h-16 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function RepoListSkeleton({ count = 4 }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="space-y-3">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-4 w-full max-w-lg rounded" />
            <div className="flex gap-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <ProfileSkeleton />
      <RepoListSkeleton />
    </div>
  );
}
