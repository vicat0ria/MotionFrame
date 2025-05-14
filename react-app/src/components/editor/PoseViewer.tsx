// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { Landmark } from "@/services/videoService";

// Register custom and core Three.js objects for JSX use
extend({
  Group: THREE.Group,
  Points: THREE.Points,
  PointsMaterial: THREE.PointsMaterial,
  AmbientLight: THREE.AmbientLight,
});

// Define key joints for stick figure and their connections
const KEY_JOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

const STICK_CONNECTIONS: [number, number][] = [
  [0, 11],
  [0, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

interface PoseViewerProps {
  landmarks: Landmark[];
  width: number;
  height: number;
}

interface SkeletonProps {
  landmarks: Landmark[];
  width: number;
  height: number;
}

function Skeleton({ landmarks, width, height }: SkeletonProps) {
  const lineGroupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const dotPositions = new Float32Array(KEY_JOINTS.length * 3);

  useFrame(() => {
    if (!lineGroupRef.current) return;
    lineGroupRef.current.clear();

    STICK_CONNECTIONS.forEach(([a, b]) => {
      const landmarkA = landmarks.find((lm) => lm.id === a);
      const landmarkB = landmarks.find((lm) => lm.id === b);
      if (!landmarkA || !landmarkB) return;

      const start = new THREE.Vector3(
        landmarkA.x * width,
        landmarkA.y * height,
        0
      );
      const end = new THREE.Vector3(
        landmarkB.x * width,
        landmarkB.y * height,
        0
      );

      const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color("hotpink"),
        linewidth: 2,
        transparent: true,
        depthTest: false,
      });
      const line = new THREE.Line(geom, mat);
      lineGroupRef.current.add(line);
    });

    KEY_JOINTS.forEach((jointId, i) => {
      const landmark = landmarks.find((lm) => lm.id === jointId);
      if (!landmark) return;
      dotPositions[i * 3] = landmark.x * width;
      dotPositions[i * 3 + 1] = landmark.y * height;
      dotPositions[i * 3 + 2] = 0;
    });

    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(dotPositions, 3)
      );
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={lineGroupRef} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attachObject={["attributes", "position"]}
            args={[dotPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={8} color={0xffff00} sizeAttenuation={false} />
      </points>
    </>
  );
}

// Component to update camera bounds and renderer on size change
function ResizeCamera({ width, height }: { width: number; height: number }) {
  const { camera, setSize } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
    }
    setSize(width, height);
  }, [width, height]);

  return null;
}

const PoseViewer: React.FC<PoseViewerProps> = ({
  landmarks,
  width,
  height,
}) => {
  return (
    <Canvas
      orthographic
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <ResizeCamera width={width} height={height} />
      <OrthographicCamera
        makeDefault
        left={0}
        right={width}
        top={0}
        bottom={height}
        near={-1000}
        far={1000}
        position={[0, 0, 100]}
        zoom={1}
      />
      <ambientLight />
      <Skeleton landmarks={landmarks} width={width} height={height} />
    </Canvas>
  );
};

export default PoseViewer;
