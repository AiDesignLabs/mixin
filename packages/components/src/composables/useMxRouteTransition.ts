import type { FocusOptions, FocusTarget } from "@mixin/runtime";
import { RouteTransitionManager } from "@mixin/runtime";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMxCamera } from "./useMxCamera";

export interface UseMxRouteTransitionOptions {
  transitions: Record<string, FocusTarget>;
  viewKey?: string;
  defaultView?: string;
  focusOptions?: FocusOptions;
}

export function useMxRouteTransition(options: UseMxRouteTransitionOptions) {
  const { focusTo } = useMxCamera();
  const route = useRoute();
  const router = useRouter();
  const viewKey = options.viewKey ?? "view";

  const manager = new RouteTransitionManager((target) => focusTo(target), {
    transitions: options.transitions,
    defaultView: options.defaultView,
  });

  watch(
    () => route.query[viewKey],
    async (rawView) => {
      const view = Array.isArray(rawView) ? rawView[0] : rawView;
      await manager.sync(view, options.focusOptions);
    },
    { immediate: true },
  );

  async function setView(view: string, replace = true): Promise<void> {
    const method = replace ? router.replace : router.push;
    await method({
      query: {
        ...route.query,
        [viewKey]: view,
      },
    });
  }

  return {
    setView,
    syncView: async (view: string | null | undefined, focusOptions?: FocusOptions) =>
      await manager.sync(view, focusOptions),
  };
}
