import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, useTexture, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// DataFlow component to create the fiber optic-like data flows
const DataFlow = ({ count = 50 }) => {
  const points = useMemo(() => {
    const temp = [];
    // Create random points around the globe
    for (let i = 0; i < count; i++) {
      // Random position on the sphere
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 1.02; // Slightly larger than Earth's radius
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      
      // Create a curve from one point to another
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(
          x * 1.3 + (Math.random() - 0.5) * 0.3,
          y * 1.3 + (Math.random() - 0.5) * 0.3,
          z * 1.3 + (Math.random() - 0.5) * 0.3
        ),
        new THREE.Vector3(
          x * 1.6 + (Math.random() - 0.5) * 0.6,
          y * 1.6 + (Math.random() - 0.5) * 0.6,
          z * 1.6 + (Math.random() - 0.5) * 0.6
        ),
        new THREE.Vector3(
          x * 1.1 + (Math.random() - 0.5) * 1.2,
          y * 1.1 + (Math.random() - 0.5) * 1.2,
          z * 1.1 + (Math.random() - 0.5) * 1.2
        )
      );
      
      // Get points along the curve
      const points = curve.getPoints(20);
      temp.push({
        points,
        speed: 0.001 + Math.random() * 0.005,
        progress: Math.random(),
        width: Math.random() * 0.03 + 0.01,
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 1, 0.5) // Blue/cyan hues
      });
    }
    return temp;
  }, [count]);
  
  const lineRef = useRef();
  
  useFrame(() => {
    if (!lineRef.current) return;
    
    const lines = lineRef.current.children;
    
    // Update each line's opacity based on progress
    lines.forEach((line, i) => {
      const data = points[i];
      data.progress += data.speed;
      if (data.progress > 1) data.progress = 0;
      
      // Make the line appear to flow by changing opacity along its length
      const colors = line.geometry.attributes.color.array;
      const pointCount = data.points.length;
      
      for (let j = 0; j < pointCount; j++) {
        const alpha = Math.max(0, Math.sin(Math.PI * (j / pointCount - data.progress) * 2) ** 3);
        colors[j * 3] = data.color.r;
        colors[j * 3 + 1] = data.color.g;
        colors[j * 3 + 2] = data.color.b;
        line.geometry.attributes.color.needsUpdate = true;
      }
    });
  });
  
  return (
    <group ref={lineRef}>
      {points.map((data, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={data.points.length}
              array={new Float32Array(data.points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={data.points.length}
              array={new Float32Array(data.points.length * 3)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            attach="material"
            vertexColors
            linewidth={data.width}
            transparent
            opacity={0.8}
          />
        </line>
      ))}
    </group>
  );
};

// Earth component
const Earth = () => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  
  // Load Earth textures
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/pmndrs/drei-assets/master/earth/color.jpg',
    'https://raw.githubusercontent.com/pmndrs/drei-assets/master/earth/normal.jpg',
    'https://raw.githubusercontent.com/pmndrs/drei-assets/master/earth/specular.jpg',
    'https://raw.githubusercontent.com/pmndrs/drei-assets/master/earth/clouds.jpg'
  ]);
  
  // Rotate the earth slowly
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
    }
  });
  
  return (
    <>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={5}
          specular={new THREE.Color('grey')}
        />
      </Sphere>
      
      {/* Clouds layer */}
      <Sphere ref={cloudsRef} args={[1.01, 64, 64]}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Data flows */}
      <DataFlow count={50} />
      
      {/* Atmosphere glow */}
      <Sphere args={[1.15, 64, 64]}>
        <meshPhongMaterial
          color="#4ca6ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
};

// Main canvas component
const EarthCanvas = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Earth />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default EarthCanvas; 