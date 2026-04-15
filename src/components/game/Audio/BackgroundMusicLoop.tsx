import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo } from "react";

export default function BackgroundMusicLoop() {
  const { camera } = useThree();
  const buffer = useLoader(THREE.AudioLoader, "/audio/gameLoop.webm");

  const [listener, sound] = useMemo(() => {
    const l = new THREE.AudioListener();
    const s = new THREE.Audio(l);
    return [l, s];
  }, []);

  useEffect(() => {
    camera.add(listener);

    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();

    const handleInteraction = () => {
      if (listener.context.state === "suspended") {
        listener.context.resume().then(() => {
          if (!sound.isPlaying) sound.play();
        });
      } else {
        if (!sound.isPlaying) sound.play();
      }
    };

    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      sound.stop();
      camera.remove(listener);
    };
  }, [buffer, camera, listener, sound]);

  // 4. Use primitive to put it in the scene graph without TS errors
  return <primitive object={sound} />;
}
