import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

const AVATAR_API = 'https://avatar.roblox.com';

export async function POST(request: NextRequest) {
  try {
    const { cookie, assetId, action } = await request.json() as {
      cookie?: string;
      assetId?: number;
      action?: 'wear' | 'remove';
    };

    if (!cookie || !assetId || !action) {
      return NextResponse.json({ error: 'Cookie, assetId, and action required' }, { status: 400 });
    }

    await noblox.setCookie(cookie);
    const token = await noblox.getGeneralToken();

    const headers: HeadersInit = {
      Cookie: `.ROBLOSECURITY=${cookie}`,
      'X-CSRF-TOKEN': token,
      'Content-Type': 'application/json',
    };

    let res: Response;

    if (action === 'wear') {
      // Use wear-asset endpoint for single item
      res = await fetch(`${AVATAR_API}/v1/avatar/assets/${assetId}/wear`, {
        method: 'POST',
        headers,
      });
    } else {
      // Use remove-asset endpoint for single item
      res = await fetch(`${AVATAR_API}/v1/avatar/assets/${assetId}/remove`, {
        method: 'POST',
        headers,
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: `Failed to ${action} asset: ${errorText}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
