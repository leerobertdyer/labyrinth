import { setup, assign, emit } from "xstate";
import { combatMachine } from "./combatMachine";
import { Enemy, Player } from "@/components/game/combat/types";
import { defaultPlayer } from "@/app/constants";
import { EncounterConfig } from "@/components/game/types";

const gameSetup = setup({
  types: {
    input: {} as { player: Player },
    context: {} as {
      player: Player;
      room: string;
      encounter: EncounterConfig;
    },
    // Define what events the machine can RECEIVE (UI events)
    events: {} as
      | { type: "START_GAME" }
      | { type: "PLAYER_HIT"; damage: number }
      | { type: "ENTER_COMBAT"; encounter: EncounterConfig }
      | { type: "LEAVE_COMBAT"; player: Player }
      | { type: "VICTORY"; player: Player }
      | { type: "DEFEAT" }
      | { type: "PAUSE" }
      | { type: "UNPAUSE" }
      | { type: "RESPAWN"; room: string }
      | { type: "SEE_RED"; intensity: number }
      | { type: "COMBAT_LOST" },
    // Define what events the machine can EMIT (UI listeners)
    emitted: {} as
      | { type: "SEE_RED"; intensity: number } // TODO make it FLASH_COLOR; intensity: number, color: string
      | { type: "BATTLE_WON"; encounter: EncounterConfig }
      | { type: "BATTLE_LOST"; encounter: EncounterConfig },
  },
  actors: {
    combatMachine: combatMachine,
  },
  actions: {
    resetGame: assign({ player: defaultPlayer }),
  },
});

export const gameMachine = gameSetup.createMachine({
  id: "game",
  context: ({ input }) => ({
    player: input?.player,
    room: "start",
    encounter: {} as EncounterConfig,
  }),
  initial: "startScreen",
  states: {
    startScreen: {
      initial: "idle",
      states: {
        idle: {},
      },
      on: {
        START_GAME: {
          target: "playing",
          actions: assign({
            player: () => defaultPlayer, // TODO - load real player stats from db
            room: () => "startingRoom", // TODO - check if this works with second room
          }),
        },
      },
    },
    playing: {
      initial: "exploring",
      on: {
        SEE_RED: {
          actions: emit(({ event }) => ({
            type: "SEE_RED",
            intensity: event.intensity,
          })),
        },
        PLAYER_HIT: [
          {
            guard: ({ context, event }) =>
              context.player.health <= event.damage,
            actions: [
              assign({
                player: ({ context }) => ({
                  ...context.player,
                  health: 0,
                }),
              }),
              emit({ type: "SEE_RED", intensity: 1 }),
            ],
            target: ".dead",
          },
          {
            actions: [
              assign({
                player: ({ context, event }) => ({
                  ...context.player,
                  health: context.player.health - event.damage,
                }),
              }),
              emit({ type: "SEE_RED", intensity: 0.5 }),
            ],
          },
        ],
        PAUSE: ".paused",
      },
      states: {
        exploring: {
          on: {
            ENTER_COMBAT: {
              actions: assign({ encounter: ({ event }) => event.encounter }),
              target: "inCombat",
            },
          },
        },
        inCombat: {
          invoke: {
            id: "combatActor",
            src: "combatMachine",
            input: ({ context }) => ({
              player: context.player,
              encounter: context.encounter,
            }),
          },
          on: {
            LEAVE_COMBAT: {
              target: "exploring",
              actions: assign({
                player: ({ event }) => event.player,
              }),
            },
            VICTORY: {
              target: "exploring",
              actions: [
                assign({
                  player: ({ event }) => event.player,
                }),
                emit(({ context }) => ({
                  type: "BATTLE_WON",
                  encounter: context.encounter,
                })),
              ],
            },
            DEFEAT: {
              target: "dead",
              actions: [
                "resetGame",
                emit(({ context }) => ({
                  type: "BATTLE_LOST",
                  encounter: context.encounter,
                })),
              ],
            },
          },
        },
        paused: {
          on: {
            UNPAUSE: "history",
          },
        },
        history: {
          type: "history",
          history: "shallow",
        },
        dead: {
          on: {
            RESPAWN: {
              target: "exploring",
              actions: assign({
                player: ({ context }) => ({
                  ...context.player,
                  health: 100,
                }),
                room: ({ event }) =>
                  event.type === "RESPAWN" ? event.room : "start",
              }),
            },
          },
        },
      },
    },
  },
  actions: {},
});
