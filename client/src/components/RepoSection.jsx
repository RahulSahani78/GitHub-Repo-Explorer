import { useRef } from 'react';
import { RepoCard } from './RepoCard';
import { SortControls } from './SortControls';
import { Pagination } from './Pagination';
import { EmptyRepos } from './StateViews';

export function RepoSection({
  login,
  repos,
  pagination,
  sort,
  pageLoading,
  truncated,
  onSort,
  onPageChange,
}) {
  const topRef = useRef(null);
  const total = pagination?.total ?? repos.length;

  if (total === 0) return <EmptyRepos login={login} />;

  const handlePageChange = (page) => {
    onPageChange(page);
    // Bring the top of the list into view so the user keeps their place.
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-label="Repositories" className="space-y-4">
      <div ref={topRef} className="scroll-mt-20">
        <SortControls sort={sort} total={total} onChange={onSort} />
      </div>

      <ul
        className={`grid grid-cols-1 gap-3.5 transition-opacity duration-200 ${
          pageLoading ? 'pointer-events-none opacity-50' : 'opacity-100'
        }`}
      >
        {repos.map((repo, i) => (
          <RepoCard key={repo.id} repo={repo} index={i} />
        ))}
      </ul>

      <Pagination pagination={pagination} busy={pageLoading} onChange={handlePageChange} />

      {truncated && (
        <p className="text-center text-[13px] text-faint">
          Showing the first {total} repositories. This user has more than we fetch in one go.
        </p>
      )}
    </section>
  );
}
