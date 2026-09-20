'use client';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Dashboard from './dashboard';
import { cloneTaycan, disposeTaycanMaterials } from '@/lib/taycan-model';
import { useExperience } from '@/state/experience';

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
// The door is fully open before the camera crosses the sill.
const entryPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(5.4, 2.35, 6.7),
  new THREE.Vector3(3.8, 1.75, 1.55),
  new THREE.Vector3(2.4, 1.5, -0.12),
  new THREE.Vector3(1.24, 1.3, -0.22),
  new THREE.Vector3(0.38, 1.15, 0.03),
  new THREE.Vector3(0.23, 1.12, -0.13),
]);
const targetPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-1.45, 0.65, 0),
  new THREE.Vector3(0, 0.74, 0),
  new THREE.Vector3(0.22, 0.88, 0.3),
  new THREE.Vector3(0.22, 0.93, 0.66),
  new THREE.Vector3(0.01, 0.94, 0.84),
  new THREE.Vector3(0.015, 0.91, 0.83),
]);
const focusPosition = new THREE.Vector3(-0.025, 0.995, 0.165);
const focusTarget = new THREE.Vector3(-0.03, 0.887, 0.741);
type SceneProps = {
  onReady: () => void;
  onError: () => void;
  displayRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLInputElement | null>;
  reducedMotion: boolean;
};

