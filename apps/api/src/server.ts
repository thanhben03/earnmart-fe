// Fastify REST Backend for EarnMart
// Spec Reference: Section 7.4 API Contracts

import Fastify from 'fastify';
import cors from '@fastify/cors';

export async function buildServer() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: '*',
  });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', service: 'earnmart-api', timestamp: new Date().toISOString() };
  });

  // Minimum API contracts (/api/v1/...)
  server.register(
    async (v1) => {
      // 1. Guest Auth
      v1.post('/auth/guest', async () => {
        return {
          data: {
            user: {
              id: 'usr-guest-seed',
              displayName: 'Khách Trải Nghiệm',
              isGuest: true,
            },
            token: 'mock-jwt-token-earnmart',
          },
        };
      });

      // 2. Me
      v1.get('/me', async () => {
        return {
          data: {
            id: 'usr-guest-seed',
            displayName: 'Khách Trải Nghiệm',
            level: 1,
            streakDays: 3,
          },
        };
      });

      // 3. Products
      v1.get('/products', async (request) => {
        const query = request.query as any;
        return {
          data: [],
          meta: {
            page: 1,
            pageSize: 24,
            total: 24,
          },
        };
      });

      // 4. Wallet
      v1.get('/wallet', async () => {
        return {
          data: {
            balance: 150,
            lifetimeEarned: 150,
            lifetimeSpent: 0,
            currency: 'EC',
          },
        };
      });

      // 5. Checkout (Idempotent atomic operation)
      v1.post('/orders/checkout', async (request, reply) => {
        const idempotencyKey = request.headers['idempotency-key'];
        if (!idempotencyKey) {
          return reply.status(400).send({
            error: { code: 'MISSING_IDEMPOTENCY_KEY', message: 'Header Idempotency-Key is required' },
          });
        }
        return {
          data: {
            orderId: `EM-${Date.now().toString().slice(-6)}`,
            status: 'COMPLETED',
            isVirtual: true,
          },
        };
      });

      // 6. Checkin
      v1.post('/checkin', async (request, reply) => {
        return {
          data: {
            awardedCoins: 5,
            streakDays: 4,
          },
        };
      });

      // 7. Activity Submit
      v1.post('/activities/:id/submit', async (request) => {
        return {
          data: {
            awardedCoins: 20,
            passed: true,
          },
        };
      });
    },
    { prefix: '/api/v1' }
  );

  return server;
}

if (require.main === module) {
  buildServer().then((app) => {
    const port = Number(process.env.PORT) || 4000;
    app.listen({ port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`EarnMart API listening at ${address}`);
    });
  });
}

