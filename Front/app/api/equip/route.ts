import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

const AVATAR_API = 'https://avatar.roblox.com';

async function getCSRFToken(cookie: string): Promise<string> {
  const res = await fetch(`${AVATAR_API}/v1/avatar/set-player-avatar-type`, {
    method: 'POST',
    headers: { 'Cookie': `.ROBLOSECURITY=${cookie}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerAvatarType: 'R15' }),
  });
  return res.headers.get('x-csrf-token') || '';
}

export async function POST(request: NextRequest) {
  try {
    const { cookie, outfitId } = await request.json();
    if (!cookie || !outfitId) return NextResponse.json({ error: 'Cookie and outfitId required' }, { status: 400 });

    await noblox.setCookie(cookie);
    const token = await getCSRFToken(cookie);
    const headers = { 'Cookie': `.ROBLOSECURITY=${cookie}`, 'X-CSRF-TOKEN': token, 'Content-Type': 'application/json' };

    const detailsRes = await fetch(`${AVATAR_API}/v3/outfits/${outfitId}/details`, { headers: { 'Cookie': `.ROBLOSECURITY=${cookie}` } });
    const outfit = await detailsRes.json();
    if (outfit.errors) throw new Error(JSON.stringify(outfit.errors));

    await fetch(`${AVATAR_API}/v2/avatar/set-wearing-assets`, { method: 'POST', headers, body: JSON.stringify({ assets: outfit.assets }) });
    if (outfit.bodyColor3s) await fetch(`${AVATAR_API}/v2/avatar/set-body-colors`, { method: 'POST', headers, body: JSON.stringify(outfit.bodyColor3s) });
    if (outfit.scale) await fetch(`${AVATAR_API}/v1/avatar/set-scales`, { method: 'POST', headers, body: JSON.stringify(outfit.scale) });

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
