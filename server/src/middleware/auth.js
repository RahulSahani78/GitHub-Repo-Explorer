import { ApiError } from '../utils/ApiError.js';
import { getUserFromToken } from '../services/auth.service.js';

/**
 * Gate middleware: requires a valid `Authorization: Bearer <token>` header.
 * On success it attaches the public user record to `req.user`; otherwise it
 * forwards a 401 to the error handler. This is what protects the GitHub proxy
 * routes so only signed-in users can search.
 */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Authentication required. Please sign in.');
    }

    req.user = await getUserFromToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
