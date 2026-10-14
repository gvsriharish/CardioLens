import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera, RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { PredictionResponse } from '../types';

interface HeartViewer3DProps {
  prediction: PredictionResponse | null;
  selectedVessel: string | null;
  onSelectVessel: (vesselKey: string) => void;
  pulseRate?: number;
}

type ViewKey = 'Anterior' | 'Posterior' | 'Left' | 'Right' | 'Superior';
type StructureKind = 'chamber' | 'artery' | 'vein' | 'heart';
interface StructureInfo {
  name: string;
  kind: StructureKind;
  description: string;
}

const TARGETS = ['CAD', 'LAD', 'LCX', 'RCA'] as const;
const TARGET_INFO: Record<string, StructureInfo> = {
  HEART: {
    name: 'Heart overview',
    kind: 'heart',
    description:
      'Generic educational 3D anatomical reference model. It is not patient imaging and does not depict a patient’s actual anatomy.',
  },
  CAD: {
    name: 'Coronary system overview',
    kind: 'heart',
    description:
      'CAD is an overall model target. The overview highlights the coronary system without implying a particular plaque location.',
  },
  RA: {
    name: 'Right atrium',
    kind: 'chamber',
    description:
      'Receives systemic venous blood from the superior and inferior venae cavae and passes it to the right ventricle.',
  },
  LA: {
    name: 'Left atrium',
    kind: 'chamber',
    description:
      'Receives oxygenated blood from the pulmonary veins and passes it to the left ventricle.',
  },
  RV: {
    name: 'Right ventricle',
    kind: 'chamber',
    description:
      'Pumps blood into the pulmonary trunk and onward to the lungs via the pulmonary valve.',
  },
  LV: {
    name: 'Left ventricle',
    kind: 'chamber',
    description:
      'Pumps blood into the ascending aorta and systemic circulation through the aortic valve.',
  },
  SEPTUM: {
    name: 'Interventricular septum',
    kind: 'chamber',
    description:
      'The muscular partition separating the right and left ventricles along the interventricular groove.',
  },
  AORTA: {
    name: 'Aorta and arch',
    kind: 'artery',
    description:
      'The ascending aorta and aortic arch carry blood from the left ventricle to the systemic arterial circulation.',
  },
  PULMONARY: {
    name: 'Pulmonary trunk and arteries',
    kind: 'artery',
    description:
      'Carries deoxygenated blood from the right ventricle onward to the right and left pulmonary capillary beds.',
  },
  SVC: {
    name: 'Superior vena cava',
    kind: 'vein',
    description:
      'Returns venous blood from the head, neck, and upper extremities to the right atrium.',
  },
  IVC: {
    name: 'Inferior vena cava',
    kind: 'vein',
    description:
      'Returns venous blood from the abdomen, pelvis, and lower extremities to the right atrium.',
  },
  LAD: {
    name: 'Left anterior descending artery (LAD)',
    kind: 'artery',
    description:
      'A schematic anterior interventricular course with diagonal branches supplying the apex and anterior septum.',
  },
  LCX: {
    name: 'Left circumflex artery (LCX)',
    kind: 'artery',
    description:
      'A schematic atrioventricular-groove course with obtuse marginal branches supplying the lateral LV wall.',
  },
  RCA: {
    name: 'Right coronary artery (RCA)',
    kind: 'artery',
    description:
      'A schematic right atrioventricular-groove course supplying the RV, inferior wall, and conduction system.',
  },
  VEINS: {
    name: 'Cardiac & pulmonary veins',
    kind: 'vein',
    description:
      'Systemic and pulmonary venous ostia and coronary sinus returning venous blood.',
  },
};

const STRUCTURE_OPTIONS = [
  { label: 'Chambers', keys: ['RA', 'LA', 'RV', 'LV', 'SEPTUM'] },
  { label: 'Great vessels', keys: ['AORTA', 'PULMONARY', 'SVC', 'IVC'] },
  { label: 'Coronary arteries', keys: ['LAD', 'LCX', 'RCA'] },
  { label: 'Cardiac veins', keys: ['VEINS'] },
];

