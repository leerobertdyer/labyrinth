import EnemyEncounter from "@/components/game/characters/EnemyEncounter/EnemyEncounter";
import { ROOMS } from "@/components/game/Rooms/roomRegistry";
import Room from "@/components/game/structure/Room";
import {
  Direction,
  EncounterConfig,
  IRoomObjects,
} from "@/components/game/types";
import { CuboidCollider } from "@react-three/rapier";
import {
  REMOVE_ENCOUNTER,
  MOVE_NPC,
  REMOVE_NPC,
  SHOW_NPC,
  STARTING_POINT,
} from "../../../app/constants";
import React, { useEffect, useState } from "react";
import { useGameMachine } from "@/contexts/GameMachineContext";
import { useRoomStore } from "@/stores/useRoomStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import TriggerEvent from "@/components/game/TriggerEvent/TriggerEvent";

export default function RoomManager() {
  const { currentRoomId, transitionTo } = useRoomStore();
  const { teleportPlayer } = usePlayerStore();
  const room = ROOMS[currentRoomId];

  const handleGateEnter = (direction: Direction) => {
    const destinationId = room.connections?.[direction];
    if (!destinationId) return;
    const spawnPoint = STARTING_POINT;
    transitionTo(destinationId);
    setTimeout(() => teleportPlayer(spawnPoint), 0);
  };

  const [, , actor] = useGameMachine();

  const [activeEncounters, setActiveEncounters] = useState<EncounterConfig[]>(
    room?.encounters ?? [],
  );

  useEffect(() => {
    if (room) {
    // TODO: Fix this
    //eslint-disable-next-line 
    setActiveEncounters(room?.encounters);
  }
}, [currentRoomId, room]);

  function handleVictory(encounter: EncounterConfig) {
    const e = encounter.afterPlayerVictory;
    switch (e) {
      case REMOVE_ENCOUNTER:
        setActiveEncounters((prev) =>
          prev.filter((e) => e.entityId !== encounter.entityId),
        );
        break;
      case MOVE_NPC:
        break; // TODO
      case REMOVE_NPC:
        break; // TODO
      case SHOW_NPC:
        break; // TODO
    }
  }

  useEffect(() => {
    const sub = actor.on("BATTLE_WON", ({ encounter }) => {
      const thisEncounter = activeEncounters.find(
        (e) => e.entityId === encounter.entityId,
      );
      if (thisEncounter) handleVictory(thisEncounter);
    });
    return () => sub.unsubscribe();
  }, [activeEncounters, actor]);

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
        width={room.width}
        length={room.length}
        scale={room.scale}
        tileSize={room.tileSize ?? 1}
        edges={edges}
        onGateEnter={handleGateEnter}
      />
      {room.triggers && room.triggers.map((t, i) => {
       return <TriggerEvent position={t.position} key={i} collider={t.collider} event={t.event}>{t.children}</TriggerEvent>
      })}
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
      {activeEncounters.map((e, i) => {
        const entity = room.entities.find(
          (roomEntity) => roomEntity.id === e.entityId,
        );
        const Model = entity?.Model;
        if (!Model || !e) return;
        return (
          <React.Fragment key={i}>
            <EnemyEncounter encounter={e}>
              <CuboidCollider args={[2, 3, 1.5]} />
            </EnemyEncounter>
            <Model
              position={entity.position}
              rotation={[
                entity.rotation.x,
                entity.rotation.y,
                entity.rotation.z,
              ]}
              scale={entity.modelScale}
            />
          </React.Fragment>
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
