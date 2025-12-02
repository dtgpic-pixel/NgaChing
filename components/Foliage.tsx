import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

const Foliage: React.FC<{ progress: number }> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Custom shader for sparkling emerald effect
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.EMERALD) },
      uHighlight: { value: new THREE.Color(COLORS.GOLD) },
      uProgress: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uProgress;
      attribute vec3 chaosPos;
      attribute vec3 targetPos;
      attribute float size;
      attribute float random;
      
      varying float vRandom;
      varying vec3 vPos;
      
      void main() {
        vRandom = random;
        
        // Cubic ease out for smooth transition
        float t = uProgress;
        t = 1.0 - pow(1.0 - t, 3.0);
        
        vec3 pos = mix(chaosPos, targetPos, t);
        vPos = pos;
        
        // Add subtle wind movement
        pos.x += sin(uTime * 2.0 + pos.y) * 0.1 * t;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size attenuation
        gl_PointSize = size * (300.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uHighlight;
      uniform float uTime;
      
      varying float vRandom;
      varying vec3 vPos;
      
      void main() {
        // Circular particle
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        
        // Sparkle effect
        float sparkle = sin(uTime * 5.0 + vRandom * 100.0) * 0.5 + 0.5;
        
        // Gradient from center (gold) to edge (emerald)
        vec3 finalColor = mix(uColor, uHighlight, sparkle * 0.3);
        
        // Add fake lighting based on Y position (darker at bottom)
        float lightFactor = clamp(vPos.y / 20.0 + 0.5, 0.4, 1.0);
        
        gl_FragColor = vec4(finalColor * lightFactor, 1.0);
      }
    `
  }), []);

  const { positions, chaosPositions, targetPositions, randoms, sizes } = useMemo(() => {
    const count = CONFIG.PARTICLE_COUNT;
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Target: Cone Shape
      const theta = Math.random() * Math.PI * 2;
      // y goes from -H/2 to H/2
      const y = (Math.random() - 0.5) * CONFIG.TREE_HEIGHT;
      // Radius decreases as Y increases
      const r = ((CONFIG.TREE_HEIGHT / 2 - y) / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS;
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      target[i * 3] = x;
      target[i * 3 + 1] = y;
      target[i * 3 + 2] = z;

      // Chaos: Sphere Shape
      const cr = CONFIG.TREE_HEIGHT * 1.5 * Math.cbrt(Math.random());
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos(2 * Math.random() - 1);
      
      chaos[i * 3] = cr * Math.sin(cPhi) * Math.cos(cTheta);
      chaos[i * 3 + 1] = cr * Math.sin(cPhi) * Math.sin(cTheta);
      chaos[i * 3 + 2] = cr * Math.cos(cPhi);

      rands[i] = Math.random();
      sz[i] = Math.random() * 0.4 + 0.1;
    }

    return {
      positions: chaos, // Initial positions buffer
      chaosPositions: chaos,
      targetPositions: target,
      randoms: rands,
      sizes: sz
    };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      // Smooth lerp for uniform
      material.uniforms.uProgress.value = THREE.MathUtils.lerp(
        material.uniforms.uProgress.value,
        progress,
        0.05
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-chaosPos"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPos"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-random"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial attach="material" args={[shaderArgs]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export default Foliage;
