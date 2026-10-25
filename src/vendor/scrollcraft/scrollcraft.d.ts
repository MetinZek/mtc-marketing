/**
 * Types for the vendored Scroll Craft engine (scrollcraft.js). The engine is
 * a classic script that assigns `window.ScrollCraft`; importing the module
 * for its side effect is enough.
 */
export {};

export type ScrollCraftInstance = {
  layout(): void;
  read(): void;
  destroy(): void;
};

export type ScrollCraftGlobal = {
  mount(root?: Element | string | null, opts?: { lerp?: number }): ScrollCraftInstance;
  reduce: boolean;
  instances: ScrollCraftInstance[];
};

declare global {
  interface Window {
    ScrollCraft?: ScrollCraftGlobal;
  }
}
