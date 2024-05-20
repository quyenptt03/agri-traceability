import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newDisease = {
  name: 'benh abc 1',
  description:
    'lorem ipunt ut labore et dolore magna aliqua. Ut enim ad minim veniam',
  symptoms: 'Trieu chung benh',
  preventive_measures:
    'Bien phap phong tranh Lorem ipunt ut labore et dolore magna aliqua. Ut enim ad minim veniam',
};

let jwtToken = '';
let diseaseCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/diseases', () => {
  describe('get all diseases', () => {
    test('should get all diseases', async () => {
      const response = await request(app).get('/api/v1/diseases');
      expect(response.statusCode).toBe(200);
      expect(response.body.diseases).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/diseases', () => {
  describe('create new disease', () => {
    test('should create a new disease', async () => {
      const res = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newDisease);

      expect(res.statusCode).toBe(201);
      expect(res.body.disease._id).toBeDefined();

      diseaseCreated = res.body.disease;
    });

    test('should throw error when not login', async () => {
      const res = await request(app).post('/api/v1/diseases').send(newDisease);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/diseases/:id', () => {
  describe('get disease by id', () => {
    test('should get disease by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/diseases/${diseaseCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/diseases/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/diseases/:id', () => {
  describe('update disease by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/diseases/${diseaseCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/diseases/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/diseases/${diseaseCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/diseases/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/diseases/upload/${diseaseCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.disease.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/diseases/upload/${diseaseCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/diseases/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/diseases/:id', () => {
  describe('delete disease by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/diseases/${diseaseCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/diseases/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/diseases/${diseaseCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
