import { DoubleSide, Group, MathUtils, Mesh, PerspectiveCamera, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Thin glass squares for the night chapter (see GlassSquares.tsx): a dozen
 * square panes, each a very thin rounded slab, drifting at different
 * depths. Scrolling through the section lifts them (nearer panes faster)
 * and turns them; a pointer tilts the whole group a little. One shared
 * geometry and one shader: faces stay almost clear, edges and grazing
 * angles catch a white studio light, so the panes read as glass on black
 * without colour. Rendering is driven from outside (GSAP's ticker), so
 * nothing runs while the section is off screen.
 */

export type GlassScene = {
  /** Draws one frame; `time` in seconds. */
  render(time: number): void;
  /** Scroll progress through the section, 0 to 1. */
  setProgress(progress: number): void;
  /** Pointer position across the window, -1 to 1 on both axes. */
  setPointer(x: number, y: number): void;
  destroy(): void;
};

type Options = {
  /** Phones: fewer, smaller panes and a lower pixel ratio. */
  compact: boolean;
  /** The WebGL context was lost; the caller shows the still instead. */
  onLost?: () => void;
};

type Pane = {
  mesh: Mesh;
  /** Position as a share of the visible half-width/height at its depth. */
  nx: number;
  ny: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  /** Extra turn over the whole section (radians). */
  turnX: number;
  turnY: number;
  /** Idle spin (radians per second) and bob phase. */
  spin: number;
  phase: number;
  /** Rise over the whole section, in visible heights. */
  travel: number;
};

const FOV = 32;
const CAMERA_Z = 14;

const vertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewW;
  varying vec3 vLocal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewW = cameraPosition - world.xyz;
    vLocal = position;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Faces: nearly clear, and never more than a faint sheen even when a
// studio light is reflected full on (white text runs over them). Edges:
// a hairline that catches the light, brightest at grazing angles.
const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vNormalW;
  varying vec3 vViewW;
  varying vec3 vLocal;

  float softbox(vec3 r, vec3 dir, float size, float soft) {
    return smoothstep(1.0 - size - soft, 1.0 - size, dot(r, normalize(dir)));
  }

  void main() {
    vec3 n = normalize(vNormalW);
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(vViewW);
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 3.0);
    vec3 r = reflect(-v, n);

    float env = softbox(r, vec3(0.35, 1.0, 0.45), 0.08, 0.14)
              + 0.7 * softbox(r, vec3(-1.0, 0.25, 0.35), 0.025, 0.05)
              + 0.45 * softbox(r, vec3(0.9, -0.45, 0.5), 0.02, 0.04);
    float rim = smoothstep(0.47, 0.5, max(abs(vLocal.x), abs(vLocal.y)));
    float face = min(0.03 + env * 0.26 + fresnel * 0.22, 0.3);
    float edge = rim * (0.35 + 0.6 * fresnel + 0.4 * env);
    float light = clamp(env + fresnel * 0.3 + rim, 0.0, 1.0);

    float alpha = clamp(face + edge, 0.0, 0.92) * uOpacity;
    vec3 color = mix(vec3(0.68, 0.72, 0.78), vec3(1.0), light);
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Small seeded generator, so the composition is the same on every visit. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGlassScene(host: HTMLElement, { compact, onLost }: Options): GlassScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.className = "glass-canvas";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.z = CAMERA_Z;
  const group = new Group();
  scene.add(group);

  const geometry = new RoundedBoxGeometry(1, 1, 0.028, 3, 0.012);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });

  // Placement: most panes to the right of the paragraph, the rest at the
  // left edge, none too close to another (in screen terms).
  const random = seeded(compact ? 11 : 7);
  const range = (min: number, max: number) => min + (max - min) * random();
  const sign = () => (random() < 0.5 ? -1 : 1);
  const count = compact ? 7 : 12;
  const panes: Pane[] = [];
  for (let i = 0; i < count; i++) {
    let nx = 0;
    let ny = 0;
    for (let attempt = 0; attempt < 40; attempt++) {
      nx = compact ? range(-1, 1) : random() < 0.7 ? range(0.32, 1.05) : range(-1.1, -0.72);
      ny = range(-1.15, 1.15);
      if (panes.every((p) => Math.hypot(p.nx - nx, p.ny - ny) > (compact ? 0.55 : 0.36))) break;
    }
    const z = range(-7, 3);
    const size = range(compact ? 0.8 : 0.75, compact ? 1.5 : 2) * (1 + -Math.min(z, 0) * 0.07);
    const mesh = new Mesh(geometry, material);
    mesh.scale.setScalar(size);
    group.add(mesh);
    panes.push({
      mesh,
      nx,
      ny,
      z,
      rx: range(-0.6, 0.6),
      ry: range(-0.9, 0.9),
      rz: range(-0.5, 0.5),
      turnX: sign() * range(0.6, 1.5),
      turnY: sign() * range(0.8, 2.1),
      spin: sign() * range(0.02, 0.07),
      phase: range(0, Math.PI * 2),
      travel: 0.35 + ((z + 7) / 10) * 0.6,
    });
  }

  const tanHalf = Math.tan(MathUtils.degToRad(FOV / 2));
  let progress = 0;
  let shownProgress = 0;
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  let startedAt = -1;
  let destroyed = false;

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    if (!destroyed) onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  return {
    render(time) {
      if (destroyed) return;
      if (startedAt < 0) startedAt = time;
      shownProgress += (progress - shownProgress) * 0.12;
      tilt.x += (pointer.x - tilt.x) * 0.05;
      tilt.y += (pointer.y - tilt.y) * 0.05;
      group.rotation.set(-tilt.y * 0.1, tilt.x * 0.16, 0);

      for (const p of panes) {
        const halfH = tanHalf * (CAMERA_Z - p.z);
        const halfW = halfH * camera.aspect;
        p.mesh.position.set(
          p.nx * halfW,
          p.ny * halfH + (shownProgress - 0.5) * p.travel * 2 * halfH + Math.sin(time * 0.4 + p.phase) * 0.08,
          p.z,
        );
        p.mesh.rotation.set(
          p.rx + shownProgress * p.turnX + Math.sin(time * 0.3 + p.phase) * 0.05,
          p.ry + shownProgress * p.turnY + time * p.spin,
          p.rz,
        );
      }

      material.uniforms.uOpacity!.value = Math.min(1, (time - startedAt) / 1.2);
      renderer.render(scene, camera);
    },
    setProgress(value) {
      progress = value;
      // The first frame starts where the page already is.
      if (startedAt < 0) shownProgress = value;
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    destroy() {
      destroyed = true;
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
