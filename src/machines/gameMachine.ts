import { setup, assign } from 'xstate';
import { combatMachine } from './combatMachine';
import { Enemy } from '@/components/game/combat/types';

const gameSetup = setup({
    types: {
        context: {} as { maxHealth: number; health: number; amnesia: number; room: string; enemies: Enemy[] },
        // Define what events the machine can RECEIVE (for your UI events)
        events: {} as
            | { type: 'PLAYER_HIT'; damage: number }
            | { type: 'ENTER_COMBAT' }
            | { type: 'VICTORY' }
            | { type: 'PAUSE' }
            | { type: 'UNPAUSE' }
            | { type: 'RESPAWN'; room: string },
        // Define what events the machine can EMIT (for your UI listeners)
        emitted: {} as
            | { type: 'SEE_RED'; intensity: number }
            | { type: 'SCREEN_EFFECT'; color: string; duration: number }
    },
    actors: {
        combatMachine: combatMachine,
    },
    // Actions would go here but need more time to figure it out. 
    // actions: {}
}
);

export const gameMachine = gameSetup.createMachine({
    id: "game",
    context: { maxHealth: 100, health: 100, amnesia: 0, room: 'start', enemies: [] },
    initial: 'playing',
    states: {
        playing: {
            initial: 'exploring',
            // Any event here is inherited by EVERY child (exploring, inCombat, etc.)
            on: {
                PLAYER_HIT: [
                    {
                        guard: ({ context, event }) => context.health <= event.damage,
                        actions: [
                            assign({ health: 0 }),
                            gameSetup.emit({ type: 'SEE_RED', intensity: 1 })
                        ],
                        target: '.dead', // Correct: Moves to playing.dead
                    },
                    {
                        actions: [
                            assign({ health: ({ context, event }) => context.health - event.damage }),
                            gameSetup.emit({ type: 'SEE_RED', intensity: 0.5 })
                        ]
                    }
                ],
                PAUSE: '.paused' // Correct: Moves to playing.paused
            },
            states: {
                exploring: {
                    on: {
                        ENTER_COMBAT: 'inCombat' // Moves to playing.inCombat
                    }
                },
                inCombat: {
                    invoke: {
                        id: 'combatActor',
                        src: 'combatMachine',
                        input: ({ context }) => ({
                            playerHealth: context.health,
                            enemies: context.enemies
                        })
                    },
                    on: {
                        // When the child actor sends 'VICTORY' to the parent
                        VICTORY: 'exploring'
                    }
                },
                paused: {
                    on: {
                        UNPAUSE: 'history'
                    }
                },
                history: {
                    type: 'history',
                    history: 'shallow'
                },
                dead: {
                    on: {
                        RESPAWN: {
                            target: 'exploring',
                            actions: assign({
                                health: 100,
                                room: ({ event }) => event.type === 'RESPAWN' ? event.room : 'start'
                            })
                        }
                    }
                }
            }
        }
    },
    actions: {
        HEALTH_UP: assign({
            health: ({ context, event }) => context.health + event.amount
        }),
        HEALTH_DOWN: assign({
            health: ({ context, event }) => context.health - event.amount
        }),
        FULL_HEALTH: assign({
            health: ({ context, event }) => context.health = context.maxHealth
        }),
    }
});