process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { register, login } = require('../controllers/authController');

function responseDouble() {
  return {
    statusCode: 200,
    cookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
      return this;
    },
  };
}

test('public registration always creates a student and never returns its password hash', async () => {
  const originalCreate = User.create;
  let created;
  User.create = async (document) => {
    created = document;
    return { ...document, id: 'student-id', createdAt: new Date() };
  };

  try {
    const response = responseDouble();
    await register({
      body: {
        name: 'Example Student',
        email: 'student@example.test',
        registerNumber: 'S-100',
        department: 'Science',
        password: 'a-strong-password',
        role: 'admin',
      },
    }, response, (error) => { throw error; });

    assert.equal(response.statusCode, 201);
    assert.equal(created.role, 'student');
    assert.equal(response.body.data.user.role, 'student');
    assert.equal('passwordHash' in response.body.data.user, false);
  } finally {
    User.create = originalCreate;
  }
});

test('login enforces the selected role and sets an HttpOnly SameSite session cookie', async () => {
  const originalFindOne = User.findOne;
  const passwordHash = await bcrypt.hash('correct-password', 4);
  User.findOne = () => ({
    select: async () => ({
      id: 'admin-id',
      name: 'Example Admin',
      email: 'admin@example.test',
      role: 'admin',
      isActive: true,
      passwordHash,
    }),
  });

  try {
    const response = responseDouble();
    await login({
      body: { email: 'admin@example.test', password: 'correct-password', role: 'student' },
    }, response, (error) => { throw error; });
    assert.equal(response.statusCode, 401);
    assert.equal(response.cookies.length, 0);

    const successfulResponse = responseDouble();
    await login({
      body: { email: 'admin@example.test', password: 'correct-password', role: 'admin' },
    }, successfulResponse, (error) => { throw error; });
    assert.equal(successfulResponse.statusCode, 200);
    assert.equal(successfulResponse.body.data.user.role, 'admin');
    assert.equal(successfulResponse.cookies[0].options.httpOnly, true);
    assert.equal(successfulResponse.cookies[0].options.sameSite, 'strict');
  } finally {
    User.findOne = originalFindOne;
  }
});
