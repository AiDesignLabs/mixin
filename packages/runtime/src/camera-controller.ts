import type { CameraState, EasingName, FocusOptions, FocusTarget, Vec3 } from "./types";

export const defaultCameraState: CameraState = {
  position: [3.6, 2.2, 4.8],
  target: [0, 0, 0],
  fov: 45,
};

type StateListener = (state: CameraState) => void;

const easingMap: Record<EasingName, (progress: number) => number> = {
  linear: (progress) => progress,
  easeInOutCubic: (progress) => {
    if (progress < 0.5) return 4 * progress * progress * progress;
    return 1 - (-2 * progress + 2) ** 3 / 2;
  },
  easeOutQuart: (progress) => 1 - (1 - progress) ** 4,
};

function cloneVec3(value: Vec3): Vec3 {
  return [value[0], value[1], value[2]];
}

function cloneState(state: CameraState): CameraState {
  return {
    position: cloneVec3(state.position),
    target: cloneVec3(state.target),
    fov: state.fov,
  };
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function lerpVec3(from: Vec3, to: Vec3, progress: number): Vec3 {
  return [
    lerp(from[0], to[0], progress),
    lerp(from[1], to[1], progress),
    lerp(from[2], to[2], progress),
  ];
}

function now(): number {
  if (typeof performance !== "undefined") return performance.now();
  return Date.now();
}

function requestFrame(frame: (timestamp: number) => void): number {
  if (typeof globalThis.requestAnimationFrame === "function")
    return globalThis.requestAnimationFrame(frame);
  return globalThis.setTimeout(() => frame(now()), 16) as unknown as number;
}

function cancelFrame(handle: number): void {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(handle);
    return;
  }
  clearTimeout(handle);
}

export class CameraController {
  private state: CameraState;
  private listeners = new Set<StateListener>();
  private frameHandle: number | null = null;
  private animationToken = 0;

  constructor(initialState: Partial<CameraState> = {}) {
    this.state = {
      position: cloneVec3(initialState.position ?? defaultCameraState.position),
      target: cloneVec3(initialState.target ?? defaultCameraState.target),
      fov: initialState.fov ?? defaultCameraState.fov,
    };
  }

  getState(): CameraState {
    return cloneState(this.state);
  }

  setState(next: Partial<CameraState>): CameraState {
    this.stopActiveAnimation();
    this.state = {
      position: cloneVec3(next.position ?? this.state.position),
      target: cloneVec3(next.target ?? this.state.target),
      fov: next.fov ?? this.state.fov,
    };
    this.emit();
    return this.getState();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  async focusTo(target: FocusTarget, options: FocusOptions = {}): Promise<CameraState> {
    const start = this.getState();
    const end: CameraState = {
      position: cloneVec3(target.position),
      target: cloneVec3(target.target ?? this.state.target),
      fov: target.fov ?? this.state.fov,
    };
    const duration = Math.max(50, options.duration ?? 900);
    const easing = easingMap[options.easing ?? "easeInOutCubic"];
    const token = ++this.animationToken;

    this.stopActiveFrame();

    return await new Promise<CameraState>((resolve) => {
      const startAt = now();

      const tick = (timestamp: number) => {
        if (token !== this.animationToken) {
          resolve(this.getState());
          return;
        }

        const rawProgress = Math.min((timestamp - startAt) / duration, 1);
        const progress = easing(rawProgress);

        this.state = {
          position: lerpVec3(start.position, end.position, progress),
          target: lerpVec3(start.target, end.target, progress),
          fov: lerp(start.fov, end.fov, progress),
        };
        this.emit();
        options.onUpdate?.(this.getState());

        if (rawProgress < 1) {
          this.frameHandle = requestFrame(tick);
          return;
        }

        this.frameHandle = null;
        options.onComplete?.(this.getState());
        resolve(this.getState());
      };

      this.frameHandle = requestFrame(tick);
    });
  }

  dispose(): void {
    this.stopActiveAnimation();
    this.listeners.clear();
  }

  private emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private stopActiveAnimation(): void {
    this.animationToken += 1;
    this.stopActiveFrame();
  }

  private stopActiveFrame(): void {
    if (this.frameHandle === null) return;
    cancelFrame(this.frameHandle);
    this.frameHandle = null;
  }
}
