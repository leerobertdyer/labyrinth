import EnemyEncounter from "@/components/game/characters/Enemies/EnemyEncounter";
import { ROOMS } from "@/components/game/Rooms/roomRegistry";
import Room from "@/components/game/structure/Room";
import { IRoomObjects } from "@/components/game/types";
import { CuboidCollider } from "@react-three/rapier";

type IRoomManager = {
  roomId: string;
};

export default function RoomManager({ roomId }: IRoomManager) {
  const room = ROOMS[roomId];
  if (!room) return null;

  const edges = [
    room.edges.north,
    room.edges.east,
    room.edges.south,
    room.edges.west,
  ];

  const roomObjects = room.roomObjects;
  const npcs = room.npcs;
  const M = npcs[0].Model;

  return (
    <group>
      <Room
        size={room.size}
        scale={room.scale}
        tileSize={room.tileSize ?? 1}
        edges={edges}
      />
      {roomObjects &&
        roomObjects.map((o: IRoomObjects, i) => {
          const Model = o.Model;
          return (
            <Model
              key={i}
              position={o.pos}
              scale={o.scale}
              rotation={o.rotation}
            />
          );
        })}
      <EnemyEncounter encounterEnemies={room.enemies}>
        {
          <>
            <CuboidCollider position={npcs[0].position} args={[2, 3, 1.5]} />
            <M
              position={npcs[0].position}
              rotation={[
                npcs[0].rotation.x,
                npcs[0].rotation.y,
                npcs[0].rotation.z,
              ]}
              scale={npcs[0].modelScale}
            />
          </>
        }
      </EnemyEncounter>
      {/* {npcs &&
        npcs.map((n, i) => {
          const Model = n.Model;
          return (
            <Model
              key={i}
              position={n.position}
              rotation={[n.rotation.x, n.rotation.y, n.rotation.z]}
              scale={n.modelScale}
            />
          );
        })} */}
    </group>
  );
}
