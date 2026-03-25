<script setup lang="ts">
import { MxAnchor, MxModel, MxOverlay, MxScene, MxWorld } from "@mixin/components";
import { reactive, ref } from "vue";

type FocusTarget = {
  position: [number, number, number];
  target?: [number, number, number];
  fov?: number;
};

type EasingName = "linear" | "easeInOutCubic" | "easeOutQuart";
type FocusOptions = { duration?: number; easing?: EasingName };
type FocusTo = (target: string | FocusTarget, options?: FocusOptions) => Promise<unknown>;
type ModelStatus = "idle" | "loading" | "ready" | "error";
type ModelId = "hero" | "satellite";
type ViewId = "overview" | "hero" | "satellite" | "cube";
type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};
type CameraController = {
  getState: () => CameraState;
  setState: (state: Partial<CameraState>) => CameraState;
};

const lastAction = ref("idle");
const activeView = ref<ViewId>("overview");
const autoRotate = ref(true);
const touring = ref(false);

const modelStatus = reactive<Record<ModelId, ModelStatus>>({
  hero: "idle",
  satellite: "idle",
});

const modelError = reactive<Record<ModelId, string>>({
  hero: "",
  satellite: "",
});

const overviewTarget: FocusTarget = {
  position: [4.2, 2.3, 6.2],
  target: [0, 0, 0],
  fov: 45,
};

function cameraText(cameraState: CameraState): string {
  const [x, y, z] = cameraState.position;
  return `camera: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}], fov: ${cameraState.fov.toFixed(1)}`;
}

function handleModelStatusChange(id: ModelId, status: ModelStatus): void {
  modelStatus[id] = status;
}

function handleModelError(id: ModelId, payload: { error: unknown }): void {
  modelError[id] = String(payload.error);
}

async function focusView(focusTo: FocusTo, view: ViewId): Promise<void> {
  activeView.value = view;
  lastAction.value = `focus: ${view}`;

  if (view === "overview") {
    await focusTo(overviewTarget, {
      duration: 800,
      easing: "easeOutQuart",
    });
    return;
  }

  await focusTo(view === "cube" ? "demo-cube" : view, {
    duration: 900,
    easing: "easeInOutCubic",
  });
}

async function runTour(focusTo: FocusTo): Promise<void> {
  if (touring.value) return;
  touring.value = true;
  lastAction.value = "tour:start";

  const queue: ViewId[] = ["overview", "hero", "satellite", "cube", "overview"];
  for (const view of queue) {
    await focusView(focusTo, view);
    await new Promise((resolve) => setTimeout(resolve, 260));
  }

  touring.value = false;
  lastAction.value = "tour:done";
}

function setFov(controller: CameraController, event: Event): void {
  const input = event.target as HTMLInputElement | null;
  if (!input) return;
  controller.setState({ fov: Number(input.value) });
}

function nudgeAltitude(controller: CameraController, delta: number): void {
  const state = controller.getState();
  controller.setState({
    position: [state.position[0], state.position[1] + delta, state.position[2]],
    target: state.target,
  });
}

function toggleRotation(): void {
  autoRotate.value = !autoRotate.value;
}
</script>

<template>
  <main class="demo-page">
    <MxScene class="scene-shell" :initial-camera="overviewTarget">
      <template #default="{ focusTo, cameraState, controller }">
        <MxWorld
          :auto-rotate="autoRotate"
          show-demo-cube
          @model-click="
            (id) => void focusView(focusTo, id === 'demo-cube' ? 'cube' : (id as ViewId))
          "
        >
          <MxModel
            id="hero"
            src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb"
            :position="[-1.25, -0.2, 0.2]"
            :rotation="[0, 0.65, 0]"
            :scale="[1.25, 1.25, 1.25]"
            :focus-offset="[0, 0.4, 2.8]"
            :focus-fov="30"
            @click="() => void focusView(focusTo, 'hero')"
            @status-change="(status) => handleModelStatusChange('hero', status)"
            @error="(payload) => handleModelError('hero', payload)"
          />
          <MxModel
            id="satellite"
            src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb"
            :position="[1.65, 0.15, -1.35]"
            :rotation="[0, -0.75, 0]"
            :scale="[0.9, 0.9, 0.9]"
            :focus-offset="[0.15, 0.45, 2.6]"
            :focus-fov="33"
            @click="() => void focusView(focusTo, 'satellite')"
            @status-change="(status) => handleModelStatusChange('satellite', status)"
            @error="(payload) => handleModelError('satellite', payload)"
          />
        </MxWorld>

        <MxOverlay>
          <section class="hud-panel">
            <p class="label">MIXIN INTERACTIVE DEMO</p>
            <h1>2D + 3D 一体交互场景</h1>
            <p>
              鼠标拖拽可环绕，滚轮可缩放。点击 3D 目标或下方按钮，触发相机过渡，2D 卡片会跟随 3D
              锚点。
            </p>

            <div class="actions">
              <button @click="() => void focusView(focusTo, 'overview')">overview</button>
              <button @click="() => void focusView(focusTo, 'hero')">hero</button>
              <button @click="() => void focusView(focusTo, 'satellite')">satellite</button>
              <button @click="() => void focusView(focusTo, 'cube')">cube</button>
              <button class="ghost" :disabled="touring" @click="() => void runTour(focusTo)">
                {{ touring ? "touring..." : "tour" }}
              </button>
              <button class="ghost" @click="toggleRotation">
                {{ autoRotate ? "pause rotate" : "resume rotate" }}
              </button>
            </div>

            <div class="slider-row">
              <label for="fov-slider">FOV</label>
              <input
                id="fov-slider"
                type="range"
                min="24"
                max="72"
                step="1"
                :value="Math.round(cameraState.fov)"
                @input="(event) => setFov(controller, event)"
              />
              <span>{{ Math.round(cameraState.fov) }}</span>
            </div>

            <div class="actions compact">
              <button class="ghost" @click="() => nudgeAltitude(controller, 0.25)">
                camera +Y
              </button>
              <button class="ghost" @click="() => nudgeAltitude(controller, -0.25)">
                camera -Y
              </button>
            </div>

            <p class="state">
              {{ lastAction }}
            </p>
            <p class="state">
              {{ `active: ${activeView}` }}
            </p>
            <p class="state">
              {{ cameraText(cameraState) }}
            </p>
            <p class="state">
              {{ `hero: ${modelStatus.hero}, satellite: ${modelStatus.satellite}` }}
            </p>
            <p v-if="modelError.hero || modelError.satellite" class="state error">
              {{ modelError.hero || modelError.satellite }}
            </p>
          </section>

          <MxAnchor target="hero" :offset-x="-12" :offset-y="-92">
            <article class="anchor-card">
              <p class="label">3D Anchor</p>
              <h2>Hero</h2>
              <p>产品主角点位，适合放 CTA 和关键文案。</p>
            </article>
          </MxAnchor>

          <MxAnchor target="satellite" :offset-x="8" :offset-y="-80">
            <article class="anchor-card secondary">
              <p class="label">3D Anchor</p>
              <h2>Satellite</h2>
              <p>副视觉点位，可做规格说明或分镜跳转。</p>
            </article>
          </MxAnchor>
        </MxOverlay>
      </template>
    </MxScene>
  </main>
</template>
