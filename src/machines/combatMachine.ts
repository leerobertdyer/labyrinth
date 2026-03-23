import { Player, type Enemy } from "@/components/game/combat/types";
import { calculateIncomingDamage } from "@/machines/utils";
import { assign, fromPromise, raise, sendParent, setup } from "xstate";

export const combatSetup = setup({
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
      | { type: "SELECT_ENEMY"; enemyId: string }
      | { type: "PLAYER_HIT"; damage: number },
  },
  actors: {
    enemyAI: fromPromise(
      async ({ input }: { input: { enemy: Enemy | undefined } }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const damage = Math.ceil(Math.random() * (input?.enemy?.attack ?? 1));
        return { damage };
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
  },
  guards: {
    allEnemiesVanquished: ({ context }) =>
      context.enemies.every((e) => e.health <= 0),
    playerDead: ({ context }) => context.player.health <= 0,
  },
});

export const combatMachine = combatSetup.createMachine({
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
    PLAYER_HIT: [
      {
        guard: ({ context, event }) =>
          context.player.health - event.damage <= 0,
        actions: [
          assign({
            player: ({ context }) => ({ ...context.player, health: 0 }),
          }),
          sendParent({ type: "SEE_RED", intensity: 1 }),
        ],
        target: ".defeat",
      },
      {
        actions: [
          assign({
            player: ({ context, event }) => ({
              ...context.player,
              health: context.player.health - event.damage,
            }),
          }),
          sendParent({ type: "SEE_RED", intensity: 0.5 }),
        ],
      },
    ],
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
          target: "playerTurn",
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
            raise(({ event, context }) => ({
              type: "PLAYER_HIT",
              damage: calculateIncomingDamage({
                rawDamage: event.output.damage,
                isPlayerDefending: false, //TODO
                player: context.player,
              }),
            })),
            assign({
              enemyAttackQueue: ({ context }) =>
                context.enemyAttackQueue.slice(1),
            }),
          ],
        },
      },
    },
    victory: {
      entry: [
        sendParent(({ context }) => ({
          type: "VICTORY",
          player: context.player,
        })),
      ],
      type: "final",
    },
    defeat: {
      entry: [sendParent({ type: "DEFEAT" })],
      type: "final",
    },
  },
});
