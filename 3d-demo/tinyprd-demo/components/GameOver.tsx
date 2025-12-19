
import React from 'react';

interface GameOverProps {
  score: number;
  wave: number;
  highScore: number;
  bestWave: number;
  onRetry: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, wave, highScore, bestWave, onRetry }) => {
  return (
    <div className="absolute inset-0 bg-[#0B1B2B]/80 flex items-center justify-center z-50 p-8">
      <div className="max-w-md w-full text-white text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <h2 className="text-4xl text-[#FF4D5A] drop-shadow-lg">GAME OVER</h2>
        
        <div className="bg-[#16324A] p-6 rounded-lg border-2 border-[#FF4D5A] space-y-4">
          <div className="flex justify-between text-sm">
            <span className="opacity-70">SCORE:</span>
            <span className="font-bold">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-70">WAVE:</span>
            <span className="font-bold">{wave}</span>
          </div>
          <div className="h-px bg-[#214B6B] my-4" />
          <div className="flex justify-between text-xs text-[#6FD3FF]">
            <span>BEST SCORE:</span>
            <span>{highScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#6FD3FF]">
            <span>BEST WAVE:</span>
            <span>{bestWave}</span>
          </div>
        </div>

        <button 
          onClick={onRetry}
          className="px-12 py-4 bg-[#F3FBFF] text-[#0B1B2B] text-xl rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          RETRY
        </button>

        <p className="text-[10px] opacity-60">Press SPACE to Retry</p>
      </div>
    </div>
  );
};

export default GameOver;
