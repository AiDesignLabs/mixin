import type { WorldContextValue } from "./world-context";

let activeWorldContext: WorldContextValue | null = null;

export function setActiveWorldContext(context: WorldContextValue | null): void {
  activeWorldContext = context;
}

export function getActiveWorldContext(): WorldContextValue | null {
  return activeWorldContext;
}
