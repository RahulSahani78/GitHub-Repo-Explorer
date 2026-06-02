import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { githubRouter } from './routes/github.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';


export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json());

  // Liveness probe — handy for uptime checks and hosting platforms.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/github', githubRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
