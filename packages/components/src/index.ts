import type { App } from "vue";
import MxAnchor from "./MxAnchor/index.vue";
import MxModel from "./MxModel/index.vue";
import MxOverlay from "./MxOverlay/index.vue";
import MxScene from "./MxScene/index.vue";
import MxWorld from "./MxWorld/index.vue";

export { MxAnchor, MxModel, MxOverlay, MxScene, MxWorld };
export { useMxCamera } from "./composables/useMxCamera";
export { useMxRouteTransition } from "./composables/useMxRouteTransition";

export default {
  install(app: App): void {
    app.component("MxScene", MxScene);
    app.component("MxWorld", MxWorld);
    app.component("MxOverlay", MxOverlay);
    app.component("MxAnchor", MxAnchor);
    app.component("MxModel", MxModel);
  },
};
