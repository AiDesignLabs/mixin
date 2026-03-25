import type {
  CameraController,
  CameraState,
  FocusOptions,
  FocusTarget,
  InputArbiter,
} from "@mixin/runtime";
import type { InjectionKey } from "vue";

export interface AnchorScreenState {
  x: number;
  y: number;
  visible: boolean;
}

export type FocusTo = (
  target: string | FocusTarget,
  options?: FocusOptions,
) => Promise<CameraState>;

export interface SceneContextValue {
  controller: CameraController;
  arbiter: InputArbiter;
  focusTo: FocusTo;
  registerTarget: (id: string, target: FocusTarget) => void;
  getTarget: (id: string) => FocusTarget | undefined;
  setAnchorState: (id: string, state: AnchorScreenState) => void;
  getAnchorState: (id: string) => AnchorScreenState | undefined;
}

export const SCENE_CONTEXT_KEY: InjectionKey<SceneContextValue> = Symbol("mixin-scene-context");
