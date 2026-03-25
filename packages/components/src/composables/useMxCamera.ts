import type { SceneContextValue } from "../context";
import { resolveSceneContext } from "../resolve-scene-context";

export function useMxCamera(): Pick<SceneContextValue, "focusTo" | "controller"> {
  const context = resolveSceneContext("useMxCamera must be used inside <MxScene>.");

  return {
    focusTo: context.focusTo,
    controller: context.controller,
  };
}
