import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "@/lib/gsap";
import { WALL, type FloorPlan, type Rect, type RoomKind, type OutdoorKind } from "../data/plans";
import { furnish, type Finish, type Piece } from "../data/furniture";
import type { Status } from "../data/inventory";

/**
 * One floor as an architectural maquette: the slab, floors finished by
 * room, walls cut at 2.3 m with dark section caps, floor-to-ceiling glass,
 * brick balcony parapets with planting, and the furniture, all built from
 * the plan (src/troy/data). Seen through an orthographic camera from the
 * front, it can be turned a little with a mouse. Homes are picked by
 * pointing at them; the labels the page lays over the canvas are moved to
 * follow their anchors on every frame. Renders on demand only.
 */

const CM = 0.01;
const CUT = 2.3;

const C = (hex: number) => new THREE.Color(hex);

const FLOOR: Record<RoomKind | OutdoorKind | "corridor" | "core", number> = {
  living: 0xd8c09d,
  bedroom: 0xd8c09d,
  hall: 0xd8c09d,
  passage: 0xd8c09d,
  kitchen: 0xe6e0d6,
  bath: 0xdde2e1,
  balcony: 0xcdb99f,
  terrace: 0xcdb99f,
  corridor: 0xe7e2da,
  core: 0xd6cfc5,
};

const FINISH: Record<Finish, number> = {
  white: 0xf7f3ed,
  linen: 0xe8ddcd,
  fabric: 0xdfd4c4,
  woodDark: 0x7b5c44,
  woodLight: 0xc9a77f,
  black: 0x2a2522,
  green: 0x6f8f4c,
  greenDark: 0x4d6c3a,
  stone: 0xbab1a6,
  brick: 0xa47852,
  steel: 0x9da2a4,
  grass: 0x89a466,
};

const PAINT = {
  slab: 0xebe5dc,
  slabEdge: 0xcfc5b8,
  wall: 0xf8f5f0,
  cap: 0x2d2621,
  brick: 0xa47852,
  brickCap: 0x8a6244,
  frame: 0x3b342e,
  glass: 0xc4dae2,
  sold: 0xd9d4cd,
  reserved: 0xe2d2b4,
  hover: 0xc28a52,
};

export type SceneEvents = {
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
};

type Pose = { phi: number; theta: number; zoom: number; tx: number; ty: number; tz: number };

const HOME_PHI = 0.88;
const HOME_THETA = -0.52;

