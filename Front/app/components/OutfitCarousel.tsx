"use client";

import { useEffect, useRef, useState } from "react";
import OutfitCard from "./OutfitCard";

interface Outfit {
  id: number;
  name: string;
  isEditable: boolean;
  thumbnailUrl: string | null;
}

interface OutfitCarouselProps {
  outfits: Outfit[];
  equipping: number | null;
  onEquip: (id: number) => void;
}

export default function OutfitCarousel({ outfits, equipping, onEquip }: OutfitCarouselProps) {
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(140);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const filteredOutfits = outfits.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  // Recalculate card width when filtered outfits change
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const first = el.querySelector("[data-card]") as HTMLElement | null;
    if (first) {
      const style = getComputedStyle(first);
      const marginRight = parseInt(style.marginRight || "0");
      setCardWidth(first.offsetWidth + marginRight);
    }
  }, [filteredOutfits]);

  const scrollTo = (i: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const targetLeft =
      i >= filteredOutfits.length - 1
        ? maxScroll
        : Math.min(i * cardWidth, maxScroll);
    el.scrollTo({ left: targetLeft, behavior: "smooth" });
    setIndex(i);
  };

  const prev = () => scrollTo(Math.max(0, index - 1));
  const next = () => scrollTo(Math.min(filteredOutfits.length - 1, index + 1));

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (cardWidth || 1));
    setIndex(idx);
  };

  return (
    <section className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white leading-none">Outfits</h2>
          <p className="mt-1 text-xs text-zinc-400">Choose and customize your avatar</p>
        </div>

        {/* Search + count */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="relative w-full sm:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar outfit..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIndex(0);
              }}
              className="w-full pl-9 pr-3 py-1 rounded-lg bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-800 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-500 whitespace-nowrap sm:pl-1">
            {filteredOutfits.length} total
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative mt-4">
        <button aria-label="prev" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 carousel-btn">
          ‹
        </button>

        <div className="overflow-visible pr-0">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="carousel-track flex gap-3 overflow-x-auto pb-2 custom-scroll no-scrollbar snap-x snap-mandatory"
          >
            {filteredOutfits.map((o, idx) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                index={idx}
                equipping={equipping}
                onEquip={onEquip}
              />
            ))}
            <div className="carousel-tail" />
          </div>
        </div>

        {/* Dots + counter */}
        <div className="mt-3">
          <div className="text-[11px] text-zinc-400 mb-1.5">
            {index + 1} / {filteredOutfits.length}
          </div>
          <div className="dots-wrap">
            <div className={`dots-row ${filteredOutfits.length > 1 ? "dots-row--spread" : "dots-row--center"}`}>
              {filteredOutfits.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollTo(i)}
                  className={`dot ${i === index ? "active" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button aria-label="next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 carousel-btn">
          ›
        </button>
      </div>
    </section>
  );
}
