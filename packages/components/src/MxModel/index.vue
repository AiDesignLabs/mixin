<script setup lang="ts">
import type { Vec3 } from "@mixin/runtime";
import type { Object3D } from "three";
import { watch } from "vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { resolveWorldContext } from "../resolve-world-context";

defineOptions({
  name: "MxModel",
});

type ModelStatus = "idle" | "loading" | "ready" | "error";

const props = withDefaults(
  defineProps<{
    id: string;
    src: string;
    position?: Vec3;
    rotation?: Vec3;
    scale?: number | Vec3;
    focusOffset?: Vec3;
    focusFov?: number;
    interactive?: boolean;
    visible?: boolean;
  }>(),
  {
    position: () => [0, 0, 0],
    rotation: () => [0, 0, 0],
    scale: 1,
    focusOffset: () => [0, 0, 2.4],
    focusFov: 35,
    interactive: true,
    visible: true,
  },
);

const emit = defineEmits<{
  (event: "status-change", status: ModelStatus): void;
  (event: "load-start", id: string): void;
  (event: "load", id: string): void;
  (event: "error", payload: { id: string; error: unknown }): void;
  (event: "click", id: string): void;
}>();

const world = resolveWorldContext("MxModel must be used inside <MxWorld>.");

const status = ref<ModelStatus>("idle");
let modelRoot: Object3D | null = null;
let unregister: (() => void) | null = null;
let loadingToken = 0;

function setStatus(next: ModelStatus): void {
  status.value = next;
  emit("status-change", next);
}

function disposeObject(object: Object3D): void {
  object.traverse((node) => {
    const mesh = node as Object3D & {
      geometry?: { dispose: () => void };
      material?: { dispose: () => void } | { dispose: () => void }[];
    };
    mesh.geometry?.dispose?.();
    if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose?.());
    else mesh.material?.dispose?.();
  });
}

function cleanupModel(): void {
  unregister?.();
  unregister = null;
  if (modelRoot) {
    disposeObject(modelRoot);
    modelRoot = null;
  }
}

function applyTransform(): void {
  if (!modelRoot) return;

  modelRoot.position.set(...props.position);
  modelRoot.rotation.set(...props.rotation);

  if (Array.isArray(props.scale)) modelRoot.scale.set(...props.scale);
  else modelRoot.scale.setScalar(props.scale);
}

function registerModel(root: Object3D): void {
  unregister?.();
  unregister = world.registerModel({
    id: props.id,
    object: root,
    focusOffset: props.focusOffset,
    focusFov: props.focusFov,
    interactive: props.interactive,
    onClick: () => emit("click", props.id),
  });
}

function loadModel(): void {
  cleanupModel();
  const token = ++loadingToken;
  const loader = new GLTFLoader();

  setStatus("loading");
  emit("load-start", props.id);

  loader.load(
    props.src,
    (gltf) => {
      if (token !== loadingToken) return;
      const root = gltf.scene ?? gltf.scenes[0];
      if (!root) {
        setStatus("error");
        emit("error", { id: props.id, error: new Error("GLTF has no scene node") });
        return;
      }

      root.visible = props.visible;
      modelRoot = root;
      applyTransform();
      registerModel(root);
      setStatus("ready");
      emit("load", props.id);
    },
    undefined,
    (error) => {
      if (token !== loadingToken) return;
      setStatus("error");
      emit("error", { id: props.id, error });
    },
  );
}

watch(
  () => props.src,
  () => {
    loadModel();
  },
);

watch(
  () => props.visible,
  (visible) => {
    if (modelRoot) modelRoot.visible = visible;
  },
);

watch(
  () => [props.position, props.rotation, props.scale] as const,
  () => {
    applyTransform();
  },
  { deep: true },
);

onMounted(() => {
  loadModel();
});

onBeforeUnmount(() => {
  loadingToken += 1;
  cleanupModel();
});
</script>

<template>
  <slot :status="status" />
</template>
