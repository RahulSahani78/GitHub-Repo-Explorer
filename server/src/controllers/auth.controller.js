import { login, signup } from '../services/auth.service.js';

/** POST /api/auth/signup */
export async function postSignup(req, res) {
  const { name, email, password } = req.body ?? {};
  const result = await signup({ name, email, password });
  res.status(201).json(result);
}

/** POST /api/auth/login */
export async function postLogin(req, res) {
  const { email, password } = req.body ?? {};
  const result = await login({ email, password });
  res.json(result);
}

/** GET /api/auth/me — requireAuth has already populated req.user. */
export async function getMe(req, res) {
  res.json({ user: req.user });
}