export class FloorScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  private readonly controls: OrbitControls;
  private readonly sun: THREE.DirectionalLight;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly solid = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
  private readonly glass = new THREE.MeshStandardMaterial({
    color: PAINT.glass,
    transparent: true,
    opacity: 0.3,
    roughness: 0.08,
    metalness: 0.1,
    depthWrite: false,
  });
  private readonly hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
  private readonly ground: THREE.Mesh;
  private root = new THREE.Group();
  private walls = new THREE.Group();
  private furniture = new THREE.Group();
  private overlays = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>();
  private hits: THREE.Mesh[] = [];
  private plan: FloorPlan | null = null;
  private centre = new THREE.Vector3();
  private width = 1;
  private height = 1;
  private hovered: string | null = null;
  private selected: string | null = null;
  private frame = 0;
  private down: { x: number; y: number } | null = null;
  private pose: Pose = { phi: HOME_PHI, theta: HOME_THETA, zoom: 10, tx: 0, ty: 0, tz: 0 };
  private tween: gsap.core.Tween | null = null;
  private readonly fine: boolean;
  private readonly reduced: boolean;
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly labels: HTMLElement,
    private readonly events: SceneEvents,
  ) {
    this.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene.add(new THREE.HemisphereLight(0xfff8ef, 0xcfc3b2, 1.25));
    this.sun = new THREE.DirectionalLight(0xfff0dc, 2.3);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 3;
    this.scene.add(this.sun, this.sun.target);
    const fill = new THREE.DirectionalLight(0xdfe8ef, 0.4);
    fill.position.set(20, 14, -18);
    this.scene.add(fill);

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.13 }));
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.34;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground, this.root);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.55;
    this.controls.minPolarAngle = 0.45;
    this.controls.maxPolarAngle = 1.2;
    this.controls.minAzimuthAngle = -1.15;
    this.controls.maxAzimuthAngle = 0.85;
    this.controls.enabled = this.fine;
    // Touch screens: taps pick homes, swipes keep scrolling the page.
    if (!this.fine) canvas.style.touchAction = "pan-y";
    this.controls.addEventListener("change", this.invalidate);

    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("webglcontextlost", this.onContextLost);

    this.resize();
  }

  /** Show a floor; `intro` plays the arrival (walls rising, camera
   * settling from the facade). */
  setFloor(plan: FloorPlan, statuses: Record<string, Status>, intro: boolean) {
    this.clear();
    this.plan = plan;
    const b = plan.bounds;
    this.centre.set((b.x + b.w / 2) * CM, 0, (b.y + b.h / 2) * CM);
    this.build(plan, statuses);

    const size = Math.max(b.w, b.h) * CM;
    const s = this.sun.shadow.camera;
    s.left = -size * 0.75;
    s.right = size * 0.75;
    s.top = size * 0.75;
    s.bottom = -size * 0.75;
    s.updateProjectionMatrix();
    this.sun.position.set(-size * 0.45, size * 1.2, size * 0.7);

    const home = this.homePose();
    this.selected = null;
    this.hovered = null;
    if (intro && !this.reduced) {
      this.pose = { ...home, phi: 1.36, theta: -0.05, zoom: home.zoom * 1.5 };
      this.walls.scale.y = 0.02;
      this.furniture.scale.y = 0.001;
      this.applyPose();
      // Starts as the page fades the model in (FloorView waits 0.3 s).
      this.animateTo(home, 1.8, "expo.out", 0.3);
      gsap.to(this.walls.scale, { y: 1, duration: 1.5, delay: 0.4, ease: "expo.out", onUpdate: this.invalidate });
      gsap.to(this.furniture.scale, { y: 1, duration: 1.1, delay: 0.8, ease: "expo.out", onUpdate: this.invalidate });
    } else {
      this.pose = home;
      this.applyPose();
    }
  }

  setHover(id: string | null) {
    if (id === this.hovered) return;
    this.hovered = id;
    this.paintOverlays();
  }

  /** Frame one home, or the whole floor again with null. */
  setSelected(id: string | null) {
    if (id === this.selected) return;
    this.selected = id;
    this.paintOverlays();
    const unit = id ? this.plan?.units.find((u) => u.id === id) : null;
    this.animateTo(unit ? this.unitPose([unit.bounds, unit.outdoor]) : this.homePose(), 1.2, "expo.inOut");
  }

  resize() {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    // A ResizeObserver also reports the size it starts with: nothing to do.
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();
    if (this.plan) {
      const unit = this.selected ? this.plan.units.find((u) => u.id === this.selected) : null;
      const next = unit ? this.unitPose([unit.bounds, unit.outdoor]) : this.homePose();
      if (this.tween && this.tween.progress() < 1) {
        // Mid-flight (the arrival, or framing a home): land on the new
        // framing instead of freezing at the angle it had reached.
        this.animateTo(next, 0.8, "expo.out");
      } else {
        // At rest: keep the angle the visitor left it at, framed anew.
        this.pose = { ...next, phi: this.currentPhi(), theta: this.currentTheta() };
        this.applyPose();
      }
    }
    this.invalidate();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.tween?.kill();
    gsap.killTweensOf(this.walls.scale);
    gsap.killTweensOf(this.furniture.scale);
    this.clear();
    this.controls.removeEventListener("change", this.invalidate);
    this.controls.dispose();
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.solid.dispose();
    this.glass.dispose();
    this.hitMaterial.dispose();
    this.renderer.dispose();
  }

  // ---------------------------------------------------------------- build

  private build(plan: FloorPlan, statuses: Record<string, Status>) {
    const at = (x: number, y: number) => [x * CM - this.centre.x, y * CM - this.centre.z] as const;

    // Slab under the plate and the balconies.
    const slab: THREE.BufferGeometry[] = [];
    const slabRects: Rect[] = [{ x: 0, y: 0, w: plan.width, h: plan.depth }, ...plan.units.map((u) => u.outdoor)];
    for (const r of slabRects) slab.push(box(at, r, -0.32, 0, C(PAINT.slab), C(PAINT.slabEdge)));

    // Floor finishes; sold homes greyed, reserved ones paler.
    const floors: THREE.BufferGeometry[] = [];
    const tint = (hex: number, status: Status | undefined) =>
      status === "sold" ? C(hex).lerp(C(PAINT.sold), 0.8) : status === "reserved" ? C(hex).lerp(C(PAINT.reserved), 0.45) : C(hex);
    floors.push(box(at, plan.corridor, 0, 0.012, C(FLOOR.corridor), C(FLOOR.corridor)));
    if (plan.core.w > 0) floors.push(box(at, plan.core, 0, 0.012, C(FLOOR.core), C(FLOOR.core)));
    for (const unit of plan.units) {
      const status = statuses[unit.id];
      for (const r of [...unit.rooms, unit.outdoor]) {
        const c = tint(FLOOR[r.kind], status);
        floors.push(box(at, r, 0, 0.012, c, c));
      }
    }

    // Walls, glass and parapets.
    const walls: THREE.BufferGeometry[] = [];
    const glass: THREE.BufferGeometry[] = [];
    const wall = C(PAINT.wall);
    const cap = C(PAINT.cap);
    const brick = C(PAINT.brick);
    const brickCap = C(PAINT.brickCap);
    const frame = C(PAINT.frame);
    for (const w of plan.walls) {
      const spec = WALL[w.kind];
      const horizontal = w.y1 === w.y2;
      const from = horizontal ? Math.min(w.x1, w.x2) : Math.min(w.y1, w.y2);
      const to = horizontal ? Math.max(w.x1, w.x2) : Math.max(w.y1, w.y2);
      const line = horizontal ? w.y1 : w.x1;
      const run = (a: number, b: number, thick: number, z0: number, z1: number, top: THREE.Color, side: THREE.Color) => {
        const r: Rect = horizontal ? { x: a, y: line - thick / 2, w: b - a, h: thick } : { x: line - thick / 2, y: a, w: thick, h: b - a };
        return box(at, r, z0, z1, top, side);
      };
      const ext = spec.t / 2;
      if (w.kind === "window") {
        const pier = 30;
        if (to - from > 2 * pier + 40) {
          walls.push(run(from - ext, from + pier, spec.t, 0, CUT, cap, wall));
          walls.push(run(to - pier, to + ext, spec.t, 0, CUT, cap, wall));
          glass.push(run(from + pier, to - pier, 4, 0, CUT, wall, wall));
          walls.push(run(from + pier, to - pier, 8, 0, 0.04, frame, frame));
          const panes = Math.max(1, Math.round((to - from - 2 * pier) / 140));
          const step = (to - from - 2 * pier) / panes;
          for (let i = 1; i < panes; i++) {
            const m = from + pier + i * step;
            walls.push(run(m - 2.5, m + 2.5, 7, 0, CUT, frame, frame));
          }
        } else {
          walls.push(run(from - ext, to + ext, spec.t, 0, CUT, cap, wall));
        }
        continue;
      }
      if (w.kind === "railing") {
        // Glass balustrade on a brick curb, with a slim handrail.
        walls.push(run(from - ext, to + ext, spec.t, 0, 0.16, brickCap, brick));
        glass.push(run(from, to, 3, 0.16, 1.0, wall, wall));
        walls.push(run(from - 3, to + 3, 6, 1.0, 1.04, frame, frame));
        continue;
      }
      const masonry = w.kind === "divider" || w.kind === "parapet";
      walls.push(run(from - ext, to + ext, spec.t, 0, spec.h * CM, masonry ? brickCap : cap, masonry ? brick : wall));
    }

    // Furniture, greyed in sold homes.
    const pieces: THREE.BufferGeometry[] = [];
    for (const p of furnish(plan)) {
      const sold = p.unit && statuses[p.unit] === "sold";
      const c = sold ? C(FINISH[p.finish]).lerp(C(PAINT.sold), 0.55) : C(FINISH[p.finish]);
      pieces.push(shape(at, p, c));
    }

    const slabMesh = mesh(mergeGeometries(slab), this.solid);
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    const floorMesh = mesh(mergeGeometries(floors), this.solid);
    floorMesh.receiveShadow = true;
    const wallMesh = mesh(mergeGeometries(walls), this.solid);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    const glassMesh = mesh(mergeGeometries(glass), this.glass);
    glassMesh.renderOrder = 2;
    const furnitureMesh = mesh(mergeGeometries(pieces), this.solid);
    furnitureMesh.castShadow = true;
    furnitureMesh.receiveShadow = true;
    for (const g of [...slab, ...floors, ...walls, ...glass, ...pieces]) g.dispose();

    this.walls = new THREE.Group();
    this.walls.add(wallMesh, glassMesh);
    this.furniture = new THREE.Group();
    this.furniture.add(furnitureMesh);
    this.root.add(slabMesh, floorMesh, this.walls, this.furniture);

    // A tint over each home for hover and selection, and an invisible box
    // over it to point at.
    for (const unit of plan.units) {
      const parts = [...unit.rooms, unit.outdoor].map((r) => {
        const g = new THREE.PlaneGeometry(r.w * CM, r.h * CM);
        g.rotateX(-Math.PI / 2);
        const [x, z] = at(r.x + r.w / 2, r.y + r.h / 2);
        g.translate(x, 0.03, z);
        return g;
      });
      const overlay = new THREE.Mesh(
        mergeGeometries(parts),
        new THREE.MeshBasicMaterial({ color: PAINT.hover, transparent: true, opacity: 0, depthWrite: false }),
      );
      parts.forEach((g) => g.dispose());
      overlay.renderOrder = 1;
      this.overlays.set(unit.id, overlay);
      this.root.add(overlay);
      for (const r of [unit.bounds, unit.outdoor]) {
        const hit = mesh(box(at, r, 0, CUT, wall, wall), this.hitMaterial);
        hit.userData.unit = unit.id;
        this.hits.push(hit);
        this.root.add(hit);
      }
    }
  }

  private clear() {
    for (const o of this.overlays.values()) {
      gsap.killTweensOf(o.material);
      o.material.dispose();
    }
    this.root.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.overlays.clear();
    this.hits = [];
    this.plan = null;
  }

  private paintOverlays() {
    for (const [id, o] of this.overlays) {
      const opacity = id === this.selected ? 0.34 : id === this.hovered ? 0.24 : 0;
      gsap.to(o.material, { opacity, duration: this.reduced ? 0.01 : 0.35, ease: "power2.out", onUpdate: this.invalidate });
    }
  }

  // --------------------------------------------------------------- camera

  private direction(phi: number, theta: number) {
    return new THREE.Vector3(Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta));
  }

  /** The zoom and target that fit the given plan rectangles (with their
   * walls) in view from this angle, centred. */
  private fit(rects: Rect[], phi: number, theta: number, fill: number, y: number): Pose {
    const dir = this.direction(phi, theta);
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    const camUp = new THREE.Vector3().crossVectors(dir, right).normalize();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const p = new THREE.Vector3();
    for (const r of rects) {
      for (const x of [r.x, r.x + r.w]) {
        for (const z of [r.y, r.y + r.h]) {
          for (const h of [-0.3, CUT]) {
            p.set(x * CM - this.centre.x, h, z * CM - this.centre.z);
            const a = p.dot(right);
            const b = p.dot(camUp);
            minX = Math.min(minX, a);
            maxX = Math.max(maxX, a);
            minY = Math.min(minY, b);
            maxY = Math.max(maxY, b);
          }
        }
      }
    }
    // Aim at the middle of what is seen, so it sits centred.
    const target = new THREE.Vector3()
      .addScaledVector(right, (minX + maxX) / 2)
      .addScaledVector(camUp, (minY + maxY) / 2);
    // Slide the target along the view line back to the working height.
    const along = (target.y - y) / dir.y;
    target.addScaledVector(dir, -along);
    const zoom = Math.min((this.width * fill) / (maxX - minX), (this.height * fill) / (maxY - minY));
    return { phi, theta, zoom, tx: target.x, ty: target.y, tz: target.z };
  }

  private homePose(): Pose {
    if (!this.plan) return this.pose;
    return this.fit([this.plan.bounds], HOME_PHI, HOME_THETA, 0.94, 0);
  }

  private unitPose(rects: Rect[]): Pose {
    return this.fit(rects, 0.8, this.currentTheta() * 0.5 + HOME_THETA * 0.5, 0.72, 0);
  }

  /** Where the camera is now, turned by the visitor or not. */
  private angles() {
    return new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target));
  }

  private currentPhi() {
    return this.angles().phi;
  }

  private currentTheta() {
    return this.angles().theta;
  }

  private applyPose() {
    const { phi, theta, zoom, tx, ty, tz } = this.pose;
    const target = new THREE.Vector3(tx, ty, tz);
    this.camera.position.copy(target).addScaledVector(this.direction(phi, theta), 80);
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(target);
    this.camera.lookAt(target);
    this.invalidate();
  }

  private animateTo(next: Pose, duration: number, ease: string, delay = 0) {
    this.tween?.kill();
    // Start from wherever the visitor has turned the model.
    this.pose = { ...this.pose, phi: this.currentPhi(), theta: this.currentTheta() };
    this.controls.enabled = false;
    this.tween = gsap.to(this.pose, {
      ...next,
      duration: this.reduced ? 0.01 : duration,
      delay: this.reduced ? 0 : delay,
      ease,
      onUpdate: () => this.applyPose(),
      onComplete: () => {
        this.controls.enabled = this.fine;
        this.controls.update();
      },
    });
  }

  // --------------------------------------------------------------- render

  private readonly invalidate = () => {
    if (this.disposed || this.frame) return;
    this.frame = requestAnimationFrame(this.render);
  };

  private readonly render = () => {
    this.frame = 0;
    if (this.disposed) return;
    const moving = this.controls.enabled && this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
    if (moving) this.invalidate();
  };

  /** Move every `[data-anchor="x,y,height"]` (plan cm) over its spot. */
  private placeLabels() {
    const v = new THREE.Vector3();
    this.labels.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
      const [x, y, h] = (el.dataset.anchor ?? "").split(",").map(Number);
      if (x === undefined || y === undefined || Number.isNaN(x)) return;
      v.set(x * CM - this.centre.x, (h ?? 0) * CM, y * CM - this.centre.z).project(this.camera);
      const sx = ((v.x + 1) / 2) * this.width;
      const sy = ((1 - v.y) / 2) * this.height;
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
    });
  }

  // ------------------------------------------------------------- pointing

  private pick(e: PointerEvent): string | null {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.hits, false)[0];
    return (hit?.object.userData.unit as string | undefined) ?? null;
  }

  private readonly onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || (e.buttons & 1) === 1) return;
    const id = this.pick(e);
    this.canvas.style.cursor = id ? "pointer" : this.fine ? "grab" : "";
    if (id !== this.hovered) this.events.onHover(id);
  };

  private readonly onPointerDown = (e: PointerEvent) => {
    this.down = { x: e.clientX, y: e.clientY };
  };

  private readonly onPointerUp = (e: PointerEvent) => {
    const d = this.down;
    this.down = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
    this.events.onSelect(this.pick(e));
  };

  private readonly onPointerLeave = () => {
    if (this.hovered) this.events.onHover(null);
  };

  private readonly onContextLost = (e: Event) => {
    e.preventDefault();
  };
}

