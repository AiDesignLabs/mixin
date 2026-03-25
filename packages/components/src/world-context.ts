import type { FocusTarget, Vec3 } from "@mixin/runtime";
import type { Object3D, PerspectiveCamera, Scene } from "three";
import type { InjectionKey } from "vue";

export interface ModelRegistration {
  id: string;
  object: Object3D;
  focusOffset?: Vec3;
  focusFov?: number;
  interactive?: boolean;
  onClick?: () => void;
}

export interface WorldContextValue {
  scene: Scene;
  camera: PerspectiveCamera;
  registerModel: (registration: ModelRegistration) => () => void;
  registerTarget: (id: string, target: FocusTarget) => void;
}

export const WORLD_CONTEXT_KEY: InjectionKey<WorldContextValue> = Symbol("mixin-world-context");
