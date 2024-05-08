import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS);

const newProductInfo = {
  name: 'new product name',
  description: 'new product description',
  storage_method: 'new product storage method',
};

let jwtToken = '';
let productInfoCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.headers['set-cookie'][0].split('=')[1];
});

describe('GET /api/v1/product-infos', () => {
  describe('get all product infomations', () => {
    test('should get all product infomations', async () => {
      const response = await request(app).get('/api/v1/product-infos');
      expect(response.statusCode).toBe(200);
      expect(response.body.products).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/product-infos', () => {
  describe('create new product info', () => {
    test('should create a new product info', async () => {
      const res = await request(app)
        .post('/api/v1/product-infos')
        .set('Cookie', `token=${jwtToken}`)
        .send(newProductInfo);

      expect(res.statusCode).toBe(201);
      expect(res.body.productInfo).toMatchObject(newProductInfo);
      expect(res.body.productInfo._id).toBeDefined();

      productInfoCreated = res.body.productInfo;
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .post('/api/v1/product-infos')
        .send(newProductInfo);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/product-infos')
        .set('Cookie', `token=${jwtToken}`)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/product-infos/:id', () => {
  describe('get product info by id', () => {
    test('should get product info by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/product-infos/${productInfoCreated._id}`)
        .set('Cookie', `token=${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.productInfo).toMatchObject(productInfoCreated);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/product-infos/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/product-infos/:id', () => {
  describe('update product info by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/product-infos/${productInfoCreated._id}`)
        .set('Cookie', `token=${jwtToken}`)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/product-infos/662q19defa65f62953135931')
        .set('Cookie', `token=${jwtToken}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch('/api/v1/product-infos/662q19defa65f62953135931')
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('DELETE /api/v1/product-infos/:id', () => {
  describe('delete product info by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/product-infos/${productInfoCreated._id}`)
        .set('Cookie', `token=${jwtToken}`);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/product-infos/662q19defa65f62953135931')
        .set('Cookie', `token=${jwtToken}`);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        '/api/v1/product-infos/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
