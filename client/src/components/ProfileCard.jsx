import { formatCount, formatMonthYear } from '../lib/format';
import { ExternalLinkIcon, LinkIcon, PinIcon, UsersIcon } from './icons';

export function ProfileCard({ profile }) {
  const blogHref = normaliseUrl(profile.blog);

  return (
    <section
      aria-label={`Profile for ${profile.login}`}
      className="animate-in overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]"
    >
      {/* Accent banner for a bit of visual richness. */}
      <div className="h-16 bg-gradient-to-r from-accent/80 via-accent to-accent/70" />

      <div className="px-6 pb-6">
        <div className="-mt-9 flex flex-col gap-4 sm:flex-row sm:items-end">
          <img
            src={profile.avatarUrl}
            alt={`${profile.login}'s avatar`}
            width={88}
            height={88}
            loading="lazy"
            className="size-[88px] shrink-0 rounded-2xl border-4 border-surface bg-surface-2 shadow-md"
          />
          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-text">
                {profile.name ?? profile.login}
              </h2>
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-accent hover:underline"
              >
                @{profile.login}
                <ExternalLinkIcon className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        {profile.bio && <p className="mt-3 text-[15px] leading-relaxed text-muted">{profile.bio}</p>}

        <dl className="mt-4 grid grid-cols-3 gap-2">
          <StatTile value={profile.followers} label="Followers" />
          <StatTile value={profile.following} label="Following" />
          <StatTile value={profile.publicRepos} label="Repositories" />
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
          {profile.company && <Meta icon={<UsersIcon className="size-3.5" />} text={profile.company} />}
          {profile.location && <Meta icon={<PinIcon className="size-3.5" />} text={profile.location} />}
          {blogHref && (
            <a
              href={blogHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-accent"
            >
              <LinkIcon className="size-3.5" />
              <span className="max-w-[12rem] truncate">{profile.blog}</span>
            </a>
          )}
          <span>Joined {formatMonthYear(profile.createdAt)}</span>
        </div>
      </div>
    </section>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-3 py-3 text-center">
      <dd className="text-xl font-bold tabular-nums text-text">{formatCount(value)}</dd>
      <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-faint">{label}</dt>
    </div>
  );
}

function Meta({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      <span className="max-w-[12rem] truncate">{text}</span>
    </span>
  );
}

function normaliseUrl(blog) {
  if (!blog) return null;
  return /^https?:\/\//i.test(blog) ? blog : `https://${blog}`;
}
