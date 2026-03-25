<script setup lang="ts">
import type { CameraState, FocusTarget } from "@mixin/runtime";
import type { Object3D } from "three";
import type { ModelRegistration, WorldContextValue } from "../world-context";
import { projectToScreen } from "@mixin/runtime";
import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { onBeforeUnmount, onMounted, provide, ref } from "vue";
import { resolveSceneContext } from "../resolve-scene-context";
import { setActiveWorldContext } from "../world-context-bridge";
import { WORLD_CONTEXT_KEY } from "../world-context";

defineOptions({
  name: "MxWorld",
});

const props = withDefaults(
  defineProps<{
    background?: string;
    autoRotate?: boolean;
    showDemoCube?: boolean;
  }>(),
  {
    background: "#0a1020",
    autoRotate: true,
    showDemoCube: false,
  },
);

const emit = defineEmits<{
  (event: "model-click", targetId: string): void;
}>();

const context = resolveSceneContext("MxWorld must be used inside <MxScene>.");

const mountEl = ref<HTMLElement | null>(null);

type RuntimeModel = Required<Pick<ModelRegistration, "id" | "object">> & {
  focusOffset: [number, number, number];
  focusFov: number;
  interactive: boolean;
  onClick?: () => void;
};

let renderer: WebGLRenderer | null = null;
const scene = new Scene();
const camera = new PerspectiveCamera(45, 1, 0.1, 100);
let animationFrame: number | null = null;
let stopWatchCameraState: (() => void) | null = null;
let pointerDown = false;
let dragging = false;
let pointerStartX = 0;
let pointerStartY = 0;
let dragStartState: CameraState | null = null;

const models = new Map<string, RuntimeModel>();
const pointer = new Vector2();
const raycaster = new Raycaster();
const worldPosition = new Vector3();
const targetView = new Vector3(0, 0, 0);

function scheduleFrame(callback: (timestamp: number) => void): number {
  if (typeof globalThis.requestAnimationFrame === "function")
    return globalThis.requestAnimationFrame(callback);
  return globalThis.setTimeout(() => callback(Date.now()), 16) as unknown as number;
}

function stopFrame(handle: number): void {
  if (typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(handle);
    return;
  }
  clearTimeout(handle);
}

