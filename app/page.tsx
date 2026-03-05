'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Scene from './Scene'

const controls = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
]

export default function GamePage() {
  return (
    <KeyboardControls map={controls}>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [0, 5, 10], fov: 60 }}
      >
        <Scene />
      </Canvas>
    </KeyboardControls>
  )
}