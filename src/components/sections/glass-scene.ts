import {
  AdditiveBlending,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  Vector2,
  Vector3,
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
 * with only a faint cool cast. A pane that is clicked or tapped breaks into
 * shards that fly apart and fall, and a new one grows in its place.
 * Rendering is driven from outside (GSAP's ticker), so nothing runs while
 * the section is off screen.
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
  /** Whether a whole pane is under this point of the canvas (CSS px). */
  hit(x: number, y: number): boolean;
  /** Breaks the pane under this point of the canvas (CSS px), if any. */
  shatter(x: number, y: number): boolean;
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
  /** Side length in world units. */
  size: number;
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
  /** After a break: when the new pane starts to grow (seconds), else 0. */
  regrowAt: number;
};

/** One break: its shards, flying and falling, and their shared fade. */
type Burst = {
  shards: { mesh: Mesh; velocity: Vector3; spin: Vector3 }[];
  material: ShaderMaterial;
  born: number;
};

const FOV = 32;
const CAMERA_Z = 14;

/** Half the pane's side and its corner radius, before the bevel. */
const HALF = 0.5;
const CORNER = 0.085;

/** The pane's outline: a square with little rounded corners. */
function paneShape() {
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
  return shape;
}

/** A pane: the outline as a thin slab, softly bevelled. */
function paneGeometry() {
  const geometry = new ExtrudeGeometry(paneShape(), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.014,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geometry.center();
  smoothSides(geometry);
  return geometry;
}

/**
 * ExtrudeGeometry shades its bevel and corners in flat facets, which flicker
 * as the panes turn. Average the side normals wherever facets meet (the
 * faces stay flat), so the edges catch light as one smooth curve.
 */
function smoothSides(geometry: ExtrudeGeometry) {
  const sides = geometry.groups.find((g) => g.materialIndex === 1);
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  if (!sides || !position || !normal) return;
  const key = (i: number) => `${position.getX(i).toFixed(4)},${position.getY(i).toFixed(4)},${position.getZ(i).toFixed(4)}`;
  const sums = new Map<string, [number, number, number]>();
  const end = sides.start + sides.count;
  for (let i = sides.start; i < end; i++) {
    const sum = sums.get(key(i)) ?? [0, 0, 0];
    sum[0] += normal.getX(i);
    sum[1] += normal.getY(i);
    sum[2] += normal.getZ(i);
    sums.set(key(i), sum);
  }
  for (let i = sides.start; i < end; i++) {
    const [x, y, z] = sums.get(key(i))!;
    const length = Math.hypot(x, y, z) || 1;
    normal.setXYZ(i, x / length, y / length, z / length);
  }
  normal.needsUpdate = true;
}

/**
 * Breaks a pane at `impact` (in its own units): cracks run from the impact
 * to the outline in 7 to 10 directions, and a ring crack splits each wedge
 * in two. The shards come back as thin slabs centred on themselves, with
 * where each sat on the pane (`paneXY`, so the rim light stays put) and
 * its centre on the pane.
 */
function fracture(impact: Vector2) {
  const outline = paneShape().getSpacedPoints(84);
  outline.pop();
  const count = outline.length;
  const angle = (p: Vector2) => Math.atan2(p.y - impact.y, p.x - impact.x);
  const rays = 7 + Math.floor(Math.random() * 4);
  const start = Math.random() * Math.PI * 2;
  const cuts = new Set<number>();
  for (let k = 0; k < rays; k++) {
    const aim = start + (k + 0.2 + Math.random() * 0.6) * ((Math.PI * 2) / rays);
    let best = 0;
    let bestGap = Infinity;
    outline.forEach((point, i) => {
      const gap = Math.abs(((angle(point) - aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    cuts.add(best);
  }
  let ordered = [...cuts].sort((a, b) => a - b);
  if (ordered.length < 3) ordered = [0, 1, 2, 3].map((q) => Math.floor((q * count) / 4));

  const polygons: Vector2[][] = [];
  ordered.forEach((from, k) => {
    const to = ordered[(k + 1) % ordered.length]!;
    const arc: Vector2[] = [];
    for (let i = from; ; i = (i + 1) % count) {
      arc.push(outline[i]!);
      if (i === to) break;
    }
    if (arc.length < 2) return;
    const ring = 0.3 + Math.random() * 0.28;
    const a = impact.clone().lerp(arc[0]!, ring);
    const b = impact.clone().lerp(arc[arc.length - 1]!, ring);
    polygons.push([impact.clone(), a, b], [a, ...arc, b]);
  });

  return polygons.map((polygon) => {
    const center = polygon.reduce((sum, p) => sum.add(p), new Vector2()).divideScalar(polygon.length);
    const geometry = new ExtrudeGeometry(new Shape(polygon.map((p) => p.clone().sub(center))), {
      depth: 0.06,
      bevelEnabled: false,
    });
    geometry.translate(0, 0, -0.03);
    const position = geometry.getAttribute("position");
    const paneXY = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i++) {
      paneXY[i * 2] = position.getX(i) + center.x;
      paneXY[i * 2 + 1] = position.getY(i) + center.y;
    }
    geometry.setAttribute("paneXY", new Float32BufferAttribute(paneXY, 2));
    return { geometry, center };
  });
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

/** Shards light their rim from where they sat on the pane. */
const shardVertexShader = vertexShader
  .replace("varying vec3 vNormalW;", "attribute vec2 paneXY;\n  varying vec3 vNormalW;")
  .replace("vLocal = position.xy;", "vLocal = paneXY;");

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

  const tanHalf = Math.tan(MathUtils.degToRad(FOV / 2));
  const travelAt = (z: number) => Math.max(0.2, 0.35 + ((z + 7) / 10) * 0.6);

  // Placement: most panes to the right of the paragraph, the rest at the
  // left edge, none too close to another (in screen terms).
  const random = seeded(compact ? 11 : 7);
  const range = (min: number, max: number) => min + (max - min) * random();
  const sign = () => (random() < 0.5 ? -1 : 1);
  const count = compact ? 7 : 12;
  const specs: Omit<Pane, "mesh">[] = [];
  for (let i = 0; i < count; i++) {
    let nx = 0;
    let ny = 0;
    for (let attempt = 0; attempt < 40; attempt++) {
      nx = compact ? range(-1, 1) : random() < 0.7 ? range(0.32, 1.05) : range(-1.1, -0.72);
      ny = range(-1.15, 1.15);
      if (specs.every((p) => Math.hypot(p.nx - nx, p.ny - ny) > (compact ? 0.55 : 0.36))) break;
    }
    const z = range(-7, 3);
    specs.push({
      nx,
      ny,
      z,
      size: range(compact ? 0.8 : 0.75, compact ? 1.5 : 2) * (1 + -Math.min(z, 0) * 0.07),
      rx: range(-0.6, 0.6),
      ry: range(-0.9, 0.9),
      rz: range(-0.5, 0.5),
      turnX: sign() * range(0.6, 1.5),
      turnY: sign() * range(0.8, 2.1),
      spin: sign() * range(0.02, 0.07),
      phase: range(0, Math.PI * 2),
      travel: travelAt(z),
      regrowAt: 0,
    });
  }

  // Panes never pass through one another, whatever they turn to: where two
  // could come within reach of each other anywhere along the section's
  // scroll (checked on the narrowest screen of the kind), the farther one
  // steps back and grows to keep its size on screen.
  const narrowest = compact ? 0.42 : 0.7;
  const reachOf = (p: Omit<Pane, "mesh">) => p.size * 0.76;
  const placeAt = (p: Omit<Pane, "mesh">, t: number) => {
    const halfH = tanHalf * (CAMERA_Z - p.z);
    return [p.nx * halfH * narrowest, p.ny * halfH + (t - 0.5) * p.travel * 2 * halfH, p.z];
  };
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (let i = 0; i < specs.length; i++) {
      for (let j = i + 1; j < specs.length; j++) {
        const a = specs[i]!;
        const b = specs[j]!;
        let closest = Infinity;
        for (let step = 0; step <= 16; step++) {
          const [ax, ay, az] = placeAt(a, step / 16);
          const [bx, by, bz] = placeAt(b, step / 16);
          closest = Math.min(closest, Math.hypot(ax! - bx!, ay! - by!, az! - bz!));
        }
        const needed = reachOf(a) + reachOf(b) + 0.25;
        if (closest >= needed) continue;
        const far = a.z < b.z ? a : b;
        const depth = CAMERA_Z - far.z;
        far.z -= needed - closest + 0.1;
        far.size *= (CAMERA_Z - far.z) / depth;
        far.travel = travelAt(far.z);
        moved = true;
      }
    }
    if (!moved) break;
  }

  const panes: Pane[] = specs.map((spec) => {
    const mesh = new Mesh(geometry, material);
    mesh.scale.setScalar(spec.size);
    group.add(mesh);
    return { ...spec, mesh };
  });
  let progress = 0;
  let shownProgress = 0;
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  let startedAt = -1;
  let lastTime = 0;
  let destroyed = false;
  const bursts: Burst[] = [];
  const raycaster = new Raycaster();
  const aimAt = new Vector2();

  /** The whole pane under a point of the canvas (CSS px), and where it was hit. */
  const paneAt = (x: number, y: number) => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return null;
    aimAt.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    raycaster.setFromCamera(aimAt, camera);
    const whole = panes.filter((p) => p.mesh.visible && !p.regrowAt);
    const [first] = raycaster.intersectObjects(
      whole.map((p) => p.mesh),
      false,
    );
    const pane = first && whole.find((p) => p.mesh === first.object);
    return pane ? { pane, point: first.point } : null;
  };

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
      const dt = lastTime ? Math.min(0.05, Math.max(0, time - lastTime)) : 0;
      lastTime = time;
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
        // A broken pane grows back from nothing after a pause.
        if (p.regrowAt) {
          const grown = (time - p.regrowAt) / 1.3;
          p.mesh.visible = grown > 0;
          if (grown >= 1) {
            p.regrowAt = 0;
            p.mesh.scale.setScalar(p.size);
          } else if (grown > 0) {
            p.mesh.scale.setScalar(p.size * Math.max(0.001, 1 - Math.pow(1 - grown, 3)));
          }
        }
      }

      const opacity = Math.min(1, (time - startedAt) / 1.2);
      material.uniforms.uOpacity!.value = opacity;

      // Shards fly apart, fall and fade out.
      for (let i = bursts.length - 1; i >= 0; i--) {
        const burst = bursts[i]!;
        const age = time - burst.born;
        burst.material.uniforms.uOpacity!.value = opacity * (1 - MathUtils.smoothstep(age, 0.9, 1.8));
        for (const shard of burst.shards) {
          shard.velocity.y -= 5.5 * dt;
          shard.mesh.position.addScaledVector(shard.velocity, dt);
          shard.mesh.rotation.x += shard.spin.x * dt;
          shard.mesh.rotation.y += shard.spin.y * dt;
          shard.mesh.rotation.z += shard.spin.z * dt;
        }
        if (age > 1.8) {
          burst.shards.forEach(({ mesh }) => {
            scene.remove(mesh);
            mesh.geometry.dispose();
          });
          burst.material.dispose();
          bursts.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    },
    hit(x, y) {
      return Boolean(paneAt(x, y));
    },
    shatter(x, y) {
      const found = paneAt(x, y);
      if (!found) return false;
      const { pane, point } = found;
      pane.mesh.updateMatrixWorld();
      const impact = pane.mesh.worldToLocal(point.clone());
      const shardMaterial = new ShaderMaterial({
        vertexShader: shardVertexShader,
        fragmentShader,
        uniforms: {
          uOpacity: { value: material.uniforms.uOpacity!.value },
          uViewport: material.uniforms.uViewport!,
          uTextRight: material.uniforms.uTextRight!,
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
      });
      const shards = fracture(new Vector2(impact.x, impact.y)).map(({ geometry: piece, center }) => {
        const mesh = new Mesh(piece, shardMaterial);
        new Matrix4()
          .multiplyMatrices(pane.mesh.matrixWorld, new Matrix4().makeTranslation(center.x, center.y, 0))
          .decompose(mesh.position, mesh.quaternion, mesh.scale);
        scene.add(mesh);
        // Outward from the impact, nearer shards faster, a little toward the viewer.
        const out = mesh.position.clone().sub(point).setZ(0);
        const near = 1 - Math.min(out.length() / pane.size, 1);
        out.normalize();
        return {
          mesh,
          velocity: out
            .multiplyScalar(0.7 + Math.random() * 1.2 + near * 0.8)
            .add(new Vector3((Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 1.2, 0.5 + Math.random() * 1.4)),
          spin: new Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4),
        };
      });
      bursts.push({ shards, material: shardMaterial, born: lastTime });
      pane.mesh.visible = false;
      pane.regrowAt = lastTime + 2.4;
      return true;
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
      bursts.forEach((burst) => {
        burst.shards.forEach(({ mesh }) => mesh.geometry.dispose());
        burst.material.dispose();
      });
      bursts.length = 0;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
