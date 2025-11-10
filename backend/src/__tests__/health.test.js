import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';

describe('Health check endpoint', () => {
  let app;

  beforeAll(async () => {
    jest.resetModules();

    const createStubRouter = () => {
      const router = express.Router();
      router.use((req, res, next) => next());
      return router;
    };

    jest.unstable_mockModule('../routes/auth.js', () => ({
      default: createStubRouter()
    }));

    jest.unstable_mockModule('../routes/vehicles.js', () => ({
      default: createStubRouter()
    }));

    jest.unstable_mockModule('../routes/serviceRequests.js', () => ({
      default: createStubRouter()
    }));

    jest.unstable_mockModule('../routes/technicians.js', () => ({
      default: createStubRouter()
    }));

    const routesModule = await import('../routes/index.js');
    const routes = routesModule.default;

    app = express();
    app.use('/api/v1', routes);
  });

  it('responds with success metadata', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: expect.any(String),
        timestamp: expect.any(String)
      })
    );
  });
});
