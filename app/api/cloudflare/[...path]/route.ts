
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/cloudflare', '');
  const url = `https://api.cloudflare.com/client/v4${path}${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set('X-Auth-Key', req.headers.get('X-Auth-Key') || '');
  headers.set('X-Auth-Email', req.headers.get('X-Auth-Email') || '');
  headers.set('Content-Type', 'application/json');

  const requestOptions: RequestInit = {
    method: req.method,
    headers: headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    requestOptions.body = await req.text();
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ success: false, errors: [{ message: (error as Error).message }] }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
