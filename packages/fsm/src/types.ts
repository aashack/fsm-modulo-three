/**
 * Minimal deterministic finite state machine (DFA) types.
 *
 * We keep it generic (State/Symbol are string unions) so downstream code gets
 * excellent type inference with `as const` configs.
 */

export type TransitionTable<State extends string, Symbol extends string> =
  Record<State, Record<Symbol, State>>;

export type TransitionFn<State extends string, Symbol extends string> =
  (state: State, symbol: Symbol) => State;
export type TraceStep<State extends string, Symbol extends string> = Readonly<{
  from: State;
  symbol: Symbol;
  to: State;
}>;

export type MachineConfig<
  State extends string,
  Symbol extends string
> = Readonly<{
  states: readonly State[];
  alphabet: readonly Symbol[];
  start: State;
  finals?: readonly State[];
} & (
  | { transition: TransitionTable<State, Symbol>; transitionFn?: never }
  | { transitionFn: TransitionFn<State, Symbol>; transition?: never }
)>;

export type RunResult<State extends string> = Readonly<{
  finalState: State;
}>;

export type TraceResult<State extends string, Symbol extends string> = Readonly<{
  finalState: State;
  trace: readonly TraceStep<State, Symbol>[];
}>;

// Finite State Machine config error: invalid config object passed to createMachine
export class FsmConfigError extends Error {
  override name = "FsmConfigError";
}

//// Finite State Machine input error: invalid symbol encountered during run
export class FsmInputError extends Error {
  override name = "FsmInputError";
}
