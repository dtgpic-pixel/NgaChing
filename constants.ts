export const COLORS = {
  EMERALD: '#004225',
  GOLD: '#FFD700',
  CHAMPAGNE: '#F7E7CE',
  SILVER: '#C0C0C0',
  RED_VELVET: '#800020',
  RICH_BLACK: '#020403'
};

export const CONFIG = {
  TREE_HEIGHT: 18,
  TREE_RADIUS: 7,
  PARTICLE_COUNT: 2500,
  ORNAMENT_COUNT: 150,
  GIFT_COUNT: 40,
  PHOTO_COUNT: 20,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_INTENSITY: 1.5,
  CAMERA_POS: [0, 4, 22] as [number, number, number],
  MOTION_THRESHOLD: 15, // Pixel diff threshold
  TRIGGER_CHAOS_THRESHOLD: 0.25 // Motion score to trigger chaos
};

// Placeholder images for Polaroids
export const PHOTO_URLS = Array.from({ length: 20 }).map((_, i) => 
  `https://picsum.photos/seed/${i * 123}/300/350`
);
