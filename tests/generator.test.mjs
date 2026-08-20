import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

/* ---- 最小 DOM 桩 ---- */
const mkEl = (value = "", checked = false) => ({
  value,
  checked,
  textContent: "",
  innerHTML: "",
  classList: { toggle() {}, add() {}, remove() {} },
  appendChild() {},
  querySelector() {
    return mkEl();
  }
});

const els = new Map();
const getEl = (id) => {
  if (!els.has(id)) els.set(id, mkEl());
  return els.get(id);
};
const set = (id, v) => {
  getEl(id).value = String(v);
};
const check = (id, on) => {
  getEl(id).checked = on;
};

const moduleRows = [];
const depRows = [];
const settingRows = [];
const caps = [];

const mkRow = (map) => ({
  querySelector(sel) {
    const v = map[sel];
    return v !== undefined ? (typeof v === "object" ? v : mkEl(v)) : mkEl();
  }
});

const documentStub = {
  getElementById: (id) => getEl(id),
  querySelectorAll(sel) {
    if (sel === ".module-item") return moduleRows;
    if (sel === ".dep-item") return depRows;
    if (sel === ".setting-item") return settingRows;
    if (sel === ".cap:checked") return caps.filter((c) => c.checked);
    return [];
  },
  addEventListener() {},
  querySelector() {
    return mkEl();
  }
};

const windowStub = { crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000" } };
const navigatorStub = { clipboard: { writeText: () => Promise.resolve() } };

const factory = new Function(
  "document",
  "window",
  "navigator",
  js + "\n;return { buildManifest, applyManifest, uuidv4 };"
);
const api = factory(documentStub, windowStub, navigatorStub);

/* ---- 用例 1：官方行为包示例 ---- */
set("packType", "behavior");
set("formatVersion", "2");
set("packName", "Vanilla Behavior Pack");
set("packDesc", "Example vanilla behavior pack");
set("packUuid", "ee649bcf-256c-4013-9068-6a802b89d756");
set("verMajor", 1); set("verMinor", 0); set("verPatch", 0);
set("minMajor", 1); set("minMinor", 20); set("minPatch", 0);
set("packScope", "");
set("metaAuthors", "exampleAuthor");
set("metaLicense", "MIT");
set("metaUrl", "http://www.contoso.com");
set("genTool", "example_tool");
set("genVersions", "1.0.0, 1.1.0");

moduleRows.length = 0;
moduleRows.push(
  mkRow({
    ".mod-type": "data",
    ".mod-uuid": "fa6e90c8-c925-460f-8155-c8a60b753caa",
    ".mod-desc": "Example behavior pack module",
    ".mod-ver-major": 1, ".mod-ver-minor": 0, ".mod-ver-patch": 0
  }),
  mkRow({
    ".mod-type": "client_data",
    ".mod-uuid": "c05a992e-482a-455f-898c-58bbb4975e47",
    ".mod-desc": "Example client scripts module",
    ".mod-ver-major": 1, ".mod-ver-minor": 0, ".mod-ver-patch": 0
  })
);

depRows.length = 0;
depRows.push(
  mkRow({
    ".dep-kind": "pack",
    ".dep-uuid": "66c6e9a8-3093-462a-9c36-dbb052165822",
    ".dep-ver-major": 1, ".dep-ver-minor": 0, ".dep-ver-patch": 0
  }),
  mkRow({
    ".dep-kind": "script",
    ".dep-module-name": "@minecraft/server",
    ".dep-script-version": "1.9.0"
  })
);

let { manifest, warnings } = api.buildManifest();
assert.deepEqual(warnings, [], "行为包示例不应有警告");
assert.equal(manifest.format_version, 2);
assert.equal(manifest.header.name, "Vanilla Behavior Pack");
assert.deepEqual(manifest.header.version, [1, 0, 0]);
assert.deepEqual(manifest.header.min_engine_version, [1, 20, 0]);
assert.equal(manifest.modules.length, 2);
assert.equal(manifest.modules[0].type, "data");
assert.equal(manifest.dependencies[1].module_name, "@minecraft/server");
assert.deepEqual(manifest.metadata.authors, ["exampleAuthor"]);
assert.deepEqual(manifest.metadata.generated_with.example_tool, ["1.0.0", "1.1.0"]);
assert.doesNotThrow(() => JSON.stringify(manifest), "输出必须是合法 JSON");

/* ---- 用例 2：v3 预览（SemVer 字符串 + settings + capabilities） ---- */
set("formatVersion", "3");
set("packName", "V3 Pack");
set("packUuid", "aa649bcf-256c-4013-9068-6a802b89d700");
set("verMajor", 2); set("verMinor", 1); set("verPatch", 0);
set("minMajor", 1); set("minMinor", 21); set("minPatch", 0);
moduleRows.length = 0;
moduleRows.push(
  mkRow({
    ".mod-type": "script",
    ".mod-uuid": "fa6e90c8-c925-460f-8155-c8a60b753c00",
    ".mod-desc": "Script module",
    ".mod-lang": "javascript",
    ".mod-ver-major": 2, ".mod-ver-minor": 0, ".mod-ver-patch": 0
  })
);
depRows.length = 0;
settingRows.length = 0;
settingRows.push(
  mkRow({
    ".set-type": "toggle",
    ".set-text": "Enable something",
    ".set-name": "my_toggle",
    ".set-toggle-default-cb": { checked: true }
  })
);
caps.length = 0;
caps.push({ value: "chemistry", checked: true }, { value: "pbr", checked: false });

({ manifest, warnings } = api.buildManifest());
assert.deepEqual(warnings, [], "v3 示例不应有警告");
assert.equal(manifest.format_version, 3);
assert.equal(manifest.header.version, "2.1.0", "v3 版本应为 SemVer 字符串");
assert.equal(manifest.header.min_engine_version, "1.21.0", "v3 min_engine_version 应为字符串");
assert.equal(manifest.modules[0].language, "javascript");
assert.deepEqual(manifest.capabilities, ["chemistry"]);
assert.deepEqual(manifest.settings, [{ type: "toggle", text: "Enable something", name: "my_toggle", default: true }]);

/* ---- 用例 3：校验错误 ---- */
set("packUuid", "not-a-uuid");
set("packName", "");
({ warnings } = api.buildManifest());
assert.ok(warnings.some((w) => w.includes("UUID")), "应提示 UUID 无效");
assert.ok(warnings.some((w) => w.includes("名称")), "应提示名称必填");

console.log("All generator tests passed ✓");
