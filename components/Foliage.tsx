import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS, AppState } from '../types';
import { generateTreePositions, generateScatterPositions } from '../utils/math';

// Vertex Shader: Interpolates positions and adds "breathing"
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0.0 = Scattered, 1.0 = Tree
  uniform float uPixelRatio;

  attribute vec3 aPositionTree;
  attribute vec3 aPositionScatter;
  attribute float aRandom;

  varying float vAlpha;
  varying float vProgress;
  varying float vRandom;

  // Cubic Bezier Ease In Out approximation for smoother transition
  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vRandom = aRandom;
    float t = easeInOutCubic(uProgress);

    // Lerp position
    vec3 pos = mix(aPositionScatter, aPositionTree, t);

    // Add breathing animation (stronger when scattered, gentle when tree)
    float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
    pos.y += breathe * (1.0 - t * 0.8); // Dampen Y movement in tree mode
    
    // Add subtle wind noise in tree mode
    if (t > 0.8) {
        pos.x += sin(uTime * 1.5 + pos.y) * 0.05 * t;
        pos.z += cos(uTime * 1.2 + pos.y) * 0.05 * t;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation - Increased base size for fuller look
    gl_PointSize = (70.0 * uPixelRatio) * (1.0 / -mvPosition.z);
    
    // Varying for fragment
    vProgress = t;
  }
`;

// Fragment Shader: Rich Emerald Green with Gold Sparkles
const fragmentShader = `
  uniform float uTime;
  varying float vProgress;
  varying float vRandom;

  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;

    // --- COLOR PALETTE ---
    // Much greener base colors for additive blending
    vec3 colorDeep = vec3(0.0, 0.15, 0.05);    // Deep Forest Green
    vec3 colorEmerald = vec3(0.0, 0.5, 0.2);   // Vibrant Emerald
    vec3 colorGold = vec3(1.0, 0.9, 0.5);      // Gold Sparkle

    // Radial gradient: Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0); // Soft falloff

    // Base Green Gradient
    vec3 baseColor = mix(colorDeep, colorEmerald, glow);

    // --- ANIMATED SPARKLES ---
    // Twinkle effect based on time, position, and random attribute
    float twinkle = sin(uTime * 3.0 + vRandom * 20.0);
    // Make sparkles sharp and occasional
    float sparkle = smoothstep(0.85, 1.0, twinkle);
    
    // Mix in gold based on sparkle
    vec3 finalColor = mix(baseColor, colorGold, sparkle * 0.8);

    // Adjust intensity based on progress (brighter when scattered, denser when tree)
    float intensity = mix(1.2, 0.8, vProgress);

    gl_FragColor = vec4(finalColor * intensity, 1.0);
  }
`;

interface FoliageProps {
  appState: AppState;
}

export const Foliage: React.FC<FoliageProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Create data once
  const { positionsTree, positionsScatter, randoms } = useMemo(() => {
    const tree = generateTreePositions(CONFIG.FOLIAGE_COUNT, CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS);
    const scatter = generateScatterPositions(CONFIG.FOLIAGE_COUNT, CONFIG.SCATTER_RADIUS);
    const rnd = new Float32Array(CONFIG.FOLIAGE_COUNT);
    for (let i = 0; i < CONFIG.FOLIAGE_COUNT; i++) rnd[i] = Math.random();
    
    return {
      positionsTree: tree,
      positionsScatter: scatter,
      randoms: rnd
    };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  // Animation Loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth lerp for uProgress
      const targetProgress = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
      // Slower, heavy interpolation for a "majestic" feel
      material.uniforms.uProgress.value = THREE.MathUtils.lerp(
        material.uniforms.uProgress.value,
        targetProgress,
        delta * 1.5
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        {/* We use 'position' just for bounding sphere, real rendering positions are in attributes */}
        <bufferAttribute
          attach="attributes-position" // Dummy position for Three.js culling
          count={positionsTree.length / 3}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionTree"
          count={positionsTree.length / 3}
          array={positionsTree}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aPositionScatter"
          count={positionsScatter.length / 3}
          array={positionsScatter}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};