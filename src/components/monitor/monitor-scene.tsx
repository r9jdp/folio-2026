'use client';

import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Html, RoundedBox } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { MonitorDesktop } from './monitor-desktop';

const cream = '#d6d2c6';
const keyRows = [14, 14, 13, 12, 8];

function Hardware({ paused }: { paused: boolean }) {
  return (
    <group>
      <RoundedBox
        args={[4.55, 3.56, 2.12]}
        radius={0.19}
        smoothness={6}
        position={[0, 0.58, -0.3]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={cream} roughness={0.62} />
      </RoundedBox>
      <RoundedBox
        args={[4.62, 3.58, 0.32]}
        radius={0.16}
        smoothness={6}
        position={[0, 0.58, 0.86]}
        castShadow
      >
        <meshStandardMaterial color="#e2ded2" roughness={0.72} />
      </RoundedBox>
      <RoundedBox
        args={[4.07, 2.83, 0.12]}
        radius={0.15}
        smoothness={6}
        position={[0, 0.72, 1.027]}
      >
        <meshStandardMaterial color="#77796e" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[3.93, 2.7, 0.1]} radius={0.13} smoothness={6} position={[0, 0.72, 1.09]}>
        <meshStandardMaterial color="#1e2922" roughness={0.25} />
      </RoundedBox>
      <Html
        transform
        position={[0, 0.72, 1.148]}
        distanceFactor={2.5}
        zIndexRange={[5, 0]}
        style={{ width: 608, height: 412 }}
      >
        <MonitorDesktop paused={paused} />
      </Html>
      <Html
        transform
        position={[-1.71, -0.93, 1.04]}
        distanceFactor={2.5}
        style={{
          color: '#55574e',
          font: 'bold 25px Georgia',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        rp.
      </Html>
      <mesh position={[1.75, -0.91, 1.045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.008, 16]} />
        <meshStandardMaterial
          color="#a9c883"
          emissive="#84b454"
          emissiveIntensity={paused ? 0.1 : 0.8}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[0.16, 0.05, 0.025]}
          radius={0.02}
          position={[1.18 + i * 0.2, -0.91, 1.043]}
        >
          <meshStandardMaterial color="#9e9f91" />
        </RoundedBox>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[2.281, 1.31 - i * 0.15, -0.45]}>
          <boxGeometry args={[0.007, 0.035, 0.99]} />
          <meshStandardMaterial color="#999b90" />
        </mesh>
      ))}
      <RoundedBox args={[1.1, 0.48, 0.9]} radius={0.16} position={[0, -1.36, -0.1]} castShadow>
        <meshStandardMaterial color="#bbbdb0" roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        args={[2.6, 0.23, 1.75]}
        radius={0.1}
        position={[0, -1.66, 0.02]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={cream} roughness={0.8} />
      </RoundedBox>
      <group position={[-0.18, -1.78, 2.65]} rotation={[0.055, -0.015, 0]}>
        <RoundedBox args={[4.32, 0.19, 1.34]} radius={0.09} castShadow receiveShadow>
          <meshStandardMaterial color="#d8d5ca" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.1, -0.05]}>
          <boxGeometry args={[4.05, 0.02, 1.04]} />
          <meshStandardMaterial color="#b2b3a7" />
        </mesh>
        {keyRows.flatMap((count, row) =>
          Array.from({ length: count }, (_, column) => {
            const space = row === 4 && column === 3;
            const x =
              row === 4
                ? [-1.8, -1.51, -1.22, -0.23, 0.77, 1.06, 1.35, 1.64][column]
                : -1.86 + column * 0.284 + (row % 2) * 0.07;
            return (
              <RoundedBox
                key={`${row}-${column}`}
                args={[space ? 1.68 : 0.252, 0.07, 0.168]}
                radius={0.025}
                smoothness={2}
                position={[x, 0.145, -0.46 + row * 0.214]}
                castShadow
              >
                <meshStandardMaterial
                  color={row === 0 && column === 0 ? '#899b89' : '#ece8dd'}
                  roughness={0.7}
                />
              </RoundedBox>
            );
          }),
        )}
      </group>
      <group position={[2.86, -1.74, 2.6]} rotation={[0, -0.1, 0]}>
        <RoundedBox args={[0.61, 0.28, 0.99]} radius={0.14} smoothness={6} castShadow>
          <meshStandardMaterial color="#e1ddd2" roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, 0.137, -0.2]}>
          <boxGeometry args={[0.015, 0.009, 0.3]} />
          <meshStandardMaterial color="#b4b6aa" />
        </mesh>
      </group>
    </group>
  );
}

function fitCamera(view: OrthographicCamera, width: number, height: number) {
  view.zoom = Math.min(width / 7.6, height / 5.5);
  view.lookAt(0, -0.02, 0.5);
  view.updateProjectionMatrix();
}

function Setup({ onReady, onFailure }: { onReady: () => void; onFailure: () => void }) {
  const { camera, gl, size, invalidate } = useThree();
  useEffect(() => {
    fitCamera(camera as OrthographicCamera, size.width, size.height);
    invalidate();
  }, [camera, size, invalidate]);
  useEffect(() => {
    onReady();
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onReady, onFailure]);
  return null;
}

export default function MonitorScene({
  paused,
  onReady,
  onFailure,
}: {
  paused: boolean;
  onReady: () => void;
  onFailure: () => void;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [4.8, 2.8, 15], zoom: 75, near: 0.1, far: 60 }}
      dpr={[1, 1.75]}
      frameloop="demand"
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <Setup onReady={onReady} onFailure={onFailure} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-4, 7, 6]}
        intensity={2.6}
        color="#fff9ec"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <directionalLight position={[5, 2, -4]} intensity={0.6} color="#e3e9ee" />
      <Hardware paused={paused} />
      <ContactShadows
        position={[0, -1.94, 0.4]}
        opacity={0.25}
        scale={14}
        blur={2.4}
        far={5}
        resolution={512}
        frames={1}
        color="#53564b"
      />
    </Canvas>
  );
}
