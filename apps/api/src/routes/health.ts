import type { FastifyInstance } from 'fastify';

/**
 * Health inquiry: the only behavior reachable without a session (docs/security.md). It returns
 * the ok indication and nothing else (spec 0001, G1).
 */
export function registerHealthRoute(app: FastifyInstance): void {
  app.get('/api/health', async () => ({ status: 'ok' as const }));
}
