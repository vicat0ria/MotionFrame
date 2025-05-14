declare module "three.meshline" {
  import * as THREE from "three";
  export class MeshLine {
    geometry: THREE.BufferGeometry;
    setGeometry(geometry: THREE.BufferGeometry): void;
  }
  export class MeshLineMaterial extends THREE.MeshBasicMaterial {
    constructor(parameters?: unknown);
  }
}
