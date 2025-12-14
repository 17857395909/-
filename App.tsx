import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { AppState } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  return (
    <div className="relative w-full h-screen bg-black">
      <Experience appState={appState} />
      <UI appState={appState} setAppState={setAppState} />
      
      {/* Decorative Border Frame */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-[#C5A059]/10 m-4 rounded-sm"></div>
      <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-transparent to-[#C5A059]/40"></div>
      <div className="absolute bottom-8 right-8 w-px h-16 bg-gradient-to-t from-transparent to-[#C5A059]/40"></div>
    </div>
  );
}