import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { ShopkeeperModel } from "../../models/mixamo/Shopkeeper";
import { Euler, Vector3 } from "three";

export default function Shopkeeper({
  scale,
  position,
  rotation
}: {
  scale: number;
  position: Vector3;
  rotation: [number, number, number];
}) {
  return (
    <RigidBody
      colliders={false}
      lockRotations
      friction={2}
      mass={10}
      type="fixed"
      scale={scale}
      position={position}
      rotation={rotation}
      >
      <CapsuleCollider
        args={[0.5, 0.4]} // [half-height, radius]
        position={[0, 0.9, 0]}
        restitution={0}
        friction={0}
        />
      <ShopkeeperModel />
        
    </RigidBody>
  );
}
