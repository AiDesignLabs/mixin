import { describe, expect, it } from "vite-plus/test";
import { projectToScreen } from "../src/anchor-projector";

describe("projectToScreen", () => {
  it("should map normalized point to screen coordinates", () => {
    const point = projectToScreen({
      x: 0,
      y: 0,
      z: 0,
      width: 1000,
      height: 600,
    });

    expect(point.x).toBe(500);
    expect(point.y).toBe(300);
    expect(point.visible).toBe(true);
  });
});
