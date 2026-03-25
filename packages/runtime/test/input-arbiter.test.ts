import { describe, expect, it } from "vite-plus/test";
import { InputArbiter } from "../src/input-arbiter";

describe("InputArbiter", () => {
  it("should block world interaction when dom is locked", () => {
    const arbiter = new InputArbiter();
    expect(arbiter.canStartWorldInteraction()).toBe(true);

    arbiter.lockDom();
    expect(arbiter.canStartWorldInteraction()).toBe(false);

    arbiter.unlockDom();
    expect(arbiter.canStartWorldInteraction()).toBe(true);
  });

  it("should block page scroll while world dragging", () => {
    const arbiter = new InputArbiter();
    expect(arbiter.shouldBlockPageScroll()).toBe(false);

    arbiter.beginWorldDrag();
    expect(arbiter.shouldBlockPageScroll()).toBe(true);

    arbiter.endWorldDrag();
    expect(arbiter.shouldBlockPageScroll()).toBe(false);
  });
});
