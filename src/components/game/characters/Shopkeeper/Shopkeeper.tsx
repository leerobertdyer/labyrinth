import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { ShopkeeperModel } from '../../models/mixamo/Shopkeeper'

export default function Shopkeeper() {
  return (
    <RigidBody
      colliders={false}
      lockRotations
      friction={2}
      mass={10}
      userData={{ type: "player" }}
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
