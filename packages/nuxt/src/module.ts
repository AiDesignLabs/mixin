import { addImports, addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import { defaultMixinNuxtOptions, defineMixinNuxtOptions, type MixinNuxtOptions } from "./options";

export default defineNuxtModule<Partial<MixinNuxtOptions>>({
  meta: {
    name: "@mixin/nuxt",
    configKey: "mixin",
  },
  defaults: defaultMixinNuxtOptions,
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const normalizedOptions = defineMixinNuxtOptions(options);

    nuxt.options.runtimeConfig.public.mixin = {
      ...(nuxt.options.runtimeConfig.public.mixin as object | undefined),
      ...normalizedOptions,
    };

    addPlugin(resolver.resolve("./runtime/plugin"));

    addImports([
      { name: "useMxCamera", from: "@mixin/components" },
      { name: "useMxRouteTransition", from: "@mixin/components" },
    ]);
  },
});
