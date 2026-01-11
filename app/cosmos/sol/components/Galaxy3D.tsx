'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Parâmetros da galáxia
const GALAXY_CONFIG = {
  starCount: 15000,
  arms: 5,
  armSpread: 0.4,
  radius: 5,
  thickness: 0.15,
  coreRadius: 0.8,
  coreIntensity: 1.5,
  rotationSpeed: 0.03,
};

// Cores da galáxia
const GALAXY_COLORS = {
  core: new THREE.Color('#6366f1'),
  inner: new THREE.Color('#818cf8'),
  mid: new THREE.Color('#0ea5e9'),
  outer: new THREE.Color('#a855f7'),
  dust: new THREE.Color('#1e1b4b'),
};

// Componente das estrelas da galáxia
const GalaxyStars: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes, dustPositions, dustColors, dustSizes: _dustSizes } = useMemo(() => {
    const positions = new Float32Array(GALAXY_CONFIG.starCount * 3);
    const colors = new Float32Array(GALAXY_CONFIG.starCount * 3);
    const sizes = new Float32Array(GALAXY_CONFIG.starCount);
    
    const dustCount = Math.floor(GALAXY_CONFIG.starCount * 0.3);
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);

    // Gera estrelas em padrão espiral
    for (let i = 0; i < GALAXY_CONFIG.starCount; i++) {
      const i3 = i * 3;
      
      // Distância do centro (distribuição exponencial para mais estrelas no centro)
      const radius = Math.pow(Math.random(), 0.5) * GALAXY_CONFIG.radius;
      
      // Ângulo base do braço espiral
      const armIndex = Math.floor(Math.random() * GALAXY_CONFIG.arms);
      const armAngle = (armIndex / GALAXY_CONFIG.arms) * Math.PI * 2;
      
      // Curvatura espiral (quanto mais longe, mais rotação)
      const spiralAngle = radius * 0.8;
      
      // Dispersão do braço
      const spreadX = (Math.random() - 0.5) * GALAXY_CONFIG.armSpread * radius;
      const spreadY = (Math.random() - 0.5) * GALAXY_CONFIG.thickness * (1 - radius / GALAXY_CONFIG.radius);
      const spreadZ = (Math.random() - 0.5) * GALAXY_CONFIG.armSpread * radius;
      
      // Posição final
      const angle = armAngle + spiralAngle;
      positions[i3] = Math.cos(angle) * radius + spreadX;
      positions[i3 + 1] = spreadY;
      positions[i3 + 2] = Math.sin(angle) * radius + spreadZ;
      
      // Cor baseada na distância do centro
      const t = radius / GALAXY_CONFIG.radius;
      let color: THREE.Color;
      
      if (t < 0.15) {
        color = GALAXY_COLORS.core.clone().lerp(GALAXY_COLORS.inner, t / 0.15);
      } else if (t < 0.4) {
        color = GALAXY_COLORS.inner.clone().lerp(GALAXY_COLORS.mid, (t - 0.15) / 0.25);
      } else {
        color = GALAXY_COLORS.mid.clone().lerp(GALAXY_COLORS.outer, (t - 0.4) / 0.6);
      }
      
      // Variação de brilho
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i3] = color.r * brightness;
      colors[i3 + 1] = color.g * brightness;
      colors[i3 + 2] = color.b * brightness;
      
      // Tamanho (estrelas maiores no centro)
      sizes[i] = (1 - t * 0.5) * (0.02 + Math.random() * 0.04);
    }

    // Gera poeira cósmica
    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 0.3) * GALAXY_CONFIG.radius * 0.8;
      const angle = Math.random() * Math.PI * 2;
      
      dustPositions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
      dustPositions[i3 + 1] = (Math.random() - 0.5) * 0.1;
      dustPositions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.8;
      
      dustColors[i3] = GALAXY_COLORS.dust.r;
      dustColors[i3 + 1] = GALAXY_COLORS.dust.g;
      dustColors[i3 + 2] = GALAXY_COLORS.dust.b;
      
      dustSizes[i] = 0.05 + Math.random() * 0.1;
    }

    return { positions, colors, sizes, dustPositions, dustColors, dustSizes };
  }, []);

  // Animação de rotação
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += GALAXY_CONFIG.rotationSpeed * 0.01;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y += GALAXY_CONFIG.rotationSpeed * 0.008;
    }
  });

  return (
    <group>
      {/* Estrelas principais */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colors}
            count={colors.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={sizes}
            count={sizes.length}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Poeira cósmica */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={dustPositions}
            count={dustPositions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={dustColors}
            count={dustColors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// Núcleo brilhante da galáxia
const GalaxyCore: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (coreRef.current) {
      const scale = 1 + Math.sin(time * 0.5) * 0.1;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (glowRef.current) {
      const scale = 1.5 + Math.sin(time * 0.3) * 0.2;
      glowRef.current.scale.set(scale, scale * 0.3, scale);
      glowRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Núcleo central */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[GALAXY_CONFIG.coreRadius * 0.3, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Halo do núcleo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[GALAXY_CONFIG.coreRadius, 32, 32]} />
        <meshBasicMaterial
          color={GALAXY_COLORS.core}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Brilho volumétrico */}
      <sprite>
        <spriteMaterial
          color={GALAXY_COLORS.core}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};

// Estrelas de fundo distantes
const BackgroundStars: React.FC = () => {
  const positions = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Cena principal da galáxia
const GalaxyScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <BackgroundStars />
      <GalaxyStars />
      <GalaxyCore />
      
      {/* Luz ambiente sutil */}
      <ambientLight intensity={0.1} />
    </group>
  );
};

// Componente principal exportado
const Galaxy3D: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div 
      className={`absolute inset-0 w-full h-full ${className ?? ''}`} 
      style={{ 
        display: 'block',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          toneMappingExposure: 0.8,
        }}
        dpr={[1, 2]}
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      >
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 10, 50]} />
        <GalaxyScene />
      </Canvas>
    </div>
  );
};

export default Galaxy3D;
