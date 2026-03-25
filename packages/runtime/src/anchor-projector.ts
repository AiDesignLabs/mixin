import type { AnchorProjectionInput, AnchorProjectionOutput } from "./types";

export function projectToScreen(input: AnchorProjectionInput): AnchorProjectionOutput {
  return {
    x: (input.x * 0.5 + 0.5) * input.width,
    y: (-input.y * 0.5 + 0.5) * input.height,
    visible: input.z > -1 && input.z < 1,
  };
}
