import { describe, expect, it } from "vite-plus/test";
import { RouteTransitionManager } from "../src/route-transition";

describe("RouteTransitionManager", () => {
  it("should focus to mapped target by view key", async () => {
    let calledWithView = "";
    const manager = new RouteTransitionManager(
      async (target) => {
        calledWithView = JSON.stringify(target.position);
        return {
          position: target.position,
          target: target.target ?? [0, 0, 0],
          fov: target.fov ?? 45,
        };
      },
      {
        transitions: {
          hero: { position: [1, 2, 3], target: [0, 0, 0], fov: 30 },
        },
      },
    );

    const state = await manager.sync("hero");
    expect(calledWithView).toBe("[1,2,3]");
    expect(state?.fov).toBe(30);
  });
});
