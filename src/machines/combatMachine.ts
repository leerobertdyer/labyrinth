/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player, type Enemy } from "@/components/game/combat/types";
import { assign, fromPromise, sendParent, setup } from "xstate";

export const combatMachine = setup({
  types: {
    input: {} as { player: Player; enemies: Enemy[] },
    context: {} as {
      enemies: Enemy[];
      player: Player;
      selectedEnemyId: string | null;
      selectedView: "PLAYER" | "ENEMY" | "CHAT";
      enemyAttackQueue: string[];
    },
    events: {} as
      | { type: "ATTACK" }
      | { type: "DEFEND" }
      | { type: "USE_ITEM"; itemId: string }
      | { type: "FLEE" }
      | { type: "NEXT_ROUND" }
      | { type: "SET_VIEW"; view: "PLAYER" | "ENEMY" | "CHAT" }
      | { type: "SELECT_ENEMY"; enemyId: string },
  },
  actors: {
    enemyAI: fromPromise(
      async ({ input }: { input: { enemy: Enemy | undefined } }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { damage: input?.enemy?.attack };
      },
    ),
  },
  actions: {
    applyPlayerDamage: assign({
      enemies: ({ context }) => {
        if (!context.selectedEnemyId) return context.enemies;
        return context.enemies.map((enemy) =>
          enemy.id === context.selectedEnemyId
            ? {
                ...enemy,
                health: Math.max(0, enemy.health - context.player.attack),
              }
            : enemy,
        );
      },
    }),
    applyEnemyDamage: assign({
      player: ({ context, event }) => ({
        ...context.player,
        health: Math.max(
          0,
          context.player.health - (event as any).output.damage, // @todo: fix any
        ),
      }),
    }),
  },

  guards: {
    allEnemiesVanquished: ({ context }) =>
      context.enemies.every((e) => e.health <= 0),
    playerDead: ({ context }) => context.player.health <= 0,
  },
}).createMachine({
  id: "combat",
  initial: "playerTurn",
  context: ({ input }: { input: { player: Player; enemies: Enemy[] } }) => ({
    player: input.player,
    enemies: input.enemies,
    selectedEnemyId: null,
    selectedView: "PLAYER",
    enemyAttackQueue: input.enemies.map((e) => e.id),
  }),
  on: {
    SET_VIEW: {
      actions: assign(({ context, event }) => ({
        selectedView: event.view,
        selectedEnemyId:
          event.view === "ENEMY" && !context.selectedEnemyId
            ? (context.enemies[0]?.id ?? null)
            : context.selectedEnemyId,
      })),
    },
  },
  states: {
    playerTurn: {
      entry: assign({ selectedView: () => "PLAYER" }),
      on: {
        SELECT_ENEMY: {
          actions: [assign({ selectedEnemyId: ({ event }) => event.enemyId })],
        },
        ATTACK: {
          guard: ({ context }) => context.selectedEnemyId !== null,
          target: "checkEnemies",
          actions: ["applyPlayerDamage"],
        },
        DEFEND: {
          actions: () => {},
        },
        USE_ITEM: {
          actions: () => {},
        },
        FLEE: {
          actions: [sendParent({ type: "LEAVE_COMBAT" })],
        },
      },
    },
    checkEnemies: {
      always: [
        { guard: "allEnemiesVanquished", target: "victory" },
        { target: "enemyTurn" },
      ],
    },
    enemyTurn: {
      entry: assign({
        enemyAttackQueue: ({ context }) =>
          context.enemies.filter((e) => e.health > 0).map((e) => e.id),
      }),
      always: { target: "enemyAttack" },
    },
    enemyAttackQueue: {
      always: [
        {
          guard: ({ context }) => context.enemyAttackQueue.length === 0,
          target: "checkPlayer",
        },
        { target: "enemyAttack" },
      ],
    },
    enemyAttack: {
      invoke: {
        src: "enemyAI",
        input: ({ context }) => ({
          enemy: context.enemies.find(
            (e) => e.id === context.enemyAttackQueue[0],
          ),
        }),
        onDone: {
          target: "enemyAttackQueue",
          actions: [
            "applyEnemyDamage",
            assign({
              enemyAttackQueue: ({ context }) =>
                context.enemyAttackQueue.slice(1),
            }),
            sendParent(({ event }) => ({
              type: "PLAYER_HIT",
              damage: event.output.damage,
            })),
          ],
        },
      },
    },
    checkPlayer: {
      always: [
        { guard: "playerDead", target: "defeat" },
        { target: "playerTurn" },
      ],
    },
    victory: {
      entry: sendParent({ type: "VICTORY" }),
      type: "final",
    },
    defeat: {
      entry: sendParent({ type: "DEFEAT" }),
      type: "final",
    },
  },
});
