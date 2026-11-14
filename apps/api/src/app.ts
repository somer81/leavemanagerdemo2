import Fastify, { type FastifyInstance } from 'fastify';
import { registerHealthRoute } from './routes/health.ts';

export interface AppOptions {
  readonly logger?: boolean;
}

/** Builds the API without listening, so tests drive it with inject() and open no port. */
export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  registerHealthRoute(app);
  return app;
}
