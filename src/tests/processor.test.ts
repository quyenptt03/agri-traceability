import app from '..';
import request from 'supertest';

const SECONDS = 1000;
jest.setTimeout(700 * SECONDS);

const newProcessor = {
  price: '436000',
  net_weight: 1,
  unit: 'kg',
  dte: '2 năm kể từ ngày sản xuất',
  location: '206 đường Huỳnh Phước , huyện Ninh Phước, tỉnh Ninh Thuận',
  quantity: 29,
  harvest: '6634a9980e67951e9b68bf1f',
  product_info: '662f19defa65f62353155930',
};

let jwtToken = '';
let processorCreated: any;

beforeAll(async () => {
  const response = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@gmail.com',
    password: '1230123',
  });
  jwtToken = response.body.token;
});

describe('GET /api/v1/processors', () => {
  describe('get all processors', () => {
    test('should get all processors', async () => {
      const response = await request(app).get('/api/v1/processors');
      expect(response.statusCode).toBe(200);
      expect(response.body.processors).toBeInstanceOf(Array);
    });
  });
});

describe('POST /api/v1/processors', () => {
  describe('create new processor', () => {
    test('should create a new processor and generate QR in product', async () => {
      const res = await request(app)
        .post('/api/v1/processors')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(newProcessor);

      expect(res.statusCode).toBe(201);
      expect(res.body.processor._id).toBeDefined();
      expect(res.body.processor.qr_code).toBeDefined();
      processorCreated = res.body.processor;
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .post('/api/v1/processors')
        .send(newProcessor);

      expect(res.statusCode).toBe(401);
    });

    test('should throw error when not provide all values', async () => {
      const res = await request(app)
        .post('/api/v1/processors')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ price: '436000' });

      expect(res.statusCode).toBe(400);
    });
  });
});

describe('GET /api/v1/processors/:id', () => {
  describe('get processor by id', () => {
    test('should get processor by id and 200 status code', async () => {
      const res = await request(app)
        .get(`/api/v1/processors/${processorCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app).get(
        '/api/v1/processors/662q19defa65f62953135931'
      );
      expect(res.statusCode).toBe(404);
    });
  });
});

describe('PATCH /api/v1/processors/:id', () => {
  describe('update processor by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/processors/${processorCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ price: '436000' });

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .patch('/api/v1/processors/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({ price: '436000' });
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app)
        .patch(`/api/v1/processors/${processorCreated._id}`)
        .send({ price: '436000' });
      expect(res.statusCode).toBe(401);
    });
  });
});

describe('PATCH /api/v1/processors/upload/:id - upload images', () => {
  const filePath = `${__dirname}/test-files/test-image.jpg`;
  const filePath2 = `${__dirname}/test-files/test-image2.jpg`;
  test('should upload the the images to server', async () => {
    const res = await request(app)
      .patch(`/api/v1/processors/upload/${processorCreated._id}`)
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(201);
    expect(res.body.processor.images).toBeInstanceOf(Array);
  });

  test('should return an error if no files are uploaded', async () => {
    const response = await request(app)
      .patch(`/api/v1/processors/upload/${processorCreated._id}`)
      .set('Authorization', 'Bearer ' + jwtToken);

    expect(response.status).toBe(400);
    expect(response.body.msg).toBe('No files uploaded');
  });

  test('should throw not found error 404 when id is not exists', async () => {
    const res = await request(app)
      .patch('/api/v1/processors/upload/662q19defa65f62953135931')
      .attach('images', filePath)
      .attach('images', filePath2)
      .set('Authorization', 'Bearer ' + jwtToken);
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/processors/:id', () => {
  describe('delete processor by id', () => {
    test('should respond with a status 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/processors/${processorCreated._id}`)
        .set('Authorization', 'Bearer ' + jwtToken);

      expect(res.statusCode).toBe(200);
    });

    test('should throw not found error 404 when id is not exists', async () => {
      const res = await request(app)
        .delete('/api/v1/processors/662q19defa65f62953135931')
        .set('Authorization', 'Bearer ' + jwtToken);
      expect(res.statusCode).toBe(404);
    });

    test('should throw error when not login', async () => {
      const res = await request(app).delete(
        `/api/v1/processors/${processorCreated._id}`
      );
      expect(res.statusCode).toBe(401);
    });
  });
});
