import { Vector3 } from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export const COLORS = {
  EMERALD_DEEP: '#00281b',
  EMERALD_LIGHT: '#005c3e',
  GOLD_METALLIC: '#FAD889',
  GOLD_HIGHLIGHT: '#FFF6D6',
  RED_VELVET: '#590909',
  RED_HAT: '#D62828', // Brighter red for the hat
};

// Configuration for geometry generation
export const CONFIG = {
  FOLIAGE_COUNT: 20000,
  ORNAMENT_SPHERE_COUNT: 400,
  ORNAMENT_BOX_COUNT: 150,
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
  SCATTER_RADIUS: 25,
};

export interface ParticleData {
  scatterPos: Float32Array;
  treePos: Float32Array;
  randoms: Float32Array;
}

export interface OrnamentData {
  scatterPos: Vector3[];
  treePos: Vector3[];
  scales: number[];
  rotations: number[]; // simple random rotation offset
}