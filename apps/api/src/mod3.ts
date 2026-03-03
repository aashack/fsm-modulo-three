import { createMachine, type MachineConfig } from "@aashack/fsm";

export type Mod3State = "S0" | "S1" | "S2";
export type Bit = "0" | "1";

/**
 * A simple FSM that computes the remainder mod 3 of a binary string. 
 * The states S0, S1, S2 correspond to remainders 0, 1, 2 respectively. 
 * The transitions are defined such that reading a '0' keeps the same remainder, while reading a '1' advances to the next remainder (modulo 3).
 */
export const mod3Config: MachineConfig<Mod3State, Bit> = {
  states: ["S0", "S1", "S2"] as const,
  alphabet: ["0", "1"] as const,
  start: "S0",
  // For mod-3, every state is "final" because we always return the remainder.
  finals: ["S0", "S1", "S2"] as const,
  // Transition table defining how the machine moves from one state to another based on the input symbol.
  transition: {
    S0: { "0": "S0", "1": "S1" },
    S1: { "0": "S2", "1": "S0" },
    S2: { "0": "S1", "1": "S2" }
  }
};

// Create the machine instance from the configuration. 
// This will validate the config and prepare the machine for running. 
// We can reuse this instance for all computations since it's immutable.
const mod3Machine = createMachine(mod3Config);

// A helper function to map the machine's states to their corresponding remainders. 
// This is specific to our mod-3 machine and is not a general FSM concept. 
export function remainderFromState(state: Mod3State): 0 | 1 | 2 {
  switch (state) {
    case "S0": return 0;
    case "S1": return 1;
    case "S2": return 2;
  }
}

// A helper function that runs the mod3Machine on a given binary string input 
// and returns the final remainder and state. 
// This is the main exported function that users of this module will call to compute 
// the mod-3 remainder of a binary string.
export function modThree(input: string): { remainder: 0 | 1 | 2; finalState: Mod3State } {
  const finalState = mod3Machine.run(input) as Mod3State;
  return { remainder: remainderFromState(finalState), finalState };
}

// Like modThree but also includes the trace of each step in the computation. Useful for debugging and educational purposes.
// Why not always return the trace? Because it can be expensive to compute and return, especially for long inputs, and most callers won't need it.
export function modThreeWithTrace(input: string): {
  remainder: 0 | 1 | 2;
  finalState: Mod3State;
  trace: readonly { from: Mod3State; symbol: Bit; to: Mod3State }[];
} {
  const { finalState, trace } = mod3Machine.runWithTrace(input) as any;
  return { remainder: remainderFromState(finalState), finalState, trace };
}
