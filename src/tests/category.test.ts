import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

const newCategory = {
  name: 'test category',
  description: 'new category test description',
};

let jwtToken = '';
let categoryCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/categories', () => {
  describe('get all categories', () => {
    test('should get all categories', async () => {
      const response = await request(app).get('/api/v1/categories');
      expect(response.statusCode).toBe(200);
      expect(response.body.categories).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/categories', () => {
  describe('create new category', () => {
    test('should create a new category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newCategory);

      expect(res.statusCode).toBe(201);
      expect(res.body.category._id).toBeDefined();

      categoryCreated = res.body.category;
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .send(newCategory);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/categories/:id', () => {
  describe('get category by id', () => {
    test('should get category by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/categories/${categoryCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/categories/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/categories/:id', () => {
  describe('update category by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/categories/${categoryCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/categories/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/categories/${categoryCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('DELETE /api/v1/categories/:id', () => {
  describe('delete category by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/categories/${categoryCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/categories/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/categories/${categoryCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
