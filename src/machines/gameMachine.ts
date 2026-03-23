import { setup, assign, emit } from "xstate";
import { combatMachine } from "./combatMachine";
import { Enemy, Player } from "@/components/game/combat/types";
import { defaultPlayer } from "@/app/constants";

const gameSetup = setup({
  types: {
    input: {} as { player: Player },
    context: {} as {
      player: Player;
      room: string;
      enemies: Enemy[];
    },
    // Define what events the machine can RECEIVE (for your UI events)
    events: {} as
      | { type: "START_GAME" }
      | { type: "PLAYER_HIT"; damage: number }
      | { type: "SET_ENCOUNTER_ENEMIES"; encounterEnemies: Enemy[] }
      | { type: "ENTER_COMBAT" }
      | { type: "LEAVE_COMBAT" }
      | { type: "VICTORY"; player: Player }
      | { type: "PAUSE" }
      | { type: "UNPAUSE" }
      | { type: "RESPAWN"; room: string }
      | { type: "SEE_RED"; intensity: number }
      | { type: "COMBAT_LOST" },
    // Define what events the machine can EMIT (for your UI listeners)
    emitted: {} as
      | { type: "SEE_RED"; intensity: number }
      | { type: "SCREEN_EFFECT"; color: string; duration: number },
  },
  actors: {
    combatMachine: combatMachine,
  },
  actions: {
    resetPlayer: assign({ player: defaultPlayer }),
  },
});

export const gameMachine = gameSetup.createMachine({
  id: "game",
  context: ({ input }) => ({
    player: input?.player,
    room: "start",
    enemies: [],
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
        SET_ENCOUNTER_ENEMIES: {
          actions: [assign({ enemies: ({ event }) => event.encounterEnemies })],
        },
        PAUSE: ".paused",
      },
      states: {
        exploring: {
          on: {
            ENTER_COMBAT: "inCombat",
          },
        },
        inCombat: {
          invoke: {
            id: "combatActor",
            src: "combatMachine",
            input: ({ context }) => ({
              player: {
                health: context.player.health,
                attack: 10,
                image: "hero.png",
                maxHealth: 100,
                experience: 0,
                speed: context.player.speed,
                defense: context.player.defense,
              },
              enemies: context.enemies,
            }),
          },
          on: {
            LEAVE_COMBAT: "exploring",
            VICTORY: {
              target: "exploring",
              actions: assign({ player: ({ event }) => event.player }),
            },
            DEFEAT: {
              target: "dead",
              actions: ["resetPlayer"],
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
  actions: {
    HEALTH_UP: assign({
      health: ({ context, event }) => context.health + event.amount,
    }),
    HEALTH_DOWN: assign({
      health: ({ context, event }) => context.health - event.amount,
    }),
    FULL_HEALTH: assign({
      health: ({ context }) => (context.health = context.maxHealth),
    }),
  },
});
