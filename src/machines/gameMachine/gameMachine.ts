import { setup, assign, emit } from "xstate";
import { combatMachine } from "../combatMachine/combatMachine";
import { Player } from "@/components/game/combat/types";
import { startingPlayer } from "@/app/constants";
import { EncounterConfig } from "@/components/game/types";
import {
  ConversationTrigger,
  GameContext,
  GameEmit,
  GameEvent,
} from "@/machines/gameMachine/types";
import { getPlayerLevel } from "@/machines/combatMachine/utils";

const gameSetup = setup({
  types: {
    input: {} as { player: Player },
    context: {} as GameContext,
    events: {} as GameEvent,
    emitted: {} as GameEmit,
  },
  actors: {
    combatMachine: combatMachine,
  },
  actions: {
    resetGame: assign({ player: startingPlayer }),
  },
});

export const gameMachine = gameSetup.createMachine({
  id: "game",
  context: ({ input }) => ({
    player: input?.player,
    room: "start",
    encounter: {} as EncounterConfig,
    conversation: {} as ConversationTrigger,
  }),
  initial: "startScreen",
  states: {
    startScreen: {
      initial: "idle",
      states: {
        idle: {
          on: {
            NEW_GAME: "statSelection",
          },
        },
        statSelection: {
          on: {
            CONFIRM_STATS: {
              target: "#game.playing",
              actions: assign({
                player: ({ event }) => {
                  return { ...event.player, unspentPoints: 0 };
                },
                room: () => "startingRoom",
              }),
            },
          },
        },
      },
    },
    playing: {
      initial: "exploring",
      on: {
        FLASH_SCREEN: {
          actions: emit(({ event }) => ({
            type: "FLASH_SCREEN",
            color: event.color,
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
              emit({ type: "FLASH_SCREEN", color: "RED", intensity: 3 }),
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
              emit({ type: "FLASH_SCREEN", color: "RED", intensity: 0.35 }),
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
            START_TALKING: {
              actions: assign({
                conversation: ({ event }) => event.conversation,
              }),
              target: "talking",
            },
          },
        },
        talking: {
          on: {
            FINISH_TALKING: {
              actions: assign({
                conversation: {} as ConversationTrigger,
              }),
              target: "exploring",
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
            VICTORY: [
              {
                guard: ({ context, event }) =>
                  getPlayerLevel(event.player.experience) >
                  getPlayerLevel(context.player.experience),
                target: "levelUp",
                actions: [
                  assign({ player: ({ event }) => event.player }),
                  emit(({ context }) => ({
                    type: "BATTLE_WON",
                    encounter: context.encounter,
                  })),
                ],
              },
              {
                target: "exploring",
                actions: [
                  assign({ player: ({ event }) => event.player }),
                  emit(({ context }) => ({
                    type: "BATTLE_WON",
                    encounter: context.encounter,
                  })),
                ],
              },
            ],
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
        levelUp: {
          on: {
            CONFIRM_STATS: {
              target: "exploring",
              actions: assign({
                player: ({ event }) => {
                  return { ...event.player, unspentPoints: 0 };
                },
              }),
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
                  health: context.player.maxHealth,
                }),
                room: ({ event }) =>
                  // TODO: I don't think this is working -> always staying in the same room
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
