"use client";

import Image from "next/image";

interface Outfit {
  id: number;
  name: string;
  isEditable: boolean;
  thumbnailUrl: string | null;
}

interface OutfitCardProps {
  outfit: Outfit;
  index: number;
  equipping: number | null;
  onEquip: (id: number) => void;
}

export default function OutfitCard({ outfit, index, equipping, onEquip }: OutfitCardProps) {
  const isEquipping = equipping === outfit.id;

  return (
    <div
      key={outfit.id}
      data-card
      onClick={() => onEquip(outfit.id)}
      className={`card outfit-card cursor-pointer transition-all hover:brightness-125 snap-start ${
        isEquipping ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="outfit-card-padding">
        {outfit.thumbnailUrl && (
          <Image
            src={outfit.thumbnailUrl}
            alt={outfit.name}
            width={128}
            height={128}
            className="w-full aspect-square object-cover rounded-md"
          />
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium truncate text-white/90">{outfit.name}</p>
        <p className="text-[11px] text-zinc-400">Outfit #{index + 1}</p>
      </div>
    </div>
  );
}
