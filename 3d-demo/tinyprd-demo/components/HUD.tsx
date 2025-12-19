
import React from 'react';

interface HUDProps {
  hp: number;
  score: number;
  wave: number;
}

const HUD: React.FC<HUDProps> = ({ hp, score, wave }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between select-none">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="text-[#EAF6FF] text-xl drop-shadow-md">SCORE: {score.toLocaleString()}</div>
          <div className="text-[#EAF6FF] text-lg drop-shadow-md">WAVE: {wave}</div>
        </div>
        
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-xs text-[#EAF6FF]">
            <span>HP</span>
            <span>{Math.max(0, Math.floor(hp))}/100</span>
          </div>
          <div className="w-full bg-[#16324A] h-4 rounded-full border-2 border-[#EAF6FF] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF4D5A] to-[#F3FBFF] transition-all duration-300 ease-out"
              style={{ width: `${Math.max(0, hp)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="text-[#EAF6FF] text-[10px] opacity-60">
          Move: WASD | Shoot: IJKL or Click/Hold | Pause: P/Esc
        </div>
      </div>
    </div>
  );
};

export default HUD;
