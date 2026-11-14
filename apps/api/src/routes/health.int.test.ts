import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.ts';

describe('GET /api/health', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    // Known trap: an unclosed Fastify app keeps the test process alive.
    await app?.close();
    app = undefined;
  });

  it('answers ok without a session', async () => {
    app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    // Exactly the ok indication — no version, uptime or environment data (spec 0001, G1).
    expect(response.json()).toStrictEqual({ status: 'ok' });
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
