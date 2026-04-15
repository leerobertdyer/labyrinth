import { WoodFloor } from "@/components/game/models/kenney/retroMedieval/wood-floor";
import FloorCeilingGrid from "@/components/game/structure/FloorCeilingGrid";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { Roof } from "@/components/game/models/kenney/retroMedieval/roof";
import { WallBDetailPainted } from "../models/kenney/retroUrban/wall-b-detail-painted";
import { WallBDetailPaintedFortifiedGate } from "../models/kenney/retroMedieval/wall-fortified-gate";
import { Direction, IRoom, SlotType, WallEdge } from "@/components/game/types";

const EDGE_ROTATIONS: Record<string, [number, number, number]> = {
  north: [0, 0, 0],
  south: [0, Math.PI, 0],
  east: [0, -Math.PI / 2, 0],
  west: [0, Math.PI / 2, 0],
};

interface IGetEdgePositions {
  direction: string;
  slotIndex: number;
  width: number;
  length: number;
  tileSize: number;
}
function getEdgePositions({
  direction,
  slotIndex,
  width,
  length,
  tileSize,
}: IGetEdgePositions): [number, number, number] {
  const halfWidth = (width * tileSize) / 2;
  const halfLength = (length * tileSize) / 2;
  const widthOffset = slotIndex * tileSize - halfWidth + tileSize / 2;
  const lengthOffset = slotIndex * tileSize - halfLength + tileSize / 2;

  switch (direction) {
    case "north":
      return [widthOffset, 0, -halfLength];
    case "south":
      return [widthOffset, 0, halfLength];
    case "east":
      return [halfWidth, 0, lengthOffset];
    case "west":
      return [-halfWidth, 0, lengthOffset];
    default:
      return [0, 0, 0];
  }
}

const DEFAULT_SCALE = new Vector3(1.7, 5, 4.5);

export default function Room({
  width = 30, // east/west
  length = 30, // north/south
  tileSize = 1,
  edges,
  showRoof,
  scale = DEFAULT_SCALE,
  onGateEnter,
}: IRoom) {
  const defaultLengthEdges: WallEdge[] = ["north", "south"].map((dir) => ({
    direction: dir as "north" | "south",
    slots: Array(length).fill("wall"),
  }));
  const defaultWidthEdges: WallEdge[] = ["east", "west"].map((dir) => ({
    direction: dir as "east" | "west",
    slots: Array(width).fill("wall"),
  }));
  const defaultEdges = [...defaultLengthEdges, ...defaultWidthEdges];

  const resolvedEdges = edges ?? defaultEdges;
  const halfWidth = (width * tileSize) / 2;
  const halfLength = (length * tileSize) / 2;

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

  const floorHeight = 0.1; // floor surface at -0.1, so box center slightly below
  const floorColliderY = -0.1 - floorHeight / 2;

  function calculateArgsAndPos(edge: WallEdge, start: number, end: number) {
    const isNS = edge.direction === "north" || edge.direction === "south";

    const runTiles = end - start;
    const half = isNS ? halfWidth : halfLength;
    const runCenter = start * tileSize + (runTiles * tileSize) / 2 - half;

    const position: [number, number, number] = isNS
      ? [
          runCenter,
          scale.y / 2,
          edge.direction === "north" ? -halfLength : halfLength,
        ]
      : [
          edge.direction === "east" ? halfWidth : -halfWidth,
          scale.y / 2,
          runCenter,
        ];

    const offset = -2.5;
    const args: [number, number, number] = isNS
      ? [(tileSize * runTiles) / 2, scale.y, scale.z + offset]
      : [scale.z + offset, scale.y, (tileSize * runTiles) / 2];
    return { args, position };
  }

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Floor collision: single cuboid so player doesn't fall through */}
      <CuboidCollider
        args={[halfWidth, floorHeight / 2, halfLength]}
        position={[0, floorColliderY, 0]}
        friction={1.2}
      />
      {/* Floor */}
      <FloorCeilingGrid
        width={width}
        length={length}
        tileSize={tileSize}
        Model={WoodFloor}
        type="floor"
        height={-0.1}
      />

      {/* Ceiling */}
      {showRoof && (
        <FloorCeilingGrid
          width={width}
          length={length}
          tileSize={tileSize}
          Model={Roof}
          type="ceiling"
          height={scale.y}
        />
      )}

      {/* Visual Wall Runs */}
      {resolvedEdges.map((edge) =>
        edge.slots.map((slot, i) => {
          const pos = getEdgePositions({
            direction: edge.direction,
            slotIndex: i,
            width,
            length,
            tileSize,
          });
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
          const pos = getEdgePositions({
            direction: edge.direction,
            slotIndex: (start + end) / 2,
            width,
            length,
            tileSize,
          });
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
        return getEdgeRuns(edge.slots, "wall").map(({ start, end }) => {
          const { args, position } = calculateArgsAndPos(edge, start, end);

          return (
            <CuboidCollider
              key={`${edge.direction}-${start}`}
              args={args}
              position={position}
            />
          );
        });
      })}

      {/* Gate sensor colliders */}
      {resolvedEdges.map((edge) => {
        return getEdgeRuns(edge.slots, "gate").map(({ start, end }) => {
          const { args, position } = calculateArgsAndPos(edge, start, end);
          return (
            <RigidBody
              key={`${edge.direction}-gate-sensor-${start}`}
              type="fixed"
              colliders={false}
            >
              <CuboidCollider
                args={args}
                position={position}
                sensor
                onIntersectionEnter={() =>
                  onGateEnter?.(edge.direction as Direction)
                }
              />
            </RigidBody>
          );
        });
      })}
    </RigidBody>
  );
}
