<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { resolveSceneContext } from "../resolve-scene-context";

defineOptions({
  name: "MxOverlay",
});

const rootEl = ref<HTMLElement | null>(null);
const context = resolveSceneContext("MxOverlay must be used inside <MxScene>.");

function handleFocusIn(): void {
  context.arbiter.lockDom();
}

function handleFocusOut(event: FocusEvent): void {
  const root = rootEl.value;
  if (!root) return;

  const next = event.relatedTarget;
  if (next instanceof Node && root.contains(next)) return;

  context.arbiter.unlockDom();
}

onMounted(() => {
  if (!rootEl.value) return;

  rootEl.value.addEventListener("focusin", handleFocusIn);
  rootEl.value.addEventListener("focusout", handleFocusOut);
});

onBeforeUnmount(() => {
  context.arbiter.unlockDom();
  if (!rootEl.value) return;
  rootEl.value.removeEventListener("focusin", handleFocusIn);
  rootEl.value.removeEventListener("focusout", handleFocusOut);
});
</script>

<template>
  <aside ref="rootEl" class="mx-overlay">
    <slot />
  </aside>
</template>

<style scoped>
.mx-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
</style>