const ARTERY = 0x8f2d3a;
const VEIN = 0x4a6ea8;
const PULMONARY_ARTERY = 0x4a6ea8;
const HIGHLIGHT = 0x06b6d4; // Cyan
const HOVER = 0xffc15a; // Warm Amber

function curve(points: Array<[number, number, number]>, closed = false) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    closed,
    'centripetal'
  );
}

function addSelectableMesh(
  parent: THREE.Group,
  registry: Record<string, THREE.Group>,
  key: string,
  info: StructureInfo,
  mesh: THREE.Mesh
) {
  let group = registry[key];
  if (!group) {
    group = new THREE.Group();
    group.name = info.name;
    group.userData.structureKey = key;
    registry[key] = group;
    parent.add(group);
  }
  mesh.name = info.name;
  mesh.userData.structureKey = key;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function addTube(
  parent: THREE.Group,
  registry: Record<string, THREE.Group>,
  key: string,
  info: StructureInfo,
  points: Array<[number, number, number]>,
  radius: number,
  color: number,
  tubularSegments = 54
) {
  const geometry = new THREE.TubeGeometry(curve(points), tubularSegments, radius, 12, false);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: info.kind === 'vein' ? 0.62 : 0.58,
    metalness: 0.05,
    clearcoat: 0.1,
    clearcoatRoughness: 0.6,
    emissive: color,
    emissiveIntensity: 0.02,
  });
  addSelectableMesh(parent, registry, key, info, new THREE.Mesh(geometry, material));
}

