# @aashack/fsm

A lightweight, type-safe TypeScript library for building and running deterministic finite state machines (DFAs).

## Features

- **Type-safe**: Full TypeScript support with generic state and symbol types for excellent inference
- **Flexible configuration**: Define machines using either a transition table or a custom transition function
- **Comprehensive validation**: Config validation catches errors early; runtime symbol validation prevents crashes
- **Execution tracing**: Built-in support for capturing detailed trace information during machine execution
- **Zero dependencies**: Minimal footprint, self-contained
- **Well-tested**: Extensive unit test coverage for edge cases and core functionality

## Installation

### Local Development (Workspace)

If you're working within the monorepo:

```bash
# Install root dependencies
npm install

# The FSM package is automatically available in the workspace
# if this was using yarn you can reference it via workspace:* in package.json, but with npm we use file: to link directly to the local package
# Reference it in your package.json as:
"dependencies": {
  "@aashack/fsm": "file:../../packages/fsm"
}
```

### After Publishing to npm

Once published, install via npm:

```bash
npm install @aashack/fsm
```

Then import and use:

```typescript
import { createMachine } from '@aashack/fsm';
```

## Quick Start

### Basic Usage

Define a simple 2-state machine:

```typescript
import { createMachine, type MachineConfig, FsmInputError } from '@aashack/fsm';

const config: MachineConfig<'S0' | 'S1', '0' | '1'> = {
  states: ['S0', 'S1'] as const,
  alphabet: ['0', '1'] as const,
  start: 'S0',
  finals: ['S0'] as const,
  transition: {
    S0: { '0': 'S0', '1': 'S1' },
    S1: { '0': 'S0', '1': 'S1' },
  },
};

const machine = createMachine(config);

// Run the machine
const finalState = machine.run('1010');
console.log(finalState); // "S0"

// Check if accepting
console.log(machine.isFinal(finalState)); // true
```

### Using a Transition Function

Instead of a static table, provide a custom function:

```typescript
const config: MachineConfig<'Even' | 'Odd', 'a' | 'b'> = {
  states: ['Even', 'Odd'] as const,
  alphabet: ['a', 'b'] as const,
  start: 'Even',
  transitionFn: (state, symbol) => {
    // Toggle between Even and Odd on any input
    return state === 'Even' ? 'Odd' : 'Even';
  },
};

const machine = createMachine(config);
const result = machine.run('aba'); // "Odd"
```

### Execution Tracing

Capture detailed step-by-step execution:

```typescript
const { finalState, trace } = machine.runWithTrace('101');

console.log(finalState); // "S1"
console.log(trace); // Array of { from, symbol, to } objects
trace.forEach((step) => {
  console.log(`${step.from} --${step.symbol}--> ${step.to}`);
});
```

## API

### `createMachine(config)`

Factory function that creates an immutable DFA instance.

**Parameters:**

- `config: MachineConfig<State, Symbol>` — Configuration object defining the machine

**Returns:**

- `Machine<State, Symbol>` — Frozen object with methods to run the machine

**Throws:**

- `FsmConfigError` — If the configuration is invalid (missing states, incomplete transition table, etc.)

### Machine Methods

#### `startState(): State`

Returns the configured start state.

#### `isFinal(state): boolean`

Returns `true` if the state is in the finals set. If no finals are defined, always returns `true`.

#### `step(state, symbol): State`

Performs a single transition without validation. Low-level API for advanced use.

#### `run(input): State`

Executes the machine on a complete input sequence (string or iterable of symbols).

**Throws:**

- `FsmInputError` — If any symbol is not in the configured alphabet

#### `runWithTrace(input): TraceResult`

Like `run()` but returns an object containing both the final state and a complete trace of all transitions.

```typescript
interface TraceResult<State, Symbol> {
  finalState: State;
  trace: readonly TraceStep<State, Symbol>[];
}

interface TraceStep<State, Symbol> {
  from: State;
  symbol: Symbol;
  to: State;
}
```

## Error Handling

### `FsmConfigError`

Thrown during machine creation if the configuration is invalid:

- Start state not in states
- Final state not in states
- Missing transition arrows in the table
- Invalid next state in transition table
- Both `transition` and `transitionFn` provided (or neither)

### `FsmInputError`

Thrown during execution if input contains invalid symbols:

- Symbol not in the declared alphabet

```typescript
import { FsmConfigError, FsmInputError } from '@aashack/fsm';

try {
  const machine = createMachine(badConfig);
} catch (e) {
  if (e instanceof FsmConfigError) {
    console.error('Configuration error:', e.message);
  }
}

try {
  machine.run('invalid');
} catch (e) {
  if (e instanceof FsmInputError) {
    console.error('Input error:', e.message);
  }
}
```

## Configuration Details

### MachineConfig<State, Symbol>

```typescript
type MachineConfig<State extends string, Symbol extends string> = {
  states: readonly State[]; // All valid states
  alphabet: readonly Symbol[]; // All valid input symbols
  start: State; // Initial state
  finals?: readonly State[]; // Accepting states (optional; if omitted, all states accept)
} & (
  | { transition: TransitionTable<State, Symbol>; transitionFn?: never }
  | { transitionFn: TransitionFn<State, Symbol>; transition?: never }
);
```

**Key Points:**

- Use `as const` assertions for excellent TypeScript inference
- Provide _either_ a `transition` table or a `transitionFn`, but not both
- If `finals` is omitted, the machine always accepts regardless of final state
- All state and symbol types are constrained to strings for simplicity

## Testing

Run the test suite:

```bash
npm test
```

Tests are located in `test/` and use [Vitest](https://vitest.dev/).

## Publishing to npm

### Prerequisites

1. Create or log in to your npm account
2. Ensure you have publishing rights to the `@aashack` scope (or create your own)

### Steps

1. **Update version** in `packages/fsm/package.json`:

   ```json
   {
     "name": "@aasahck/fsm",
     "version": "1.0.0",
     "private": false
   }
   ```

2. **Set the `private` flag to `false`** (shown above) to allow publishing

3. **Build the package** (if a build step is needed; currently this package is published as-is with TypeScript sources):

   ```bash
   npm run build  # if a build script is configured
   ```

4. **Authenticate with npm**:

   ```bash
   npm login
   # Enter your npm username and password
   ```

5. **Publish from the package directory**:

   ```bash
   cd packages/fsm
   npm publish
   ```

   Or publish from the root with scoped packages:

   ```bash
   npm publish packages/fsm
   ```

6. **Tag the release** (recommended):
   ```bash
   git tag fsm@1.0.0
   git push origin fsm@1.0.0
   ```

### Accessing Published Package

Once published to npm, users can install and use it:

```bash
# Installation
npm install @aasahck/fsm

# In your code
import { createMachine, FsmConfigError, FsmInputError } from "@aashack/fsm";
```

### Automated Publishing (Optional)

Set up GitHub Actions to auto-publish on release:

```yaml
name: Publish FSM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish packages/fsm
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Examples

See the [apps/api](../../apps/api) directory for a complete example that uses this library to compute mod-3 remainders via a DFA.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a PR:

```bash
npm test
```
