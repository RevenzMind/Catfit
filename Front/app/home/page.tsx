"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const ALL_CATEGORIES = [
  "Hat", "HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory",
  "Shirt", "Pants", "TShirt", "Torso", "RightArm", "LeftArm", "LeftLeg", "RightLeg", "Head", "Face", "Gear",
  "ClimbAnimation", "DeathAnimation", "FallAnimation", "IdleAnimation", "JumpAnimation", "RunAnimation", "SwimAnimation", "WalkAnimation", "PoseAnimation", "EmoteAnimation",
  "TShirtAccessory", "ShirtAccessory", "PantsAccessory", "JacketAccessory", "SweaterAccessory", "ShortsAccessory", "LeftShoeAccessory", "RightShoeAccessory", "DressSkirtAccessory", "DynamicHead"
];
const DEFAULT_CATEGORIES = ["Hat", "HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory", "Shirt", "Pants", "TShirt", "Face"];

interface UserData { userId: number; username: string; displayName: string; description: string; thumbnail: string; avatar: { assets: { id: number }[] }; }
interface Outfit { id: number; name: string; isEditable: boolean; thumbnailUrl: string | null; }
interface InventoryItem { assetId: number; name: string; assetType: string; thumbnailUrl: string | null; }

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipping, setEquipping] = useState<number | null>(null);
  const [wornAssets, setWornAssets] = useState<Set<number>>(new Set());
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(DEFAULT_CATEGORIES));
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const cacheRef = useRef(0);

  const toggleCollapse = (cat: string) => setCollapsedCategories((p) => { const n = new Set(p); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  const getCookie = () => localStorage.getItem("roblox_cookie");

  useEffect(() => {
    const cookie = getCookie();
    if (!cookie) { location.href = "/"; return; }
    const fetchData = async () => {
      const [avatarRes, charRes, invRes] = await Promise.all([
        fetch("/api/avatar", { method: "POST", body: JSON.stringify({ cookie }) }),
        fetch("/api/characters", { method: "POST", body: JSON.stringify({ cookie }) }),
        fetch("/api/inventory", { method: "POST", body: JSON.stringify({ cookie }) }),
      ]);
      if (avatarRes.ok) { const d = await avatarRes.json(); setUserData(d); setWornAssets(new Set(d.wornAssetIds ?? [])); }
      if (charRes.ok) { const d = await charRes.json(); setOutfits(d.outfits?.filter((o: Outfit) => o.isEditable) ?? []); }
      if (invRes.ok) { const d = await invRes.json(); setInventory(d.items ?? []); }
    };
    fetchData();
  }, []);

  const refreshAvatar = async (cookie: string, delay = 500) => {
    await new Promise((r) => setTimeout(r, delay));
    try {
      const res = await fetch("/api/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cookie }) });
      if (res.ok) {
        const d = await res.json();
        if (d.thumbnail) { cacheRef.current++; d.thumbnail = `${d.thumbnail}${d.thumbnail.includes('?') ? '&' : '?'}cb=${cacheRef.current}`; }
        setUserData(d); setWornAssets(new Set(d.wornAssetIds ?? []));
      }
    } catch {}
  };

  const equipOutfit = async (outfitId: number) => {
    const cookie = getCookie(); setEquipping(outfitId);
    try { await fetch("/api/equip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cookie, outfitId }) }); } catch {}
    setEquipping(null);
  };

  const toggleAsset = async (assetId: number) => {
    const cookie = getCookie(); const isWorn = wornAssets.has(assetId); setEquipping(assetId);
    try {
      const res = await fetch("/api/wear", { method: "POST", body: JSON.stringify({ cookie, assetId, action: isWorn ? "remove" : "wear", currentAssetIds: Array.from(wornAssets) }) });
      if (res.ok) setWornAssets((p) => { const n = new Set(p); isWorn ? n.delete(assetId) : n.add(assetId); return n; });
    } catch {}
    setEquipping(null);
  };

  const toggleCategory = (cat: string) => setSelectedCategories((p) => { const n = new Set(p); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  const selectAllCategories = () => setSelectedCategories(new Set(ALL_CATEGORIES));
  const deselectAllCategories = () => setSelectedCategories(new Set());

  const groupedInventory = inventory.filter((i) => selectedCategories.has(i.assetType)).reduce((a, i) => { if (!a[i.assetType]) a[i.assetType] = []; a[i.assetType].push(i); return a; }, {} as Record<string, InventoryItem[]>);

  return (
    <>
      <style>{`.custom-scroll::-webkit-scrollbar{width:8px}.custom-scroll::-webkit-scrollbar-track{background:rgb(24,24,27)}.custom-scroll::-webkit-scrollbar-thumb{background:rgb(63,63,70);border-radius:4px}.custom-scroll::-webkit-scrollbar-thumb:hover{background:rgb(82,82,91)}.w11-checkbox{appearance:none;width:18px;height:18px;border:2px solid rgb(113,113,122);border-radius:4px;background:transparent;cursor:pointer;position:relative;transition:all .15s}.w11-checkbox:hover{border-color:rgb(161,161,170)}.w11-checkbox:checked{background:rgb(59,130,246);border-color:rgb(59,130,246)}.w11-checkbox:checked::after{content:'';position:absolute;left:5px;top:2px;width:5px;height:9px;border:solid white;border-width:0 2px 2px 0;transform:rotate(45deg)}`}</style>
      <div className="min-h-screen bg-zinc-950 text-white flex h-screen">
        <div className="fixed left-0 top-0 w-80 h-screen bg-zinc-900 border-r border-zinc-800 px-4 pt-10 pb-3 flex flex-col gap-3 overflow-y-auto custom-scroll">
          {userData && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl text-white">🐱 Catvatar</h1>
                <button onClick={() => setShowOptions(true)} className="p-2 hover:bg-zinc-700 rounded-lg transition z-10 cursor-pointer" title="Options" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
              </div>
              <div className="flex flex-col items-center gap-2">
                {userData.thumbnail && <Image src={userData.thumbnail} alt={userData.username} width={100} height={100} className="rounded-lg" />}
                <div className="text-center"><h2 className="text-lg font-bold">{userData.displayName}</h2><p className="text-xs text-zinc-400">@{userData.username}</p></div>
              </div>
              <div className="border-t border-zinc-700 pt-2"><p className="text-xs text-zinc-500 mb-1">User ID</p><p className="text-xs">{userData.userId}</p></div>
              {userData.description && <div className="border-t border-zinc-700 pt-2"><p className="text-xs text-zinc-500 mb-1">Description</p><p className="text-xs line-clamp-2">{userData.description}</p></div>}
              <button onClick={() => { localStorage.removeItem("roblox_cookie"); location.href = "/"; }} className="mt-auto px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold w-full">Logout</button>
            </>
          )}
        </div>
        <div className="ml-80 flex-1 flex flex-col h-screen">
          <div className="h-10 shrink-0"></div>
          <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scroll">
            <h1 className="text-4xl font-bold mb-6">Avatar</h1>
            <section className="mb-6">
              <button onClick={() => toggleCollapse("_outfits")} className="flex items-center gap-2 text-2xl font-bold mb-4 hover:text-zinc-300 transition w-full text-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${collapsedCategories.has("_outfits") ? "-rotate-90" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                Outfits ({outfits.length})
              </button>
              {!collapsedCategories.has("_outfits") && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {outfits.map((o) => (
                    <div key={o.id} onClick={() => equipOutfit(o.id)} className={`bg-zinc-800 rounded-lg overflow-hidden cursor-pointer transition hover:scale-105 hover:ring-2 hover:ring-blue-500 ${equipping === o.id ? "opacity-50 pointer-events-none" : ""}`}>
                      {o.thumbnailUrl && <Image src={o.thumbnailUrl} alt={o.name} width={150} height={150} className="w-full aspect-square object-cover" />}
                      <div className="p-2"><p className="text-xs font-medium truncate">{o.name}</p></div>
                    </div>
                  ))}
                  {outfits.length === 0 && <p className="text-zinc-400 text-sm">No editable outfits</p>}
                </div>
              )}
            </section>
            {Object.entries(groupedInventory).map(([type, items]) => (
              <section key={type} className="mb-6">
                <button onClick={() => toggleCollapse(type)} className="flex items-center gap-2 text-xl font-bold mb-3 hover:text-zinc-300 transition w-full text-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${collapsedCategories.has(type) ? "-rotate-90" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  {type} ({items.length})
                </button>
                {!collapsedCategories.has(type) && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {items.map((i) => {
                      const isWorn = wornAssets.has(i.assetId);
                      return (
                        <div key={i.assetId} onClick={() => toggleAsset(i.assetId)} className={`bg-zinc-800 rounded-lg overflow-hidden cursor-pointer transition hover:scale-105 ${isWorn ? "ring-2 ring-green-500" : "hover:ring-2 hover:ring-blue-500"} ${equipping === i.assetId ? "opacity-50 pointer-events-none" : ""}`}>
                          {i.thumbnailUrl && <Image src={i.thumbnailUrl} alt={i.name} width={100} height={100} className="w-full aspect-square object-cover" />}
                          <div className="p-1.5"><p className="text-[10px] truncate">{i.name}</p>{isWorn && <p className="text-[9px] text-green-400">Equipped</p>}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
        {showOptions && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowOptions(false)}>
            <div className="bg-zinc-900 rounded-xl p-6 w-150 max-h-[80vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-bold">Category Options</h2><button onClick={() => setShowOptions(false)} className="text-zinc-400 hover:text-white text-2xl">&times;</button></div>
              <div className="flex gap-2 mb-4">
                <button onClick={selectAllCategories} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm">Select All</button>
                <button onClick={deselectAllCategories} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm">Deselect All</button>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Accessories", cats: ["Hat", "HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory"] },
                  { title: "Clothing", cats: ["Shirt", "Pants", "TShirt"] },
                  { title: "Body Parts", cats: ["Torso", "RightArm", "LeftArm", "LeftLeg", "RightLeg", "Head", "Face", "DynamicHead"] },
                  { title: "Gear", cats: ["Gear"] },
                  { title: "Animations", cats: ["ClimbAnimation", "DeathAnimation", "FallAnimation", "IdleAnimation", "JumpAnimation", "RunAnimation", "SwimAnimation", "WalkAnimation", "PoseAnimation", "EmoteAnimation"] },
                  { title: "Layered Clothing", cats: ["TShirtAccessory", "ShirtAccessory", "PantsAccessory", "JacketAccessory", "SweaterAccessory", "ShortsAccessory", "LeftShoeAccessory", "RightShoeAccessory", "DressSkirtAccessory"] },
                ].map((g) => (
                  <div key={g.title}>
                    <h3 className="text-sm font-semibold text-zinc-400 mb-2">{g.title}</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {g.cats.map((c) => (
                        <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-800 p-2 rounded">
                          <input type="checkbox" checked={selectedCategories.has(c)} onChange={() => toggleCategory(c)} className="w11-checkbox" />
                          {c.replace("Accessory", "").replace("Animation", "")}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-700"><button onClick={() => setShowOptions(false)} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Done</button></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
