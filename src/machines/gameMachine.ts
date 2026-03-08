import { setup, assign } from 'xstate';

const gameSetup = setup({
    types: {
        context: {} as { health: number; amnesia: number; room: string },
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
    }
});

export const gameMachine = gameSetup.createMachine({
    id: "game",
    context: { health: 100, amnesia: 0, room: 'start' },
    initial: 'playing',
    states: {
      playing: {
        initial: 'exploring',
        on: {
          PLAYER_HIT: [
            {
              guard: ({ context, event }) => context.health <= event.damage,
              actions: [
                assign({ health: 0 }), 
                gameSetup.emit({ type: 'SEE_RED', intensity: 1 })
              ],
              target: '.dead', // Moves to playing.dead
            },
            {
              actions: [
                assign({ health: ({ context, event }) => context.health - event.damage }),
                gameSetup.emit({ type: 'SEE_RED', intensity: 0.5 })
              ]
            }
          ],
          // Use relative targeting (the dot) to move to sibling child states
          PAUSE: '.paused' 
        },
        states: {
          exploring: {
            on: { ENTER_COMBAT: 'inCombat' }
          },
          inCombat: {
            on: { VICTORY: 'exploring' }
          },
          paused: {
            on: { 
              // This now returns to wherever the player was (exploring OR inCombat)
              UNPAUSE: 'history' 
            }
          },
          // The history state "remembers" the last active child of 'playing'
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
    }
  });