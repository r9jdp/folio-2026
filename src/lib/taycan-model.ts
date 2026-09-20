import * as THREE from 'three';

/** Share immutable geometry, but give each scene its own paint and cabin materials. */
export function cloneTaycan(scene: THREE.Group) {
  const clone = scene.clone(true);
  const materials = new Map<THREE.Material, THREE.Material>();
  clone.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const tune = (original: THREE.Material) => {
      const cached = materials.get(original);
      if (cached) return cached;
      const material = original.clone() as THREE.MeshStandardMaterial;
      if (material.name === 'corpus1') {
        const paint = new THREE.MeshPhysicalMaterial({
          name: material.name,
          color: '#c2c8cd',
          metalness: 0.8,
          roughness: 0.3,
          clearcoat: 1,
          clearcoatRoughness: 0.23,
          side: original.side,
        });
        material.dispose();
        materials.set(original, paint);
        return paint;
      }
      if (material.name === 'SKIN') {
        material.color.set('#34373a');
        material.roughness = 0.78;
      }
      if (/Black_plastick|Carbon_black/.test(material.name)) {
        material.color.set('#1b1d20');
        material.roughness = 0.58;
      }
      if (material.name === 'MIRROR') {
        material.color.set('#77818b');
        material.emissive.set('#000000');
        material.metalness = 0.94;
        material.roughness = 0.16;
      }
      materials.set(original, material);
      return material;
    };
    node.material = Array.isArray(node.material) ? node.material.map(tune) : tune(node.material);
  });
  const door = clone.getObjectByName('driver_door');
  if (door) door.rotation.y = 0;
  return clone;
}

/** Geometry belongs to the GLTF cache; only dispose this clone's materials. */
export function disposeTaycanMaterials(car: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  car.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) =>
        materials.add(m),
      );
    }
  });
  materials.forEach((material) => material.dispose());
}
