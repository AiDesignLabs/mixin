<script setup lang="ts">
import type { CameraState, FocusOptions, FocusTarget } from "@mixin/runtime";
import { CameraController, defaultCameraState, InputArbiter } from "@mixin/runtime";
import { onBeforeUnmount, provide, ref, shallowReactive } from "vue";
import { SCENE_CONTEXT_KEY, type AnchorScreenState, type SceneContextValue } from "../context";
import { setActiveSceneContext } from "../scene-context-bridge";

defineOptions({
  name: "MxScene",
});

const props = defineProps<{
  initialCamera?: Partial<CameraState>;
}>();

const targets = shallowReactive<Record<string, FocusTarget>>({});
const anchors = shallowReactive<Record<string, AnchorScreenState>>({});

const initial: CameraState = {
  position: [...(props.initialCamera?.position ?? defaultCameraState.position)],
  target: [...(props.initialCamera?.target ?? defaultCameraState.target)],
  fov: props.initialCamera?.fov ?? defaultCameraState.fov,
};

const controller = new CameraController(initial);
const arbiter = new InputArbiter();
const cameraState = ref<CameraState>(controller.getState());

const stopWatchingState = controller.subscribe((state) => {
  cameraState.value = state;
});

async function focusTo(target: string | FocusTarget, options?: FocusOptions): Promise<CameraState> {
  if (typeof target === "string") {
    const resolved = targets[target];
    if (!resolved) throw new Error(`Target "${target}" is not registered in current <MxScene>.`);
    return await controller.focusTo(resolved, options);
  }
  return await controller.focusTo(target, options);
}

const sceneContext: SceneContextValue = {
  controller,
  arbiter,
  focusTo,
  registerTarget: (id, target) => {
    targets[id] = {
      position: [...target.position],
      target: [...(target.target ?? [0, 0, 0])],
      fov: target.fov,
    };
  },
  getTarget: (id) => targets[id],
  setAnchorState: (id, state) => {
    anchors[id] = state;
  },
  getAnchorState: (id) => anchors[id],
};

provide(SCENE_CONTEXT_KEY, sceneContext);
setActiveSceneContext(sceneContext);

onBeforeUnmount(() => {
  setActiveSceneContext(null);
  stopWatchingState();
  controller.dispose();
});
</script>

<template>
  <section class="mx-scene">
    <slot :focus-to="focusTo" :camera-state="cameraState" :controller="controller" />
  </section>
</template>

<style scoped>
.mx-scene {
  position: relative;
  width: 100%;
  min-height: 360px;
  overflow: hidden;
}
</style>
