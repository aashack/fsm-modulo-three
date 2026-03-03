# Policy Reporter – FSM / mod-3 assignment (Advanced)

This repo contains:

- `packages/fsm`: a small deterministic finite state machine (DFA) library
- `fsm-api`: an API + tiny browser UI that uses the FSM library to compute `modThree` on binary strings

## Initial Requirements

My local setup on Windows 11 with Node v22 and npm 10.9.2. The project is built with TypeScript and uses Playwright for end-to-end testing, along with Vitest for unit tests.

Node Version: v22.17.1
NPM Version: 10.9.2

There is no local database or external services required for this project. The API is self-contained and runs in-memory.

## Quick start

```bash
npm install
npm test
npm run dev
```

Then open http://127.0.0.1:3000

## API

### POST /api/mod3

Body:

```json
{ "input": "1101" }
```

Response:

```json
{ "remainder": 1, "finalState": "S1" }
```

### Input rules / assumptions

- Input must be a string containing only `0` and `1`.
- Empty string is treated as `0` (remainder 0). This matches the DFA concept of consuming no symbols and remaining in the start state.

## End-to-end tests

They live in `fsm-api/e2e/`.
