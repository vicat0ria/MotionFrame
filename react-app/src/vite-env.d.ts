/// <reference types="vite/client" />

import "@react-three/fiber";

declare global {
  namespace JSX {
    /* eslint-disable @typescript-eslint/no-empty-interface */
    interface IntrinsicElements
      extends import("@react-three/fiber").ThreeElements {
      _allowThreeFiberElements?: unknown;
    }
  }
}
