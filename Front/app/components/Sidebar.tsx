"use client";

import Image from "next/image";

interface UserData {
  userId: number;
  username: string;
  displayName: string;
  description: string;
  thumbnail: string;
  avatar: { assets: { id: number }[] };
}

interface SidebarProps {
  userData: UserData | null;
  onLogout: () => void;
}

export default function Sidebar({ userData, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar-surface w-80 h-screen px-4 pt-6 pb-4 flex flex-col gap-4 overflow-y-auto custom-scroll fixed left-0 top-0 border border-zinc-800">
      {userData ? (
        <>
          {/* Logo / App name */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-3 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black p-1.5">
                <Image src="/Frame 5.svg" alt="Catvatar logo" fill className="object-contain p-1" priority />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-black tracking-tight text-white leading-none">Catfit</h1>
                <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-zinc-500">outfit editor</p>
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-[0_0_30px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col items-center gap-3">
              {userData.thumbnail && (
                <Image
                  src={userData.thumbnail}
                  alt={userData.username}
                  width={96}
                  height={96}
                  className="profile-ring rounded-full"
                />
              )}
              <div className="text-center">
                <h2 className="text-lg font-bold leading-none">{userData.displayName}</h2>
                <p className="mt-1 text-xs text-zinc-400">@{userData.username}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {userData.description && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-2">Description</p>
              <p className="text-sm text-zinc-100 leading-5 line-clamp-3">{userData.description}</p>
            </div>
          )}

          {/* Logout */}
          <div className="mt-auto pt-2">
            <button
              onClick={onLogout}
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
}
