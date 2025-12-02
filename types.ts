export enum TreeState {
  CHAOS = 'CHAOS',
  FORMING = 'FORMING',
  FORMED = 'FORMED'
}

export interface ParticleData {
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  speed: number;
  rotationSpeed: number;
  color: string;
  type: 'ORNAMENT' | 'GIFT' | 'LIGHT' | 'PHOTO';
  photoUrl?: string;
}

export interface MotionData {
  score: number; // 0 to 1, amount of movement
  centerX: number; // -1 to 1, center of motion
}

export interface GreetingResponse {
  message: string;
}
