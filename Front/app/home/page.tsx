"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import OutfitCarousel from "../components/OutfitCarousel";

interface UserData {
  userId: number;
  username: string;
  displayName: string;
  description: string;
  thumbnail: string;
  avatar: { assets: { id: number }[] };
}

interface Outfit {
  id: number;
  name: string;
  isEditable: boolean;
  thumbnailUrl: string | null;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [equipping, setEquipping] = useState<number | null>(null);
  const cacheRef = useRef(0);

  const getCookie = () => localStorage.getItem("roblox_cookie");

  // Fetch initial data
  useEffect(() => {
    const cookie = getCookie();
    if (!cookie) { location.href = "/"; return; }

    const fetchData = async () => {
      const [avatarRes, charRes] = await Promise.all([
        fetch("/api/avatar", { method: "POST", body: JSON.stringify({ cookie }) }),
        fetch("/api/characters", { method: "POST", body: JSON.stringify({ cookie }) }),
      ]);
      if (avatarRes.ok) { const d = await avatarRes.json(); setUserData(d); }
      if (charRes.ok) {
        const d = await charRes.json();
        setOutfits(d.outfits?.filter((o: Outfit) => o.isEditable) ?? []);
      }
    };

    fetchData();
  }, []);

  const refreshAvatar = async (cookie: string, delay = 500) => {
    await new Promise((r) => setTimeout(r, delay));
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.thumbnail) {
          cacheRef.current++;
          d.thumbnail = `${d.thumbnail}${d.thumbnail.includes("?") ? "&" : "?"}cb=${cacheRef.current}`;
        }
        setUserData(d);
      }
    } catch {}
  };

  const equipOutfit = async (outfitId: number) => {
    const cookie = getCookie();
    setEquipping(outfitId);
    if (!cookie) { setEquipping(null); return; }
    try {
      await fetch("/api/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookie, outfitId }),
      });
      await refreshAvatar(cookie);
    } catch {}
    setEquipping(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("roblox_cookie");
    location.href = "/";
  };

  return (
    <>
      <style>{`
        .custom-scroll { scrollbar-width: auto }
        .custom-scroll::-webkit-scrollbar { width: 8px }
        .custom-scroll::-webkit-scrollbar-track { background: #000 }
        .custom-scroll::-webkit-scrollbar-thumb { background: #111; border-radius: 999px }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #222 }

        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none }
        .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0 }

        .card { background: rgba(9,9,11,0.72); border: 1px solid rgb(39,39,42); box-shadow: 0 0 30px rgba(0,0,0,0.2); border-radius: 16px; overflow: hidden }
        .card img { display: block }

        .sidebar-surface { background: #050505 }
        .profile-ring { outline: 3px solid white }

        .carousel-track { padding-left: 3rem; padding-right: 5rem; scroll-padding-left: 3rem; scroll-padding-right: 5rem; width: 100% }
        .outfit-card { min-width: 120px; flex: 0 0 120px }
        .outfit-card-padding { padding: 10px }
        .carousel-tail { flex: 0 0 2.25rem }

        .dots-wrap { padding: 0 2.25rem; width: 100% }
        .dots-row { display: flex; width: 100% }
        .dots-row--spread { justify-content: space-between }
        .dots-row--center { justify-content: center }

        .carousel-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 9999px; background: rgba(0,0,0,0.6); color: #cfeffb; border: 1px solid rgba(255,255,255,0.02); backdrop-filter: blur(6px) }
        .carousel-btn:hover { background: rgba(0,212,255,0.06); transform: scale(1.04) }

        .dots { display: flex; gap: 3px; justify-content: center; padding-top: 8px }
        .dot { width: 6px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; transition: all .2s; cursor: pointer }
        .dot:hover { background: rgba(255,255,255,0.2) }
        .dot.active { background: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.6) }
      `}</style>

      <div className="min-h-screen bg-black text-white">
        <div className="flex h-full align-middle">
          <Sidebar userData={userData} onLogout={handleLogout} />

          <main className="flex items-center ml-80 min-w-0 h-screen">
            <div className="p-3 overflow-y-auto min-w-0">
              <OutfitCarousel
                outfits={outfits}
                equipping={equipping}
                onEquip={equipOutfit}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
