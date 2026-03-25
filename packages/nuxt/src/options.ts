export interface MixinPerformanceConfig {
  targetFps: number;
  autoDegrade: boolean;
}

export interface MixinSceneDefaults {
  background: string;
  autoRotate: boolean;
}

export interface MixinNuxtOptions {
  debug: boolean;
  performance: MixinPerformanceConfig;
  sceneDefaults: MixinSceneDefaults;
}

export const defaultMixinNuxtOptions: MixinNuxtOptions = {
  debug: false,
  performance: {
    targetFps: 55,
    autoDegrade: true,
  },
  sceneDefaults: {
    background: "#0a1020",
    autoRotate: true,
  },
};

export function defineMixinNuxtOptions(
  overrides: Partial<MixinNuxtOptions> = {},
): MixinNuxtOptions {
  return {
    debug: overrides.debug ?? defaultMixinNuxtOptions.debug,
    performance: {
      targetFps: overrides.performance?.targetFps ?? defaultMixinNuxtOptions.performance.targetFps,
      autoDegrade:
        overrides.performance?.autoDegrade ?? defaultMixinNuxtOptions.performance.autoDegrade,
    },
    sceneDefaults: {
      background:
        overrides.sceneDefaults?.background ?? defaultMixinNuxtOptions.sceneDefaults.background,
      autoRotate:
        overrides.sceneDefaults?.autoRotate ?? defaultMixinNuxtOptions.sceneDefaults.autoRotate,
    },
  };
}
