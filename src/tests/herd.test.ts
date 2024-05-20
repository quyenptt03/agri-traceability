import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newHerd = {
  name: 'đàn dê mới',
  description: 'mô tả của đàn dê',
  location: 'chuồng c1101',
  categoryId: '66138d895f2feff77d198e91',
  farmId: '66091e01df96ed7a1635a959',
};

let jwtToken = '';
let herdCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/herds', () => {
  describe('get all herds', () => {
    test('should get all herds', async () => {
      const response = await request(app).get('/api/v1/herds');
      expect(response.statusCode).toBe(200);
      expect(response.body.herds).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/herds', () => {
  describe('create new herd', () => {
    test('should create a new herd', async () => {
      const res = await request(app)
        .post('/api/v1/herds')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newHerd);

      expect(res.statusCode).toBe(201);
      expect(res.body.herd._id).toBeDefined();

      herdCreated = res.body.herd;
    });

    test('should throw error when not login', async () => {
      const res = await request(app).post('/api/v1/herds').send(newHerd);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/herds')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/herds/:id', () => {
  describe('get herd by id', () => {
    test('should get herd by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/herds/${herdCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/herds/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/herds/:id', () => {
  describe('update herd by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/herds/${herdCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/herds/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/herds/${herdCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/herds/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/herds/upload/${herdCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.herd.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/herds/upload/${herdCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/herds/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/herds/:id', () => {
  describe('delete herd by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/herds/${herdCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/herds/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(`/api/v1/herds/${herdCreated._id}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
