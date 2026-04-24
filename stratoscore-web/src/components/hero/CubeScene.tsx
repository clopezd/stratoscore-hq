"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

function Cube() {
  const mesh = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.LineSegments>(null);
  const { mouse } = useThree();

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.15;
      mesh.current.rotation.y += delta * 0.2;
      mesh.current.rotation.x += (mouse.y * 0.2 - mesh.current.rotation.x * 0.02) * 0.04;
      mesh.current.rotation.y += (mouse.x * 0.3 - mesh.current.rotation.y * 0.02) * 0.04;
    }
    if (wire.current) {
      wire.current.rotation.copy(mesh.current!.rotation);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={mesh}>
        <boxGeometry args={[2.4, 2.4, 2.4]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.8}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.2}
          iridescence={1}
          iridescenceIOR={1.3}
          color="#22d3ee"
          attenuationColor="#00f2fe"
          attenuationDistance={1.6}
          roughness={0.05}
        />
      </mesh>
      <lineSegments ref={wire}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.42, 2.42, 2.42)]} />
        <lineBasicMaterial color="#67e8f9" transparent opacity={0.6} />
      </lineSegments>
    </Float>
  );
}

function Rig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function CubeScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000a0e", 6, 14]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 4, 4]} intensity={1.5} color="#22d3ee" />
      <directionalLight position={[-4, -2, -4]} intensity={0.8} color="#00f2fe" />
      <pointLight position={[0, 0, 3]} intensity={1.2} color="#a5f3fc" />

      <Suspense fallback={null}>
        <Cube />
        <Environment preset="city" />
      </Suspense>

      <Rig />

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
