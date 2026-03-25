export type Vec3 = [number, number, number];

export interface CameraState {
  position: Vec3;
  target: Vec3;
  fov: number;
}

export interface FocusTarget {
  position: Vec3;
  target?: Vec3;
  fov?: number;
}

export type EasingName = "linear" | "easeInOutCubic" | "easeOutQuart";

export interface FocusOptions {
  duration?: number;
  easing?: EasingName;
  onUpdate?: (state: CameraState) => void;
  onComplete?: (state: CameraState) => void;
}

export interface AnchorProjectionInput {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}

export interface AnchorProjectionOutput {
  x: number;
  y: number;
  visible: boolean;
}

export interface InputArbiterSnapshot {
  domLocked: boolean;
  worldDragging: boolean;
}
