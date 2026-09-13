'use client';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Dashboard from './dashboard';
import { useExperience } from '@/state/experience';

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
type Shot = {
  t: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};
const shots: Shot[] = [
  { t: 0, position: [5.4, 2.35, 6.7], target: [-0.75, 0.65, 0], fov: 37 },
  { t: 0.28, position: [3.8, 1.75, 1.55], target: [0, 0.74, 0], fov: 40 },
  { t: 0.52, position: [2.4, 1.5, -0.12], target: [0.22, 0.88, 0.3], fov: 48 },
  { t: 0.72, position: [1.24, 1.3, -0.22], target: [0.22, 0.93, 0.66], fov: 61 },
  { t: 0.86, position: [0.38, 1.15, 0.03], target: [0.01, 0.94, 0.84], fov: 65 },
  { t: 1, position: [0.23, 1.12, -0.13], target: [0.015, 0.94, 0.83], fov: 57 },
];
type SceneProps = { onReady: () => void; displayRef: RefObject<HTMLDivElement | null> };
function Car({ onReady, displayRef }: SceneProps) {
  const { scene } = useGLTF('/models/taycan-preview.glb', false, true);
  const car = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (!Array.isArray(node.material) && node.material.name === 'MIRROR') {
          const mirror = node.material.clone() as THREE.MeshStandardMaterial;
          mirror.color.set('#78828c');
          mirror.emissive.set('#000000');
          mirror.metalness = 0.9;
          mirror.roughness = 0.18;
          node.material = mirror;
        }
      }
    });
    return clone;
  }, [scene]);
  const root = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const mode = useExperience((s) => s.mode);
  const elapsed = useRef(0);
  useEffect(() => {
    onReady();
  }, [onReady]);
  useEffect(() => {
    if (mode === 'showroom') elapsed.current = 0;
    invalidate();
  }, [mode, invalidate]);
  useFrame(({ camera, size }, delta) => {
    const current = useExperience.getState().mode;
    if (current === 'entering') elapsed.current += Math.min(delta, 0.05);
    const p = current === 'showroom' ? 0 : current === 'desktop' ? 1 : clamp(elapsed.current / 5.2);
    const index = Math.max(0, shots.findIndex((shot) => shot.t >= p) - 1);
    const a = shots[p === 1 ? shots.length - 2 : index],
      b = shots[p === 1 ? shots.length - 1 : index + 1];
    const mix = smooth((p - a.t) / (b.t - a.t));
    camera.position.set(
      ...(a.position.map((v, i) => THREE.MathUtils.lerp(v, b.position[i], mix)) as [
        number,
        number,
        number,
      ]),
    );
    camera.lookAt(
      ...(a.target.map((v, i) => THREE.MathUtils.lerp(v, b.target[i], mix)) as [
        number,
        number,
        number,
      ]),
    );
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(a.fov, b.fov, mix) + (size.width < 700 && p < 0.1 ? 19 : 0);
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    const door = root.current?.getObjectByName('driver_door');
    if (door) door.rotation.y = -1.08 * smooth((p - 0.16) / 0.18) * (1 - smooth((p - 0.91) / 0.09));
    if (current === 'entering') {
      if (p === 1) useExperience.getState().arrive();
      else invalidate();
    }
  }, -1);
  return (
    <primitive ref={root} object={car} dispose={null}>
      <Dashboard displayRef={displayRef} />
    </primitive>
  );
}
export default function TaycanScene({ onReady, displayRef }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [5.4, 2.35, 6.7], fov: 37, near: 0.015, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      shadows
    >
      <color attach="background" args={['#111519']} />
      <fog attach="fog" args={['#111519', 13, 28]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#dbe4f1', '#171b21', 1.5]} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={2.4}
        color="#eef5ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#8daebd" />
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={4}
          color="white"
          position={[0, 5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 3, 1]}
        />
        <Lightformer
          intensity={3}
          color="#b9cedb"
          position={[-5, 2, -1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 4, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[5, 2, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[3, 5, 1]}
        />
        <Lightformer intensity={2} color="#d6f1e8" position={[0, 3, -6]} scale={[7, 1, 1]} />
      </Environment>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#151a1e" roughness={0.64} metalness={0.3} />
      </mesh>
      <Car onReady={onReady} displayRef={displayRef} />
    </Canvas>
  );
}
