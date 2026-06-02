import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Back the user store with an in-memory array so tests never touch the disk.
vi.mock('../src/services/users.store.js', () => {
  let users = [];
  let counter = 0;
  return {
    findByEmail: async (email) =>
      users.find((u) => u.email === email.trim().toLowerCase()) ?? null,
    findById: async (id) => users.find((u) => u.id === id) ?? null,
    createUser: async ({ name, email, passwordHash }) => {
      const user = {
        id: `usr_${++counter}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        createdAt: '2024-01-01T00:00:00Z',
      };
      users.push(user);
      return user;
    },
    __reset: () => {
      users = [];
      counter = 0;
    },
  };
});

const { createApp } = await import('../src/app.js');
const { __reset } = await import('../src/services/users.store.js');

const app = createApp();
const credentials = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret1' };

describe('Auth API routes', () => {
  beforeEach(() => __reset());

  it('signs up a new user and returns a token without leaking the password', async () => {
    const res = await request(app).post('/api/auth/signup').send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe('ada@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects a weak password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...credentials, password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate signups with 409', async () => {
    await request(app).post('/api/auth/signup').send(credentials);
    const res = await request(app).post('/api/auth/signup').send(credentials);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await request(app).post('/api/auth/signup').send(credentials);

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTypeOf('string');

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrongpassword' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user from /me with a valid token and 401 without one', async () => {
    const signup = await request(app).post('/api/auth/signup').send(credentials);
    const token = signup.body.token;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('ada@example.com');

    const noAuth = await request(app).get('/api/auth/me');
    expect(noAuth.status).toBe(401);
  });
});
