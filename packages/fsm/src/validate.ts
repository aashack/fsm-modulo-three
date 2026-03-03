import { FsmConfigError, type MachineConfig, type TransitionTable } from "./types.js";

/*
 * validate.ts - Configuration validation for the FSM library
 *
 * This module exposes `validateConfig` which performs a series of static
 * checks on a `MachineConfig` before a machine is created. The purpose of the
 * validation is to fail fast on malformed configurations and provide clear
 * errors to callers. High-level validation steps:
 *
 * 1. Build sets from the provided `states` and `alphabet` arrays for efficient
 *    membership tests.
 * 2. Ensure the configured `start` state is one of the declared `states`.
 * 3. If `finals` are provided, ensure each final state exists in `states`.
 * 4. Confirm exactly one of `transition` (a full transition table) or
 *    `transitionFn` (a custom function) is provided. Supplying both or none
 *    results in a `FsmConfigError`.
 * 5. If a transition table is provided, run structural validation to ensure
 *    the table contains an entry for every declared state, contains exactly
 *    the expected symbols for each state, and that every target state in the
 *    table is a known state. Any deviation raises `FsmConfigError`.
 *
 * The validator focuses on shape/completeness rather than runtime behaviour
 * (runtime symbol validation is performed when executing the machine).
 */

// Helper function to convert an array of strings into a Set for O(1) membership checks.
function setOf<T extends string>(items: readonly T[]) {
  return new Set(items);
}

// Main validation function that checks the integrity of the provided machine configuration.
export function validateConfig<State extends string, Symbol extends string>(
  config: MachineConfig<State, Symbol>
): void {
  const states = setOf(config.states);
  const alphabet = setOf(config.alphabet);

  //  Check that the start state is valid
  if (!states.has(config.start)) {
    throw new FsmConfigError(`Start state '${config.start}' is not in 'states'.`);
  }

  // If finals are provided, check that each final state is valid
  if (config.finals) {
    for (const f of config.finals) {
      if (!states.has(f)) {
        throw new FsmConfigError(`Final state '${f}' is not in 'states'.`);
      }
    }
  }

  const hasTable = "transition" in config;
  const hasFn = "transitionFn" in config;

  if (hasTable === hasFn) {
    throw new FsmConfigError(`Provide exactly one of 'transition' or 'transitionFn'.`);
  }

  if (hasTable) {
    validateTransitionTable(config.transition as TransitionTable<State, Symbol>, config.states, config.alphabet);
  }
}

// Validates that a provided transition table is complete and well-formed. Checks that:
// - Every declared state has an entry in the table.
// - Each state has exactly the expected symbols as keys.
// - Every target state in the table is a known state.
function validateTransitionTable<State extends string, Symbol extends string>(
  table: TransitionTable<State, Symbol>,
  statesList: readonly State[],
  alphabetList: readonly Symbol[]
): void {
  const states = new Set(statesList);
  const alphabet = new Set(alphabetList);

  // Ensure table has exactly the expected states (no missing states, no extras)
  for (const s of statesList) {
    if (!(s in table)) {
      throw new FsmConfigError(`Transition table is missing state '${s}'.`);
    }
  }
  for (const key of Object.keys(table) as State[]) {
    if (!states.has(key)) {
      throw new FsmConfigError(`Transition table contains unknown state '${key}'.`);
    }
  }

  // For each state, ensure it has exactly the expected symbols and points to valid states
  for (const s of statesList) {
    const row = table[s];
    for (const a of alphabetList) {
      if (!(a in row)) {
        throw new FsmConfigError(`Transition table is missing symbol '${a}' for state '${s}'.`);
      }
      const next = row[a];
      if (!states.has(next)) {
        throw new FsmConfigError(`Transition table has invalid next state '${next}' for (${s}, ${a}).`);
      }
    }
    for (const sym of Object.keys(row) as Symbol[]) {
      if (!alphabet.has(sym)) {
        throw new FsmConfigError(`Transition table contains unknown symbol '${sym}' for state '${s}'.`);
      }
    }
  }
}
