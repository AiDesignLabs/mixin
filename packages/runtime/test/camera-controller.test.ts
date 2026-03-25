import { describe, expect, it } from "vite-plus/test";
import { CameraController } from "../src/camera-controller";

describe("CameraController", () => {
  it("focusTo should resolve to target state", async () => {
    const controller = new CameraController({
      position: [0, 0, 10],
      target: [0, 0, 0],
      fov: 45,
    });

    const result = await controller.focusTo(
      {
        position: [2, 3, 4],
        target: [0, 1, 0],
        fov: 35,
      },
      {
        duration: 80,
        easing: "linear",
      },
    );

    expect(result.position).toEqual([2, 3, 4]);
    expect(result.target).toEqual([0, 1, 0]);
    expect(result.fov).toBe(35);
  });
});
