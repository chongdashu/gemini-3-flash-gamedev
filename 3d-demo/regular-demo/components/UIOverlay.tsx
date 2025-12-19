
import React from 'react';
import { Heart, Trophy, Swords, RefreshCw } from 'lucide-react';
import { GameState } from '../types';

interface UIProps {
  state: GameState;
  onRestart: () => void;
}

export const UIOverlay: React.FC<UIProps> = ({ state, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 select-none">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-red-400 fill-red-400 animate-pulse" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-6 rounded-full transition-all duration-300 ${i < state.health ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-slate-700'}`} 
                />
              ))}
            </div>
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-300">HP: {state.health}/5</div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white shadow-xl min-w-[140px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-bold uppercase text-xs">Score</span>
              <span className="font-game text-2xl text-blue-300">{state.score.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white shadow-xl text-sm">
             Best: <span className="font-bold text-yellow-400">{state.highScore}</span>
          </div>
        </div>
      </div>

      {/* Wave Announcement */}
      <div className="flex flex-col items-center">
        {state.waveMessage && (
          <div className="bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full border border-white/10 animate-bounce">
            <h2 className="font-game text-xl text-white tracking-wide">{state.waveMessage}</h2>
          </div>
        )}
      </div>

      {/* Controls Guide */}
      <div className="flex justify-between items-end">
        <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white/70 text-xs">
          <p className="mb-1 font-bold text-slate-300">CONTROLS:</p>
          <p>WASD / Arrows to shoot</p>
          <p>Click/Tap area to shoot</p>
        </div>
        <div className="bg-blue-600/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white shadow-xl">
           <div className="flex flex-col items-center">
             <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Wave</span>
             <span className="font-game text-4xl">{state.wave}</span>
           </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {state.isGameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 border-b-8 border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Swords className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="font-game text-4xl text-slate-800 mb-2">MELTED!</h2>
            <p className="text-slate-500 mb-8">You defended the snow park for {state.wave} waves.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-slate-400 uppercase">Score</span>
                <span className="text-2xl font-game text-blue-500">{state.score}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="block text-xs font-bold text-slate-400 uppercase">Record</span>
                <span className="text-2xl font-game text-yellow-500">{state.highScore}</span>
              </div>
            </div>

            <button 
              onClick={onRestart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-game py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-xl shadow-[0_6px_0_rgb(37,99,235)] active:translate-y-1 active:shadow-none"
            >
              <RefreshCw /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
