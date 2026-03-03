import { describe, expect, it } from "vitest";
import { createMachine, FsmConfigError, FsmInputError } from "../src/index.js";
 
// deterministic finite automaton tests - mostly focused on validating the config 
// and basic run behaviour of the machine, not so much on complex language acceptance tests 
// (those are in mod3.test.ts)
describe("createMachine / run", () => {
  it("runs a tiny DFA and returns final state", () => {
    const m = createMachine({
      states: ["A", "B"] as const,
      alphabet: ["0", "1"] as const,
      start: "A",
      finals: ["A"] as const,
      transition: {
        A: { "0": "A", "1": "B" },
        B: { "0": "A", "1": "B" }
      }
    });

    expect(m.run("")).toBe("A");
    expect(m.run("1")).toBe("B");
    expect(m.run("10")).toBe("A");
  });

  it("throws on invalid symbol", () => {
    const m = createMachine({
      states: ["S0"] as const,
      alphabet: ["0"] as const,
      start: "S0",
      transition: { S0: { "0": "S0" } }
    });

    expect(() => m.run("1")).toThrowError(FsmInputError);
  });

  it("validates transition table completeness", () => {
    expect(() => createMachine({
      states: ["S0", "S1"] as const,
      alphabet: ["0", "1"] as const,
      start: "S0",
      transition: {
        // Missing S1 row and missing "1" transition
        S0: { "0": "S0" } as any
      } as any
    })).toThrowError(FsmConfigError);
  });

    it("accepts iterable input (array of symbols)", () => {
    const m = createMachine({
      states: ["A", "B"] as const,
      alphabet: ["x", "y"] as const,
      start: "A",
      transition: {
        A: { x: "B", y: "A" },
        B: { x: "A", y: "B" }
      }
    });

    // A --x--> B --y--> B --x--> A
    expect(m.run(["x", "y", "x"]).toString()).toBe("A");
  });

  it("runWithTrace returns a detailed step trace and final state", () => {
    const m = createMachine({
      states: ["A", "B"] as const,
      alphabet: ["0", "1"] as const,
      start: "A",
      transition: {
        A: { "0": "A", "1": "B" },
        B: { "0": "A", "1": "B" }
      }
    });

    const res = m.runWithTrace("10");
    expect(res.finalState).toBe("A");
    expect(res.trace).toHaveLength(2);
    expect(res.trace[0]).toEqual({ from: "A", symbol: "1", to: "B" });
    expect(res.trace[1]).toEqual({ from: "B", symbol: "0", to: "A" });
  });

  it("isFinal returns true for all states when no finals are defined", () => {
    const m = createMachine({
      states: ["S0", "S1"] as const,
      alphabet: ["0"] as const,
      start: "S0",
      transition: {
        S0: { "0": "S1" },
        S1: { "0": "S0" }
      }
    });

    expect(m.isFinal("S0")).toBe(true);
    expect(m.isFinal("S1")).toBe(true);
  });

  it("supports providing a transition function instead of a table", () => {
    const fn = (state: "S0" | "S1", symbol: "a" | "b") => {
      if (state === "S0") return symbol === "a" ? "S1" : "S0";
      return symbol === "b" ? "S0" : "S1";
    };

    const m = createMachine({
      states: ["S0", "S1"] as const,
      alphabet: ["a", "b"] as const,
      start: "S0",
      transitionFn: fn
    });

    expect(m.run("a")).toBe("S1");
    expect(m.run("ab")).toBe("S0");
  });

  it("throws when both transition table and transitionFn are provided", () => {
    expect(() => createMachine({
      states: ["S0"] as const,
      alphabet: ["0"] as const,
      start: "S0",
      transition: { S0: { "0": "S0" } },
      transitionFn: (() => "S0") as any
    } as any)).toThrowError(FsmConfigError);
  });
});
