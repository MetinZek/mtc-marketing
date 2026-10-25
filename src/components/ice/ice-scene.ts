import {
  CanvasTexture,
  Color,
  DirectionalLight,
  FrontSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
  type BufferGeometry,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * The MTC ice cube: a real-time WebGL scene, client-only and loaded on
 * demand by IceCube.tsx. A rounded cube of "ice" (physical transmission
 * with dispersion, a procedural frost roughness map and a faint blue
 * attenuation) holds four coloured cores, one per discipline, and a few
 * air bubbles. Coloured light spills onto an invisible floor beneath it.
 *
 * Nothing animates on its own here. The component computes a frame (yaw,
 * pitch, lift, core weights, ground colour) and calls draw(); this module
 * only renders what it is given, so the render loop can stop entirely when
 * nothing changes or the canvas is off screen.
 */

export type IceQuality = "high" | "low";

export type IceFrame = {
  /** Turntable rotation, radians. Core i faces the camera at yaw = -i·π/2. */
  yaw: number;
  /** Extra pitch toward the pointer, radians. */
  pitch: number;
  /** Vertical float, world units. */
  lift: number;
  /** Brightness of each core, 0..1, in service order. */
  weights: readonly number[];
  /** Ground colour around the cube, as #rrggbb. Must match the page behind. */
  ground: string;
};

export type IceScene = {
  draw(frame: IceFrame): void;
  setSize(width: number, height: number, pixelRatio: number): void;
  /** Renders the frame and returns it as a data URL (poster capture). */
  capture(frame: IceFrame, type?: string, quality?: number): string;
  dispose(): void;
};

const CUBE_SIZE = 2;
const CORE_RADIUS = 0.24;
const CORE_OFFSET = 0.38;
/** Heights of the four cores, so they read as a loose cluster frozen at
 * different depths rather than one flat ring. */
const CORE_HEIGHTS = [0.2, -0.16, 0.08, -0.26];
const FLOOR_Y = -1.62;
const BASE_TILT_X = 0.3;
const BASE_TILT_Z = 0.16;

/** Deterministic PRNG so the frost and bubbles are identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Frost: patches of clear and milky ice plus fine scratches, as a
 * roughness map (three reads the green channel). */
function frostTexture(size: number): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(7);

  ctx.fillStyle = "rgb(118,118,118)";
  ctx.fillRect(0, 0, size, size);

  // Soft milky patches.
  for (let i = 0; i < 46; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.05 + rand() * 0.18);
    const v = Math.round(90 + rand() * 150);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${v},${v},${v},0.55)`);
    g.addColorStop(1, `rgba(${v},${v},${v},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Hairline scratches and fracture lines.
  ctx.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = size * (0.03 + rand() * 0.16);
    const a = rand() * Math.PI;
    const v = Math.round(150 + rand() * 105);
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.25 + rand() * 0.45})`;
    ctx.lineWidth = 0.6 + rand() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/** A white radial falloff used for every soft light and shadow plane. */
function glowTexture(size: number): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(0.7, "rgba(255,255,255,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createIceScene(
  canvas: HTMLCanvasElement,
  { quality, hues, ground }: { quality: IceQuality; hues: readonly string[]; ground: string },
): IceScene {
  const high = quality === "high";
  const renderer = new WebGLRenderer({
    canvas,
    antialias: high,
    alpha: false,
    powerPreference: high ? "high-performance" : "default",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.transmissionResolutionScale = high ? 1 : 0.6;

  const scene = new Scene();
  const groundColor = new Color(ground);
  scene.background = groundColor;
  let lastGround = ground;

  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 1.05;

  const camera = new PerspectiveCamera(27, 1, 0.1, 50);
  camera.position.set(0, 1.35, 8.4);
  camera.lookAt(0, -0.32, 0);

  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 5, 4);
  scene.add(key);

  // Disposables, collected as they are created.
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [environment];
  const track = <T extends BufferGeometry | Material | Texture>(item: T): T => {
    if ("isBufferGeometry" in item) geometries.push(item as BufferGeometry);
    else if ("isMaterial" in item) materials.push(item as Material);
    else textures.push(item as Texture);
    return item;
  };

  // ---- the cube ------------------------------------------------------
  const turntable = new Group();
  const tilt = new Group();
  tilt.rotation.set(BASE_TILT_X, 0, BASE_TILT_Z);
  turntable.add(tilt);
  scene.add(turntable);

  const frost = track(frostTexture(high ? 512 : 256));
  const ice = track(
    new MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 1.6,
      ior: 1.31,
      dispersion: high ? 1.2 : 0,
      roughness: 0.78,
      roughnessMap: frost,
      metalness: 0,
      attenuationColor: new Color("#cfe2ff"),
      attenuationDistance: 3.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.06,
      specularIntensity: 1,
      envMapIntensity: 1.15,
      side: FrontSide,
    }),
  );
  const cube = new Mesh(track(new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, high ? 7 : 4, 0.24)), ice);
  tilt.add(cube);

  // ---- four coloured cores ---------------------------------------------
  const coreGeometry = track(new SphereGeometry(CORE_RADIUS, high ? 48 : 24, high ? 32 : 16));
  const cores = hues.slice(0, 4).map((hue, i) => {
    const material = track(
      new MeshStandardMaterial({
        color: new Color(hue),
        emissive: new Color(hue),
        emissiveIntensity: 0.6,
        roughness: 0.18,
        metalness: 0,
      }),
    );
    const mesh = new Mesh(coreGeometry, material);
    const angle = (i * Math.PI) / 2;
    mesh.position.set(Math.sin(angle) * CORE_OFFSET, CORE_HEIGHTS[i] ?? 0, Math.cos(angle) * CORE_OFFSET);
    tilt.add(mesh);
    return { mesh, material };
  });

  // ---- air bubbles -------------------------------------------------------
  const rand = mulberry32(21);
  const bubbleCount = high ? 30 : 14;
  const bubbles = new InstancedMesh(
    track(new SphereGeometry(1, 10, 8)),
    track(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.12, metalness: 0, emissive: 0xe8f1ff, emissiveIntensity: 0.35 })),
    bubbleCount,
  );
  const m = new Matrix4();
  const q = new Quaternion();
  for (let i = 0; i < bubbleCount; i++) {
    const s = 0.012 + rand() ** 2 * 0.045;
    const p = new Vector3((rand() - 0.5) * 1.5, (rand() - 0.5) * 1.5, (rand() - 0.5) * 1.5);
    m.compose(p, q, new Vector3(s, s, s));
    bubbles.setMatrixAt(i, m);
  }
  tilt.add(bubbles);

  // ---- floor light ---------------------------------------------------
  const glow = track(glowTexture(128));
  const planeGeometry = track(new PlaneGeometry(1, 1));
  const floor = new Group();
  floor.position.y = FLOOR_Y;
  scene.add(floor);

  const shadow = new Mesh(
    planeGeometry,
    track(
      new MeshBasicMaterial({
        map: glow,
        color: new Color("#0b1a3a"),
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(3.4, 2.6, 1);
  floor.add(shadow);

  const spill = new Group();
  floor.add(spill);
  const spills = hues.slice(0, 4).map((hue, i) => {
    const material = track(
      new MeshBasicMaterial({
        map: glow,
        color: new Color(hue),
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const mesh = new Mesh(planeGeometry, material);
    const angle = (i * Math.PI) / 2;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(Math.sin(angle) * 0.95, 0.002 + i * 0.0005, Math.cos(angle) * 0.95);
    mesh.scale.set(2.5, 2.5, 1);
    spill.add(mesh);
    return material;
  });

  // ---- frame ---------------------------------------------------------
  function apply(frame: IceFrame) {
    turntable.rotation.y = frame.yaw;
    turntable.position.y = frame.lift;
    tilt.rotation.x = BASE_TILT_X + frame.pitch;
    spill.rotation.y = frame.yaw;
    // The shadow tightens and darkens as the cube settles toward the floor.
    shadow.material.opacity = 0.16 - frame.lift * 0.12;

    cores.forEach(({ mesh, material }, i) => {
      const w = frame.weights[i] ?? 0.5;
      material.emissiveIntensity = 0.25 + 1.5 * w;
      mesh.scale.setScalar(0.62 + 0.5 * w);
    });
    spills.forEach((material, i) => {
      material.opacity = 0.05 + 0.4 * (frame.weights[i] ?? 0.5);
    });

    if (frame.ground !== lastGround) {
      groundColor.set(frame.ground);
      lastGround = frame.ground;
    }
  }

  return {
    draw(frame) {
      apply(frame);
      renderer.render(scene, camera);
    },
    setSize(width, height, pixelRatio) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    capture(frame, type = "image/webp", quality = 0.92) {
      apply(frame);
      renderer.render(scene, camera);
      return canvas.toDataURL(type, quality);
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((mat) => mat.dispose());
      textures.forEach((t) => t.dispose());
      bubbles.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