function resizeViewport(): void {
  if (!mountEl.value || !renderer) return;

  const width = Math.max(mountEl.value.clientWidth, 1);
  const height = Math.max(mountEl.value.clientHeight, 1);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function buildFocusTarget(id: string, model: RuntimeModel): FocusTarget {
  model.object.getWorldPosition(worldPosition);
  const [dx, dy, dz] = model.focusOffset;

  const target: FocusTarget = {
    position: [worldPosition.x + dx, worldPosition.y + dy, worldPosition.z + dz],
    target: [worldPosition.x, worldPosition.y, worldPosition.z],
    fov: model.focusFov,
  };
  context.registerTarget(id, target);
  return target;
}

function syncAnchors(): void {
  if (!mountEl.value) return;

  const width = mountEl.value.clientWidth;
  const height = mountEl.value.clientHeight;

  models.forEach((model, id) => {
    model.object.getWorldPosition(worldPosition);
    worldPosition.project(camera);
    const projection = projectToScreen({
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z,
      width,
      height,
    });

    context.setAnchorState(id, projection);
    buildFocusTarget(id, model);
  });
}

function isDescendantOf(object: Object3D, ancestor: Object3D): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function hitTest(clientX: number, clientY: number): RuntimeModel | null {
  if (!renderer) return null;

  const interactiveModels = Array.from(models.values()).filter((model) => model.interactive);
  if (interactiveModels.length === 0) return null;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const roots = interactiveModels.map((model) => model.object);
  const intersects = raycaster.intersectObjects(roots, true);
  if (intersects.length === 0) return null;

  const top = intersects[0];
  return interactiveModels.find((model) => isDescendantOf(top.object, model.object)) ?? null;
}

function lockScroll(lock: boolean): void {
  if (typeof document === "undefined") return;
  document.body.style.overflow = lock ? "hidden" : "";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function applyOrbitDrag(deltaX: number, deltaY: number): void {
  const base = dragStartState;
  if (!base) return;

  const dragSpeed = 0.006;
  const minPhi = 0.25;
  const maxPhi = Math.PI - 0.25;

  const [tx, ty, tz] = base.target;
  const [px, py, pz] = base.position;
  const vx = px - tx;
  const vy = py - ty;
  const vz = pz - tz;
  const radius = Math.max(Math.sqrt(vx * vx + vy * vy + vz * vz), 0.01);

  const baseTheta = Math.atan2(vx, vz);
  const basePhi = Math.acos(clamp(vy / radius, -1, 1));

  const theta = baseTheta - deltaX * dragSpeed;
  const phi = clamp(basePhi + deltaY * dragSpeed, minPhi, maxPhi);
  const sinPhi = Math.sin(phi);

  context.controller.setState({
    position: [
      tx + radius * sinPhi * Math.sin(theta),
      ty + radius * Math.cos(phi),
      tz + radius * sinPhi * Math.cos(theta),
    ],
    target: [...base.target],
  });
}

function handlePointerDown(event: PointerEvent): void {
  if (!renderer) return;
  if (!context.arbiter.canStartWorldInteraction()) return;

  pointerDown = true;
  dragging = false;
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
  dragStartState = context.controller.getState();
  renderer.domElement.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent): void {
  if (!pointerDown) return;

  if (!dragging) {
    const dx = Math.abs(event.clientX - pointerStartX);
    const dy = Math.abs(event.clientY - pointerStartY);
    if (dx + dy < 6) return;

    dragging = true;
    context.arbiter.beginWorldDrag();
    lockScroll(context.arbiter.shouldBlockPageScroll());
  }
  applyOrbitDrag(event.clientX - pointerStartX, event.clientY - pointerStartY);
}

function handlePointerUp(event: PointerEvent): void {
  if (!renderer || !pointerDown) return;

  if (dragging) {
    dragging = false;
    context.arbiter.endWorldDrag();
    lockScroll(false);
  } else {
    const model = hitTest(event.clientX, event.clientY);
    if (model) {
      model.onClick?.();
      emit("model-click", model.id);
    }
  }

  pointerDown = false;
  dragStartState = null;
  renderer.domElement.releasePointerCapture(event.pointerId);
}

function handlePointerCancel(event: PointerEvent): void {
  if (!renderer) return;
  pointerDown = false;
  dragging = false;
  dragStartState = null;
  context.arbiter.endWorldDrag();
  lockScroll(false);
  renderer.domElement.releasePointerCapture(event.pointerId);
}

function handleWheel(event: WheelEvent): void {
  if (!context.arbiter.canStartWorldInteraction()) return;
  event.preventDefault();

  const state = context.controller.getState();
  const [tx, ty, tz] = state.target;
  const [px, py, pz] = state.position;
  const vx = px - tx;
  const vy = py - ty;
  const vz = pz - tz;
  const radius = Math.max(Math.sqrt(vx * vx + vy * vy + vz * vz), 0.001);
  const dirX = vx / radius;
  const dirY = vy / radius;
  const dirZ = vz / radius;

  const scale = Math.exp(event.deltaY * 0.0011);
  const nextRadius = clamp(radius * scale, 1.2, 14);

  context.controller.setState({
    position: [tx + dirX * nextRadius, ty + dirY * nextRadius, tz + dirZ * nextRadius],
    target: [...state.target],
  });
}

function renderLoop(timestamp: number): void {
  if (!renderer) return;

  if (props.autoRotate) {
    const clock = timestamp * 0.001;
    models.forEach((model) => {
      if (model.id !== "demo-cube") return;
      model.object.rotation.y += 0.01;
      model.object.position.y = Math.sin(clock * 1.4) * 0.12;
    });
  }

  camera.lookAt(targetView);
  syncAnchors();
  renderer.render(scene, camera);
  animationFrame = scheduleFrame(renderLoop);
}

onMounted(() => {
  if (!mountEl.value) return;

  scene.background = new Color(props.background);

  renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mountEl.value.appendChild(renderer.domElement);

  scene.add(
    new AmbientLight("#f1f3ff", 0.7),
    (() => {
      const keyLight = new DirectionalLight("#b4bfff", 1.1);
      keyLight.position.set(3, 4, 4);
      return keyLight;
    })(),
  );

  stopWatchCameraState = context.controller.subscribe((nextState) => {
    camera.position.set(...nextState.position);
    targetView.set(...nextState.target);
    camera.fov = nextState.fov;
    camera.updateProjectionMatrix();
  });

  resizeViewport();
  window.addEventListener("resize", resizeViewport);
  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("pointermove", handlePointerMove);
  renderer.domElement.addEventListener("pointerup", handlePointerUp);
  renderer.domElement.addEventListener("pointercancel", handlePointerCancel);
  renderer.domElement.addEventListener("pointerleave", handlePointerCancel);
  renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

  if (props.showDemoCube) {
    const cube = new Mesh(
      new BoxGeometry(1.5, 1.5, 1.5),
      new MeshStandardMaterial({ color: "#67f6c7", roughness: 0.3, metalness: 0.1 }),
    );
    scene.add(cube);
    models.set("demo-cube", {
      id: "demo-cube",
      object: cube,
      focusOffset: [0, 0, 2.4],
      focusFov: 35,
      interactive: true,
      onClick: () => emit("model-click", "demo-cube"),
    });
  }

  animationFrame = scheduleFrame(renderLoop);
});

onBeforeUnmount(() => {
  setActiveWorldContext(null);
  window.removeEventListener("resize", resizeViewport);

  if (renderer) {
    renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
    renderer.domElement.removeEventListener("pointermove", handlePointerMove);
    renderer.domElement.removeEventListener("pointerup", handlePointerUp);
    renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
    renderer.domElement.removeEventListener("pointerleave", handlePointerCancel);
    renderer.domElement.removeEventListener("wheel", handleWheel);
  }

  if (animationFrame !== null) {
    stopFrame(animationFrame);
    animationFrame = null;
  }

  if (stopWatchCameraState) {
    stopWatchCameraState();
    stopWatchCameraState = null;
  }

  models.forEach((model) => {
    scene.remove(model.object);
  });
  models.clear();
  lockScroll(false);
  renderer?.dispose();

  if (renderer?.domElement.parentNode)
    renderer.domElement.parentNode.removeChild(renderer.domElement);

  renderer = null;
  scene.clear();
});

const worldContext: WorldContextValue = {
  scene,
  camera,
  registerTarget: context.registerTarget,
  registerModel: (registration: ModelRegistration) => {
    const existing = models.get(registration.id);
    if (existing) {
      scene.remove(existing.object);
      models.delete(registration.id);
    }

    scene.add(registration.object);
    models.set(registration.id, {
      id: registration.id,
      object: registration.object,
      focusOffset: registration.focusOffset ?? [0, 0, 2.4],
      focusFov: registration.focusFov ?? 35,
      interactive: registration.interactive ?? true,
      onClick: registration.onClick,
    });

    return () => {
      if (!scene) return;
      const current = models.get(registration.id);
      if (!current) return;
      scene.remove(current.object);
      models.delete(registration.id);
    };
  },
};

provide(WORLD_CONTEXT_KEY, worldContext);
setActiveWorldContext(worldContext);
</script>

<template>
  <div ref="mountEl" class="mx-world">
    <slot />
  </div>
</template>

<style scoped>
.mx-world {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
