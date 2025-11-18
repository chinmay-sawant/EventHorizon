import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D, MathUtils } from 'three';

const tempObject = new Object3D();
const tempColor = new Color();

// Colors for the accretion disk
const COLORS = ['#ffaa00', '#ff5500', '#ffcc88', '#ffffff', '#aa0000'];

export const VoxelBlackHole: React.FC = () => {
  // 1. Accretion Disk (Glowing Ring)
  const diskCount = 3000;
  const diskMeshRef = useRef<InstancedMesh>(null);

  // 2. Event Horizon (Central Void)
  const horizonCount = 800;
  const horizonMeshRef = useRef<InstancedMesh>(null);

  // 3. Particle streams (Jets/Outer debris)
  const debrisCount = 500;
  const debrisMeshRef = useRef<InstancedMesh>(null);

  // Generate static data for the disk
  const diskData = useMemo(() => {
    return new Array(diskCount).fill(0).map(() => {
      const angle = Math.random() * Math.PI * 2;
      // Distribution: more density closer to the center, but with a hole in the middle
      // Inner radius ~4, Outer radius ~12
      const radius = 4 + Math.random() * Math.random() * 10; 
      const yDev = (Math.random() - 0.5) * (radius * 0.15); // Flatter near center, wobbly outside
      const speed = 0.02 + (10 / radius) * 0.005; // Faster near center
      const scale = 0.2 + Math.random() * 0.3; // Voxel size
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      return { angle, radius, yDev, speed, scale, color };
    });
  }, []);

  // Generate data for the Event Horizon (The Void Sphere)
  const horizonData = useMemo(() => {
    return new Array(horizonCount).fill(0).map(() => {
      // Random point on sphere surface
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      const r = 2.8 + Math.random() * 0.4; // Radius slightly fuzzy
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      return { x, y, z, scale: 0.3 + Math.random() * 0.2 };
    });
  }, []);

  useEffect(() => {
    // Initial Setup for Horizon (Static-ish ball of voxels)
    if (horizonMeshRef.current) {
      horizonData.forEach((data, i) => {
        tempObject.position.set(data.x, data.y, data.z);
        tempObject.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        tempObject.scale.setScalar(data.scale);
        tempObject.updateMatrix();
        horizonMeshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      horizonMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [horizonData]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate Accretion Disk
    if (diskMeshRef.current) {
      diskData.forEach((data, i) => {
        // Orbit logic
        const currentAngle = data.angle + time * data.speed;
        const x = Math.cos(currentAngle) * data.radius;
        const z = Math.sin(currentAngle) * data.radius;
        
        // Add a slight "breathing" or wave effect to Y
        const y = data.yDev + Math.sin(time * 2 + data.radius) * 0.2;

        tempObject.position.set(x, y, z);
        
        // Look at center (optional, but makes cubes align with gravity)
        tempObject.lookAt(0, 0, 0);
        tempObject.scale.setScalar(data.scale);
        
        tempObject.updateMatrix();
        diskMeshRef.current!.setMatrixAt(i, tempObject.matrix);

        // Color updating (flicker effect)
        const flicker = Math.sin(time * 5 + i) > 0.9;
        tempColor.set(data.color);
        if (flicker) tempColor.multiplyScalar(1.5); // Bloom brighter
        
        // Darken inner edge slightly for contrast
        if (data.radius < 4.5) tempColor.multiplyScalar(0.5);

        diskMeshRef.current!.setColorAt(i, tempColor);
      });
      diskMeshRef.current.instanceMatrix.needsUpdate = true;
      if (diskMeshRef.current.instanceColor) diskMeshRef.current.instanceColor.needsUpdate = true;
    }

    // Animate Horizon (Slight rotation/shivering to feel alive)
    if (horizonMeshRef.current) {
        horizonMeshRef.current.rotation.y -= 0.002;
        horizonMeshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group rotation={[0.4, 0, 0.2]}> {/* Tilt the black hole for better view */}
      
      {/* The Accretion Disk */}
      <instancedMesh ref={diskMeshRef} args={[undefined, undefined, diskCount]}>
        <boxGeometry args={[1, 1, 1]} /> {/* Standard Minecraft Block */}
        <meshStandardMaterial 
            toneMapped={false} 
            color="#ffaa00" 
            emissive="#ff5500" 
            emissiveIntensity={2}
            roughness={0.8}
        />
      </instancedMesh>

      {/* The Event Horizon (Void) */}
      <instancedMesh ref={horizonMeshRef} args={[undefined, undefined, horizonCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#000000" />
      </instancedMesh>
      
      {/* Inner Glow (Fake Volumetrics using a simple sphere inside) */}
      <mesh scale={[3.5, 3.5, 3.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

    </group>
  );
};