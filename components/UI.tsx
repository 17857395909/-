import React from 'react';
import { AppState, COLORS } from '../types';

interface UIProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export const UI: React.FC<UIProps> = ({ appState, setAppState }) => {
  const isTree = appState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-12 z-10">
      {/* Header */}
      <div className="text-center space-y-4 opacity-90">
        <h3 className="text-[#8c9c96] tracking-[0.3em] text-xs font-serif uppercase">Warmest Wishes</h3>
        <h1 
            className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#FFF6D6] to-[#C5A059] drop-shadow-lg leading-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Jiaxin,<br/>Merry Christmas!
        </h1>
      </div>

      {/* Controls */}
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <button
          onClick={() => setAppState(isTree ? AppState.SCATTERED : AppState.TREE_SHAPE)}
          className="group relative px-8 py-3 bg-[#01140e]/80 backdrop-blur-md border border-[#C5A059]/30 rounded-full transition-all duration-700 hover:border-[#C5A059] hover:bg-[#00281b]"
        >
          <span className="relative z-10 text-[#C5A059] font-serif tracking-widest text-sm transition-all duration-500 group-hover:text-white">
            {isTree ? "DISPERSE PARTICLES" : "ASSEMBLE SIGNATURE"}
          </span>
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_20px_rgba(197,160,89,0.3)]"></div>
        </button>
        
        <p className="text-[#8c9c96] text-xs font-mono tracking-widest opacity-60">
            {isTree ? "STATE: CONICAL AGGREGATION" : "STATE: AETHER SUSPENSION"}
        </p>
      </div>
    </div>
  );
};