import { Vector3, MathUtils } from 'three';
import { CONFIG } from '../types';

/**
 * Generates positions for a conical tree shape.
 * Distributed spirally for even coverage.
 */
export const generateTreePositions = (count: number, height: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ratio = i / count;
    // Y: 0 to height (bottom to top), slightly randomized
    const y = ratio * height - height / 2;
    
    // Radius at this height (linear cone)
    const currentRadius = (1 - ratio) * radius;

    // Golden Angle spiral distribution
    const theta = i * 2.39996 + Math.random() * 0.5; 
    
    // Add some noise to radius for fluffiness
    const r = currentRadius * (0.8 + Math.random() * 0.4);

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

/**
 * Generates positions scattered inside a large sphere.
 */
export const generateScatterPositions = (count: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vec = new Vector3();
  for (let i = 0; i < count; i++) {
    // Random point inside sphere
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random()) * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

export const generateOrnamentData = (count: number, type: 'BOX' | 'SPHERE'): { tree: Vector3[], scatter: Vector3[] } => {
    const tree = [];
    const scatter = [];
    
    // Similar to tree generation but fewer, keeping them more on the surface
    for (let i = 0; i < count; i++) {
        // Scatter
        const rScatter = Math.cbrt(Math.random()) * CONFIG.SCATTER_RADIUS;
        const thetaS = Math.random() * Math.PI * 2;
        const phiS = Math.acos(2 * Math.random() - 1);
        scatter.push(new Vector3(
            rScatter * Math.sin(phiS) * Math.cos(thetaS),
            rScatter * Math.sin(phiS) * Math.sin(thetaS),
            rScatter * Math.cos(phiS)
        ));

        // Tree
        const ratio = Math.random(); 
        const y = ratio * CONFIG.TREE_HEIGHT - CONFIG.TREE_HEIGHT / 2;
        const currentRadius = (1 - ratio) * CONFIG.TREE_RADIUS;
        
        // Push ornaments slightly outside the foliage radius
        const rTree = currentRadius + (type === 'BOX' ? 0.5 : 0.2); 
        const thetaT = Math.random() * Math.PI * 2;
        
        tree.push(new Vector3(
            rTree * Math.cos(thetaT),
            y,
            rTree * Math.sin(thetaT)
        ));
    }

    return { tree, scatter };
}