import type { CameraState, FocusOptions, FocusTarget } from "./types";

export type FocusExecutor = (target: FocusTarget, options?: FocusOptions) => Promise<CameraState>;

export interface RouteTransitionOptions {
  transitions: Record<string, FocusTarget>;
  defaultView?: string;
}

export class RouteTransitionManager {
  private transitions: Record<string, FocusTarget>;
  private defaultView?: string;
  private focusTo: FocusExecutor;

  constructor(focusTo: FocusExecutor, options: RouteTransitionOptions) {
    this.focusTo = focusTo;
    this.transitions = options.transitions;
    this.defaultView = options.defaultView;
  }

  resolveTarget(view: string | null | undefined): FocusTarget | undefined {
    if (view && this.transitions[view]) return this.transitions[view];
    if (this.defaultView && this.transitions[this.defaultView])
      return this.transitions[this.defaultView];
    return undefined;
  }

  async sync(view: string | null | undefined, options?: FocusOptions): Promise<CameraState | null> {
    const target = this.resolveTarget(view);
    if (!target) return null;
    return await this.focusTo(target, options);
  }
}
