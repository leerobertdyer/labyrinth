import { Player, type Enemy } from "@/components/game/combat/types";
import { assign, fromPromise, log, sendParent, setup } from "xstate";

export const combatMachine = setup({
    types: {
        input: {} as { player: Player; enemies: Enemy[] },
        context: {} as { enemies: Enemy[]; player: Player; selectedEnemyId: string | null },
        events: {} as
            | { type: 'ATTACK' }
            | { type: 'DEFEND' }
            | { type: 'USE_ITEM'; itemId: string }
            | { type: 'FLEE' }
            | { type: 'NEXT_ROUND' }
            | { type: 'SELECT_ENEMY'; enemyId: string }
    },
    actors: {
        enemyAI: fromPromise(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { damage: 10 };
        }),
    },
    actions: {
        applyPlayerDamage: assign({
            enemies: ({ context }) => {
                if (!context.selectedEnemyId) return context.enemies;
                return context.enemies.map(enemy =>
                    enemy.id === context.selectedEnemyId
                        ? { ...enemy, health: Math.max(0, enemy.health - context.player.attack) }
                        : enemy
                );
            }
        }),
        applyEnemyDamage: assign({
            player: ({ context, event }) => ({
                ...context.player,
                // event.output comes from the resolved promise
                health: Math.max(0, context.player.health - (event as any).output.damage)
            })
        })
    },

    guards: {
        allEnemiesVanquished: ({ context }) => context.enemies.every(e => e.health <= 0),
        playerDead: ({ context }) => context.player.health <= 0,
    }
}).createMachine({
    id: "combat",
    initial: "playerTurn",
    context: ({ input }: { input: { player: Player; enemies: Enemy[] } }) => ({
        player: input.player,
        enemies: input.enemies,
        selectedEnemyId: null,
    }),
    states: {
        playerTurn: {
            on: {
                SELECT_ENEMY: {
                    actions: [assign({ selectedEnemyId: ({ event }) => event.enemyId })]
                },
                ATTACK: {
                    guard: ({ context }) => context.selectedEnemyId !== null,
                    target: 'checkEnemies',
                    actions: ['applyPlayerDamage']
                },
                DEFEND: {
                    actions: () => { }
                },
                USE_ITEM: {
                    actions: () => { }
                },
                FLEE: {
                    actions: [sendParent({ type: 'LEAVE_COMBAT' })],
                }
            }
        },
        checkEnemies: {
            always: [
                { guard: 'allEnemiesVanquished', target: 'victory' },
                { target: 'enemyTurn' }
            ]
        },
        enemyTurn: {
            invoke: {
                src: 'enemyAI',
                onDone: {
                    target: 'checkPlayer',
                    actions: [
                        'applyEnemyDamage',
                        sendParent(({ event }) => ({ type: 'PLAYER_HIT', damage: event.output.damage }))
                    ]
                }
            }
        },
        checkPlayer: {
            always: [
                { guard: 'playerDead', target: 'defeat' },
                { target: 'playerTurn' }
            ]
        },
        victory: {
            entry: sendParent({ type: 'VICTORY' }),
            type: 'final'
        },
        defeat: {
            entry: sendParent({ type: 'DEFEAT' }),
            type: 'final'
        }
    }
});