import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type ScreenMode = 'ambient' | 'static' | 'game';
export type TVScene = {
  setMode: (mode: ScreenMode) => void;
  setFrame: (frame: HTMLCanvasElement) => void;
  setPlaying: (playing: boolean) => void;
  setVideoPaused: (paused: boolean) => void;
  dispose: () => void;
};

/** Same CC0 cabinet and camera calibration as the approved CrazyGL preview. */
export function createTVScene(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  controls: { power: HTMLButtonElement; sound: HTMLButtonElement; screen: HTMLButtonElement },
  media: { video: HTMLVideoElement; onPaused: (paused: boolean) => void },
  onReady: () => void,
  onFailure: () => void,
): TVScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0xffffff, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  camera.position.set(0, 0.05, 4.2);
  camera.lookAt(0, 0, 0);
  const cabinet = new THREE.Group();
  cabinet.rotation.x = THREE.MathUtils.degToRad(-3);
  cabinet.position.x = -0.32;
  scene.add(cabinet);
  const key = new THREE.DirectionalLight(0xfff0d8, 1);
  key.position.set(-2.5, 2, 3.5);
  const fill = new THREE.DirectionalLight(0xa8c5ff, 0.45);
  fill.position.set(2.5, -1, 2);
  scene.add(key, fill, new THREE.AmbientLight(0x303843, 0.55));

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 640;
  screenCanvas.height = 480;
  const context = screenCanvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(screenCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 240;
  noiseCanvas.height = 180;
  const noiseContext = noiseCanvas.getContext('2d')!;
  const noise = noiseContext.createImageData(240, 180);
  let mode: ScreenMode = 'ambient';
  let gameFrame: HTMLCanvasElement | null = null;
  let model: THREE.Group | null = null;
  let screen: THREE.Mesh | null = null;
  let animation = 0;
  let lastNoise = 0;
  let destroyed = false;
  let inView = true;
  let playing = false;
  let pointerX = 0;
  let pointerY = 0;
  let yaw = 0;
  let pitch = 0;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const { video } = media;
  const poster = new Image();
  let videoPaused = preference.matches;
  let playPending = false;
  let videoFailed = false;
  video.muted = true;
  media.onPaused(videoPaused);
  const wantsVideo = () =>
    !destroyed && mode === 'ambient' && !videoPaused && inView && !document.hidden;
  function syncVideo() {
    if (!wantsVideo()) {
      video.pause();
      return;
    }
    if (playPending || !video.paused || videoFailed) return;
    playPending = true;
    void video
      .play()
      .then(() => {
        // A knob click or unmount can overtake a pending autoplay request.
        if (!wantsVideo()) video.pause();
        invalidate();
      })
      .catch((error: unknown) => {
        if (!wantsVideo() || (error instanceof DOMException && error.name === 'AbortError')) return;
        videoPaused = true;
        media.onPaused(true);
        invalidate();
      })
      .finally(() => {
        playPending = false;
        // Retry an interrupted play only when playback is still wanted.
        if (wantsVideo() && video.paused && !videoFailed) syncVideo();
      });
  }
  const mediaReady = () => {
    syncVideo();
    invalidate();
  };
  const mediaFailed = () => {
    videoFailed = true;
    videoPaused = true;
    video.pause();
    if (!destroyed) media.onPaused(true);
    invalidate();
  };
  const visibilityChanged = () => {
    syncVideo();
    invalidate();
  };
  const motionChanged = () => {
    if (preference.matches) {
      videoPaused = true;
      media.onPaused(true);
    }
    visibilityChanged();
  };
  poster.onload = invalidate;
  poster.src = video.poster;
  video.addEventListener('loadeddata', mediaReady);
  video.addEventListener('seeked', mediaReady);
  video.addEventListener('error', mediaFailed);
  const textures = new Set<THREE.Texture>();
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  function disposeModel(object: THREE.Object3D) {
    object.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      geometries.add(node.geometry);
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    textures.forEach((item) => item.dispose());
    materials.forEach((item) => item.dispose());
    geometries.forEach((item) => item.dispose());
  }
  function placeControl(button: HTMLButtonElement, point: THREE.Vector3) {
    if (!screen) return;
    screen.localToWorld(point).project(camera);
    button.style.left = `${(point.x * 0.5 + 0.5) * host.clientWidth}px`;
    button.style.top = `${(-point.y * 0.5 + 0.5) * host.clientHeight}px`;
  }
  function paint(time: number) {
    if (mode === 'ambient') {
      const source = video.readyState >= 2 ? video : poster;
      const width = source === video ? video.videoWidth : poster.naturalWidth;
      const height = source === video ? video.videoHeight : poster.naturalHeight;
      if (!width || !height) return;
      // Fill the curved 4:3 glass; favor the laptop and tree in this wide clip.
      const cropWidth = Math.min(width, height * (4 / 3));
      const cropHeight = Math.min(height, width * (3 / 4));
      context.imageSmoothingEnabled = false;
      context.drawImage(
        source,
        (width - cropWidth) * 0.65,
        (height - cropHeight) * 0.5,
        cropWidth,
        cropHeight,
        0,
        0,
        640,
        480,
      );
      context.fillStyle = 'rgba(0,0,0,.045)';
      for (let y = 0; y < 480; y += 3) context.fillRect(0, y, 640, 1);
    } else if (mode === 'game' && gameFrame) {
      context.imageSmoothingEnabled = false;
      context.drawImage(gameFrame, 0, 0, 640, 480);
      context.fillStyle = 'rgba(0,0,0,.07)';
      for (let y = 0; y < 480; y += 3) context.fillRect(0, y, 640, 1);
    } else if (mode === 'static') {
      if (time - lastNoise < (preference.matches ? 180 : 50)) return;
      lastNoise = time;
      for (let i = 0; i < noise.data.length; i += 4) {
        const value = Math.random() * 180 + 22;
        noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value;
        noise.data[i + 3] = 255;
      }
      noiseContext.putImageData(noise, 0, 0);
      context.imageSmoothingEnabled = false;
      context.drawImage(noiseCanvas, 0, 0, 640, 480);
      context.fillStyle = 'rgba(0,0,0,.22)';
      context.fillRect(0, ((time * 0.06) % 520) - 40, 640, 32);
    } else {
      const glow = context.createRadialGradient(300, 190, 30, 320, 240, 410);
      glow.addColorStop(0, '#414958');
      glow.addColorStop(1, '#252b37');
      context.fillStyle = glow;
      context.fillRect(0, 0, 640, 480);
    }
    texture.needsUpdate = true;
  }
  function draw(time: number) {
    animation = 0;
    if (destroyed || !inView || document.hidden) return;
    const targetX = playing || preference.matches ? 0 : pointerX * 0.018;
    const targetY = playing || preference.matches ? 0 : pointerY * 0.012;
    yaw += (targetX - yaw) * 0.08;
    pitch += (targetY - pitch) * 0.08;
    cabinet.rotation.y = yaw;
    cabinet.rotation.x = THREE.MathUtils.degToRad(-3) + pitch;
    cabinet.updateMatrixWorld(true);
    paint(time);
    placeControl(controls.power, new THREE.Vector3(-224, 14, 85));
    placeControl(controls.sound, new THREE.Vector3(232, 14, 85));
    placeControl(controls.screen, new THREE.Vector3(5, 31, 302));
    renderer.render(scene, camera);
    if (
      mode === 'static' ||
      mode === 'game' ||
      (wantsVideo() && !video.paused) ||
      Math.abs(yaw - targetX) + Math.abs(pitch - targetY) > 0.00001
    ) {
      animation = requestAnimationFrame(draw);
    }
  }
  function invalidate() {
    if (!animation && !destroyed) animation = requestAnimationFrame(draw);
  }
  const move = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    invalidate();
  };
  const leave = () => {
    pointerX = pointerY = 0;
    invalidate();
  };
  const resize = () => {
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
    // Preserve the approved desktop framing; make space on narrow phones.
    camera.position.z = host.clientWidth < 360 ? 4.65 : 4.2;
    camera.updateProjectionMatrix();
    invalidate();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    visibilityChanged();
  });
  intersection.observe(host);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', visibilityChanged);
  preference.addEventListener('change', motionChanged);
  const lost = (event: Event) => {
    event.preventDefault();
    onFailure();
  };
  canvas.addEventListener('webglcontextlost', lost);
  new GLTFLoader().load(
    '/models/belweder.glb',
    (gltf) => {
      if (destroyed) {
        disposeModel(gltf.scene);
        return;
      }
      model = gltf.scene;
      model.rotation.y = Math.PI;
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = (3.5 / Math.max(size.x, size.y, size.z)) * 0.62 * 1.08;
      model.scale.setScalar(scale);
      model.position.copy(center.multiplyScalar(-scale));
      const glass = model.getObjectByName('tv_glass_ekran_tv_glass_ekran_0');
      if (!(glass instanceof THREE.Mesh)) {
        onFailure();
        return;
      }
      screen = glass;
      const original = Array.isArray(glass.material) ? glass.material : [glass.material];
      original.forEach((material) => {
        materials.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) textures.add(value);
      });
      const geometry = glass.geometry;
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const positions = geometry.getAttribute('position');
      const uv = new Float32Array(positions.count * 2);
      for (let i = 0; i < positions.count; i++) {
        uv[i * 2] = (positions.getX(i) - box.min.x) / (box.max.x - box.min.x);
        uv[i * 2 + 1] = (positions.getZ(i) - box.min.z) / (box.max.z - box.min.z);
      }
      geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      glass.material = screenMaterial;
      cabinet.add(model);
      resize();
      syncVideo();
      onReady();
    },
    undefined,
    onFailure,
  );
  resize();
  return {
    setMode(value) {
      mode = value;
      syncVideo();
      invalidate();
    },
    setFrame(value) {
      gameFrame = value;
      invalidate();
    },
    setPlaying(value) {
      playing = value;
      invalidate();
    },
    setVideoPaused(value) {
      videoPaused = value;
      media.onPaused(value);
      if (!value && videoFailed) {
        videoFailed = false;
        video.load();
      }
      syncVideo();
      invalidate();
    },
    dispose() {
      destroyed = true;
      video.pause();
      poster.onload = null;
      video.removeEventListener('loadeddata', mediaReady);
      video.removeEventListener('seeked', mediaReady);
      video.removeEventListener('error', mediaFailed);
      cancelAnimationFrame(animation);
      observer.disconnect();
      intersection.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', visibilityChanged);
      preference.removeEventListener('change', motionChanged);
      canvas.removeEventListener('webglcontextlost', lost);
      if (model) disposeModel(model);
      texture.dispose();
      screenMaterial.dispose();
      renderer.dispose();
    },
  };
}
