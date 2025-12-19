
import React from 'react';

interface MenuProps {
  onStart: () => void;
  arrowShootMode: boolean;
  onToggleArrowMode: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStart, arrowShootMode, onToggleArrowMode }) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
      <div className="max-w-xl w-full text-white text-center space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-[#F3FBFF] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            SNOWMAN SENTINEL
          </h1>
          <p className="text-sm text-[#6FD3FF]">4-direction snowball survival</p>
        </div>

        <div className="bg-[#16324A]/80 p-6 rounded-lg border-2 border-[#214B6B] space-y-6 text-left">
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div className="space-y-2">
              <h3 className="text-[#6FD3FF] border-b border-[#214B6B] pb-1">MOVEMENT</h3>
              <p>WASD / Arrow Keys</p>
              <p>(strictly 4-directional)</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[#6FD3FF] border-b border-[#214B6B] pb-1">SHOOTING</h3>
              <p>IJKL / Tap Zones</p>
              <p>Click & Hold for Auto</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#214B6B] pt-4">
            <span className="text-xs">Arrow Shoot Mode</span>
            <button 
              onClick={onToggleArrowMode}
              className={`px-4 py-2 text-xs rounded transition-colors ${arrowShootMode ? 'bg-[#E43D4C]' : 'bg-[#214B6B]'}`}
            >
              {arrowShootMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <p className="text-[8px] opacity-50 italic">If ON, Arrow Keys shoot; WASD moves.</p>
        </div>

        <button 
          onClick={onStart}
          className="group relative px-12 py-4 bg-[#F3FBFF] text-[#0B1B2B] text-xl rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          PLAY
          <div className="absolute inset-0 rounded-full border-4 border-[#F3FBFF] animate-ping opacity-20 pointer-events-none" />
        </button>

        <p className="text-[10px] animate-pulse">Press SPACE to Start</p>
      </div>
    </div>
  );
};

export default Menu;
