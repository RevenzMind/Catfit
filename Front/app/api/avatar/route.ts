import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

interface ThumbnailBatchResponse { data: Array<{ targetId: number; state: string; imageUrl?: string }>; }
interface AvatarResponse { assets: Array<{ id: number; name: string; assetType: { id: number; name: string } }>; }
interface CurrentOutfitResponse { assets: Array<{ id: number }>; }

async function fetchThumbnail(userId: number): Promise<string | null> {
  for (let i = 0; i < 2; i++) {
    const res = await fetch('https://thumbnails.roblox.com/v1/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ requestId: `${userId}::AvatarHeadshot:150x150:webp:regular:`, type: 'AvatarHeadShot', targetId: userId, token: '', format: 'webp', size: '150x150', version: '' }])
    });
    const data = await res.json() as ThumbnailBatchResponse;
    const item = data.data?.[0];
    if (item?.state === 'Completed' && item.imageUrl) return item.imageUrl;
    if (i < 1) await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { cookie } = await request.json() as { cookie?: string };
    if (!cookie) return NextResponse.json({ error: 'Cookie required' }, { status: 400 });

    await noblox.setCookie(cookie);
    const user = await noblox.getAuthenticatedUser();

    const [avatarRes, currentOutfitRes, userInfo] = await Promise.all([
      fetch('https://avatar.roblox.com/v2/avatar/avatar', { headers: { Cookie: `.ROBLOSECURITY=${cookie}` } }),
      fetch(`https://avatar.roblox.com/v1/users/${user.id}/currently-wearing`, { headers: { Cookie: `.ROBLOSECURITY=${cookie}` } }),
      noblox.getUserInfo(user.id),
    ]);

    const avatar = await avatarRes.json() as AvatarResponse;
    const currentOutfit = await currentOutfitRes.json() as CurrentOutfitResponse;
    const thumbnail = await fetchThumbnail(user.id);

    const allWornAssetIds = new Set<number>();
    avatar.assets?.forEach((asset) => allWornAssetIds.add(asset.id));
    if (Array.isArray(currentOutfit.assets)) currentOutfit.assets.forEach((asset) => allWornAssetIds.add(asset.id));
    const outfitData = currentOutfit as unknown as { assetIds?: number[] };
    if (Array.isArray(outfitData.assetIds)) outfitData.assetIds.forEach((id) => allWornAssetIds.add(id));

    return NextResponse.json({
      success: true, userId: user.id, username: user.name, displayName: user.displayName,
      description: userInfo.description, avatar, wornAssetIds: Array.from(allWornAssetIds), thumbnail,
    });
  } catch { return NextResponse.json({ error: 'Invalid cookie' }, { status: 400 }); }
}
