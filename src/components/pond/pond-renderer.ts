import * as THREE from 'three';
import type { Koi } from '@/lib/pond';
import { POND_WIDTH as W, POND_HEIGHT as H } from '@/lib/pond';
import { createKoiModel } from './koi-model';
import { createPondBed } from './pond-bed';

export type WaterRipple = { x: number; y: number; age: number; strength: number };
export type PondRenderer = {
  resize: (width: number, height: number) => void;
  render: (time: number, fish: Koi[], ripples: WaterRipple[]) => void;
  dispose: () => void;
};

const vertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = `
precision highp float;
uniform sampler2D sceneTexture;
uniform float time;
uniform vec4 ripples[12];
varying vec2 vUv;

vec2 hash22(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float caustics(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  float first = 10.0;
  float second = 10.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbour = vec2(float(x), float(y));
      vec2 seed = hash22(cell + neighbour);
      vec2 point = neighbour + .5 + .34 * sin(time * .24 + 6.28318 * seed) - local;
      float d = dot(point, point);
      if (d < first) { second = first; first = d; }
      else { second = min(second, d); }
    }
  }
  float edge = max(0.0, sqrt(second) - sqrt(first));
  return exp(-edge * 31.0) * .78 + exp(-edge * 10.0) * .22;
}

void main() {
  vec2 uv = vUv;
  vec2 drift = vec2(
    sin(uv.y * 18.0 + time * .39) + sin(uv.x * 27.0 - time * .31) * .43,
    cos(uv.x * 17.0 + time * .27) + sin(uv.y * 25.0 - time * .35) * .38
  );
  vec2 displacement = drift * .0018;
  float ringLight = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 ripple = ripples[i];
    if (ripple.z >= 0.0 && ripple.z < 3.6) {
      vec2 delta = (uv - ripple.xy) * vec2(900.0, 580.0);
      float d = length(delta);
      float radius = ripple.z * 108.0;
      float band = (d - radius) / (15.0 + ripple.z * 3.0);
      float envelope = exp(-band * band * .65) * exp(-ripple.z * .78);
      float wave = sin((d - radius) * .19) * envelope * ripple.w;
      vec2 direction = delta / max(d, 1.0);
      displacement += direction * wave * .010;
      ringLight += cos((d - radius) * .19) * envelope * ripple.w;
    }
  }
  vec2 warped = clamp(uv + displacement, vec2(.002), vec2(.998));
  vec3 color = texture2D(sceneTexture, warped).rgb;
  vec2 p = warped * vec2(6.4, 4.2);
  p += vec2(
    sin(p.y * 2.3 + sin(p.x * 1.4 + time * .16)),
    cos(p.x * 2.0 + sin(p.y * 2.1 - time * .18))
  ) * .32 + drift * .10;
  float light = caustics(p);
  float broadLight = caustics(p * 1.19 + vec2(3.1, 7.8));
  light = pow(light * .78 + broadLight * .22, 1.35);
  light *= .73 + .27 * sin(p.x * 2.0 + p.y * 1.3 + time * .21);
  // Light is focused through the water onto the scene, including the koi.
  color *= .83 + light * .8;
  color += vec3(.52, .76, .65) * light * .46;
  color += vec3(.55, .67, .59) * ringLight * .12;
  float reflection = pow(max(0.0, .5 + .5 * sin(uv.x * 6.0 + uv.y * 9.0 + time * .13)), 12.0);
  color = mix(color, vec3(.67, .79, .67), reflection * .025);
  float vignette = (1.0 - smoothstep(.24, .78, length((uv - .5) * vec2(1.0, .85))));
  color *= .77 + .23 * vignette;
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;

export function createPondRenderer(canvas: HTMLCanvasElement): PondRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor('#244d3b');
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, W, 0, -H, 0.1, 1400);
  camera.position.set(0, 0, 650);
  camera.lookAt(0, 0, 0);
  const bedTexture = new THREE.CanvasTexture(createPondBed());
  bedTexture.colorSpace = THREE.SRGBColorSpace;
  bedTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const bedGeometry = new THREE.PlaneGeometry(W, H);
  const bedMaterial = new THREE.MeshStandardMaterial({
    map: bedTexture,
    roughness: 1,
    metalness: 0,
  });
  const bed = new THREE.Mesh(bedGeometry, bedMaterial);
  bed.position.set(W / 2, -H / 2, -15);
  bed.receiveShadow = true;
  scene.add(bed);
  scene.add(new THREE.AmbientLight('#c7dfd0', 1.1));
  const sun = new THREE.DirectionalLight('#fff5e0', 2.3);
  sun.position.set(170, 60, 420);
  sun.target.position.set(470, -320, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -750;
  sun.shadow.camera.right = 750;
  sun.shadow.camera.top = 750;
  sun.shadow.camera.bottom = -750;
  sun.shadow.camera.far = 1500;
  sun.shadow.bias = -0.001;
  sun.shadow.normalBias = 0.2;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#83b7ac', 0.65);
  fill.position.set(W, -H, 200);
  scene.add(fill);
  const koiModels = Array.from({ length: 4 }, (_, pattern) => createKoiModel(pattern));
  koiModels.forEach((model) => scene.add(model.group));
  const target = new THREE.WebGLRenderTarget(720, 464, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });
  const rippleUniforms = Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, -1, 0));
  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      sceneTexture: { value: target.texture },
      time: { value: 0 },
      ripples: { value: rippleUniforms },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const waterGeometry = new THREE.PlaneGeometry(2, 2);
  const waterScene = new THREE.Scene();
  waterScene.add(new THREE.Mesh(waterGeometry, waterMaterial));
  const waterCamera = new THREE.Camera();
  return {
    resize(width, height) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      target.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
    },
    render(time, fish, ripples) {
      fish.forEach((koi, i) => {
        const model = koiModels[i];
        model.group.position.set(koi.x, -koi.y, 19 + Math.sin(time * 0.28 + koi.phase) * 2);
        model.group.rotation.z = -koi.heading;
        model.group.scale.setScalar(koi.length / 100);
        model.update(koi);
      });
      waterMaterial.uniforms.time.value = time;
      rippleUniforms.forEach((value, i) => {
        const ripple = ripples[i];
        if (ripple) value.set(ripple.x / W, 1 - ripple.y / H, ripple.age, ripple.strength);
        else value.set(0, 0, -1, 0);
      });
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(waterScene, waterCamera);
    },
    dispose() {
      koiModels.forEach((model) => model.dispose());
      bedTexture.dispose();
      bedGeometry.dispose();
      bedMaterial.dispose();
      sun.shadow.map?.dispose();
      waterGeometry.dispose();
      waterMaterial.dispose();
      target.dispose();
      // Dispose GPU resources without forcing a loss on the retained canvas:
      // React Strict Mode may immediately mount another renderer on it.
      renderer.dispose();
    },
  };
}
