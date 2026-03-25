import type { InputArbiterSnapshot } from "./types";

export class InputArbiter {
  private domLocked = false;
  private worldDragging = false;

  lockDom(): void {
    this.domLocked = true;
  }

  unlockDom(): void {
    this.domLocked = false;
  }

  beginWorldDrag(): void {
    this.worldDragging = true;
  }

  endWorldDrag(): void {
    this.worldDragging = false;
  }

  canStartWorldInteraction(): boolean {
    return !this.domLocked;
  }

  shouldBlockPageScroll(): boolean {
    return this.worldDragging;
  }

  getSnapshot(): InputArbiterSnapshot {
    return {
      domLocked: this.domLocked,
      worldDragging: this.worldDragging,
    };
  }
}
