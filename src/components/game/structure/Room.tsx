import { UwallUflatUgate } from "@/components/game/models/kenney/retroMedieval/wall-flat-gate";
import { UwoodUfloor } from "@/components/game/models/kenney/retroMedieval/wood-floor";
import FloorGrid from "@/components/game/structure/FloorGrid";
import { RigidBody } from "@react-three/rapier";

export default function Room() {
    const overallSize = 30
    return (
      <>
        <RigidBody type="fixed">
          <FloorGrid size={overallSize} tileSize={1} Model={UwoodUfloor} />
          <UwallUflatUgate
            scale={5}
            position={[0, 0, overallSize/2 * -1]}
            rotation={[0, 0, 0]}
          />
        </RigidBody>
      </>
    );
  }