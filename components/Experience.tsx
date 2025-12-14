import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { AppState, COLORS } from '../types';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { SantaHatAnimated } from './SantaHat';
import * as THREE from 'three';

interface ExperienceProps {
  appState: AppState;
}

const SceneContent: React.FC<ExperienceProps> = ({ appState }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if(groupRef.current) {
             // Slowly rotate the whole tree for cinematic feel
             groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
             <Foliage appState={appState} />
             <Ornaments appState={appState} />
             <SantaHatAnimated appState={appState} />
        </group>
    );
};

export const Experience: React.FC<ExperienceProps> = ({ appState }) => {
  return (
    <Canvas 
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping }} // Let postprocessing handle it
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 35]} fov={50} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={50}
        autoRotate={false}
      />

      {/* Lighting: High contrast, warm highlights */}
      <ambientLight intensity={0.5} color={COLORS.EMERALD_DEEP} />
      
      {/* Main warm light imitating fireplace or warm indoor lighting */}
      <spotLight 
        position={[20, 20, 20]} 
        angle={0.25} 
        penumbra={1} 
        intensity={250} 
        color={COLORS.GOLD_HIGHLIGHT} 
        castShadow 
      />
      
      {/* Rim light for definition */}
      <pointLight position={[-10, 10, -10]} intensity={100} color="#6ca8cf" />
      
      {/* Inner Green Glow - Making it look more like a tree */}
      <pointLight position={[0, 2, 0]} intensity={30} color="#00ff66" distance={15} decay={2} />

      {/* Fill light from bottom for magical uplift */}
      <pointLight position={[0, -10, 0]} intensity={50} color={COLORS.GOLD_METALLIC} distance={20} />

      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <SceneContent appState={appState} />

      {/* Post Processing for the "Cinematic Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.7} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.6}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};