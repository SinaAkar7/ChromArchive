import type { IncomingMessage, ServerResponse } from 'node:http';

const ALLOWED_HOSTNAME = 'images.metmuseum.org';
const ALLOWED_PATH_PREFIX = '/CRDImages/';
const MAX_IMAGE_BYTES = 18 * 1024 * 1024; // 18 MB upper limit for museum originals
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 15000;

function validateMetImageUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.hostname.toLowerCase() !== ALLOWED_HOSTNAME) return null;
    if (!parsed.pathname.startsWith(ALLOWED_PATH_PREFIX)) return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.port && parsed.port !== '443') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchWithSafeRedirects(
  initialUrl: URL
): Promise<{ response: Response; finalUrl: URL }> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          'User-Agent': 'ChromArchive-ImageProxy/1.0',
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error('Redirect response missing Location header.');
      }
      const nextUrl = new URL(location, currentUrl);
      const validatedNext = validateMetImageUrl(nextUrl.toString());
      if (!validatedNext) {
        throw new Error('Redirect target is outside the allowed museum image path.');
      }
      currentUrl = validatedNext;
      continue;
    }

    return { response: res, finalUrl: currentUrl };
  }

  throw new Error('Too many redirects from image origin.');
}

async function readImageBytesWithLimit(
  response: Response,
  maxBytes: number
): Promise<Buffer> {
  const contentLengthHeader = response.headers.get('content-length');
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new Error(`Image exceeds size limit (${maxBytes} bytes).`);
    }
  }

  if (!response.body) {
    const ab = await response.arrayBuffer();
    if (ab.byteLength > maxBytes) {
      throw new Error(`Image exceeds size limit (${maxBytes} bytes).`);
    }
    return Buffer.from(ab);
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error(`Image exceeds size limit (${maxBytes} bytes).`);
      }
      chunks.push(Buffer.from(value));
    }
  }

  return Buffer.concat(chunks, totalBytes);
}

function sendJsonError(
  res: ServerResponse,
  statusCode: number,
  message: string
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error: message }));
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJsonError(res, 405, 'Method not allowed. Use GET.');
    return;
  }

  const reqUrl = new URL(req.url || '/', 'http://localhost');
  const rawTarget = reqUrl.searchParams.get('url') || '';
  const validatedUrl = validateMetImageUrl(rawTarget);

  if (!validatedUrl) {
    sendJsonError(
      res,
      403,
      'Only HTTPS URLs under https://images.metmuseum.org/CRDImages/ are allowed.'
    );
    return;
  }

  try {
    const { response } = await fetchWithSafeRedirects(validatedUrl);
    if (!response.ok) {
      sendJsonError(
        res,
        response.status >= 400 && response.status < 600 ? response.status : 502,
        `Upstream museum server returned HTTP ${response.status}.`
      );
      return;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.startsWith('image/')) {
      sendJsonError(res, 415, 'Upstream resource is not a valid image.');
      return;
    }

    const imageBuffer = await readImageBytesWithLimit(response, MAX_IMAGE_BYTES);

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType.split(';')[0].trim());
    res.setHeader('Content-Length', String(imageBuffer.byteLength));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
    );
    res.end(imageBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Image proxy failed.';
    const status = msg.includes('size limit')
      ? 413
      : msg.includes('outside the allowed')
      ? 403
      : 502;
    sendJsonError(res, status, msg);
  }
}
