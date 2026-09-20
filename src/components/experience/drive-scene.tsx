'use client';

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { cloneTaycan, disposeTaycanMaterials } from '@/lib/taycan-model';
import { terrainHeight, terrainColumn, terrainSample } from '@/lib/drive-terrain';
import {
  roadCenter,
  roadSlope,
  stepDrive,
  ROAD_HALF_WIDTH,
  type DriveState,
  type DriveInput,
} from '@/lib/driving';

export type DriveSceneProps = {
  state: RefObject<DriveState>;
  input: RefObject<DriveInput>;
  paused: boolean;
  cameraMode: 'chase' | 'hood';
  reducedMotion: boolean;
  onTelemetry: (state: DriveState) => void;
  onReady: () => void;
  onError: () => void;
};

const ROAD_STEPS = 210;
const ROAD_STEP = 8;
const FAR = ROAD_STEPS * ROAD_STEP;
const MARKERS = 92;
const SCENERY = 180;
const FIXED_STEP = 1 / 120;
const hash = (x: number) => {
  const n = Math.sin(x * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};
// Looking along +Z makes -X screen-right. The simulation uses positive-right road coordinates.
const roadX = (distance: number, origin: number, lateral = 0) =>
  -(roadCenter(distance) - origin + lateral);

function stripGeometry(vertical: boolean) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array((ROAD_STEPS + 1) * 6), 3).setUsage(
      THREE.DynamicDrawUsage,
    ),
  );
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array((ROAD_STEPS + 1) * 4), 2).setUsage(
      THREE.DynamicDrawUsage,
    ),
  );
  const normals = new Float32Array((ROAD_STEPS + 1) * 6);
  for (let i = 0; i < normals.length; i += 3) normals[i + (vertical ? 0 : 1)] = 1;
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  const indices: number[] = [];
  for (let i = 0; i < ROAD_STEPS; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  geometry.setIndex(indices);
  return geometry;
}

