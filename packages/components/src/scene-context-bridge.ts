import type { SceneContextValue } from "./context";

let activeSceneContext: SceneContextValue | null = null;

export function setActiveSceneContext(context: SceneContextValue | null): void {
  activeSceneContext = context;
}

export function getActiveSceneContext(): SceneContextValue | null {
  return activeSceneContext;
}
