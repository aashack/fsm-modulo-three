# @aashack/fsm — API Reference (short)

This is a compact reference for the public API provided by the `@aashack/fsm` package.

## Exports

- `createMachine(config)`
  - Factory that builds an immutable deterministic finite automaton (DFA).
  - `config` is a `MachineConfig<State, Symbol>` (see below).
  - Throws `FsmConfigError` on invalid configuration.
  - Returns a `Machine<State, Symbol>`.

- Types (re-exported):
  - `MachineConfig<State, Symbol>` — configuration shape (states, alphabet, start, finals, transition or transitionFn)
  - `TransitionTable<State, Symbol>` — object mapping `state -> symbol -> nextState`
  - `TraceResult<State, Symbol>` / `TraceStep<State, Symbol>` — types returned by `runWithTrace`
  - `FsmConfigError`, `FsmInputError` — error classes

## Machine instance API

Given `const m = createMachine(config)`:

- `m.startState()` -> `State`
  - Returns the configured start state.

- `m.isFinal(state)` -> `boolean`
  - Returns `true` if `state` is in `config.finals`. If `finals` is omitted, returns `true` for all states.

- `m.step(state, symbol)` -> `State`
  - Performs a single transition using the configured `transition` table or `transitionFn`.
  - Low-level helper (does not validate symbol membership).

- `m.run(input)` -> `State`
  - Consumes `input` (string or iterable of symbols) and returns the final state.
  - Throws `FsmInputError` if the input contains symbols not in the configured alphabet.

- `m.runWithTrace(input)` -> `{ finalState, trace }`
  - Same as `run` but also returns `trace: TraceStep[]` describing each transition `{ from, symbol, to }`.

## Common Errors

- `FsmConfigError` — thrown at machine creation when the configuration is malformed (missing states, incomplete transition table, or both/none of `transition`/`transitionFn`).
- `FsmInputError` — thrown during execution when the input contains a symbol outside the machine's alphabet.

## Quick Examples

### Basic transition-table machine

```ts
import { createMachine } from '@aashack/fsm';

const m = createMachine({
  states: ['A', 'B'] as const,
  alphabet: ['0', '1'] as const,
  start: 'A',
  finals: ['A'] as const,
  transition: {
    A: { '0': 'A', '1': 'B' },
    B: { '0': 'A', '1': 'B' },
  },
});

console.log(m.run('1010')); // final state
```

### Using a transition function

```ts
const m2 = createMachine({
  states: ['S0', 'S1'] as const,
  alphabet: ['a', 'b'] as const,
  start: 'S0',
  transitionFn: (state, symbol) => (state === 'S0' ? 'S1' : 'S0'),
});
```

## Notes

- Use `as const` when declaring `states` and `alphabet` for the best TypeScript inference.
- The library validates configuration shape strictly; prefer full transition tables for clearer static correctness unless you need computed transitions.
- `runWithTrace` is useful for debugging and educational purposes but can be expensive for long inputs.
