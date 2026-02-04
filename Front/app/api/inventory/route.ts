import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

const ASSET_TYPES = [
  { id: 8, name: 'Hat' }, { id: 41, name: 'HairAccessory' }, { id: 42, name: 'FaceAccessory' },
  { id: 43, name: 'NeckAccessory' }, { id: 44, name: 'ShoulderAccessory' }, { id: 45, name: 'FrontAccessory' },
  { id: 46, name: 'BackAccessory' }, { id: 47, name: 'WaistAccessory' }, { id: 11, name: 'Shirt' },
  { id: 12, name: 'Pants' }, { id: 2, name: 'TShirt' }, { id: 27, name: 'Torso' }, { id: 28, name: 'RightArm' },
  { id: 29, name: 'LeftArm' }, { id: 30, name: 'LeftLeg' }, { id: 31, name: 'RightLeg' }, { id: 17, name: 'Head' },
  { id: 18, name: 'Face' }, { id: 19, name: 'Gear' }, { id: 48, name: 'ClimbAnimation' }, { id: 49, name: 'DeathAnimation' },
  { id: 50, name: 'FallAnimation' }, { id: 51, name: 'IdleAnimation' }, { id: 52, name: 'JumpAnimation' },
  { id: 53, name: 'RunAnimation' }, { id: 54, name: 'SwimAnimation' }, { id: 55, name: 'WalkAnimation' },
  { id: 56, name: 'PoseAnimation' }, { id: 61, name: 'EmoteAnimation' }, { id: 64, name: 'TShirtAccessory' },
  { id: 65, name: 'ShirtAccessory' }, { id: 66, name: 'PantsAccessory' }, { id: 67, name: 'JacketAccessory' },
  { id: 68, name: 'SweaterAccessory' }, { id: 69, name: 'ShortsAccessory' }, { id: 70, name: 'LeftShoeAccessory' },
  { id: 71, name: 'RightShoeAccessory' }, { id: 72, name: 'DressSkirtAccessory' }, { id: 79, name: 'DynamicHead' },
];

interface InventoryItem { assetId: number; name: string; assetType: string; }
interface ThumbnailResponse { data: Array<{ targetId: number; state: string; imageUrl: string }>; }

async function getThumbnails(assetIds: number[]): Promise<Map<number, string>> {
  const thumbMap = new Map<number, string>();
  for (let i = 0; i < assetIds.length; i += 100) {
    const batch = assetIds.slice(i, i + 100);
    try {
      const res = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${batch.join(',')}&size=150x150&format=Png`);
      if (res.ok) {
        const data = await res.json() as ThumbnailResponse;
        for (const thumb of data.data) if (thumb.state === 'Completed' && thumb.imageUrl) thumbMap.set(thumb.targetId, thumb.imageUrl);
      }
    } catch {}
  }
  return thumbMap;
}

export async function POST(request: NextRequest) {
  try {
    const { cookie } = await request.json() as { cookie?: string };
    if (!cookie) return NextResponse.json({ error: 'Cookie required' }, { status: 400 });

    await noblox.setCookie(cookie);
    const user = await noblox.getAuthenticatedUser();

    const allItems: InventoryItem[] = [];
    for (const assetType of ASSET_TYPES) {
      try {
        const items = await noblox.getInventory(user.id, [assetType.name]);
        allItems.push(...items.map((item) => ({ assetId: item.assetId, name: item.name, assetType: assetType.name })));
      } catch {}
    }

    const thumbnails = await getThumbnails(allItems.map((i) => i.assetId));

    return NextResponse.json({
      success: true,
      items: allItems.map((item) => ({ ...item, thumbnailUrl: thumbnails.get(item.assetId) ?? null })),
    });
  } catch { return NextResponse.json({ error: 'Invalid cookie' }, { status: 400 }); }
}