function Car({ onReady, displayRef, progressRef, reducedMotion }: SceneProps) {
  const { scene } = useGLTF('/models/taycan-preview.glb', false, true);
  const car = useMemo(() => cloneTaycan(scene), [scene]);
  useEffect(() => () => disposeTaycanMaterials(car), [car]);
  const doorRef = useRef<THREE.Object3D | undefined>(undefined);
  useEffect(() => {
    doorRef.current = car.getObjectByName('driver_door');
    return () => {
      doorRef.current = undefined;
    };
  }, [car]);
  const invalidate = useThree((s) => s.invalidate);
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const progress = useRef(0);
  const focus = useRef(0);
  const previousMode = useRef(useExperience.getState().mode);
  const automatic = useRef<{ started: number; from: number } | null>(null);
  const focusMotion = useRef({ started: 0, from: 0, to: 0 });
  useEffect(() => {
    onReady();
  }, [onReady]);
  useEffect(() => {
    invalidate();
    return useExperience.subscribe((state, previous) => {
      if (
        state.mode !== previous.mode ||
        state.entryProgress !== previous.entryProgress ||
        state.entryControl !== previous.entryControl ||
        state.displayFocused !== previous.displayFocused ||
        state.maximized !== previous.maximized
      )
        invalidate();
    });
  }, [invalidate]);
  useEffect(() => {
    invalidate();
  }, [reducedMotion, invalidate]);

  useFrame(({ camera, size }, delta) => {
    const state = useExperience.getState();
    const dt = Math.min(delta, 0.2);
    const now = performance.now();
    if (state.mode === 'showroom') {
      progress.current = 0;
      automatic.current = null;
    } else if (state.mode === 'desktop' || reducedMotion) progress.current = 1;
    else if (state.entryControl === 'auto') {
      automatic.current ??= { started: now, from: progress.current };
      progress.current = Math.min(
        1,
        automatic.current.from + (now - automatic.current.started) / 4800,
      );
    } else {
      automatic.current = null;
      progress.current = THREE.MathUtils.damp(progress.current, state.entryProgress, 10, dt);
      if (Math.abs(progress.current - state.entryProgress) < 0.0005)
        progress.current = state.entryProgress;
    }
    const p = progress.current;
    if (progressRef.current) {
      progressRef.current.value = String(p);
      progressRef.current.setAttribute('aria-valuetext', `${Math.round(p * 100)}% into the cabin`);
    }
    const focusGoal = state.mode === 'desktop' && state.displayFocused ? 1 : 0;
    if (previousMode.current !== state.mode && state.mode === 'showroom') {
      focus.current = 0;
      focusMotion.current = { started: now, from: 0, to: 0 };
    }
    previousMode.current = state.mode;
    if (focusMotion.current.to !== focusGoal) {
      focusMotion.current = { started: now, from: focus.current, to: focusGoal };
    }
    focus.current = reducedMotion
      ? focusGoal
      : THREE.MathUtils.lerp(
          focusMotion.current.from,
          focusGoal,
          smooth((now - focusMotion.current.started) / 650),
        );
    if (Math.abs(focus.current - focusGoal) < 0.0005) focus.current = focusGoal;
    entryPath.getPoint(p, position);
    targetPath.getPoint(p, target);
    position.lerp(focusPosition, focus.current);
    target.lerp(focusTarget, focus.current);
    camera.position.copy(position);
    camera.lookAt(target);
    if (camera instanceof THREE.PerspectiveCamera) {
      const aspect = size.width / Math.max(1, size.height);
      const fit = (fov: number, minimumAspect: number) =>
        Math.min(
          105,
          THREE.MathUtils.radToDeg(
            2 *
              Math.atan(
                Math.tan(THREE.MathUtils.degToRad(fov) / 2) * Math.max(1, minimumAspect / aspect),
              ),
          ),
        );
      camera.fov = THREE.MathUtils.lerp(
        fit(37 + 20 * smooth(p), 1.35),
        fit(40, 1.2),
        focus.current,
      );
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
    const door = doorRef.current;
    if (door) door.rotation.y = -1.08 * smooth((p - 0.12) / 0.16) * (1 - smooth((p - 0.9) / 0.1));
    if (state.mode === 'entering') {
      if (p === 1) state.arrive();
      else if (p === 0 && state.entryControl === 'scroll') {
        // Only return after reversing an existing entry, not on the first frame.
        if (state.entryProgress === 0 && delta > 0) state.exit();
      } else if (state.entryControl === 'auto' || p !== state.entryProgress) invalidate();
    }
    if (focus.current !== focusGoal) invalidate();
  }, -1);

  return (
    <primitive object={car} dispose={null}>
      <Dashboard displayRef={displayRef} />
    </primitive>
  );
}

function RendererRecovery({ onError }: { onError: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

function Studio() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1c2126" roughness={0.42} metalness={0.34} />
      </mesh>
      <mesh position={[0, 2.95, 8]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[24, 6]} />
        <meshStandardMaterial color="#323b42" roughness={0.9} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 2.95, 7.975]}>
          <boxGeometry args={[0.018, 6, 0.025]} />
          <meshStandardMaterial color="#141a20" roughness={0.8} />
        </mesh>
      ))}
      {[-5.9, 5.9].map((x) => (
        <mesh key={x} position={[x, 2.4, 7.94]}>
          <boxGeometry args={[0.045, 3.2, 0.03]} />
          <meshBasicMaterial color="#d8dfdc" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 7.94]}>
        <boxGeometry args={[24, 0.018, 0.025]} />
        <meshBasicMaterial color="#52656b" />
      </mesh>
    </group>
  );
}
export default function TaycanScene(props: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [5.4, 2.35, 6.7], fov: 37, near: 0.015, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      shadows="percentage"
    >
      <color attach="background" args={['#111519']} />
      <fog attach="fog" args={['#111519', 13, 28]} />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#dbe4ec', '#202123', 1.6]} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={2.6}
        color="#f5f3ef"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#9cafbc" />
      <pointLight position={[0, 1.25, 0.28]} intensity={0.09} distance={1.5} color="#e4edf7" />
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
          color="#c4d0dc"
          position={[-5, 2, -1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 4, 1]}
        />
        <Lightformer
          intensity={4}
          color="#f6f3ec"
          position={[5, 2, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 5, 1]}
        />
        <Lightformer intensity={2} color="#d7e4e6" position={[0, 3, -6]} scale={[7, 1, 1]} />
      </Environment>
      <Studio />
      <Car {...props} />
      <RendererRecovery onError={props.onError} />
    </Canvas>
  );
}
