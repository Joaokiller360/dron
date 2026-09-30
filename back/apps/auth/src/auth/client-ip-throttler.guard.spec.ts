import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientIpThrottlerGuard } from '@app/common/guards/client-ip-throttler.guard';

@Controller('ping')
class PingController {
  @Get()
  ping() {
    return 'pong';
  }
}

describe('Rate limiting', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.CLIENT_IP_HEADER = 'cf-connecting-ip';
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] })],
      controllers: [PingController, AuthController],
      providers: [
        { provide: APP_GUARD, useClass: ClientIpThrottlerGuard },
        {
          provide: AuthService,
          useValue: {
            login: async () => ({
              accessToken: 't',
              user: {},
              refreshToken: { token: 'r', expiresAt: new Date(Date.now() + 60_000) },
            }),
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    delete process.env.CLIENT_IP_HEADER;
    await app.close();
  });

  const login = (ip: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .set('cf-connecting-ip', ip)
      .send({ email: 'a@b.co', password: 'whatever1' });

  it('allows 5 login attempts per IP, then answers 429', async () => {
    for (let i = 0; i < 5; i++) expect((await login('203.0.113.1')).status).toBe(200);
    expect((await login('203.0.113.1')).status).toBe(429);
    // A different client keeps its own budget
    expect((await login('203.0.113.2')).status).toBe(200);
  });

  it('allows 100 requests per minute per IP on other routes', async () => {
    const ping = () =>
      request(app.getHttpServer()).get('/ping').set('cf-connecting-ip', '198.51.100.7');
    for (let i = 0; i < 100; i++) expect((await ping()).status).toBe(200);
    expect((await ping()).status).toBe(429);
  });
});
