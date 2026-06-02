import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Explorer } from './components/Explorer';
import { RepoIcon } from './components/icons';

/** Decides what to render based on auth status. */
function Gate() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="grid size-11 animate-pulse place-items-center rounded-xl bg-accent text-on-accent">
            <RepoIcon className="size-6" />
          </span>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') return <AuthScreen />;

  return (
    <div className="min-h-dvh">
      <Header />
      <Explorer />
      <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-faint">
        Data from the GitHub REST API, proxied and cached by a Node.js backend.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
