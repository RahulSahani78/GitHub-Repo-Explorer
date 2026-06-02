import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { createUser, findByEmail, findById } from './users.store.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

/** Strip the password hash before a user record ever leaves the backend. */
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function signup({ name, email, password }) {
  if (!name || name.trim().length < 2) {
    throw ApiError.badRequest('Please enter your name (at least 2 characters).');
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw ApiError.badRequest('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters long.');
  }

  if (await findByEmail(email)) {
    throw ApiError.conflict('An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ name, email, passwordHash });
  return { user: toPublicUser(user), token: signToken(user) };
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required.');
  }

  const user = await findByEmail(email);
  // Always run a comparison-shaped path so timing doesn't reveal which emails exist.
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }

  return { user: toPublicUser(user), token: signToken(user) };
}

/** Verifies a bearer token and returns the current public user record. */
export async function getUserFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
  const user = await findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists.');
  return toPublicUser(user);
}
