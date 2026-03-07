import { createMachine, assign, createActor } from 'xstate';

const gameMachine = createMachine({
  context: {
    health: 100,
    amnesia: 0,
    room: 'start',

  },
  on: {
   PLAYER_HIT: {
      actions: assign({
        health: ({ context }) => context.health - 10,
      }),
    },
    DEAD: {
      actions: assign({
        health: ({ context }) => 0,
      }),
    },
  },
});

export const gameActor = createActor(gameMachine).start();
gameActor.subscribe((state) => {
    console.log(state.context.health);
  });

// // logs 1
// gameActor.send({ type: 'DEAD' });
// logs 0