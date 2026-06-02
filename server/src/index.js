import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`🚀 GitHub Repo Explorer API listening on http://localhost:${env.port}`);
  console.log(`   CORS origins: ${env.corsOrigins.join(', ')}`);
  console.log(`   GitHub auth:  ${env.githubToken ? 'token configured' : 'unauthenticated (60 req/hr)'}`);
});
