import {
  FsmInputError,
  type MachineConfig,
  type TraceResult,
  type TraceStep,
  type TransitionFn
} from "./types.js";
import { validateConfig } from "./validate.js";

// Public API shape for the machine returned by `createMachine`.  The generic
// parameters are constrained to `string` unions to keep things simple while
// allowing excellent inference when users provide `as const` configuration.
export type Machine<State extends string, Symbol extends string> = Readonly<{
  // starting state accessor
  startState: () => State;
  // execute a single transition (no validation)
  step: (state: State, symbol: Symbol) => State;
  // consume an entire input sequence and return the final state
  run: (input: Iterable<Symbol> | string) => State;
  // like `run` but provide a trace of every step for debugging/visualization
  runWithTrace: (input: Iterable<Symbol> | string) => TraceResult<State, Symbol>;
  // query whether a particular state is considered accepting
  isFinal: (state: State) => boolean;
}>;

// Helper generator that normalizes the input form.  Accepts either a raw
// string (each character treated as a symbol) or any iterable of strings.  This
// abstraction keeps the rest of the implementation agnostic to the input type.
function* symbolsFrom(input: Iterable<string> | string): Generator<string> {
  if (typeof input === "string") {
    for (const ch of input) yield ch;
    return;
  }
  for (const x of input) yield x;
}

/**
 * Factory for creating immutable DFA instances. (Deterministic Finite Automaton )
 * 
 * The returned object exposes a small set of helpers for running the machine
 * and inspecting its configuration.  All runtime checks (e.g. symbol validity)
 * are performed lazily during execution so that tight loops remain fast.
 */
export function createMachine<State extends string, Symbol extends string>(
  config: MachineConfig<State, Symbol>
): Machine<State, Symbol> {
  // ensure the provided configuration is sane; throws FsmConfigError on failure
  validateConfig(config);

  // precompute some sets for quick membership tests
  const finals = new Set(config.finals ?? []);
  const alphabet = new Set(config.alphabet);

  // choose transition logic: either the table or a custom function
  const transitionFn: TransitionFn<State, Symbol> =
    "transitionFn" in config
      ? config.transitionFn
      : (state, symbol) => config.transition[state][symbol];
  
  // runtime assertion to check that a consumed symbol belongs to the alphabet
  // (throws FsmInputError if not).  The `asserts` clause lets TypeScript
  // narrow the type for subsequent code.
  function assertSymbol(sym: string): asserts sym is Symbol {
    if (!alphabet.has(sym as Symbol)) {
      throw new FsmInputError(`Invalid symbol '${sym}'. Allowed: ${[...alphabet].join(", ")}.`);
    }
  }

  // build and freeze the machine object to prevent external mutation
  return Object.freeze({
    startState: () => config.start,

    // if no finals are declared, treat every state as accepting.  this
    // simplifies callers that only care about transition behaviour.
    isFinal: (state) => (finals.size === 0 ? true : finals.has(state)),

    step: (state, symbol) => transitionFn(state, symbol),

    // the main execution loop: iterates through the input symbols, updating the state at each step.  The final state is returned after consuming the entire input.  Symbol validity is checked on-the-fly, allowing for early failure on invalid inputs.
    run: (input) => {
      let state = config.start;
      for (const raw of symbolsFrom(input)) {
        assertSymbol(raw);
        state = transitionFn(state, raw);
      }
      return state;
    },
    
    // the trace is built up incrementally as the input is consumed.  Each step records the source state, consumed symbol, and target state.  The final result includes both the end state and the full trace.
    runWithTrace: (input) => {
      let state = config.start;
      const trace: TraceStep<State, Symbol>[] = [];
      for (const raw of symbolsFrom(input)) {
        assertSymbol(raw);
        const from = state;
        const symbol = raw;
        const to = transitionFn(from, symbol);
        trace.push({ from, symbol, to });
        state = to;
      }
      return { finalState: state, trace };
    }
  });
}
