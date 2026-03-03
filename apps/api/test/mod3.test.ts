import { describe, expect, it } from "vitest";
import { FsmInputError } from "@aashack/fsm";
import { mod3Config, remainderFromState, modThree, modThreeWithTrace } from "../src/mod3.js";

// sanity-check the configuration object itself (mostly for types and completeness)
describe("mod3 configuration", () => {
  it("defines three states and an alphabet of bits", () => {
    expect(mod3Config.states).toEqual(["S0", "S1", "S2"]);
    expect(mod3Config.alphabet).toEqual(["0", "1"]);
  });
});

// behaviour of the exported helpers

describe("remainderFromState", () => {
  it("maps S0 to 0, S1 to 1, S2 to 2", () => {
    expect(remainderFromState("S0")).toBe(0);
    expect(remainderFromState("S1")).toBe(1);
    expect(remainderFromState("S2")).toBe(2);
  });
});

describe("modThree", () => {
  it("returns 0 for empty input", () => {
    expect(modThree("")).toEqual({ remainder: 0, finalState: "S0" });
  });

  it("computes correct remainders for several binary strings", () => {
    const check = (bin: string) => {
      const expectedRem = (parseInt(bin, 2) % 3) as 0 | 1 | 2;
      const { remainder, finalState } = modThree(bin);
      expect(remainder).toBe(expectedRem);
      // final state should correspond to remainder via remainderFromState
      if (expectedRem === 0) expect(finalState).toBe("S0");
      if (expectedRem === 1) expect(finalState).toBe("S1");
      if (expectedRem === 2) expect(finalState).toBe("S2");
    };

    check("1");
    check("10");
    check("111");
    check("1011");
  });

  it("throws FsmInputError on characters outside the alphabet", () => {
    expect(() => modThree("102" as any)).toThrowError(FsmInputError);
    expect(() => modThree("abc" as any)).toThrowError(FsmInputError);
  });
});

describe("modThreeWithTrace", () => {
  it("includes each step of the computation in the trace", () => {
    const { remainder, finalState, trace } = modThreeWithTrace("101");
    expect(remainder).toBe(5 % 3 as 0 | 1 | 2);
    expect(finalState).toBe("S2");
    // trace should have length equal to input length
    expect(trace).toHaveLength(3);
    // first step: from S0 consuming '1' -> S1
    expect(trace[0]).toEqual({ from: "S0", symbol: "1", to: "S1" });
  });
});