// ------------------------------------------------------------------ shapes

type At = (x: number, y: number) => readonly [number, number];

function paint(g: THREE.BufferGeometry, top: THREE.Color, side: THREE.Color) {
  const normals = g.getAttribute("normal");
  const colors = new Float32Array(normals.count * 3);
  for (let i = 0; i < normals.count; i++) {
    const c = normals.getY(i) > 0.5 ? top : side;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

/** A plan rectangle (cm) raised from z0 to z1 (m). */
function box(at: At, r: Rect, z0: number, z1: number, top: THREE.Color, side: THREE.Color) {
  const g = new THREE.BoxGeometry(Math.max(r.w * CM, 0.001), Math.max(z1 - z0, 0.001), Math.max(r.h * CM, 0.001));
  const [x, z] = at(r.x + r.w / 2, r.y + r.h / 2);
  g.translate(x, (z0 + z1) / 2, z);
  return paint(g, top, side);
}

function shape(at: At, p: Piece, color: THREE.Color) {
  const w = p.w * CM;
  const d = p.h * CM;
  const h = Math.max(p.height * CM, 0.004);
  let g: THREE.BufferGeometry;
  if (p.shape === "cylinder") {
    g = new THREE.CylinderGeometry(0.5, 0.5, 1, 20);
    g.scale(w, h, d);
  } else if (p.shape === "cone") {
    g = new THREE.ConeGeometry(0.5, 1, 14);
    g.scale(w, h, d);
  } else if (p.shape === "sphere") {
    g = new THREE.SphereGeometry(0.5, 14, 10);
    g.scale(w, h, d);
  } else {
    g = new THREE.BoxGeometry(w, h, d);
  }
  const [x, z] = at(p.x + p.w / 2, p.y + p.h / 2);
  g.translate(x, p.z * CM + h / 2, z);
  return paint(g, color, color);
}

function mesh(geometry: THREE.BufferGeometry | null, material: THREE.Material) {
  return new THREE.Mesh(geometry ?? new THREE.BufferGeometry(), material);
}
