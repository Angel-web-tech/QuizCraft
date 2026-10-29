process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('reports API health with a consistent success envelope', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, name: 'QuizCraft API' });
});

test('rejects unauthenticated access to both role-protected areas', async () => {
  for (const route of ['/api/student/dashboard', '/api/admin/dashboard']) {
    const response = await fetch(`${baseUrl}${route}`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
  }
});

test('rejects requests from an untrusted browser origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { Origin: 'https://untrusted.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Example', role: 'admin' }),
  });
  assert.equal(response.status, 403);
});

test('public registration rejects an admin role without student registration fields', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Example Admin', email: 'admin@example.test', password: 'a-strong-password', role: 'admin' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /register number/);
});
