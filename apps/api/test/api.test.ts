import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("POST /api/mod3", () => {
  it("returns remainder and final state", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/mod3",
      payload: { input: "1111" }
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ remainder: 0, finalState: "S0" });

    await app.close();
  });

  it("rejects invalid input", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/mod3",
      payload: { input: "10a01" }
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty("error");

    await app.close();
  });
});