function RoadStrip({
  state,
  left,
  right,
  height,
  color,
  texture,
  vertical = false,
}: {
  state: RefObject<DriveState>;
  left: number;
  right: number;
  height: number;
  color: string;
  texture?: THREE.Texture;
  vertical?: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => stripGeometry(vertical), [vertical]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!mesh.current) return;
    const geo = mesh.current.geometry;
    const positions = geo.getAttribute('position') as THREE.BufferAttribute;
    const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
    const distance = state.current.distance;
    const base = Math.floor(distance / ROAD_STEP) * ROAD_STEP - 112;
    const origin = roadCenter(distance);
    for (let i = 0; i <= ROAD_STEPS; i++) {
      const absolute = base + i * ROAD_STEP;
      const z = absolute - distance;
      positions.setXYZ(i * 2, roadX(absolute, origin, left), height, z);
      positions.setXYZ(
        i * 2 + 1,
        roadX(absolute, origin, vertical ? left : right),
        vertical ? height + right : height,
        z,
      );
      const v = ((base % 4096) + i * ROAD_STEP) / 8;
      uv.setXY(i * 2, 0, v);
      uv.setXY(i * 2 + 1, Math.max(1, Math.abs(right - left) / 5), v);
    }
    positions.needsUpdate = true;
    uv.needsUpdate = true;
  });
  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false} receiveShadow>
      <meshStandardMaterial
        color={color}
        map={texture}
        roughness={vertical ? 0.5 : 0.93}
        metalness={vertical ? 0.45 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function roadTexture() {
  const bytes = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < bytes.length; i += 4) {
    const value = Math.round(135 + hash(i) * 65);
    bytes[i] = value;
    bytes[i + 1] = value;
    bytes[i + 2] = value;
    bytes[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(bytes, 128, 128, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function Highway({ state }: { state: RefObject<DriveState> }) {
  const texture = useMemo(() => roadTexture(), []);
  const dashes = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const reflectors = useRef<THREE.InstancedMesh>(null);
  const transformRef = useRef(new THREE.Object3D());
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    if (!dashes.current || !posts.current || !reflectors.current) return;
    const transform = transformRef.current;
    const { distance } = state.current;
    const origin = roadCenter(distance);
    const base = Math.floor(distance / 18) * 18 - 108;
    for (let i = 0; i < MARKERS; i++) {
      const absolute = base + i * 18;
      transform.position.set(roadX(absolute, origin), 0.037, absolute - distance);
      transform.rotation.set(0, -Math.atan(roadSlope(absolute)), 0);
      transform.scale.set(0.16, 0.012, 5);
      transform.updateMatrix();
      dashes.current.setMatrixAt(i, transform.matrix);
      for (let side = -1; side <= 1; side += 2) {
        const index = i * 2 + (side === 1 ? 1 : 0);
        transform.position.set(
          roadX(absolute, origin, side * (ROAD_HALF_WIDTH + 0.3)),
          0.36,
          absolute - distance,
        );
        transform.scale.set(0.12, 0.72, 0.12);
        transform.updateMatrix();
        posts.current.setMatrixAt(index, transform.matrix);
        transform.position.y = 0.77;
        transform.scale.set(0.17, 0.09, 0.16);
        transform.updateMatrix();
        reflectors.current.setMatrixAt(index, transform.matrix);
      }
    }
    dashes.current.instanceMatrix.needsUpdate = true;
    posts.current.instanceMatrix.needsUpdate = true;
    reflectors.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <RoadStrip
        state={state}
        left={-9.5}
        right={9.5}
        height={-0.04}
        color="#8a8172"
        texture={texture}
      />
      <RoadStrip
        state={state}
        left={-ROAD_HALF_WIDTH}
        right={ROAD_HALF_WIDTH}
        height={0}
        color="#505359"
        texture={texture}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <RoadStrip
            state={state}
            left={side * 6.55 - 0.07}
            right={side * 6.55 + 0.07}
            height={0.033}
            color="#e8e1c8"
          />
          <RoadStrip
            state={state}
            left={side * (ROAD_HALF_WIDTH + 0.3)}
            right={0.27}
            height={0.49}
            color="#a5a49d"
            vertical
          />
        </group>
      ))}
      <instancedMesh ref={dashes} args={[undefined, undefined, MARKERS]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#ede6cc" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={posts} args={[undefined, undefined, MARKERS * 2]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#646665" metalness={0.4} roughness={0.6} />
      </instancedMesh>
      <instancedMesh
        ref={reflectors}
        args={[undefined, undefined, MARKERS * 2]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#fff3c5" emissive="#eab768" emissiveIntensity={0.35} />
      </instancedMesh>
    </>
  );
}

function Terrain({ state, side }: { state: RefObject<DriveState>; side: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const previous = useRef(Infinity);
  const grid = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 65 * 29;
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage),
    );
    g.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage),
    );
    const indices: number[] = [];
    for (let z = 0; z < 64; z++)
      for (let x = 0; x < 28; x++) {
        const a = z * 29 + x;
        indices.push(a, a + 29, a + 1, a + 1, a + 29, a + 30);
      }
    g.setIndex(indices);
    return g;
  }, []);
  const color = useMemo(() => new THREE.Color(), []);
  useEffect(() => () => grid.dispose(), [grid]);
  useFrame(() => {
    if (!mesh.current) return;
    const distance = state.current.distance;
    const base = Math.floor(distance / 80) * 80 - 240;
    if (base !== previous.current) {
      const geometry = mesh.current.geometry;
      const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
      const colors = geometry.getAttribute('color') as THREE.BufferAttribute;
      for (let row = 0; row < 65; row++) {
        const absolute = base + row * 40;
        for (let column = 0; column < 29; column++) {
          const lateral = terrainColumn(column, side);
          const height = terrainHeight(lateral, absolute, side);
          const index = row * 29 + column;
          positions.setXYZ(index, -roadCenter(absolute) - side * lateral, height, row * 40);
          const grain = Math.sin(absolute * 0.13 + lateral * 0.4) * 0.025;
          color.setHSL(
            0.105 + Math.min(height, 100) * 0.00015,
            0.17 + grain,
            0.3 + Math.max(0, Math.min(0.14, height / 1200)) + grain,
          );
          color.convertSRGBToLinear();
          colors.setXYZ(index, color.r, color.g, color.b);
        }
      }
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      geometry.computeVertexNormals();
      previous.current = base;
    }
    mesh.current.position.set(roadCenter(distance), 0, base - distance);
  });
  return (
    <mesh ref={mesh} geometry={grid} frustumCulled={false} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Overlapping irregular branch tiers give the silhouette depth without extra draw calls.
function pineGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const color = new THREE.Color();
  for (let tier = 0; tier < 5; tier++) {
    const bottom = -0.5 + tier * 0.18;
    const top = bottom + 0.43 - tier * 0.018;
    const radius = 1 - tier * 0.17;
    for (let side = 0; side < 11; side++) {
      const a = (side / 11) * Math.PI * 2 + tier * 0.39;
      const b = ((side + 1) / 11) * Math.PI * 2 + tier * 0.39;
      const ra = radius * (0.75 + hash(side + tier * 17) * 0.25);
      const rb = radius * (0.75 + hash(side + 1 + tier * 17) * 0.25);
      positions.push(
        Math.cos(a) * ra,
        bottom + hash(side * 2) * 0.07,
        Math.sin(a) * ra,
        Math.cos(b) * rb,
        bottom + hash(side * 2 + 2) * 0.07,
        Math.sin(b) * rb,
        0.06 * Math.sin(tier),
        top,
        0.04 * Math.cos(tier),
      );
      color
        .setHSL(0.23 + hash(side) * 0.025, 0.22, 0.12 + hash(side + tier) * 0.075)
        .convertSRGBToLinear();
      for (let vertex = 0; vertex < 3; vertex++) colors.push(color.r, color.g, color.b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Scenery({ state }: { state: RefObject<DriveState> }) {
  const canopy = useMemo(() => pineGeometry(), []);
  useEffect(() => () => canopy.dispose(), [canopy]);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const trees = useRef<THREE.InstancedMesh>(null);
  const transformRef = useRef(new THREE.Object3D());
  useFrame(() => {
    if (!rocks.current || !trunks.current || !trees.current) return;
    const transform = transformRef.current;
    const distance = state.current.distance;
    const base = Math.floor(distance / 15) - 10;
    const origin = roadCenter(distance);
    for (let i = 0; i < SCENERY; i++) {
      const index = base + i;
      const absolute = index * 15 + hash(index) * 8;
      const side = hash(index + 21) > 0.3 ? -1 : 1;
      const lateral = 13 + hash(index + 7) * 75;
      const x = roadX(absolute, origin, side * lateral);
      const ground = terrainSample(lateral, absolute, side);
      const scale = 0.7 + hash(index + 9) * 3.3;
      transform.position.set(x, ground + scale * 0.35, absolute - distance);
      transform.rotation.set(hash(index) * 0.7, index * 2.39, hash(index + 2));
      transform.scale.set(scale * 1.9, scale, scale * 1.5);
      transform.updateMatrix();
      rocks.current.setMatrixAt(i, transform.matrix);
      const treeOffset = 7 + hash(index + 12) * 10;
      const treeLateral = lateral + treeOffset;
      const treeGround = terrainSample(treeLateral, absolute, side);
      const treeHeight = 4.5 + hash(index + 5) * 7;
      transform.position.set(
        roadX(absolute, origin, side * treeLateral),
        treeGround + treeHeight * 0.22,
        absolute - distance,
      );
      transform.rotation.set(0, index, 0);
      transform.scale.set(0.22, treeHeight * 0.5, 0.22);
      transform.updateMatrix();
      trunks.current.setMatrixAt(i, transform.matrix);
      transform.position.y = treeGround + treeHeight * 0.65;
      transform.scale.set(treeHeight * 0.24, treeHeight * 0.8, treeHeight * 0.24);
      transform.updateMatrix();
      trees.current.setMatrixAt(i, transform.matrix);
    }
    rocks.current.instanceMatrix.needsUpdate = true;
    trunks.current.instanceMatrix.needsUpdate = true;
    trees.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={rocks} args={[undefined, undefined, SCENERY]} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#747167" roughness={0.98} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, SCENERY]} frustumCulled={false}>
        <cylinderGeometry args={[0.6, 1, 1, 5]} />
        <meshStandardMaterial color="#51453b" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, SCENERY]} frustumCulled={false}>
        <primitive attach="geometry" object={canopy} />
        <meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

function Sky() {
  return (
    <mesh>
      <sphereGeometry args={[4400, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`varying vec3 direction; void main(){ direction = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`varying vec3 direction; void main(){ vec3 d=normalize(direction); float h=max(d.y,0.0); vec3 col=mix(vec3(.89,.72,.55),vec3(.25,.46,.64),pow(h,.42)); vec3 sun=normalize(vec3(-.65,.22,.85)); float glow=max(dot(d,sun),0.0); col+=vec3(.9,.52,.22)*pow(glow,24.0)*.32; col+=vec3(1.0,.86,.57)*smoothstep(.9994,.9998,glow)*1.5; gl_FragColor=vec4(pow(col,vec3(2.2)),1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n }`}
      />
    </mesh>
  );
}

function VehicleAndCamera(props: DriveSceneProps) {
  const { onReady } = props;
  const { scene } = useGLTF('/models/taycan-preview.glb', false, true);
  const car = useMemo(() => cloneTaycan(scene), [scene]);
  const group = useRef<THREE.Group>(null);
  const brakeLight = useRef<THREE.Mesh>(null);
  const accumulator = useRef(0);
  const telemetryTime = useRef(0);
  const initialized = useRef(false);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const target = useRef(new THREE.Vector3());
  useEffect(() => {
    onReady();
    return () => disposeTaycanMaterials(car);
  }, [car, onReady]);
  useFrame(({ camera, size }, frameDelta) => {
    const dt = Math.min(frameDelta, 0.1);
    const state = props.state.current;
    if (!props.paused) {
      accumulator.current = Math.min(accumulator.current + dt, 0.1);
      while (accumulator.current >= FIXED_STEP) {
        stepDrive(state, props.input.current, FIXED_STEP);
        accumulator.current -= FIXED_STEP;
      }
    } else accumulator.current = 0;
    const yaw = -Math.atan(roadSlope(state.distance)) - state.heading;
    if (group.current) {
      group.current.position.set(-state.offset, 0.05, 0);
      group.current.rotation.set(
        0,
        yaw,
        props.reducedMotion ? 0 : (state.steering * state.speed) / 3000,
      );
    }
    if (brakeLight.current) {
      (brakeLight.current.material as THREE.MeshBasicMaterial).color.set(
        props.input.current.brake > 0 ? '#ff2b19' : '#a51812',
      );
    }
    const hood = props.cameraMode === 'hood';
    const back = hood ? -0.9 : 9.3;
    cameraPosition.set(
      -state.offset - Math.sin(yaw) * back,
      hood ? 1.48 : 3.3,
      -Math.cos(yaw) * back,
    );
    const ahead = hood ? 40 : 12;
    cameraTarget.set(
      roadX(state.distance + ahead, roadCenter(state.distance)) - state.offset * 0.75,
      hood ? 1.1 : 0.7,
      ahead,
    );
    const blend = !initialized.current || props.reducedMotion ? 1 : 1 - Math.exp(-7 * dt);
    camera.position.lerp(cameraPosition, blend);
    target.current.lerp(cameraTarget, blend);
    camera.lookAt(target.current);
    if (camera instanceof THREE.PerspectiveCamera) {
      const baseFov = size.width / size.height < 1 ? 70 : 53;
      const fov = baseFov + (props.reducedMotion ? 0 : state.speed * 0.11);
      camera.fov = THREE.MathUtils.lerp(camera.fov, fov, blend);
      camera.updateProjectionMatrix();
    }
    initialized.current = true;
    telemetryTime.current += dt;
    if (telemetryTime.current >= 0.1) {
      props.onTelemetry({ ...state });
      telemetryTime.current = 0;
    }
  }, -2);
  return (
    <group ref={group}>
      <primitive object={car} dispose={null} />
      <mesh ref={brakeLight} position={[0, 0.81, -2.365]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.38, 0.026]} />
        <meshBasicMaterial color="#a51812" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Recovery({ onError }: { onError: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

export default function DriveScene(props: DriveSceneProps) {
  return (
    <Canvas
      frameloop={props.paused ? 'demand' : 'always'}
      dpr={[1, 1.5]}
      shadows="percentage"
      camera={{ position: [0, 3.5, -8.4], fov: 53, near: 0.1, far: 5000 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#c9b59e']} />
      <fog attach="fog" args={['#c9b59e', FAR * 0.3, FAR * 0.88]} />
      <hemisphereLight args={['#d9e6f5', '#9f8868', 2]} />
      <directionalLight
        position={[-45, 55, 35]}
        color="#ffe0ac"
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          intensity={2.5}
          color="#dae8fb"
          position={[0, 8, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[20, 20, 1]}
        />
        <Lightformer
          intensity={3}
          color="#ffd6a3"
          position={[-10, 3, 5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 5, 1]}
        />
      </Environment>
      <Sky />
      <mesh position={[0, -3.5, 1600]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9000, 9000]} />
        <meshStandardMaterial color="#647f88" roughness={0.3} metalness={0.35} />
      </mesh>
      <Highway state={props.state} />
      <Terrain state={props.state} side={-1} />
      <Terrain state={props.state} side={1} />
      <Scenery state={props.state} />
      <Suspense fallback={null}>
        <VehicleAndCamera {...props} />
      </Suspense>
      <Recovery onError={props.onError} />
    </Canvas>
  );
}
