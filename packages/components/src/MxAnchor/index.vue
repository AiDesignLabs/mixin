<script setup lang="ts">
import { computed } from "vue";
import { resolveSceneContext } from "../resolve-scene-context";

defineOptions({
  name: "MxAnchor",
});

const props = withDefaults(
  defineProps<{
    target: string;
    offsetX?: number;
    offsetY?: number;
    hideWhenMissing?: boolean;
  }>(),
  {
    offsetX: 0,
    offsetY: 0,
    hideWhenMissing: true,
  },
);

const sceneContext = resolveSceneContext("MxAnchor must be used inside <MxScene>.");

const anchorState = computed(() => sceneContext.getAnchorState(props.target));

const anchorStyle = computed<Record<string, string>>(() => {
  const state = anchorState.value;
  if (!state) {
    return {
      opacity: props.hideWhenMissing ? "0" : "1",
      transform: "translate(-9999px, -9999px)",
      pointerEvents: "none",
    };
  }

  return {
    opacity: state.visible ? "1" : "0",
    transform: `translate(${state.x + props.offsetX}px, ${state.y + props.offsetY}px) translate(-50%, -50%)`,
    pointerEvents: state.visible ? "auto" : "none",
  };
});
</script>

<template>
  <div class="mx-anchor" :style="anchorStyle">
    <slot />
  </div>
</template>

<style scoped>
.mx-anchor {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
</style>
