import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG, AppState } from '../types';
import { generateOrnamentData } from '../utils/math';

interface OrnamentGroupProps {
  appState: AppState;
}

export const Ornaments: React.FC<OrnamentGroupProps> = ({ appState }) => {
  // --- Spheres (Baubles) ---
  const sphereCount = CONFIG.ORNAMENT_SPHERE_COUNT;
  const spheresRef = useRef<THREE.InstancedMesh>(null);
  
  const sphereData = useMemo(() => 
    generateOrnamentData(sphereCount, 'SPHERE'), 
  [sphereCount]);

  // --- Boxes (Gifts) ---
  const boxCount = CONFIG.ORNAMENT_BOX_COUNT;
  const boxesRef = useRef<THREE.InstancedMesh>(null);
  
  const boxData = useMemo(() => 
    generateOrnamentData(boxCount, 'BOX'), 
  [boxCount]);

  // Current interpolation state (0 to 1)
  const progress = useRef(0);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    // Initial placement to avoid flicker
    if (spheresRef.current) {
        for (let i = 0; i < sphereCount; i++) {
             tempObj.position.copy(sphereData.scatter[i]);
             tempObj.updateMatrix();
             spheresRef.current.setMatrixAt(i, tempObj.matrix);
        }
        spheresRef.current.instanceMatrix.needsUpdate = true;
    }
    if (boxesRef.current) {
        for (let i = 0; i < boxCount; i++) {
            tempObj.position.copy(boxData.scatter[i]);
            tempObj.updateMatrix();
            boxesRef.current.setMatrixAt(i, tempObj.matrix);
       }
       boxesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [sphereData, boxData, sphereCount, boxCount, tempObj]);

  useFrame((state, delta) => {
    const target = appState === AppState.TREE_SHAPE ? 1 : 0;
    // Lerp progress global
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2.0);
    const t = progress.current;
    
    // Ease function
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const time = state.clock.elapsedTime;

    // Update Spheres
    if (spheresRef.current) {
      for (let i = 0; i < sphereCount; i++) {
        const start = sphereData.scatter[i];
        const end = sphereData.tree[i];
        
        // Lerp Pos
        tempObj.position.lerpVectors(start, end, easedT);
        
        // Add physics feel: rotate slowly when scattered, stabilize when tree
        tempObj.rotation.set(
            time * 0.2 + i, 
            time * 0.1 + i, 
            0
        );
        // Spin faster if scattered
        if (t < 0.8) {
             tempObj.rotation.x += time * 0.5;
        } else {
             // Orient upright-ish for tree
             tempObj.rotation.set(0, time * 0.1 + i, 0); 
        }

        const scale = 0.35;
        tempObj.scale.set(scale, scale, scale);
        
        tempObj.updateMatrix();
        spheresRef.current.setMatrixAt(i, tempObj.matrix);
      }
      spheresRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Boxes
    if (boxesRef.current) {
      for (let i = 0; i < boxCount; i++) {
        const start = boxData.scatter[i];
        const end = boxData.tree[i];

        tempObj.position.lerpVectors(start, end, easedT);
        
        // Boxes tumble when scattered
        if (t < 0.9) {
            tempObj.rotation.set(time * 0.5 + i, time * 0.3 + i, i);
        } else {
            // Sit flat on the "branches"
            tempObj.rotation.set(0, i + time * 0.05, 0); 
        }

        const scale = 0.45;
        tempObj.scale.set(scale, scale, scale);

        tempObj.updateMatrix();
        boxesRef.current.setMatrixAt(i, tempObj.matrix);
      }
      boxesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Golden Spheres */}
      <instancedMesh ref={spheresRef} args={[undefined, undefined, sphereCount]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color={COLORS.GOLD_METALLIC} 
            metalness={0.9} 
            roughness={0.1}
            envMapIntensity={1.5}
        />
      </instancedMesh>

      {/* Red Velvet Boxes */}
      <instancedMesh ref={boxesRef} args={[undefined, undefined, boxCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            color={COLORS.RED_VELVET} 
            metalness={0.3} 
            roughness={0.4}
            envMapIntensity={0.8}
        />
      </instancedMesh>
    </group>
  );
};