import { WoodFloor } from "@/components/game/models/kenney/retroMedieval/wood-floor";
import FloorCeilingGrid from "@/components/game/structure/FloorCeilingGrid";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { ComponentType } from "react";
import { Euler, Vector3 } from "three";
import { Roof } from "@/components/game/models/kenney/retroMedieval/roof";
import { WallBDetailPainted } from "../models/kenney/retroUrban/wall-b-detail-painted";
import { WallBDetailPaintedFortifiedGate } from "../models/kenney/retroMedieval/wall-fortified-gate";

type SlotType = "wall" | "gate" | "empty";

export interface WallEdge {
  direction: "north" | "south" | "east" | "west";
  slots: SlotType[]; // length = number of tiles along that edge
}

interface IDebris {
  pos: Vector3;
  scale: Vector3;
  rotation: Euler;
  Model: ComponentType<{ position: Vector3; scale?: Vector3; rotation: Euler }>;
  onColide?: () => void;
}

interface IRoom {
  size: number; // floor grid size
  tileSize: number; // individual tile size
  edges?: WallEdge[]; // optional — default to all walls if omitted
  scale?: Vector3; // optional scale for walls/doors/ceiling height
  roof?: boolean; // optional flag to show sky or not
  debris?: IDebris[]; // optional objects in room
}

const EDGE_ROTATIONS: Record<string, [number, number, number]> = {
  north: [0, 0, 0],
  south: [0, Math.PI, 0],
  east: [0, -Math.PI / 2, 0],
  west: [0, Math.PI / 2, 0],
};

function getEdgePositions(
  direction: string,
  slotIndex: number,
  size: number,
  tileSize: number,
): [number, number, number] {
  const half = (size * tileSize) / 2;
  const offset = slotIndex * tileSize - half + tileSize / 2;

  switch (direction) {
    case "north":
      return [offset, 0, -half];
    case "south":
      return [offset, 0, half];
    case "east":
      return [half, 0, offset];
    case "west":
      return [-half, 0, offset];
    default:
      return [0, 0, 0];
  }
}

const DEFAULT_SCALE = new Vector3(1.7, 5, 4.5);

export default function Room({
  size = 30,
  tileSize = 1,
  edges,
  scale = DEFAULT_SCALE,
  debris,
}: IRoom) {
  const defaultEdges: WallEdge[] = ["north", "south", "east", "west"].map(
    (dir) => ({
      direction: dir as "north" | "south" | "east" | "west",
      slots: Array(size).fill("wall"),
    }),
  );

  const resolvedEdges = edges ?? defaultEdges;
  const half = (size * tileSize) / 2;

  function getEdgeRuns(slots: SlotType[], runType: SlotType) {
    const runs = [];
    let i = 0;
    while (i < slots.length) {
      if (slots[i] === runType) {
        let j = i;
        while (j < slots.length && slots[j] === runType) {
          j++;
        }
        runs.push({ start: i, end: j });
        i = j;
      } else {
        i++;
      }
    }
    return runs;
  }

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Floor */}
      <FloorCeilingGrid
        size={size}
        tileSize={tileSize}
        Model={WoodFloor}
        type="floor"
        height={-0.1}
      />

      {/* Ceiling */}
      <FloorCeilingGrid
        size={size}
        tileSize={tileSize}
        Model={Roof}
        type="ceiling"
        height={scale.y}
      />

      {/* Debris */}
      {debris &&
        debris.map((d: IDebris, i) => {
          const Model = d.Model;
          return (
            <Model
              key={i}
              position={d.pos}
              scale={d.scale}
              rotation={d.rotation}
            />
          );
        })}

      {/* Visual Wall Runs */}
      {resolvedEdges.map((edge) =>
        edge.slots.map((slot, i) => {
          const pos = getEdgePositions(edge.direction, i, size, tileSize);
          const rot = EDGE_ROTATIONS[edge.direction];
          const tilesToHeight = scale.y / tileSize;

          if (slot === "wall")
            return (
              <group key={`${edge.direction}-${i}`}>
                {Array.from({ length: tilesToHeight }).map((_, j) => (
                  <WallBDetailPainted
                    key={`${edge.direction}-${i}-${j}`}
                    scale={[scale.x, scale.y / tilesToHeight, scale.z]}
                    position={[pos[0], pos[1] + j * tileSize, pos[2]]}
                    rotation={rot}
                  />
                ))}
              </group>
            );
          return null;
        }),
      )}

      {/* Gate runs: one door per contiguous gate run */}
      {resolvedEdges.map((edge) =>
        getEdgeRuns(edge.slots, "gate").map(({ start, end }) => {
          const runLength = end - start;
          const pos = getEdgePositions(
            edge.direction,
            (start + end) / 2,
            size,
            tileSize,
          );
          return (
              <WallBDetailPaintedFortifiedGate
                key={`${edge.direction}-gate-${start}`}
                position={[pos[0], pos[1], pos[2]]}
                rotation={EDGE_ROTATIONS[edge.direction]}
                scale={[runLength + 1 * tileSize, scale.y, scale.z]}
              />
          );
        }),
      )}

      {/* Physics Colliders */}
      {resolvedEdges.map((edge) => {
        const isNS = edge.direction === "north" || edge.direction === "south";
        return getEdgeRuns(edge.slots, "wall").map(({ start, end }) => {
          const length = end - start;
          const runCenter = start * tileSize + (length * tileSize) / 2 - half;

          const position: [number, number, number] = isNS
            ? [
                runCenter,
                scale.y / 2,
                edge.direction === "north" ? -half : half,
              ]
            : [
                edge.direction === "east" ? half : -half,
                scale.y / 2,
                runCenter,
              ];

          const offset = -2.5;
          const args: [number, number, number] = isNS
            ? [(tileSize * length) / 2, scale.y, scale.z + offset]
            : [scale.z + offset, scale.y, (tileSize * length) / 2];

          return (
            <CuboidCollider
              key={`${edge.direction}-${start}`}
              args={args}
              position={position}
            />
          );
        });
      })}
    </RigidBody>
  );
}
