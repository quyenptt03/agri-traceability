import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newMedicine = {
  name: 'test Thuoc diet chuot',
  description: 'mo ta thuoc diet chuot',
  ingredients: 'ingredients dkgjdfjgdfg',
  usage_instruction: 'string',
  toxicity: 'toxicity string',
  dosage: 'dosage string',
  isolation: ' ddgfgfdg',
  recommendation: 'huong dan su dung thuoc',
  certificate: 'giay phep thuoc',
};

let jwtToken = '';
let medicineCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/medicines', () => {
  describe('get all medicines', () => {
    test('should get all medicines', async () => {
      const response = await request(app).get('/api/v1/medicines');
      expect(response.statusCode).toBe(200);
      expect(response.body.medicines).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/medicines', () => {
  describe('create new medicine', () => {
    test('should create a new medicine', async () => {
      const res = await request(app)
        .post('/api/v1/medicines')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newMedicine);

      expect(res.statusCode).toBe(201);
      expect(res.body.medicine._id).toBeDefined();

      medicineCreated = res.body.medicine;
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .post('/api/v1/medicines')
        .send(newMedicine);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/medicines')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/medicines/:id', () => {
  describe('get medicine by id', () => {
    test('should get medicine by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/medicines/${medicineCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .get('/api/v1/medicines/6550f40184f30622d7171916')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/medicines/:id', () => {
  describe('update medicine by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/medicines/${medicineCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/medicines/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/medicines/${medicineCreated._id}`)
        .send({ name: 'new test' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/medicines/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/medicines/upload/${medicineCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.medicine.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/medicines/upload/${medicineCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/medicines/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/medicines/:id', () => {
  describe('delete medicine by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/medicines/${medicineCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/medicines/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/medicines/${medicineCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
