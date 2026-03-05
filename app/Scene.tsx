import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'

function Player() {
  const ref = useRef<RapierRigidBody>(null)
  const [, get] = useKeyboardControls()
  const speed = 5

  useFrame((state, delta) => {
    const { forward, backward, left, right } = get()
    if (!ref.current) return

    if (forward) ref.current.setTranslation({
      x: ref.current.translation().x,
      y: ref.current.translation().y,
      z: ref.current.translation().z - speed * delta
    }, true)
    if (backward) ref.current.setTranslation({
      x: ref.current.translation().x,
      y: ref.current.translation().y,
      z: ref.current.translation().z + speed * delta
    }, true)
    if (left) ref.current.setTranslation({
      x: ref.current.translation().x - speed * delta,
      y: ref.current.translation().y,
      z: ref.current.translation().z
    }, true)
    if (right) ref.current.setTranslation({
      x: ref.current.translation().x + speed * delta,
      y: ref.current.translation().y,
      z: ref.current.translation().z
    }, true)
  })

  return (
    <RigidBody ref={ref} colliders="cuboid" lockRotations>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="royalblue" />
      </mesh>
    </RigidBody>
  )
}

function Room() {
  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="stone" />
        </mesh>
      </RigidBody>
    </>
  )
}

export default function Scene() {
  return (
    <Physics>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player />
      <Room />
    </Physics>
  )
}