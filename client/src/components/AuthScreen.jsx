import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { ThemeToggle } from './ThemeToggle';
import { EyeIcon, EyeOffIcon, GitHubMark } from './icons';

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) await signup(form);
      else await login({ email: form.email, password: form.password });
      // On success the AuthProvider flips status and this screen unmounts.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[500px]">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-text text-canvas">
            <GitHubMark className="size-6" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight text-text">Repo Explorer</p>
            <p className="text-[13px] text-faint">Browse GitHub profiles &amp; repos</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-card)] sm:p-9">
          <h1 className="text-[26px] font-bold tracking-tight text-text">
            {isSignup ? 'Create your account' : 'Sign in'}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            {isSignup
              ? 'It only takes a moment to get started.'
              : 'Welcome back — pick up where you left off.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {isSignup && (
              <Field
                id="name"
                label="Name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={update('name')}
                required
              />
            )}

            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />

            <Field
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              value={form.password}
              onChange={update('password')}
              hint={isSignup ? 'Use at least 8 characters.' : undefined}
              required
              hasTrailing
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="grid size-8 place-items-center rounded-md text-faint transition-colors hover:text-text"
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              }
            />

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-500"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[15px] text-muted">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" onClick={switchMode} className="font-semibold text-accent hover:underline">
            {isSignup ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <p className="mt-8 text-center text-[13px] text-faint">Studio Graphene · Exercise 3</p>
      </div>
    </div>
  );
}

function Field({ label, hint, trailing, hasTrailing = false, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...inputProps}
          className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-text shadow-sm outline-none transition-colors placeholder:text-faint focus:border-accent ${
            hasTrailing ? 'pr-12' : ''
          }`}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {hint && <p className="mt-1.5 text-[13px] text-faint">{hint}</p>}
    </div>
  );
}
