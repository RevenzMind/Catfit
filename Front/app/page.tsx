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

  if (checking) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><div className="text-zinc-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex gap-8">
        <div className="flex-1 flex items-center justify-center">
          <Image src={thumbnail} alt="Avatar" width={160} height={160} className="rounded-lg" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-4">
          <h1 className="text-3xl font-bold">Roblox Avatar</h1>
          <input ref={inputRef} type="password" placeholder="Paste cookie..." disabled={loading} className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
          {message && <p className={`text-sm ${message.includes("Success") || message.includes("Enter") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
          <button onClick={handleApply} disabled={loading} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold text-white">
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
