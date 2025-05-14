import "@react-three/fiber";

declare module "@react-three/fiber" {
  namespace JSX {
    interface IntrinsicElements {
      group: unknown;
      points: unknown;
      pointsMaterial: unknown;
      ambientLight: unknown;
    }
  }
}
