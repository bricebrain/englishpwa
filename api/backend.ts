const HOP_BY_HOP_HEADERS = [
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function cleanRequestHeaders(request: Request, workerSecret: string): Headers {
  const headers = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.set('Authorization', `Bearer ${workerSecret}`);
  return headers;
}

function cleanResponseHeaders(response: Response): Headers {
  const headers = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.delete('content-encoding');
  return headers;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const workerUrl = process.env.WORKER_URL?.replace(/\/$/, '');
    const workerSecret = process.env.WORKER_SECRET;

    if (!workerUrl || !workerSecret) {
      return jsonError('Proxy Worker non configuré.', 503);
    }

    const incomingUrl = new URL(request.url);
    const workerPath = incomingUrl.searchParams.get('path');
    if (!workerPath) return jsonError('Chemin API manquant.', 400);

    incomingUrl.searchParams.delete('path');
    const upstreamUrl = new URL(
      `/${workerPath.replace(/^\/+/, '')}${incomingUrl.search}`,
      workerUrl,
    );

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: cleanRequestHeaders(request, workerSecret),
        body: body?.byteLength ? body : undefined,
        redirect: 'manual',
      });

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: cleanResponseHeaders(upstreamResponse),
      });
    } catch {
      return jsonError('Worker temporairement inaccessible.', 502);
    }
  },
};
