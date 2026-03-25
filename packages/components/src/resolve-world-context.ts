import { inject } from "vue";
import { getActiveWorldContext } from "./world-context-bridge";
import { WORLD_CONTEXT_KEY, type WorldContextValue } from "./world-context";

export function resolveWorldContext(errorMessage: string): WorldContextValue {
  const injected = inject(WORLD_CONTEXT_KEY, null);
  if (injected) return injected;

  const bridged = getActiveWorldContext();
  if (bridged) return bridged;

  throw new Error(errorMessage);
}
