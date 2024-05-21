import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newCultivationLog = {
  name: 'Cho bú sữa',
  description: 'mô tả',
  herd: '66099000d1a4bbf859da046e',
  date: '2024-05-21',
};

let jwtToken = '';
let cultivationLogCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/cultivation-logs', () => {
  describe('get all cultivation-logs', () => {
    test('should get all cultivation logs', async () => {
      const response = await request(app).get('/api/v1/cultivation-logs');
      expect(response.statusCode).toBe(200);
      expect(response.body.cultivationLogs).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/cultivation-logs', () => {
  describe('create new cultivation log', () => {
    test('should create a new cultivation log', async () => {
      const res = await request(app)
        .post('/api/v1/cultivation-logs')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newCultivationLog);

      expect(res.statusCode).toBe(201);
      expect(res.body.cultivationLog._id).toBeDefined();

      cultivationLogCreated = res.body.cultivationLog;
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .post('/api/v1/cultivation-logs')
        .send(newCultivationLog);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/cultivation-logs')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/cultivation-logs/:id', () => {
  describe('get cultivation log by id', () => {
    test('should get cultivation log by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/cultivation-logs/${cultivationLogCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/cultivation-logs/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/cultivation-logs/:id', () => {
  describe('update cultivation log by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/cultivation-logs/${cultivationLogCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/cultivation-logs/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/cultivation-logs/${cultivationLogCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/cultivation-logs/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/cultivation-logs/upload/${cultivationLogCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.cultivationLog.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/cultivation-logs/upload/${cultivationLogCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/cultivation-logs/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/cultivation-logs/:id', () => {
  describe('delete cultivation log by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/cultivation-logs/${cultivationLogCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/cultivation-logs/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/cultivation-logs/${cultivationLogCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
