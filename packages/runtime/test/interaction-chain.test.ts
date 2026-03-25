import { describe, expect, it } from "vite-plus/test";
import { CameraController } from "../src/camera-controller";
import { RouteTransitionManager } from "../src/route-transition";

describe("interaction chain", () => {
  it("should drive camera transition from route view", async () => {
    const controller = new CameraController({
      position: [3.6, 2.2, 4.8],
      target: [0, 0, 0],
      fov: 45,
    });

    const manager = new RouteTransitionManager(
      async (target) => await controller.focusTo(target, { duration: 60, easing: "linear" }),
      {
        transitions: {
          hero: {
            position: [0.2, 1.1, 2.5],
            target: [0, 0.3, 0],
            fov: 34,
          },
        },
      },
    );

    const result = await manager.sync("hero");
    expect(result?.position[0]).toBeCloseTo(0.2, 6);
    expect(result?.position[1]).toBeCloseTo(1.1, 6);
    expect(result?.position[2]).toBeCloseTo(2.5, 6);
    expect(controller.getState().fov).toBe(34);
  });
});
