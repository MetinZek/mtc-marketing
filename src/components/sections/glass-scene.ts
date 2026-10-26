import {
  AdditiveBlending,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Shape,
  Vector2,
  WebGLRenderer,
} from "three";

/**
 * Glass squares for the night chapter (see GlassSquares.tsx): a dozen
 * square panes with little rounded corners, each a thin bevelled slab,
 * drifting at different depths. Scrolling through the section lifts them
 * (nearer panes faster) and turns them; a pointer tilts the whole group a
 * little. One shared geometry and one shader that treats them as clear
 * glass in a small studio: the faces show soft light through themselves,
 * the bevels and edges catch it brightly and split it a little by colour,
 * with only a faint cool cast. Rendering is driven from outside (GSAP's
 * ticker), so nothing runs while the section is off screen.
 */

export type GlassScene = {
  /** Draws one frame; `time` in seconds. */
  render(time: number): void;
  /** Scroll progress through the section, 0 to 1. */
  setProgress(progress: number): void;
  /** Where the paragraph ends, as a share of the canvas width from the
   * left: faces left of it stay faint so the text reads over them. */
  setTextRight(share: number): void;
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

/** Half the pane's side and its corner radius, before the bevel. */
const HALF = 0.5;
const CORNER = 0.085;

/** A square pane with little rounded corners: a thin slab, softly bevelled. */
function paneGeometry() {
  const shape = new Shape();
  shape.moveTo(-HALF + CORNER, -HALF);
  shape.lineTo(HALF - CORNER, -HALF);
  shape.absarc(HALF - CORNER, -HALF + CORNER, CORNER, -Math.PI / 2, 0, false);
  shape.lineTo(HALF, HALF - CORNER);
  shape.absarc(HALF - CORNER, HALF - CORNER, CORNER, 0, Math.PI / 2, false);
  shape.lineTo(-HALF + CORNER, HALF);
  shape.absarc(-HALF + CORNER, HALF - CORNER, CORNER, Math.PI / 2, Math.PI, false);
  shape.lineTo(-HALF, -HALF + CORNER);
  shape.absarc(-HALF + CORNER, -HALF + CORNER, CORNER, Math.PI, Math.PI * 1.5, false);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.014,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

const vertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vNormalL;
  varying vec3 vViewW;
  varying vec2 vLocal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vNormalL = normal;
    vViewW = cameraPosition - world.xyz;
    vLocal = position.xy;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Clear glass in a small studio, added as light over the black page. The
// faces show the studio through themselves (bent, and split a little by
// colour) with a soft band of light that slides across as the pane turns;
// where they pass behind the paragraph (left of uTextRight) they are held
// to a faint sheen so white text stays readable. The bevels, the slab's
// edge and a band just inside the outline carry the bright light. The
// cast is only faintly cool.
const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform vec2 uViewport;
  uniform float uTextRight;
  varying vec3 vNormalW;
  varying vec3 vNormalL;
  varying vec3 vViewW;
  varying vec2 vLocal;

  float softbox(vec3 d, vec3 dir, float from, float to) {
    return smoothstep(from, to, dot(d, normalize(dir)));
  }

  // A wide soft light overhead, strip lights to the sides, one low behind
  // the panes, and a dim cool fill.
  float studio(vec3 d) {
    return 0.03 + 0.04 * smoothstep(-0.2, 1.0, d.y)
      + 1.1 * softbox(d, vec3(0.3, 1.0, 0.45), 0.74, 0.93)
      + 0.9 * softbox(d, vec3(-1.0, 0.2, 0.3), 0.93, 0.985)
      + 0.6 * softbox(d, vec3(1.0, -0.15, 0.55), 0.95, 0.99)
      + 0.7 * softbox(d, vec3(-0.3, 0.4, -1.0), 0.9, 0.975);
  }

  float roundRect(vec2 p, float halfSide, float radius) {
    vec2 q = abs(p) - vec2(halfSide - radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  void main() {
    vec3 n = normalize(vNormalW);
    float side = gl_FrontFacing ? 1.0 : 0.55;
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(vViewW);
    vec3 incoming = -v;
    float facing = clamp(dot(n, v), 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 5.0);

    float mirror = studio(reflect(incoming, n));
    vec3 through = vec3(
      studio(refract(incoming, n, 1.0 / 1.45)),
      studio(refract(incoming, n, 1.0 / 1.5)),
      studio(refract(incoming, n, 1.0 / 1.55))
    );

    vec3 tint = vec3(0.9, 0.95, 1.0);
    vec3 edgeTint = vec3(0.86, 0.94, 1.0);
    float bevel = 1.0 - abs(normalize(vNormalL).z);
    float rim = 1.0 - smoothstep(0.0, 0.06, -roundRect(vLocal, ${HALF.toFixed(3)}, ${CORNER.toFixed(3)}));
    float sweep = dot(vLocal, vec2(0.7071)) + (n.x - n.y) * 0.9;
    float band = exp(-pow(sweep * 3.4, 2.0)) + 0.5 * exp(-pow((sweep - 0.24) * 8.0, 2.0));

    vec3 face = tint * through * 0.12 * (1.0 - fresnel) + vec3(mirror) * fresnel + tint * band * 0.32;
    float overText = 1.0 - smoothstep(uTextRight, uTextRight + 0.1, gl_FragCoord.x / uViewport.x);
    face *= min(1.0, mix(0.42, 0.15, overText) / max(dot(face, vec3(0.3333)), 1e-4));
    vec3 edge = edgeTint * (through * 0.9 + mirror) * bevel
              + edgeTint * rim * (0.06 + 0.6 * fresnel + 0.3 * mirror + 0.25 * band);

    gl_FragColor = vec4((face + edge) * side * uOpacity, 1.0);
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

  const geometry = paneGeometry();
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uOpacity: { value: 0 },
      uViewport: { value: new Vector2(1, 1) },
      uTextRight: { value: compact ? 1 : 0.7 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
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
    renderer.getDrawingBufferSize(material.uniforms.uViewport!.value);
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
    setTextRight(share) {
      material.uniforms.uTextRight!.value = share;
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
