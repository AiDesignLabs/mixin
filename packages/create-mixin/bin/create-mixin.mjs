#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const projectName = args.find((arg) => !arg.startsWith("-")) ?? "mixin-app";

function readOption(name, fallback) {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.split("=")[1] ?? fallback;
  const index = args.findIndex((arg) => arg === name);
  if (index >= 0 && args[index + 1] && !args[index + 1].startsWith("-")) return args[index + 1];
  return fallback;
}

const requestedTemplate = readOption("--template", "embed-2d");
const templateAliasMap = {
  landing: "embed-2d",
  "2d": "embed-2d",
  "3d": "world-3d",
};

const templates = {
  "embed-2d": {
    title: "2D 主视角 + 3D 嵌入",
    appVue: `<template>
  <main class="page">
    <section class="hero">
      <h1>Mixin Starter · Embed 2D</h1>
      <p>以 2D 页面为主，嵌入可交互 3D 世界和 DOM 锚点。</p>
    </section>

    <MxScene class="scene">
      <template #default="{ focusTo }">
        <MxWorld show-demo-cube @model-click="() => void focusTo('demo-cube')"/>
        <MxOverlay>
          <button class="cta" @click="() => void focusTo('demo-cube')">Focus Cube</button>
          <MxAnchor target="demo-cube" :offset-y="-90">
            <div class="card">3D Anchor Card</div>
          </MxAnchor>
        </MxOverlay>
      </template>
    </MxScene>
  </main>
</template>

<style scoped>
.page { min-height: 100vh; padding: 24px; background: #081126; color: #e8edff; }
.hero h1 { margin: 0; font-size: 40px; }
.hero p { color: #a9b7e6; }
.scene { margin-top: 20px; min-height: 460px; border-radius: 20px; overflow: hidden; border: 1px solid #2f3c74; }
.cta { pointer-events: auto; margin: 20px; border: none; border-radius: 999px; padding: 10px 14px; background: #63f3c3; color: #031124; font-weight: 600; }
.card { width: 220px; padding: 12px; border-radius: 12px; background: rgba(8, 14, 32, 0.84); border: 1px solid #63f3c3; }
</style>
`,
  },
  "world-3d": {
    title: "3D 主视角 + 2D HUD",
    appVue: `<template>
  <MxScene class="world">
    <template #default="{ focusTo, cameraState }">
      <MxWorld show-demo-cube @model-click="(id) => void focusTo(id)">
        <MxModel
          id="hero"
          src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb"
          :position="[0, -0.1, -0.6]"
          :focus-offset="[0, 0.25, 2.5]"
          @click="() => void focusTo('hero')"
        />
      </MxWorld>

      <MxOverlay>
        <section class="hud">
          <p class="label">WORLD MODE</p>
          <h1>3D-first Narrative</h1>
          <div class="actions">
            <button @click="() => void focusTo('hero')">Focus Hero</button>
            <button class="ghost" @click="() => void focusTo('demo-cube')">Focus Cube</button>
          </div>
          <p class="meta">fov: {{ cameraState.fov.toFixed(1) }}</p>
        </section>

        <MxAnchor target="hero" :offset-y="-84">
          <article class="card">HUD follows 3D target.</article>
        </MxAnchor>
      </MxOverlay>
    </template>
  </MxScene>
</template>

<style scoped>
.world { min-height: 100vh; background: #030915; }
.hud { pointer-events: auto; margin: 24px; max-width: 460px; padding: 16px; border-radius: 16px; background: rgba(6, 11, 25, 0.78); border: 1px solid #2a3f76; }
.label { margin: 0; color: #6af4c6; font-size: 12px; letter-spacing: .12em; }
h1 { margin: 8px 0; color: #eaf0ff; }
.actions { display: flex; gap: 10px; }
button { border: 1px solid #61f2c2; border-radius: 999px; background: #11233d; color: #ecf1ff; padding: 8px 12px; }
button.ghost { border-color: #39518f; background: transparent; }
.meta { margin: 10px 0 0; color: #a3b3df; font-size: 12px; }
.card { width: 210px; padding: 12px; border-radius: 12px; border: 1px solid #61f2c2; background: rgba(5, 11, 23, 0.86); color: #ecf1ff; }
</style>
`,
  },
};

const template = templateAliasMap[requestedTemplate] ?? requestedTemplate;
const templateConfig = templates[template];
const root = process.cwd();
const targetDir = path.resolve(root, projectName);

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!templateConfig) {
    console.error(`[create-mixin] unsupported template: ${requestedTemplate}`);
    console.error(`[create-mixin] available templates: ${Object.keys(templates).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  if (await pathExists(targetDir)) {
    console.error(`[create-mixin] target already exists: ${targetDir}`);
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  const packageJson = {
    name: projectName,
    private: true,
    scripts: {
      dev: "nuxi dev",
      build: "nuxi build",
      preview: "nuxi preview",
    },
    dependencies: {
      "@mixin/components": "^0.0.0",
      "@mixin/runtime": "^0.0.0",
      "@mixin/nuxt": "^0.0.0",
      nuxt: "^3.0.0",
      vue: "^3.5.0",
    },
  };

  const nuxtConfig = `export default defineNuxtConfig({
  modules: ["@mixin/nuxt"],
});
`;

  const readme = `# ${projectName}

Template: \`${template}\` (${templateConfig.title})

## Quick Start

\`\`\`bash
vp install
vp run dev
\`\`\`
`;

  await Promise.all([
    fs.writeFile(
      path.join(targetDir, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
      "utf8",
    ),
    fs.writeFile(path.join(targetDir, "app.vue"), templateConfig.appVue, "utf8"),
    fs.writeFile(path.join(targetDir, "nuxt.config.ts"), nuxtConfig, "utf8"),
    fs.writeFile(path.join(targetDir, "README.md"), readme, "utf8"),
  ]);

  console.log(`[create-mixin] created ${projectName} (${template})`);
  console.log(`[create-mixin] next steps:`);
  console.log(`  1) cd ${projectName}`);
  console.log(`  2) vp install`);
  console.log(`  3) vp run dev`);
}

void main();
