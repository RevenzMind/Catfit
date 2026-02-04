'use client';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      close: () => void;
    };
  }
}

export default function Controlbox() {
  const handleMinimize = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.close();
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between pr-3 bg-transparent select-none z-50" 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex-1 h-full"></div>
      
      <div 
        className="flex items-center gap-1" 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
      <button
        onClick={handleMinimize}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors rounded-sm"
        title="Minimize"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13H5v-2h14v2z" />
        </svg>
      </button>

      <button
        disabled
        className="w-10 h-10 flex items-center justify-center text-gray-600 cursor-not-allowed rounded-sm opacity-50"
        title="Maximize (Disabled)"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5h14v14H5V5zm2 2v10h10V7H7z" />
        </svg>
      </button>

      <button
        onClick={handleClose}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-colors rounded-sm"
        title="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
      </button>
      </div>
    </div>
  );
}
