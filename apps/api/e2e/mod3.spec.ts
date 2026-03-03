import { test, expect } from "@playwright/test";

function expectedRemainder(binary: string) {
  // Use BigInt to safely compute remainders for long binary strings
  const n = BigInt(`0b${binary}`);
  return Number(n % 3n);
}


test("computes mod 3 for a valid binary string", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("binary-input").fill("1101");
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toHaveText("Done.");
  await expect(page.getByTestId("remainder")).toHaveText("1");
  await expect(page.getByTestId("final-state")).toHaveText("S1");
});

test("shows an error for invalid input", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("binary-input").fill("10a01");
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toContainText("Input must contain only");
});


test("all zeros -> remainder 0", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("binary-input").fill("00000");
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toHaveText("Done.");
  await expect(page.getByTestId("remainder")).toHaveText("0");
});

test("leading zeros are ignored logically", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("binary-input").fill("00110"); // 6 -> 0
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toHaveText("Done.");
  await expect(page.getByTestId("remainder")).toHaveText(String(expectedRemainder("00110")));
});

test("long binary input computes remainder correctly", async ({ page }) => {
  await page.goto("/");
  // 120-bit test: repeating pattern
  const bits = Array.from({ length: 120 }, (_, i) => (i % 2 ? "1" : "0")).join("");
  await page.getByTestId("binary-input").fill(bits);
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toHaveText("Done.");
  await expect(page.getByTestId("remainder")).toHaveText(String(expectedRemainder(bits)));
});

test("alternating pattern yields expected remainder", async ({ page }) => {
  await page.goto("/");
  const bits = "1010101"; // 85 -> 85 % 3 = 1
  await page.getByTestId("binary-input").fill(bits);
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toHaveText("Done.");
  await expect(page.getByTestId("remainder")).toHaveText(String(expectedRemainder(bits)));
});

test("input with whitespace shows validation error", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("binary-input").fill("10 01");
  await page.getByTestId("compute-btn").click();

  await expect(page.getByTestId("status")).toContainText("Input must contain only");
});
