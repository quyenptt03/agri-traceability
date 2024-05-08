import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

const registerUser = {
  first_name: 'test',
  last_name: '123',
  email: 'test123@gmail.com',
  password: '1230123',
};

describe('POST /api/v1/auth/register - user register', () => {
  describe('when the email or password is missing', () => {
    test('should respond with a status code of 400', async () => {
      const bodyData = [
        { email: registerUser.email },
        { password: registerUser.password },
        {},
      ];
      for (const body of bodyData) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe('given a first name, last name, email and password', () => {
    test('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerUser);

      expect(response.statusCode).toBe(201);
      expect(response.body.user.userId).toBeDefined();
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
      const tokenValue = response.headers['set-cookie'][0].split('=');
      const tokenName = tokenValue[0];
      const token = tokenValue[1];

      expect(tokenName).toBe('token');
      expect(token).toBeDefined();
    });
  });

  describe('email already exists', () => {
    test('should respond with a 400 status code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe('Email already exists');
    });
  });
});

describe('POST /api/v1/auth/login - user login', () => {
  describe('given a email and password', () => {
    test('should respond with a 200 status code', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@gmail.com',
        password: '1230123',
      });
      expect(response.statusCode).toBe(200);
    });

    test('should specify json in the content type header', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@gmail.com',
        password: '1230123',
      });
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json')
      );
    });

    test('cookies has access token', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@gmail.com',
        password: '1230123',
      });
      const tokenValue = response.headers['set-cookie'][0].split('=');
      const tokenName = tokenValue[0];
      const token = tokenValue[1];

      expect(tokenName).toBe('token');
      expect(token).toBeDefined();
    });

    test('response has userId', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@gmail.com',
        password: '1230123',
      });
      expect(response.body.user.userId).toBeDefined();
    });
  });

  describe('when the email or password is missing', () => {
    test('should respond with a status code of 400', async () => {
      const bodyData = [
        { email: 'admin@gmail.com' },
        { password: '1230123' },
        {},
      ];
      for (const body of bodyData) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });

  describe('when the email or password is invalid', () => {
    test('should respond with a status code of 401', async () => {
      const bodyData = [
        { email: 'admin@gmail.com', password: 'aaaaaaaaaa' },
        { email: 'test@gmail.com', password: '1230123' },
        { email: 'test@gmail.com', password: 'aaaaaaaaaa' },
      ];
      for (const body of bodyData) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(body);
        expect(response.statusCode).toBe(401);
      }
    });
  });
});

describe('GET /api/v1/auth/logout', () => {
  describe('logout', () => {
    test('should respond with a 200 status code', async () => {
      const response = await request(app).get('/api/v1/auth/logout');
      expect(response.statusCode).toBe(200);
    });
  });
});
