'use client';

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Group, SRGBColorSpace, Vector3 } from 'three';
import { quadTransform } from './display-projection';

// In metres, fitted in front of the model's dashboard surface (z ~= .74).
// Project all four corners so the HTML follows the camera without losing hit targets.
const centralDisplay = {
  position: [-0.03, 0.872, 0.721] as [number, number, number],
  width: 0.388,
  height: 0.18624,
};
export default function Dashboard({
  displayRef,
}: {
  displayRef: RefObject<HTMLDivElement | null>;
}) {
  const surface = useRef<Group>(null);
  const corners = useMemo(() => {
    const w = centralDisplay.width / 2,
      h = centralDisplay.height / 2;
    return [
      new Vector3(-w, h, 0.001),
      new Vector3(w, h, 0.001),
      new Vector3(w, -h, 0.001),
      new Vector3(-w, -h, 0.001),
    ];
  }, []);
  const projected = useMemo(() => corners.map(() => new Vector3()), [corners]);
  useFrame(({ camera, size }) => {
    if (!surface.current || !displayRef.current) return;
    surface.current.updateWorldMatrix(true, false);
    const quad = corners.map((corner, i) => {
      const point = projected[i]
        .copy(corner)
        .applyMatrix4(surface.current!.matrixWorld)
        .project(camera);
      return [((point.x + 1) * size.width) / 2, ((1 - point.y) * size.height) / 2] as const;
    });
    const transform = quadTransform(quad, 1000, 480);
    displayRef.current.style.transform = transform ?? '';
    displayRef.current.style.visibility = transform ? 'visible' : 'hidden';
  });
  const [cluster, passenger, climate] = useTexture(
    [
      '/textures/instrument-cluster.svg',
      '/textures/passenger-display.svg',
      '/textures/climate-display.svg',
    ],
    (textures) => {
      textures.forEach((texture) => {
        texture.colorSpace = SRGBColorSpace;
      });
    },
  );
  return (
    <>
      {/* Continuous glass band seated below the dashboard brow. */}
      <group position={[-0.295, 0.874, 0.737]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <boxGeometry args={[1.052, 0.218, 0.025]} />
          <meshStandardMaterial color="#050709" metalness={0.3} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.11, 0.007]}>
          <boxGeometry args={[1.056, 0.006, 0.034]} />
          <meshStandardMaterial color="#53606c" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.11, 0.007]}>
          <boxGeometry args={[1.056, 0.007, 0.034]} />
          <meshStandardMaterial color="#313b45" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[-0.54, 0.872, 0.721]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.46, 0.18624]} />
        <meshBasicMaterial map={passenger} toneMapped={false} />
      </mesh>
      <mesh position={[-0.005, 0.688, 0.545]} rotation={[0.93, Math.PI, 0]}>
        <planeGeometry args={[0.24, 0.288]} />
        <meshBasicMaterial map={climate} toneMapped={false} />
      </mesh>
      <group ref={surface} position={centralDisplay.position} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, -0.004]}>
          <boxGeometry
            args={[centralDisplay.width + 0.006, centralDisplay.height + 0.006, 0.008]}
          />
          <meshStandardMaterial color="#050607" metalness={0.25} roughness={0.21} />
        </mesh>
        <mesh>
          <planeGeometry args={[centralDisplay.width, centralDisplay.height]} />
          <meshBasicMaterial color="#080a0d" />
        </mesh>
      </group>
      <mesh position={[0.482, 0.997, 0.803]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.407, 0.16]} />
        <meshBasicMaterial map={cluster} toneMapped={false} transparent />
      </mesh>
    </>
  );
}
