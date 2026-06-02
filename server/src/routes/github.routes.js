import { Router } from 'express';
import { getUserProfile, getUserRepos } from '../controllers/github.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const githubRouter = Router();

// Every GitHub proxy route requires a signed-in user.
githubRouter.use(requireAuth);

githubRouter.get('/users/:username', asyncHandler(getUserProfile));
githubRouter.get('/users/:username/repos', asyncHandler(getUserRepos));
