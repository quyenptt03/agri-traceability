import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newHarvest = {
  herd: '66059f884216273d4d6593ed',
  name: 'Sua de',
  quantity: 6,
  unit: 'lit',
};

let jwtToken = '';
let harvestCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/harvests', () => {
  describe('get all harvests', () => {
    test('should get all harvests', async () => {
      const response = await request(app).get('/api/v1/harvests');
      expect(response.statusCode).toBe(200);
      expect(response.body.harvests).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/harvests', () => {
  describe('create new harvest', () => {
    test('should create a new harvest', async () => {
      const res = await request(app)
        .post('/api/v1/harvests')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newHarvest);

      expect(res.statusCode).toBe(201);
      expect(res.body.harvest._id).toBeDefined();

      harvestCreated = res.body.harvest;
    });

    test('should throw error when not login', async () => {
      const res = await request(app).post('/api/v1/harvests').send(newHarvest);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/harvests')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/harvests/:id', () => {
  describe('get harvest by id', () => {
    test('should get harvest by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/harvests/${harvestCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/harvests/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/harvests/:id', () => {
  describe('update harvest by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/harvests/${harvestCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/harvests/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/harvests/${harvestCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/harvests/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/harvests/upload/${harvestCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.harvest.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/harvests/upload/${harvestCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/harvests/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/harvests/:id', () => {
  describe('delete harvest by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/harvests/${harvestCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/harvests/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/harvests/${harvestCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
