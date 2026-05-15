"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [thumbnail, setThumbnail] = useState("https://us-east-1.tixte.net/uploads/rawennn.tixte.co/noFilter.webp");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cookie = localStorage.getItem("roblox_cookie");
    if (cookie) {
      fetch("/api/avatar", { method: "POST", body: JSON.stringify({ cookie }) })
        .then((res) => res.ok ? (location.href = "/home") : (localStorage.removeItem("roblox_cookie"), setChecking(false)))
        .catch(() => setChecking(false));
    } else setChecking(false);
  }, []);

  const handleApply = async () => {
    const value = inputRef.current?.value;
    if (!value) { setMessage("Enter cookie"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/avatar", { method: "POST", body: JSON.stringify({ cookie: value }) });
      const data = await res.json();
      if (res.ok) {
        if (data.thumbnail) setThumbnail(data.thumbnail);
        localStorage.setItem("roblox_cookie", value);
        location.href = "/home";
      } else setMessage(data.error);
    } catch { setMessage("Error"); }
    finally { setLoading(false); }
  };

  if (checking) return <div className="min-h-screen amoled-shell text-white flex items-center justify-center"><div className="text-zinc-400">Loading...</div></div>;

  return (
    <div className="min-h-screen amoled-shell text-white flex items-center justify-center p-4">
      <main className="amoled-panel relative w-full max-w-xl overflow-hidden rounded-3xl p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/5 to-transparent" />

        <div className="relative flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-black p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <Image src={thumbnail} alt="Avatar" width={112} height={112} className="rounded-xl" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/45">Catvatar</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Roblox Avatar</h1>
              <p className="mt-2 text-sm text-white/45">Pega tu cookie para cargar y editar tu avatar.</p>
            </div>
          </div>

          <div className="space-y-3">
            <input ref={inputRef} type="password" placeholder="Paste cookie..." disabled={loading} className="amoled-input w-full px-4 py-3 rounded-xl disabled:opacity-50" />
            {message && <p className={`text-sm ${message.includes("Success") || message.includes("Enter") ? "text-white/75" : "text-white/55"}`}>{message}</p>}
            <button onClick={handleApply} disabled={loading} className="amoled-button w-full px-4 py-3 rounded-xl font-semibold transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
