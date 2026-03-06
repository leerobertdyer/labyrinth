import { UwallUflatUgate } from "@/components/game/models/kenney/retroMedieval/wall-flat-gate";
import { UwoodUfloor } from "@/components/game/models/kenney/retroMedieval/wood-floor";
import { UwallUaUdetail } from "@/components/game/models/kenney/retroUrban/wall-a-detail";
import FloorGrid from "@/components/game/structure/FloorGrid";
import { RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";

type SlotType = 'wall' | 'gate' | 'door' | 'empty';

interface WallEdge {
  direction: 'north' | 'south' | 'east' | 'west';
  slots: SlotType[];  // length = number of tiles along that edge
}

interface IRoom {
  size: number;       // floor grid size
  tileSize: number;
  edges?: WallEdge[]; // optional — default to all walls if omitted
  scale?: Vector3; // optional scale for walls/doors/ceiling height
  roof?: boolean; // optional flag to show sky or not
}

const EDGE_ROTATIONS: Record<string, [number, number, number]> = {
    north: [0, 0, 0],
    south: [0, Math.PI, 0],
    east:  [0, Math.PI / 2, 0],
    west:  [0, -Math.PI / 2, 0],
  };
  
  function getEdgePositions(
    direction: string,
    slotIndex: number,
    size: number,
    tileSize: number
  ): [number, number, number] {
    const half = (size * tileSize) / 2;
    const offset = slotIndex * tileSize - half + tileSize / 2;
  
    switch (direction) {
      case 'north': return [offset, 0, -half];
      case 'south': return [offset, 0,  half];
      case 'east':  return [ half,  0, offset];
      case 'west':  return [-half,  0, offset];
      default: return [0, 0, 0];
    }
  }

export default function Room({ size = 30, tileSize = 1, edges, scale = new Vector3(2, 5, 0) }: IRoom) {
    const defaultEdges: WallEdge[] = ['north','south','east','west'].map(dir => ({
      direction: dir as 'north' | 'south' | 'east' | 'west',
      slots: Array(size).fill('wall'),
    }));
  
    const resolvedEdges = edges ?? defaultEdges;
  
    return (
      <RigidBody type="fixed">
        <FloorGrid size={size} tileSize={tileSize} Model={UwoodUfloor} />
        {resolvedEdges.map(edge =>
          edge.slots.map((slot, i) => {
            const pos = getEdgePositions(edge.direction, i, size, tileSize);
            const rot = EDGE_ROTATIONS[edge.direction];
  
            if (slot === 'wall') return <UwallUaUdetail key={`${edge.direction}-${i}`} scale={scale} position={pos} rotation={rot} />;
            if (slot === 'gate') return <UwallUflatUgate key={`${edge.direction}-${i}`} scale={scale} position={pos} rotation={rot} />;
            // 'empty' / 'door' — return null or door model
            return null;
          })
        )}
      </RigidBody>
    );
  }