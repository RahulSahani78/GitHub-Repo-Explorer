import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { LogOutIcon, RepoIcon } from './icons';

/** Derive up to two initials from a name for the avatar chip. */
function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-on-accent">
            <RepoIcon className="size-[22px]" />
          </span>
          <div className="leading-tight">
            <h1 className="text-[17px] font-bold tracking-tight text-text">Repo Explorer</h1>
            <p className="text-xs text-faint">GitHub profiles &amp; repositories</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1 pl-1 pr-1.5">
              <span
                className="grid size-8 place-items-center rounded-lg bg-accent-soft text-sm font-bold text-accent"
                aria-hidden
              >
                {initials(user.name)}
              </span>
              <span className="hidden max-w-[10rem] truncate text-[15px] font-medium text-text sm:block">
                {user.name.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
                className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <LogOutIcon className="size-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
