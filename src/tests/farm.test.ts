import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newFarm = {
  name: 'farm test',
  description: 'farm description',
  area: 100,
  address: 'Lạc Dương, Lâm Đồng',
  coordinates: [11.991577144108662, 108.43176907671939],
};

let jwtToken = '';
let farmCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/farms', () => {
  describe('get all farms', () => {
    test('should get all farms', async () => {
      const response = await request(app).get('/api/v1/farms');
      expect(response.statusCode).toBe(200);
      expect(response.body.farms).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/farms', () => {
  describe('create new farm', () => {
    test('should create a new farm', async () => {
      const res = await request(app)
        .post('/api/v1/farms')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newFarm);

      expect(res.statusCode).toBe(201);
      expect(res.body.farm._id).toBeDefined();

      farmCreated = res.body.farm;
    });

    test('should throw error when not login', async () => {
      const res = await request(app).post('/api/v1/farms').send(newFarm);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/farms')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/farms/:id', () => {
  describe('get farm by id', () => {
    test('should get farm by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/farms/${farmCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/farms/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/farms/:id', () => {
  describe('update farm by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/farms/${farmCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/farms/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/farms/${farmCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/farms/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/farms/upload/${farmCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.farm.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/farms/upload/${farmCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/farms/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/farms/:id', () => {
  describe('delete farm by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/farms/${farmCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/farms/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(`/api/v1/farms/${farmCreated._id}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
