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

  const encounterIds = room.encounters.map((e) => e.entityId);
  const nonEncounterEntities = room.entities.filter(
    (e) => !encounterIds.includes(e.id),
  );

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
      {room.encounters.map((e, i) => {
        const entity = room.entities.find(
          (roomEntity) => (roomEntity.id = e.entityId),
        );
        const Model = entity?.Model;
        if (!Model) return;
        return (
          <EnemyEncounter key={i} encounterEnemies={e.encounterEnemies}>
            <CuboidCollider position={entity.position} args={[2, 3, 1.5]} />
            <Model
              position={entity.position}
              rotation={[
                entity.rotation.x,
                entity.rotation.y,
                entity.rotation.z,
              ]}
              scale={entity.modelScale}
            />
          </EnemyEncounter>
        );
      })}
      {nonEncounterEntities &&
        nonEncounterEntities.map((entity, i) => {
          const Model = entity.Model;
          return (
            <Model
              key={i}
              position={entity.position}
              rotation={[
                entity.rotation.x,
                entity.rotation.y,
                entity.rotation.z,
              ]}
              scale={entity.modelScale}
            />
          );
        })}
    </group>
  );
}
