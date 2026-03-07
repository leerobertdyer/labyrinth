import { createMachine, assign } from 'xstate';

export const gameMachine = createMachine({
    id: "game",
    types: {} as {
        context: { health: number; amnesia: number; room: string };
        events:
        | { type: 'PLAYER_HIT'; damage: number }
        | { type: 'ENTER_COMBAT' }
        | { type: 'VICTORY' }
        | { type: 'PAUSE' }
        | { type: 'UNPAUSE'; currentState: string }
        | { type: 'RESPAWN'; room: string };
    },
    context: {
        health: 100,
        amnesia: 0,
        room: 'start',
    },
    initial: 'exploring',
    states: {
        paused: {
            on: {
                UNPAUSE: {
                    target: 'exploring' // will need to change to sibling state 
                }
            }
        },
        exploring: {
            on: {
                ENTER_COMBAT: 'inCombat',
                PAUSE: 'paused',
                // GREET_NPC: 'talking'
            }
        },
        inCombat: {
            on: {
                PLAYER_HIT: [
                    {
                        guard: ({ context, event }) =>
                            event.type === 'PLAYER_HIT' && context.health <= event.damage,
                        actions: assign({
                            health: ({ context, event }) =>
                                event.type === 'PLAYER_HIT' ? context.health - event.damage : context.health,
                        }),
                        target: 'dead',
                    },
                    {
                        actions: assign({
                            health: ({ context, event }) =>
                                event.type === 'PLAYER_HIT' ? context.health - event.damage : context.health,
                        }),
                    },
                ],
                VICTORY: 'exploring'
            }
        },
        dead: {
            on: {
                RESPAWN: {
                    target: 'exploring',
                    actions: assign({ health: 100, room: ({ event }) => event.room })
                }
            }
        }
    }
});