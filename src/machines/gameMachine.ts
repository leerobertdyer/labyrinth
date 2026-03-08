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
  context: {
    health: 100,
    amnesia: 0,
    room: 'start',
  },
  initial: 'exploring',
  states: {
    paused: {
      on: {
        UNPAUSE: 'exploring'
      }
    },
    exploring: {
      on: {
        ENTER_COMBAT: 'inCombat',
        PAUSE: 'paused',
        PLAYER_HIT: [
          {
            // If health will drop to 0 or below
            guard: ({ context, event }) => context.health <= event.damage,
            actions: [
              assign({ health: 0 }),
              gameSetup.emit({ type: 'SEE_RED', intensity: 0.5 }) // Calling the reusable action
            ],
            target: 'dead',
          },
          {
            // Normal hit logic
            actions: [
              assign({ health: ({ context, event }) => context.health - event.damage }),
              gameSetup.emit({ type: 'SEE_RED', intensity: 0.5 })
            ]
          }
        ]
      }
    },
    inCombat: {
      on: {
        PLAYER_HIT: [
          {
            guard: ({ context, event }) => context.health <= event.damage,
            actions: assign({ health: 0 }),
            target: 'dead',
          },
          {
            actions: assign({
              health: ({ context, event }) => context.health - event.damage,
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
          actions: assign({ 
            health: 100, 
            room: ({ event }) => event.type === 'RESPAWN' ? event.room : 'start' 
          })
        }
      }
    }
  }
});