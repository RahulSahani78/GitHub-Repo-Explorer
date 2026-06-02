import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-text"
    >
      {isDark ? <MoonIcon className="size-[18px]" /> : <SunIcon className="size-[18px]" />}
    </button>
  );
}
