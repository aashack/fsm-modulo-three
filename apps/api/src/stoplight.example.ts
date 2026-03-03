// This file is an example of how to use the FSM package to create a simple stoplight FSM. 
// It defines the states, events, and transitions for a stoplight, 
// and then demonstrates how to run the FSM with a sequence of events.

// I will admit I haven't created a FSM before but this was a base exercise
// I did to learn about them. It's not used in the API project at all, but it serves as a simple example of how to use the FSM package.

// The closest thing I could think of that is anything close to a FSM that I implemented was a workflow pattern to manage complex 
// async flows in a node.js app, but that was more of a state machine with side effects and not a pure FSM. 
// So this was a fun exercise to get familiar with the concepts and API of the FSM package.

import { createMachine, type MachineConfig } from "@aashack/fsm";

// Example: a stoplight FSM with 4 states and 3 events.
type Light = "Red" | "Green" | "Yellow" | "FlashingRed";
// Events that can trigger transitions in the stoplight FSM.
type Event = "TIMER" | "POWER_OUT" | "POWER_RESTORED";

// Configuration object for the stoplight FSM. This defines the states, alphabet, start state, and transition table.
const stoplightConfig: MachineConfig<Light, Event> = {
  states: ["Red", "Green", "Yellow", "FlashingRed"] as const,
  alphabet: ["TIMER", "POWER_OUT", "POWER_RESTORED"] as const,
  start: "Red",
  transition: {
    // From Red, on TIMER go to Green, on POWER_OUT go to FlashingRed, on POWER_RESTORED stay in Red
    Red: {
      TIMER: "Green",
      POWER_OUT: "FlashingRed",
      POWER_RESTORED: "Red",
    },
    // From Green, on TIMER go to Yellow, on POWER_OUT go to FlashingRed, on POWER_RESTORED go to Red
    Green: {
      TIMER: "Yellow",
      POWER_OUT: "FlashingRed",
      POWER_RESTORED: "Red",
    },
    // From Yellow, on TIMER go to Red, on POWER_OUT go to FlashingRed, on POWER_RESTORED go to Red
    Yellow: {
      TIMER: "Red",
      POWER_OUT: "FlashingRed",
      POWER_RESTORED: "Red",
    },
    // From FlashingRed, on TIMER do nothing (stay in FlashingRed), on POWER_OUT do nothing (stay in FlashingRed), on POWER_RESTORED go to Red
    FlashingRed: {
      TIMER: "FlashingRed",          // timer ticks do nothing in outage mode
      POWER_OUT: "FlashingRed",      // already out
      POWER_RESTORED: "Red",         // reset to Red when power returns
    },
  },
};

const stoplight = createMachine(stoplightConfig);

// Example usage:
const final = stoplight.run(["TIMER", "POWER_OUT", "TIMER", "POWER_RESTORED"]);
// Red -> Green -> FlashingRed -> FlashingRed -> Red
// final === "Red"