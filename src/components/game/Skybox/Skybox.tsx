import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function SkyBox() {
  const ogTexture = useTexture("/images/backgrounds/stars.png");

  const texture = useMemo(() => {
    const t = ogTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    return t;
  }, [ogTexture]);

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* Scale -1 on X flips the sphere so the texture is on the INSIDE */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}
