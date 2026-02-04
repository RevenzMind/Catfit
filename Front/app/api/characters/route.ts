import { NextRequest, NextResponse } from 'next/server';
import noblox from 'noblox.js';

interface Outfit { id: number; name: string; isEditable: boolean; }
interface ThumbnailData { targetId: number; imageUrl?: string; }

export async function POST(request: NextRequest) {
  try {
    const { cookie } = await request.json() as { cookie?: string };
    if (!cookie) return NextResponse.json({ error: 'Cookie required' }, { status: 400 });

    await noblox.setCookie(cookie);
    const user = await noblox.getAuthenticatedUser();

    const outfitsRes = await fetch(`https://avatar.roblox.com/v1/users/${user.id}/outfits?page=1&itemsPerPage=100`, { headers: { Cookie: `.ROBLOSECURITY=${cookie}` } });
    if (!outfitsRes.ok) throw new Error('Failed to fetch outfits');

    const { data = [], total = 0 } = await outfitsRes.json() as { data?: Outfit[]; total?: number };
    if (data.length === 0) return NextResponse.json({ success: true, outfits: [], total: 0 });

    const thumbnails = await noblox.getThumbnails(data.map((o) => ({ targetId: o.id, type: 'Outfit' as const, size: '150x150' as const }))) as ThumbnailData[];
    const thumbMap = new Map(thumbnails.map((t) => [t.targetId, t.imageUrl]));

    return NextResponse.json({ success: true, outfits: data.map((o) => ({ ...o, thumbnailUrl: thumbMap.get(o.id) ?? null })), total });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 }); }
}
