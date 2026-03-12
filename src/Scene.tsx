import { VRM } from "@pixiv/three-vrm";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Mesh } from "three";
import { animations } from "./constants/animations";
import VrmCompanion from "./components/VRMCompanion";

interface SceneProps {
  virtualText: string;
  voiceUrl: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

const Scene = ({
  virtualText,
  voiceUrl,
  onSpeakStart,
  onSpeakEnd,
}: SceneProps) => {
  const vrmRef = useRef<VRM>(null);
  const vrmMeshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (virtualText) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (vrmRef as any)?.current?.setText?.(virtualText);
    }
  }, [virtualText]);

  useEffect(() => {
    const speak = async () => {
      if (voiceUrl) {
        onSpeakStart?.();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (vrmRef as any)?.current?.talk?.(voiceUrl);
        onSpeakEnd?.();
      }
    };
    speak();
  }, [voiceUrl, onSpeakStart, onSpeakEnd]);

  return (
    <Canvas
      gl={{ alpha: true }}
      style={{
        zIndex: 1,
        height: "100vh",
        width: "100%",
        background: "transparent",
      }}
    >
      <OrbitControls
        makeDefault
        minDistance={0.75}
        maxDistance={1.5}
        enableDamping
      />
      <ambientLight />
      <pointLight position={[1, 2, 1]} intensity={2.5} castShadow />
      <pointLight position={[-1, 2, 1]} intensity={2.5} castShadow />

      <VrmCompanion
        ref={vrmRef}
        meshRef={vrmMeshRef}
        vrmUrl="../assets/vrms/lala.vrm"
        animations={animations}
        scale={[1, 1, 1]}
        position={[0, -1, 0]}
        rotation={[0, Math.PI, 0]}
        isStaticPosition
      />
    </Canvas>
  );
};

export default Scene;
