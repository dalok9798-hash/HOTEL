import React, { useEffect, useState } from 'react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-radial from-slate-900 to-slate-950 flex flex-col items-center justify-center z-50 p-4 font-sans text-white">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl animate-pulse delay-500"></div>

      <div className="text-center max-w-sm w-full relative z-10 flex flex-col items-center">
        {/* Shield brand icon */}
        <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-emerald-400 to-sky-400 p-1 shadow-2xl relative mb-6 animate-bounce">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sky-400 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </div>
        </div>

        {/* Brand typography */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-linear-to-r from-emerald-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
          TULSI HOTEL
        </h1>
        <p className="text-sm font-light text-slate-400 tracking-widest uppercase mb-12">
          Scan • Browse • Order
        </p>

        {/* Luxury Glass Card Progress bar */}
        <div className="w-full max-w-xs bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl mb-4">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>Synchronizing Smart Menu...</span>
            <span className="font-mono text-emerald-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-xs text-slate-500 animate-pulse">
          Premium Digital Dining System
        </p>
      </div>
    </div>
  );
}
