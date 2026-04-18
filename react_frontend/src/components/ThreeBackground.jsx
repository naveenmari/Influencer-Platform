import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Plane, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const FluidWaves = () => {
    return (
        <group rotation={[-Math.PI / 3, 0, 0]}> {/* Tilted to look like a landscape/sea */}
            <Plane args={[20, 20, 128, 128]} position={[0, -2, -5]}>
                <MeshDistortMaterial
                    color="#4c1d95" // Deep Violet Base
                    attach="material"
                    distort={0.7} // Fluid movement
                    speed={1.5}
                    roughness={0.2}
                    metalness={0.8}
                    wireframe={false}
                />
            </Plane>
        </group>
    );
};

const ThreeBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            background: '#0a0a0a', // Deep black/grey background
            pointerEvents: 'none',
        }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                {/* Lighting to create Pink/Blue highlights on the Violet waves */}
                <ambientLight intensity={0.2} color="#ffffff" />

                <directionalLight position={[5, 10, 5]} intensity={2} color="#a78bfa" /> {/* Light Violet highlight */}
                <pointLight position={[-10, -5, -5]} intensity={2} color="#ec4899" /> {/* Pink glow fill */}
                <pointLight position={[10, 5, -10]} intensity={1} color="#3b82f6" /> {/* Blue accent */}

                <FluidWaves />

                {/* Fog to blend into distance */}
                <fog attach="fog" args={['#0a0a0a', 5, 20]} />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;
