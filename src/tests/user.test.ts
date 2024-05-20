import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

const newUser = {
  first_name: 'new',
  last_name: 'user',
  email: 'newuser@gmail.com',
  password: '1230123',
  role: 'user',
};

let jwtToken = '';
let userCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/users', () => {
  describe('get all users', () => {
    test('should get all users if user is admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(response.statusCode).toBe(200);
      expect(response.body.users).toBeInstanceOf(Array);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).get('/api/v1/users');

      expect(res.statusCode).toBe(401);
    });

    // test('should throw error unauthorized when the user is not an admin', async () => {
    //   const res = await request(app)
    //     .get('/api/v1/users')
    //     .set('Authorization', 'Bearer ' + jwtToken);

    //   expect(res.statusCode).toBe(403);
    // });
  });
});

describe('POST /api/v1/users', () => {
  describe('create new user', () => {
    test('should create a new user when user is admin and fill all infos', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.user._id).toBeDefined();

      userCreated = res.body.user;
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ first_name: 'test' });

      expect(res.statusCode).toBe(400);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).post('/api/v1/users').send(newUser);

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('GET /api/v1/users/:id', () => {
  describe('get user by id', () => {
    test('should get user info by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.user._id).toBeDefined();
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .get('/api/v1/users/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(404);
    });

    test('should throw error status 401 when not login', async () => {
      const res = await request(app).get(`/api/v1/users/${userCreated._id}`);

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('GET /api/v1/users/my-profile', () => {
  describe('show my profile', () => {
    test('should get my profile and 200 status code', async () => {
      const res = await request(app)
        .get('/api/v1/users/my-profile')
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw error status 401 when not login', async () => {
      const res = await request(app).get('/api/v1/users/my-profile');

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/update-user', () => {
  describe('update user info', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/update-user`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ first_name: 'new name' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw error status 401 when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/update-user`)
        .send({ first_name: 'new name' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/users/change-password', () => {
  describe('change user password', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/change-password`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ oldPassword: '1230123', newPassword: '1230123' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw error and 401 status when old password was wrong', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/change-password`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ oldPassword: 'incorrectPassword', newPassword: 'newpassword' });

      expect(res.statusCode).toBe(401);
    });

    test('should throw error status 401 when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/change-password`)
        .send({ oldPassword: '1230123', newPassword: 'newpassword' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/users/:id', () => {
  describe('admin change user role', () => {
    test('should respond with a status 200 if user is admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw error status 401 when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userCreated._id}`)
        .send({ role: 'admin' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('DELETE /api/v1/users/:id', () => {
  describe('delete user by id', () => {
    test('should respond with a status 200 if user is admin', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${userCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/users/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(`/api/v1/users/${userCreated._id}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
