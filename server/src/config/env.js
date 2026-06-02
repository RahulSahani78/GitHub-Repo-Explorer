import 'dotenv/config';

/**
 * Centralised, validated environment configuration.
 * Reading process.env in exactly one place keeps the rest of the codebase
 * free of stringly-typed env access and makes defaults explicit.
 */
function parseOrigins(raw) {
  if (!raw) return ['http://localhost:5173'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseNumber(raw, fallback) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const env = {
  port: parseNumber(process.env.PORT, 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  githubToken: process.env.GITHUB_TOKEN?.trim() || undefined,
  cacheTtlMs: parseNumber(process.env.CACHE_TTL_SECONDS, 60) * 1000,
  maxRepos: parseNumber(process.env.MAX_REPOS, 300),
  isProduction: process.env.NODE_ENV === 'production',
};
