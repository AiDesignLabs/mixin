import { inject } from "vue";
import { SCENE_CONTEXT_KEY, type SceneContextValue } from "./context";
import { getActiveSceneContext } from "./scene-context-bridge";

export function resolveSceneContext(errorMessage: string): SceneContextValue {
  const injected = inject(SCENE_CONTEXT_KEY, null);
  if (injected) return injected;

  const bridged = getActiveSceneContext();
  if (bridged) return bridged;

  throw new Error(errorMessage);
}
