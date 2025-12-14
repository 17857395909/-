import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState, COLORS, CONFIG } from '../types';

interface SantaHatProps {
  appState: AppState;
}

// Re-write component to include logic directly
export const SantaHatAnimated: React.FC<SantaHatProps> = ({ appState }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        const targetScale = appState === AppState.TREE_SHAPE ? 1.2 : 0;
        
        // Smooth scale transition
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
        groupRef.current.scale.setScalar(newScale);

        // Add a gentle "breathing" or "bobbing" motion to the hat when it's visible
        if (newScale > 0.1) {
            const time = state.clock.elapsedTime;
            groupRef.current.position.y = (CONFIG.TREE_HEIGHT / 2 - 0.2) + Math.sin(time * 2) * 0.1;
            groupRef.current.rotation.z = 0.1 + Math.sin(time * 1.5) * 0.05; // Wiggle tip
        }
    });

    return (
        <group ref={groupRef} position={[0, CONFIG.TREE_HEIGHT / 2, 0]}>
            {/* White Fur Base */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.8, 0.3, 16, 40]} />
                <meshStandardMaterial color="#eeeeee" roughness={1} />
            </mesh>

            {/* Hat Structure Group to bend it */}
            <group rotation={[0, 0, -0.1]}>
                {/* Lower Cone - Shortened */}
                <mesh position={[0, 0.6, 0]}>
                     <cylinderGeometry args={[0.5, 0.75, 1.2, 32]} />
                     <meshStandardMaterial color={COLORS.RED_HAT} roughness={0.7} />
                </mesh>
                
                {/* Upper Cone (Bent) - Lowered and Shortened */}
                <group position={[0, 1.2, 0]} rotation={[0, 0, -0.4]}>
                    <mesh position={[0, 0.5, 0]}>
                        {/* Shortened tip */}
                        <cylinderGeometry args={[0.1, 0.5, 1.0, 32]} />
                        <meshStandardMaterial color={COLORS.RED_HAT} roughness={0.7} />
                    </mesh>

                    {/* Pom Pom - Lowered */}
                    <mesh position={[0, 1.0, 0]}>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.9} />
                    </mesh>
                </group>
            </group>
        </group>
    );
};