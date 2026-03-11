import EnemyEncounter from "@/components/game/characters/Enemies/EnemyEncounter";
import { ROOMS } from "@/components/game/Rooms/roomRegistry";
import Room from "@/components/game/structure/Room";
import { IRoomObjects } from "@/components/types";

interface IRoomManager {
  roomId: string;
  //npc: needType[]
}

export default function RoomManager({ roomId }: IRoomManager) {
  const room = ROOMS[roomId];
  if (!room) return null;

  const edges = [
    room.edges.north,
    room.edges.east,
    room.edges.south,
    room.edges.west,
  ];

  const roomObjects = room.roomObjects
  return (
    <group>
      <Room
        size={room.size}
        scale={room.scale}
        tileSize={room.tileSize ?? 1}
        edges={edges}
      />
      <EnemyEncounter encounterEnemies={room.enemies} position={[0, 0, 4]}/>
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
    </group>
  );
}
