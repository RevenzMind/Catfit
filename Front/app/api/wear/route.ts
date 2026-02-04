import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

const AVATAR_API = 'https://avatar.roblox.com';
let cachedToken = { value: '', expires: 0 };

async function getCSRFToken(cookie: string): Promise<string> {
  if (cachedToken.value && Date.now() < cachedToken.expires) return cachedToken.value;
  const res = await fetch(`${AVATAR_API}/v1/avatar/set-player-avatar-type`, {
    method: 'POST',
    headers: { 'Cookie': `.ROBLOSECURITY=${cookie}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerAvatarType: 'R15' }),
  });
  cachedToken = { value: res.headers.get('x-csrf-token') || '', expires: Date.now() + 60000 };
  return cachedToken.value;
}

export async function POST(request: NextRequest) {
  try {
    const { cookie, assetId, action, currentAssetIds } = await request.json() as { cookie?: string; assetId?: number; action?: 'wear' | 'remove'; currentAssetIds?: number[] };
    if (!cookie || !assetId || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const token = await getCSRFToken(cookie);
    const headers = { 'Cookie': `.ROBLOSECURITY=${cookie}`, 'X-CSRF-TOKEN': token, 'Content-Type': 'application/json' };

    let assetIds = currentAssetIds || [];
    if (action === 'wear') {
      const assetInfo = await noblox.getProductInfo(assetId);
      const singleSlotTypes = [2, 11, 12, 17, 18];
      if (singleSlotTypes.includes(assetInfo.AssetTypeId)) {
        const typeAssets = await Promise.all(assetIds.map(async (id) => {
          try { const info = await noblox.getProductInfo(id); return { id, type: info.AssetTypeId }; } catch { return { id, type: 0 }; }
        }));
        assetIds = typeAssets.filter((a) => a.type !== assetInfo.AssetTypeId).map((a) => a.id);
      }
      if (!assetIds.includes(assetId)) assetIds.push(assetId);
    } else {
      assetIds = assetIds.filter((id) => id !== assetId);
    }

    const res = await fetch(`${AVATAR_API}/v2/avatar/set-wearing-assets`, { method: 'POST', headers, body: JSON.stringify({ assets: assetIds.map((id) => ({ id })) }) });
    if (!res.ok) {
      cachedToken = { value: '', expires: 0 };
      return NextResponse.json({ error: `Failed: ${res.status}` }, { status: res.status });
    }

    return NextResponse.json({ success: true, assetIds });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 }); }
}
