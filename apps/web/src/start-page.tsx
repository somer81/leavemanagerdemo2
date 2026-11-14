import { useEffect, useState } from 'react';

type ServiceStatus = 'checking' | 'ok' | 'unavailable';

const STATUS_TEXT: Record<ServiceStatus, string> = {
  checking: 'Checking service…',
  ok: 'Service: OK',
  unavailable: 'Service unavailable',
};

async function fetchServiceStatus(signal: AbortSignal): Promise<ServiceStatus> {
  try {
    const response = await fetch('/api/health', { signal });
    if (!response.ok) return 'unavailable';
    const body: unknown = await response.json();
    const isOk =
      typeof body === 'object' && body !== null && (body as { status?: unknown }).status === 'ok';
    return isOk ? 'ok' : 'unavailable';
  } catch {
    // Network failure or an unreadable body: no retry (spec 0001, G5).
    return 'unavailable';
  }
}

/** Start page: product name and whether the service is reachable (spec 0001, R-4). */
export function StartPage() {
  const [status, setStatus] = useState<ServiceStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();
    void fetchServiceStatus(controller.signal).then((next) => {
      if (!controller.signal.aborted) setStatus(next);
    });
    return () => controller.abort();
  }, []);

  // Layout and classes follow the pinned design (spec 0003, "Start Page Restyle" canvas).
  return (
    <main className="page">
      <header className="page-header">
        <h1 className="display">Leave Manager</h1>
        <p className="tagline">Request, approve and count leave in working days.</p>
      </header>
      <section className="card" aria-labelledby="service-label">
        <p className="label" id="service-label">
          Service
        </p>
        <p className="status" role="status" aria-live="polite" data-state={status}>
          {STATUS_TEXT[status]}
        </p>
      </section>
    </main>
  );
}
