import { useState } from 'react';
import { formatCount, formatRelativeTime } from '../lib/format';
import { colorForLanguage } from '../lib/languageColors';
import { ChevronIcon, ExternalLinkIcon, ForkIcon, IssueIcon, StarIcon } from './icons';

export function RepoCard({ repo, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `repo-details-${repo.id}`;
  const accent = repo.language ? colorForLanguage(repo.language) : 'var(--color-accent)';

  return (
    <li
      className="group animate-in self-start overflow-hidden rounded-2xl border border-l-[5px] border-border bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-pop)] motion-reduce:transform-none motion-reduce:transition-none"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms`, borderLeftColor: accent }}
    >
      <div className="flex items-start gap-3 p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight text-text transition-colors hover:text-accent"
            >
              {repo.name}
              <ExternalLinkIcon className="size-4 text-faint transition-colors group-hover:text-accent" />
            </a>
            {repo.isFork && <Tag>Fork</Tag>}
            {repo.isArchived && <Tag tone="warn">Archived</Tag>}
          </div>

          {repo.description && (
            <p className="mt-2 line-clamp-2 text-base leading-relaxed text-muted">{repo.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {repo.language && (
              <Pill>
                <span className="size-2.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
                {repo.language}
              </Pill>
            )}
            <Pill title={`${repo.stars} stars`}>
              <StarIcon className="size-4 text-amber-500" />
              {formatCount(repo.stars)}
            </Pill>
            <Pill title={`${repo.forks} forks`}>
              <ForkIcon className="size-4" />
              {formatCount(repo.forks)}
            </Pill>
            <span className="ml-0.5 text-sm text-faint">Updated {formatRelativeTime(repo.pushedAt)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-transparent text-muted transition-colors hover:border-border hover:bg-surface-2 hover:text-text"
        >
          <span className="sr-only">{expanded ? 'Hide details' : 'Show details'}</span>
          <ChevronIcon
            className={`size-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Height-animated reveal: the grid 0fr→1fr trick collapses to a true 0
          height when closed, so the card never reserves space for hidden details. */}
      <div
        id={detailsId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border bg-surface-2/40 px-5 py-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-base sm:grid-cols-4">
              <Detail label="Open issues" icon={<IssueIcon className="size-4" />}>
                {formatCount(repo.openIssues)}
              </Detail>
              <Detail label="Default branch">
                <code className="rounded bg-surface px-1.5 py-0.5 text-sm">{repo.defaultBranch}</code>
              </Detail>
              <Detail label="Watchers">{formatCount(repo.watchers)}</Detail>
              <Detail label="License">{repo.license ?? '—'}</Detail>
            </dl>

            {repo.topics.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {repo.topics.slice(0, 10).map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full bg-accent-soft px-2.5 py-1 text-[13px] font-medium text-accent"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            )}

            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                {repo.homepage}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function Pill({ children, title }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-medium text-muted"
    >
      {children}
    </span>
  );
}

function Detail({ label, icon, children }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-sm text-faint">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold text-text">{children}</dd>
    </div>
  );
}

function Tag({ children, tone = 'default' }) {
  const tones = {
    default: 'border-border-strong text-muted',
    warn: 'border-amber-500/40 text-amber-500',
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
