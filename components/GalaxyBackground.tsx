import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const GalaxyBackground: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Configuration for the procedural galaxy
  const config = {
    count: 12000,
    size: 0.08,
    radius: 60,
    branches: 5,
    spin: 1.2,
    randomness: 0.6,
    randomnessPower: 3,
    insideColor: '#ff6030', // Hot orange core
    outsideColor: '#1b3984', // Deep blue outer arms
  };

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);

    const colorInside = new THREE.Color(config.insideColor);
    const colorOutside = new THREE.Color(config.outsideColor);

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;

      // Distance from center
      const r = Math.random() * config.radius;

      // Spiral angle calculation
      const spinAngle = r * config.spin;
      const branchAngle = ((i % config.branches) / config.branches) * Math.PI * 2;

      // Random offset for organic look
      // We use Math.pow to concentrate particles closer to the curve (gravity effect)
      const randomX = Math.pow(Math.random(), config.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * config.randomness * r;
      const randomY = Math.pow(Math.random(), config.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * config.randomness * r * 0.5; // Flatter in Y axis
      const randomZ = Math.pow(Math.random(), config.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * config.randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Color mixing based on distance from center
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, r / config.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Slow cosmic rotation
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef} position={[0, -5, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      {/* 
         PointsMaterial with vertexColors enables the gradient.
         AdditiveBlending makes overlapping particles glow. 
      */}
      <pointsMaterial
        size={config.size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
};