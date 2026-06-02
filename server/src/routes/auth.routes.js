import { Router } from 'express';
import { getMe, postLogin, postSignup } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/signup', asyncHandler(postSignup));
authRouter.post('/login', asyncHandler(postLogin));
authRouter.get('/me', requireAuth, asyncHandler(getMe));
