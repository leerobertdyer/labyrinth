import { BLUE, RED } from "@/app/constants";
import { Player, type Enemy } from "@/components/game/combat/types";
import { EncounterConfig } from "@/components/game/types";
import { CombatContext, CombatEvent } from "@/machines/combatMachine/types";
import { calculateIncomingDamage } from "@/machines/gameMachine/utils";
import { assign, fromPromise, raise, sendParent, setup } from "xstate";

export const combatSetup = setup({
  types: {
    input: {} as { player: Player; encounter: EncounterConfig },
    context: {} as CombatContext,
    events: {} as CombatEvent,
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
  context: ({
    input,
  }: {
    input: { player: Player; encounter: EncounterConfig };
  }) => ({
    player: input.player,
    enemies: input.encounter.encounterEnemies ?? [],
    selectedEnemyId: null,
    selectedView: "PLAYER",
    enemyAttackQueue: input.encounter.encounterEnemies.map((e) => e.id),
  }),
  on: {
    SKIP_TURN: {
      target: ".enemyTurn"
    },
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
        // blocked entirely
        guard: ({ event }) => event.damage === 0,
        actions: [
          sendParent({ type: "FLASH_SCREEN", color: BLUE, intensity: 0.35 }),
        ],
      },
      {
        // fatal hit
        guard: ({ context, event }) =>
          context.player.health - event.damage <= 0,
        actions: [
          assign({
            player: ({ context }) => ({ ...context.player, health: 0 }),
          }),
          sendParent({ type: "FLASH_SCREEN", color: RED, intensity: 3 }),
        ],
        target: ".defeat",
      },
      {
        // normal hit
        actions: [
          assign({
            player: ({ context, event }) => ({
              ...context.player,
              health: context.player.health - event.damage,
            }),
          }),
          sendParent({ type: "FLASH_SCREEN", color: RED, intensity: 0.35 }),
        ],
      },
    ],
    HEAL: {
      actions: [
        assign({
          player: ({ context, event }) => ({
            ...context.player,
            health: Math.min(
              context.player.maxHealth,
              context.player.health + event.amount,
            ),
          }),
        }),
      ],
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
          target: "enemyTurn",
          actions: assign(({ context }) => ({
            player: { ...context.player, isDefending: true },
          })),
        },
        USE_ITEM: {
          target: "enemyTurn",
          actions: raise(({ event }) => {
            if (event.item.item.kind === "CONSUMABLE") {
              return event.item.item.onUse();
            }
            return { type: "NOOP" } as const; // fallback for non-consumables
          }),
        },
        FLEE: [
          {
            guard: ({ event }) => event.success,
            actions: [
              sendParent(({ context }) => ({
                type: "LEAVE_COMBAT",
                player: context.player,
              })),
            ],
          },
          {
            target: "enemyTurn",
          },
        ],
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
                isPlayerDefending: context.player.isDefending,
                player: context.player,
              }),
            })),
            assign({
              enemyAttackQueue: ({ context }) =>
                context.enemyAttackQueue.slice(1),
            }),
            assign(({ context }) => ({
              player: { ...context.player, isDefending: false },
            })),
          ],
        },
      },
    },
    victory: {
      entry: [
        assign({
          player: ({ context }) => ({
            ...context.player,
            experience:
              context.player.experience +
              context.enemies.reduce((acc, e) => acc + e.experience, 0),
          }),
        }),
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