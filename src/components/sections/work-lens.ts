import {
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  VideoTexture,
  WebGLRenderer,
} from "three";

/**
 * The glass lens over the work (see WorkLens.tsx): the glass cursor's small
 * square of glass, with the same rounded corners as the night chapter's
 * panes, sitting over a project's picture. It draws only its own square (one small canvas
 * that moves with it): the picture under it comes from the tile's own
 * playing film or still, magnified a little, bent outward toward the rim
 * and split by colour there, under a hairline of light, a soft sheen and a
 * shadow just outside. Everything else on the tile is the page itself.
 */

export type WorkLens = {
  /** Puts the lens on a `[data-lens]` box; false when its picture isn't ready. */
  attach(box: HTMLElement): boolean;
  detach(): void;
  /** Lens centre inside the box, in the box's own (unscaled) CSS pixels. */
  moveTo(x: number, y: number, immediate?: boolean): void;
  /** 0 (gone) to 1 (fully there). */
  setStrength(strength: number): void;
  render(): void;
  destroy(): void;
};

/**
 * The side of the glass (CSS px): the glass cursor's size over anything
 * that can be clicked (globals.css), so the cursor hands over to the lens
 * without a jump.
 */
const SIZE = 48;
/** Room around the glass for its shadow (CSS px). */
const PAD = 12;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uMapSize;
  uniform vec2 uBox;
  uniform vec2 uCenter;
  uniform float uLens;
  uniform float uPad;
  uniform float uStrength;
  varying vec2 vUv;

  float roundBox(vec2 p, float halfSide, float radius) {
    vec2 q = abs(p) - vec2(halfSide - radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  // object-fit: cover, centred: a point in the box (px, y down) to the
  // picture's texture coordinates.
  vec2 cover(vec2 boxPx) {
    vec2 uv = boxPx / uBox;
    float boxAspect = uBox.x / uBox.y;
    float mapAspect = uMapSize.x / uMapSize.y;
    vec2 scale = boxAspect > mapAspect ? vec2(1.0, mapAspect / boxAspect) : vec2(boxAspect / mapAspect, 1.0);
    uv = (uv - 0.5) * scale + 0.5;
    return vec2(uv.x, 1.0 - uv.y);
  }

  void main() {
    float span = uLens + 2.0 * uPad;
    vec2 local = (vec2(vUv.x, 1.0 - vUv.y) - 0.5) * span;
    float halfSide = uLens * 0.5;
    float d = roundBox(local, halfSide, halfSide * 0.18);
    float inside = 1.0 - smoothstep(-0.75, 0.75, d);

    float edge = smoothstep(-halfSide * 0.45, 0.0, d);
    vec2 dir = local / halfSide;
    vec2 bent = local * mix(1.0, 0.8, uStrength) - dir * edge * edge * halfSide * 0.18 * uStrength;
    vec2 at = clamp(uCenter + bent, vec2(0.0), uBox);
    vec2 shift = dir * edge * 2.0 * uStrength;
    vec3 color = vec3(
      texture2D(uMap, cover(at + shift)).r,
      texture2D(uMap, cover(at)).g,
      texture2D(uMap, cover(at - shift)).b
    );

    float rim = 1.0 - smoothstep(0.0, 1.6, abs(d + 1.0));
    float sheen = exp(-pow((dot(dir, vec2(0.7071)) + 0.55) * 2.4, 2.0)) * 0.16;
    color = color * vec3(0.97, 0.99, 1.02) + vec3(sheen * inside + rim * 0.75);

    float glass = max(inside, rim);
    float shadow = (1.0 - smoothstep(0.0, uPad * 0.9, d)) * (1.0 - glass) * 0.22;
    gl_FragColor = vec4(color * glass, glass + shadow) * uStrength;
  }
`;

export function createWorkLens(): WorkLens | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    left: "0",
    top: "0",
    zIndex: "2",
    pointerEvents: "none",
    willChange: "transform",
  });

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uMap: { value: null },
      uMapSize: { value: new Vector2(1, 1) },
      uBox: { value: new Vector2(1, 1) },
      uCenter: { value: new Vector2(0, 0) },
      uLens: { value: SIZE },
      uPad: { value: PAD },
      uStrength: { value: 0 },
    },
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  scene.add(quad);

  // Uploaded pictures are kept for a few tiles, so going back to one is instant.
  const textures = new Map<HTMLImageElement | HTMLVideoElement, Texture>();
  const textureFor = (media: HTMLImageElement | HTMLVideoElement) => {
    let texture = textures.get(media);
    if (!texture) {
      texture = media instanceof HTMLVideoElement ? new VideoTexture(media) : new Texture(media);
      texture.needsUpdate = true;
      textures.set(media, texture);
      if (textures.size > 6) {
        const [oldest, old] = textures.entries().next().value!;
        old.dispose();
        textures.delete(oldest);
      }
    }
    return texture;
  };

  let box: HTMLElement | null = null;
  let media: HTMLImageElement | HTMLVideoElement | null = null;
  const span = SIZE + PAD * 2;
  renderer.setSize(span, span);
  const target = { x: 0, y: 0 };
  const shown = { x: 0, y: 0 };

  const place = () => {
    canvas.style.transform = `translate3d(${(shown.x - span / 2).toFixed(1)}px, ${(shown.y - span / 2).toFixed(1)}px, 0)`;
    material.uniforms.uCenter!.value.set(shown.x, shown.y);
  };

  return {
    attach(next) {
      // The playing film when there is one, else the still.
      const video = next.querySelector<HTMLVideoElement>("video[data-ready]");
      const image = next.querySelector<HTMLImageElement>("img");
      const picture =
        video && video.readyState >= 2 && video.videoWidth > 0
          ? video
          : image && image.complete && image.naturalWidth > 0
            ? image
            : null;
      if (!picture) return false;
      box = next;
      media = picture;
      material.uniforms.uMap!.value = textureFor(picture);
      material.uniforms.uBox!.value.set(next.offsetWidth, next.offsetHeight);
      box.appendChild(canvas);
      return true;
    },
    detach() {
      canvas.remove();
      box = null;
      media = null;
    },
    moveTo(x, y, immediate = false) {
      target.x = x;
      target.y = y;
      if (immediate) {
        shown.x = x;
        shown.y = y;
      }
    },
    setStrength(strength) {
      material.uniforms.uStrength!.value = strength;
    },
    render() {
      if (!box || !media) return;
      shown.x += (target.x - shown.x) * 0.24;
      shown.y += (target.y - shown.y) * 0.24;
      place();
      const natural =
        media instanceof HTMLVideoElement ? [media.videoWidth, media.videoHeight] : [media.naturalWidth, media.naturalHeight];
      material.uniforms.uMapSize!.value.set(natural[0] || 1, natural[1] || 1);
      renderer.render(scene, camera);
    },
    destroy() {
      canvas.remove();
      textures.forEach((texture) => texture.dispose());
      textures.clear();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
