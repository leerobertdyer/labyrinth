import { Player, type Enemy } from "@/components/game/combat/types";
import { assign, enqueueActions, fromPromise, sendParent, setup } from "xstate";

export const combatMachine = setup({
    types: {
        context: {} as { enemies: Enemy[]; player: Player; lastAction: { type: string; actor: string } | null },
        events: {} as
            | { type: 'IDLE' }
            | { type: 'PLAYER_TURN' }
            | { type: 'ENEMY_TURN' }
            | { type: 'ATTACK' }
            | { type: 'VICTORY' }
            | { type: 'DEFEAT' }
    },
    actors: {
        enemyAI: fromPromise(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return { damage: Math.floor(Math.random() * 10) + 1, actor: 'enemy' };
        }),
    },
    actions: {
        calculateDamage: assign({
            enemies: ({ context }) => {
                if (context.lastAction?.actor !== 'player') return context.enemies;
                return context.enemies.map((enemy, index) => {
                    if (index === 0) {
                        return { ...enemy, health: Math.max(0, enemy.health - context.player.attack) };
                    }
                    return enemy;
                });
            }
        }),
    },
    guards: {
        enemyDead: ({ context }) => context.enemies.every(e => e.health <= 0),
        playerDead: ({ context }) => context.player.health <= 0,
        wasPlayerTurn: ({ context }) => context.lastAction?.actor === 'player'
    }
}).createMachine({
    id: "combat",
    context: {
        enemies: [],
        player: {
            image: "Hero.png",
            health: 100,
            maxHealth: 100,
            experience: 0,
            attack: 10,
        },
        lastAction: null
    },
    initial: "idle",
    states: {
        playerTurn: {
            on: {
                ATTACK: {
                    target: 'processingAction',
                    // We pass "who is attacking" in the assignment
                    actions: assign({
                        lastAction: () => ({ type: 'attack', actor: 'player' })
                    })
                }
            }
        },
        enemyTurn: {
            // The enemy AI doesn't need a button, it triggers itself
            invoke: {
                src: 'enemyAI',
                onDone: {
                    target: 'processingAction',
                    actions: assign({
                        lastAction: () => ({ type: 'attack', actor: 'enemy' })
                    })
                }
            }
        },
        processingAction: {
            entry: [
                'calculateDamage',
                enqueueActions(({ context, enqueue }) => {
                    if (context.lastAction?.actor === 'enemy') {
                        enqueue.sendParent({ type: 'PLAYER_HIT', damage: 10 });
                    }
                }),
            ],
            after: {
                1000: 'roundEnd'
            }
        },
        roundEnd: {
            always: [
                { guard: 'enemyDead', target: 'victory' },
                { guard: 'playerDead', target: 'defeat' },
                {
                    guard: 'wasPlayerTurn',
                    target: 'enemyTurn'
                },
                { target: 'playerTurn' }
            ]
        },
        victory: {
            entry: sendParent({ type: 'VICTORY' })
        },
        defeat: {}
    }
});