function buildAnatomy(parent: THREE.Group) {
  const root = new THREE.Group();
  root.name = 'CardioLens anatomical reference structure';
  parent.add(root);
  const structures: Record<string, THREE.Group> = {};

  // 1. Left Ventricle (LV) — conical/ellipsoidal muscular bulk
  const lvGeo = new THREE.SphereGeometry(1.05, 36, 28);
  lvGeo.scale(0.92, 1.48, 0.95);
  const lvMat = new THREE.MeshPhysicalMaterial({
    color: 0x8e2534,
    roughness: 0.68,
    metalness: 0.04,
    clearcoat: 0.12,
    clearcoatRoughness: 0.65,
    emissive: 0x8e2534,
    emissiveIntensity: 0.02,
  });
  const lvMesh = new THREE.Mesh(lvGeo, lvMat);
  lvMesh.position.set(0.12, -0.65, 0.15);
  lvMesh.rotation.set(0.1, -0.05, -0.15);
  addSelectableMesh(root, structures, 'LV', TARGET_INFO.LV, lvMesh);

  // 2. Right Ventricle (RV) — wraps anterior-right side
  const rvGeo = new THREE.SphereGeometry(0.92, 32, 24);
  rvGeo.scale(0.85, 1.3, 0.88);
  const rvMat = new THREE.MeshPhysicalMaterial({
    color: 0x9c2d3e,
    roughness: 0.7,
    metalness: 0.04,
    clearcoat: 0.1,
    clearcoatRoughness: 0.65,
    emissive: 0x9c2d3e,
    emissiveIntensity: 0.02,
  });
  const rvMesh = new THREE.Mesh(rvGeo, rvMat);
  rvMesh.position.set(-0.55, -0.5, 0.45);
  rvMesh.rotation.set(0.12, 0.1, 0.1);
  addSelectableMesh(root, structures, 'RV', TARGET_INFO.RV, rvMesh);

  // 3. Interventricular Septum (SEPTUM) — dividing muscular partition
  const septumGeo = new THREE.CylinderGeometry(0.35, 0.55, 1.6, 20);
  const septumMat = new THREE.MeshPhysicalMaterial({
    color: 0x7c202d,
    roughness: 0.72,
    metalness: 0.02,
    emissive: 0x7c202d,
    emissiveIntensity: 0.02,
  });
  const septumMesh = new THREE.Mesh(septumGeo, septumMat);
  septumMesh.position.set(-0.1, -0.55, 0.25);
  septumMesh.rotation.set(0.1, 0, -0.08);
  addSelectableMesh(root, structures, 'SEPTUM', TARGET_INFO.SEPTUM, septumMesh);

  // 4. Left Atrium (LA) — posterior-superior base
  const laGeo = new THREE.SphereGeometry(0.75, 28, 22);
  laGeo.scale(1.05, 0.9, 0.95);
  const laMat = new THREE.MeshPhysicalMaterial({
    color: 0x822635,
    roughness: 0.65,
    metalness: 0.04,
    emissive: 0x822635,
    emissiveIntensity: 0.02,
  });
  const laMesh = new THREE.Mesh(laGeo, laMat);
  laMesh.position.set(0.48, 0.72, -0.32);
  addSelectableMesh(root, structures, 'LA', TARGET_INFO.LA, laMesh);

  // 5. Right Atrium (RA) — right lateral-superior chamber
  const raGeo = new THREE.SphereGeometry(0.78, 28, 22);
  raGeo.scale(0.95, 1.05, 0.9);
  const raMat = new THREE.MeshPhysicalMaterial({
    color: 0x882b3a,
    roughness: 0.66,
    metalness: 0.04,
    emissive: 0x882b3a,
    emissiveIntensity: 0.02,
  });
  const raMesh = new THREE.Mesh(raGeo, raMat);
  raMesh.position.set(-0.78, 0.48, 0.25);
  addSelectableMesh(root, structures, 'RA', TARGET_INFO.RA, raMesh);

  // 6. AORTA — Ascending aorta and aortic arch
  addTube(
    root,
    structures,
    'AORTA',
    TARGET_INFO.AORTA,
    [
      [0.08, 0.65, 0.28],
      [0.12, 1.25, 0.18],
      [0.08, 1.72, -0.06],
      [-0.14, 1.82, -0.32],
      [-0.38, 1.48, -0.48],
      [-0.42, 0.8, -0.52],
    ],
    0.22,
    0xb83344,
    48
  );
  // Brachiocephalic artery trunk
  addTube(
    root,
    structures,
    'AORTA',
    TARGET_INFO.AORTA,
    [
      [-0.08, 1.8, -0.2],
      [-0.18, 2.32, -0.18],
    ],
    0.068,
    0xb83344,
    18
  );
  // Left common carotid
  addTube(
    root,
    structures,
    'AORTA',
    TARGET_INFO.AORTA,
    [
      [0.02, 1.81, -0.12],
      [0.02, 2.36, -0.1],
    ],
    0.055,
    0xb83344,
    18
  );
  // Left subclavian
  addTube(
    root,
    structures,
    'AORTA',
    TARGET_INFO.AORTA,
    [
      [0.1, 1.76, -0.02],
      [0.18, 2.32, 0.02],
    ],
    0.055,
    0xb83344,
    18
  );

  // 7. PULMONARY — Trunk and bifurcating arteries
  addTube(
    root,
    structures,
    'PULMONARY',
    TARGET_INFO.PULMONARY,
    [
      [-0.22, 0.52, 0.58],
      [-0.12, 1.02, 0.46],
      [0.04, 1.28, 0.22],
    ],
    0.2,
    PULMONARY_ARTERY,
    32
  );
  addTube(
    root,
    structures,
    'PULMONARY',
    TARGET_INFO.PULMONARY,
    [
      [0.04, 1.28, 0.22],
      [0.55, 1.18, -0.26],
    ],
    0.12,
    PULMONARY_ARTERY,
    22
  );
  addTube(
    root,
    structures,
    'PULMONARY',
    TARGET_INFO.PULMONARY,
    [
      [0.04, 1.28, 0.22],
      [-0.65, 1.18, -0.18],
    ],
    0.12,
    PULMONARY_ARTERY,
    22
  );

  // 8. SVC — Superior vena cava
  addTube(
    root,
    structures,
    'SVC',
    TARGET_INFO.SVC,
    [
      [-0.82, 1.82, 0.12],
      [-0.8, 1.15, 0.18],
      [-0.76, 0.72, 0.22],
    ],
    0.16,
    VEIN,
    28
  );

  // 9. IVC — Inferior vena cava
  addTube(
    root,
    structures,
    'IVC',
    TARGET_INFO.IVC,
    [
      [-0.72, -0.22, 0.05],
      [-0.75, 0.18, 0.15],
    ],
    0.15,
    VEIN,
    20
  );

  // 10. VEINS — Pulmonary and cardiac veins
  addTube(
    root,
    structures,
    'VEINS',
    TARGET_INFO.VEINS,
    [
      [0.85, 0.82, -0.36],
      [0.55, 0.72, -0.32],
    ],
    0.1,
    VEIN,
    18
  );
  addTube(
    root,
    structures,
    'VEINS',
    TARGET_INFO.VEINS,
    [
      [-0.22, 0.78, -0.52],
      [0.32, 0.68, -0.38],
    ],
    0.1,
    VEIN,
    18
  );

  // 11. Coronary Arteries (LMCA, LAD, LCX, RCA)
  const ladInfo = TARGET_INFO.LAD;
  const lcxInfo = TARGET_INFO.LCX;
  const rcaInfo = TARGET_INFO.RCA;
  const lmcaInfo: StructureInfo = {
    name: 'Left main coronary artery',
    kind: 'artery',
    description: 'Short schematic left main segment before the LAD and LCX branches.',
  };

  addTube(
    root,
    structures,
    'LMCA',
    lmcaInfo,
    [
      [0.2, 1.1, 0.78],
      [0.08, 0.98, 0.98],
      [-0.04, 0.84, 1.12],
    ],
    0.055,
    ARTERY,
    24
  );

  // LAD with diagonals
  addTube(
    root,
    structures,
    'LAD',
    ladInfo,
    [
      [-0.04, 0.84, 1.12],
      [-0.03, 0.45, 1.22],
      [-0.01, -0.02, 1.27],
      [0.02, -0.55, 1.22],
      [0.04, -1.12, 1.12],
      [0.03, -1.7, 0.86],
      [0.02, -2.06, 0.42],
    ],
    0.052,
    ARTERY,
    68
  );
  addTube(
    root,
    structures,
    'LAD',
    ladInfo,
    [
      [-0.03, 0.38, 1.19],
      [-0.3, 0.62, 1.07],
      [-0.54, 0.78, 0.86],
    ],
    0.026,
    ARTERY,
    28
  );
  addTube(
    root,
    structures,
    'LAD',
    ladInfo,
    [
      [0.0, 0.02, 1.25],
      [0.31, 0.16, 1.13],
      [0.53, 0.34, 0.96],
    ],
    0.026,
    ARTERY,
    28
  );
  addTube(
    root,
    structures,
    'LAD',
    ladInfo,
    [
      [0.02, -0.58, 1.2],
      [-0.28, -0.36, 1.12],
      [-0.5, -0.17, 0.95],
    ],
    0.023,
    ARTERY,
    26
  );

  // LCX with obtuse marginals
  addTube(
    root,
    structures,
    'LCX',
    lcxInfo,
    [
      [-0.04, 0.84, 1.12],
      [0.36, 0.81, 1.02],
      [0.78, 0.67, 0.84],
      [1.1, 0.42, 0.56],
      [1.24, 0.1, 0.2],
      [1.16, -0.16, -0.16],
    ],
    0.05,
    ARTERY,
    58
  );
  addTube(
    root,
    structures,
    'LCX',
    lcxInfo,
    [
      [0.78, 0.67, 0.84],
      [0.98, 0.9, 0.72],
      [1.06, 1.06, 0.52],
    ],
    0.024,
    ARTERY,
    26
  );
  addTube(
    root,
    structures,
    'LCX',
    lcxInfo,
    [
      [1.06, 0.46, 0.58],
      [1.28, 0.55, 0.33],
      [1.39, 0.59, 0.08],
    ],
    0.022,
    ARTERY,
    24
  );

  // RCA with acute marginals
  addTube(
    root,
    structures,
    'RCA',
    rcaInfo,
    [
      [-0.34, 0.78, 1.1],
      [-0.68, 0.69, 0.98],
      [-0.96, 0.44, 0.77],
      [-1.08, 0.12, 0.48],
      [-1.04, -0.18, 0.14],
      [-0.84, -0.44, -0.15],
    ],
    0.05,
    ARTERY,
    58
  );
  addTube(
    root,
    structures,
    'RCA',
    rcaInfo,
    [
      [-0.88, 0.48, 0.81],
      [-1.1, 0.57, 0.62],
      [-1.22, 0.6, 0.39],
    ],
    0.023,
    ARTERY,
    26
  );
  addTube(
    root,
    structures,
    'RCA',
    rcaInfo,
    [
      [-1.04, -0.05, 0.3],
      [-0.88, -0.16, 0.02],
      [-0.68, -0.3, -0.23],
    ],
    0.022,
    ARTERY,
    24
  );

  // Group the ventricular muscle bulk for rhythmic pulsing
  const ventricularGroup = new THREE.Group();
  ventricularGroup.name = 'Ventricular muscle group';
  if (structures.LV) ventricularGroup.add(structures.LV);
  if (structures.RV) ventricularGroup.add(structures.RV);
  if (structures.SEPTUM) ventricularGroup.add(structures.SEPTUM);
  root.add(ventricularGroup);

  return { root, structures, ventricularGroup };
}

