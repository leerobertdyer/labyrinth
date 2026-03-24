import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { ShopkeeperModel } from "../../models/mixamo/Shopkeeper";
import { Vector3 } from "three";

export default function Shopkeeper({
  scale=2,
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
      <CuboidCollider
        args={[0.75, 2, .5]} // [half-height, radius]
        position={[0, 0.9, 0]}
        restitution={0}
        friction={0}
        scale={1}
        />
      <ShopkeeperModel />
        
    </RigidBody>
  );
}
