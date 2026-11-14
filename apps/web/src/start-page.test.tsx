import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StartPage } from './start-page.tsx';

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('StartPage', () => {
  it('shows checking while fetching', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );
    render(<StartPage />);

    expect(screen.getByRole('heading', { name: 'Leave Manager' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Checking service…');
  });

  it('shows OK when the service is up', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, { status: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<StartPage />);

    expect(await screen.findByText('Service: OK')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Service: OK');
    expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.anything());
  });

  it('shows unavailable on error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(500, { code: 'INTERNAL' })),
    );
    render(<StartPage />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Service unavailable');
  });

  it('shows unavailable on an error status even when the body says ok', async () => {
    // VERIFY round 1, F-QA-1: the HTTP status alone must decide (AC-8 "answers with an error status").
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(503, { status: 'ok' })),
    );
    render(<StartPage />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
  });

  it('shows unavailable on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    );
    render(<StartPage />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
  });

  it('shows unavailable when a 2xx answer is not the ok indication', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(200, { status: 'degraded' })),
    );
    render(<StartPage />);

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
  });
});