function setGroupEmissive(group: THREE.Group | undefined, color: number, intensity: number) {
  if (!group) return;
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const standard = material as THREE.MeshStandardMaterial;
      if (standard.emissive) {
        standard.emissive.setHex(color);
        standard.emissiveIntensity = intensity;
        standard.needsUpdate = true;
      }
    });
  });
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const mat = material as THREE.Material & {
        map?: THREE.Texture | null;
        normalMap?: THREE.Texture | null;
        roughnessMap?: THREE.Texture | null;
        metalnessMap?: THREE.Texture | null;
      };
      mat.map?.dispose();
      mat.normalMap?.dispose();
      mat.roughnessMap?.dispose();
      mat.metalnessMap?.dispose();
      mat.dispose();
    });
  });
}

export const HeartViewer3D: React.FC<HeartViewer3DProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  pulseRate = 75,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onSelectVesselRef = useRef(onSelectVessel);
  const selectedVesselRef = useRef(selectedVessel);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const structuresRef = useRef<Record<string, THREE.Group>>({});
  const ventricularGroupRef = useRef<THREE.Group | null>(null);
  const pickMeshesRef = useRef<THREE.Mesh[]>([]);
  const selectedRef = useRef<string | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const pulseRateRef = useRef<number>(pulseRate);

  const [selectedStructure, setSelectedStructure] = useState<string>('HEART');
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [view, setView] = useState<ViewKey>('Anterior');
  const [isLoading, setIsLoading] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    pulseRateRef.current = pulseRate;
  }, [pulseRate]);

  useEffect(() => {
    onSelectVesselRef.current = onSelectVessel;
  }, [onSelectVessel]);

  useEffect(() => {
    selectedVesselRef.current = selectedVessel;
  }, [selectedVessel]);

  useEffect(() => {
    selectedRef.current = selectedStructure;
  }, [selectedStructure]);

  useEffect(() => {
    hoveredRef.current = hoveredStructure;
  }, [hoveredStructure]);

  useEffect(() => {
    const next = selectedVessel === 'CAD' ? 'HEART' : selectedVessel;
    if (next) setSelectedStructure(next);
  }, [selectedVessel]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let root: THREE.Group | null = null;
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let pointerStart: { x: number; y: number } | null = null;
    let moved = false;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c1322);

      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 80);
      camera.position.set(0, 0.25, 10.2);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      mount.replaceChildren(renderer.domElement);
      renderer.domElement.setAttribute(
        'aria-label',
        'Interactive 3D anatomical heart reference model with schematic selectable coronary vessels.'
      );
      renderer.domElement.setAttribute('role', 'img');

      scene.add(new THREE.HemisphereLight(0xe6f0ff, 0x45202a, 1.45));
      const keyLight = new THREE.DirectionalLight(0xffe4dd, 2.2);
      keyLight.position.set(4.5, 6.5, 7);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xb9d6ff, 1.0);
      fillLight.position.set(-5, 1.5, 3);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xff8d92, 0.8);
      rimLight.position.set(0, 4, -5);
      scene.add(rimLight);

      root = new THREE.Group();
      root.name = 'CardioLens heart reference and coronary overlays';
      scene.add(root);

      const built = buildAnatomy(root);
      structuresRef.current = built.structures;
      ventricularGroupRef.current = built.ventricularGroup;

      pickMeshesRef.current = [];
      Object.values(built.structures).forEach((group) =>
        group.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (mesh.isMesh) pickMeshesRef.current.push(mesh);
        })
      );

      setIsLoading(false);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.15, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.enablePan = false;
      controls.rotateSpeed = 0.62;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 5.2;
      controls.maxDistance = 13;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.55;
      controlsRef.current = controls;
      controls.update();

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const intersect = (event: PointerEvent) => {
        if (!renderer) return undefined;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickMeshesRef.current, false)[0];
        return hit?.object.userData.structureKey as string | undefined;
      };

      const onPointerDown = (event: PointerEvent) => {
        pointerStart = { x: event.clientX, y: event.clientY };
        moved = false;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (
          pointerStart &&
          Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5
        ) {
          moved = true;
        }
        if (!pointerStart && renderer) {
          const key = intersect(event) ?? null;
          setHoveredStructure(key);
          renderer.domElement.style.cursor = key ? 'pointer' : 'grab';
        }
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!pointerStart) return;
        const distance = Math.hypot(
          event.clientX - pointerStart.x,
          event.clientY - pointerStart.y
        );
        pointerStart = null;
        if (moved || distance > 5) return;
        const key = intersect(event);
        if (!key) return;
        setSelectedStructure(key);
        if (
          TARGETS.includes(key as (typeof TARGETS)[number]) &&
          selectedVesselRef.current !== key
        ) {
          onSelectVesselRef.current(key);
        }
      };

      const onPointerLeave = () => {
        pointerStart = null;
        setHoveredStructure(null);
        if (renderer) renderer.domElement.style.cursor = 'grab';
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointerleave', onPointerLeave);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        setRenderError('The graphics context was lost. Reload the page to restore 3D rendering.');
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

      const resize = () => {
        if (!mount || !renderer || !camera) return;
        const nextWidth = Math.max(1, mount.clientWidth);
        const nextHeight = Math.max(1, mount.clientHeight);
        renderer.setSize(nextWidth, nextHeight);
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
      };

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
      } else {
        window.addEventListener('resize', resize);
      }

      const animate = (timestamp: number) => {
        frameId = window.requestAnimationFrame(animate);

        // Cardiac systole/diastole physiological pulsing
        const t = timestamp * 0.001;
        const bps = (pulseRateRef.current || 75) / 60;
        const cardiacCycle = Math.pow(Math.max(0, Math.sin(t * bps * Math.PI * 2)), 6);
        const pulseFactor = 1 + cardiacCycle * 0.038;

        if (ventricularGroupRef.current) {
          ventricularGroupRef.current.scale.set(pulseFactor, 1 + cardiacCycle * 0.015, pulseFactor);
        }

        controls?.update();
        renderer?.render(scene, camera);
      };
      frameId = window.requestAnimationFrame(animate);

      return () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver?.disconnect();
        if (typeof ResizeObserver === 'undefined') window.removeEventListener('resize', resize);
        renderer?.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer?.domElement.removeEventListener('pointermove', onPointerMove);
        renderer?.domElement.removeEventListener('pointerup', onPointerUp);
        renderer?.domElement.removeEventListener('pointerleave', onPointerLeave);
        renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
        controls?.dispose();
        if (root) disposeObject(root);
        renderer?.dispose();
        renderer?.forceContextLoss();
        if (renderer?.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
        structuresRef.current = {};
        ventricularGroupRef.current = null;
        pickMeshesRef.current = [];
        controlsRef.current = null;
      };
    } catch (error) {
      renderer?.dispose();
      setWebglAvailable(false);
      setRenderError(
        error instanceof Error
          ? `WebGL rendering is not available: ${error.message}`
          : 'WebGL rendering is not available in this browser.'
      );
      setIsLoading(false);
      mount.replaceChildren();
      return () => {
        if (renderer) renderer.dispose();
      };
    }
  }, []);

  // Update dynamic vessel colors based on predicted risk & selection
  useEffect(() => {
    Object.entries(structuresRef.current).forEach(([key, group]) => {
      if (key === selectedStructure) {
        setGroupEmissive(group, HIGHLIGHT, 0.45);
      } else if (key === hoveredStructure) {
        setGroupEmissive(group, HOVER, 0.35);
      } else if (['LAD', 'LCX', 'RCA'].includes(key) && prediction?.vessels?.[key]) {
        // Vessel colors mapped to predicted risk band
        const vDetail = prediction.vessels[key];
        const hex = parseInt(vDetail.color_hex.replace('#', '0x'), 16);
        setGroupEmissive(group, hex, 0.28);
      } else if (key === 'VEINS' || key === 'PULMONARY' || key === 'SVC' || key === 'IVC') {
        setGroupEmissive(group, VEIN, 0.04);
      } else if (key === 'AORTA') {
        setGroupEmissive(group, 0xb83344, 0.05);
      } else {
        setGroupEmissive(group, ARTERY, 0.035);
      }
    });
  }, [selectedStructure, hoveredStructure, prediction]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = isAutoRotate;
  }, [isAutoRotate]);

  const targetOutput =
    selectedVessel && TARGETS.includes(selectedVessel as (typeof TARGETS)[number])
      ? prediction?.vessels?.[selectedVessel]
      : undefined;
  const currentStructure = TARGET_INFO[selectedStructure] ?? TARGET_INFO.HEART;
  const selectedTargetName = selectedVessel ?? 'No target selected';
  const score =
    targetOutput && Number.isFinite(targetOutput.probability)
      ? `${(targetOutput.probability * 100).toFixed(1)}%`
      : null;
  const structureKeys = useMemo(() => STRUCTURE_OPTIONS.flatMap((group) => group.keys), []);

  const selectTarget = (target: string) => {
    setSelectedStructure(target === 'CAD' ? 'HEART' : target);
    if (selectedVessel !== target) onSelectVessel(target);
  };

  const setCameraView = (nextView: ViewKey) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const positions: Record<ViewKey, [number, number, number]> = {
      Anterior: [0, 0.2, 10.2],
      Posterior: [0, 0.2, -10.2],
      Left: [-10.2, 0.15, 0],
      Right: [10.2, 0.15, 0],
      Superior: [0, 10.2, 0.01],
    };
    camera.up.set(0, 1, 0);
    if (nextView === 'Superior') camera.up.set(0, 0, -1);
    camera.position.set(...positions[nextView]);
    controls.target.set(0, 0.15, 0);
    controls.update();
    setView(nextView);
  };

  const zoom = (factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const direction = camera.position.clone().sub(controls.target);
    direction.multiplyScalar(factor);
    const distance = THREE.MathUtils.clamp(
      direction.length(),
      controls.minDistance,
      controls.maxDistance
    );
    direction.setLength(distance);
    camera.position.copy(controls.target).add(direction);
    controls.update();
  };

  const structureSelector = (
    <label className="flex items-center gap-2 text-xs text-slate-300">
      <span className="sr-only">Select anatomical structure</span>
      <select
        aria-label="Select anatomical structure"
        value={
          selectedStructure === 'HEART' || structureKeys.includes(selectedStructure)
            ? selectedStructure
            : ''
        }
        onChange={(event) => {
          const key = event.target.value;
          if (!key) return;
          setSelectedStructure(key);
          if (TARGETS.includes(key as (typeof TARGETS)[number]) && selectedVessel !== key)
            onSelectVessel(key);
        }}
        className="max-w-[210px] rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        <option value="HEART">Heart overview (clear structure focus)</option>
        {STRUCTURE_OPTIONS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.keys.map((key) => (
              <option key={key} value={key}>
                {TARGET_INFO[key].name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );

  return (
    <section className="w-full space-y-3" aria-label="Interactive schematic heart viewer">
      <div className="relative h-[480px] sm:h-[540px] lg:h-[580px] w-full overflow-hidden rounded-2xl border border-slate-700 bg-[#0c1322] shadow-xl">
        <div ref={mountRef} className="absolute inset-0" />
        {(isLoading || renderError) && (
          <div
            role={renderError ? 'alert' : 'status'}
            className="absolute inset-0 z-20 grid place-items-center bg-[#0c1322]/95 p-6 text-center"
          >
            <div className="max-w-sm space-y-2">
              <div className="text-sm font-semibold text-white">
                {renderError ? '3D view unavailable' : 'Preparing schematic heart…'}
              </div>
              {renderError && (
                <p className="text-xs text-slate-300">
                  {renderError} Use the anatomy selector and target buttons below to inspect the
                  available descriptions.
                </p>
              )}
              {renderError && !webglAvailable && (
                <p className="text-xs text-slate-400">
                  Enable WebGL or try an up-to-date browser with graphics acceleration.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 shadow-lg backdrop-blur">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-100">
              3D Heart Reference • Hemodynamic View
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">
              Entered pulse: {pulseRate} bpm • Live cardiac cycle simulation
            </div>
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 rounded-xl border border-slate-700/80 bg-slate-950/85 p-1 shadow-lg backdrop-blur">
            <label className="sr-only" htmlFor="heart-view-select">
              Camera view
            </label>
            <select
              id="heart-view-select"
              aria-label="Camera view"
              value={view}
              onChange={(event) => setCameraView(event.target.value as ViewKey)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              {(['Anterior', 'Posterior', 'Left', 'Right', 'Superior'] as ViewKey[]).map(
                (option) => (
                  <option key={option}>{option}</option>
                )
              )}
            </select>
            <button
              type="button"
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => zoom(0.84)}
              className="rounded-lg p-1.5 text-slate-200 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => zoom(1.19)}
              className="rounded-lg p-1.5 text-slate-200 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-pressed={isAutoRotate}
              aria-label={isAutoRotate ? 'Pause auto-rotation' : 'Start auto-rotation'}
              onClick={() => setIsAutoRotate((value) => !value)}
              className={`rounded-lg p-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                isAutoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Reset camera"
              title="Reset camera"
              onClick={() => setCameraView('Anterior')}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-[10px] text-slate-200 shadow-lg backdrop-blur"
          aria-label="Anatomy color legend"
        >
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Myocardium
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Coronary Arteries (Risk Color)
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            Veins & Pulmonary
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Selected Target
          </span>
        </div>

        <div className="absolute bottom-3 right-3 z-10 hidden rounded-lg bg-slate-950/75 px-2 py-1 text-[10px] text-slate-400 md:block">
          Drag to rotate • Wheel or pinch to zoom
        </div>
      </div>

      <div className="clinical-card space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Coronary Vessel Target Selection
          </h3>
          {structureSelector}
        </div>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Select prediction target">
          {TARGETS.map((target) => {
            const vData = prediction?.vessels?.[target];
            const isSelected = selectedVessel === target;
            return (
              <button
                key={target}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectTarget(target)}
                className={`rounded-lg border px-2 py-2 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-glow-cyan'
                    : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{target}</span>
                {vData && (
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                    style={{ color: vData.color_hex }}
                  >
                    {vData.percentage}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(160px,auto)] sm:items-start">
          <div aria-live="polite">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Camera className="h-4 w-4 text-cyan-300" />
              {currentStructure.name}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {currentStructure.description}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Selection focuses anatomy in the 3D viewport and updates attribution insights.
            </p>
          </div>
          <div className="rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-xs">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Target: {selectedTargetName}
            </div>
            {score ? (
              <div className="mt-1 font-semibold text-cyan-200 flex items-center justify-between">
                <span>Model Output:</span>
                <span className="font-mono text-base font-bold text-cyan-300">{score}</span>
              </div>
            ) : (
              <div className="mt-1 font-semibold text-slate-300">Model output: Ready</div>
            )}
            <div className="mt-1 text-[10px] leading-snug text-slate-400">
              Statistical model output; procedural visualization, not patient-specific imaging.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
