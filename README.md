# Minecraft Bedrock manifest.json 生成器

一个离线可用的单文件网页工具，帮助 Minecraft：Bedrock Edition 的 Add-on / 资源包 / 行为包 / 皮肤包 / 世界模板开发者快速生成 `manifest.json`。

> 🤖 本项目由 AI（DeepSeek-V4-Flash）生成

## 项目信息

- 项目类型：AI 生成（AI-generated）
- 生成时间：2026-08-20
- 生成方式：DeepSeek-V4-Flash 依据 Microsoft Learn 官方文档编写并测试

## 使用

直接用浏览器打开 [index.html](index.html) 即可，无需安装依赖、无需联网。

1. 在左侧表单填写包名称、描述、UUID（可自动生成）、版本等信息；
2. UUID 会自动填充：包与模块 UUID 新建/载入预设时自动生成，也可点「一键重新生成全部 UUID」刷新（依赖 UUID 不自动生成，需手动填对应资源包的值）；
3. 按需添加/删除模块（modules）、依赖（dependencies）、能力（capabilities）与元数据（metadata）；
4. 右侧实时预览生成的 `manifest.json`，点击「复制 JSON」或「下载 manifest.json」即可；
5. 也可以点「行为包示例 / 资源包示例 / 皮肤包示例」一键载入官方模板再修改。

## 行为包 + 资源包联动生成

很多 Add-on 需要行为包和资源包成对发布，勾选「⑧ 通用附加包联动生成」即可一次生成两份清单：

1. 主表单作为行为包填写（模块、依赖等照常配置）；
2. 联动区块里单独填写资源包名称、UUID、版本等信息（首次开启会自动从行为包复制默认值并生成全新 UUID）；
3. 默认自动在行为包 `dependencies` 里绑定资源包（`uuid` + `version`），这样玩家加载行为包时会自动加载配套资源包；取消勾选「自动绑定」可关闭；
4. 输出面板分别展示行为包与资源包的 JSON，可单独复制或下载。

联动模式下预设按钮的行为：**行为包示例**只填充行为包一侧，**资源包示例**只填充资源包一侧，**皮肤包示例**会自动退出联动模式（皮肤包不能与资源包成对生成）。

运行测试（需 Node.js）：

```powershell
node tests/generator.test.mjs
```

## 支持的字段

- `format_version`：1（皮肤包）、2（行为/资源包/世界模板）、3（预览版，版本使用 SemVer 字符串）
- `header`：`name`、`description`、`uuid`、`version`、`min_engine_version`、`pack_scope`（资源包）、`allow_random_seed` / `lock_template_options` / `base_game_version`（世界模板）
- `modules`：`data`、`resources`、`client_data`、`world_template`、`script`（含 `language`）、`skin_pack`
- `dependencies`：包依赖（`uuid` + `version`）或脚本模块依赖（`module_name`，如 `@minecraft/server`）
- `capabilities`：`chemistry`、`editorExtension`、`experimental_custom_ui`、`raytraced`、`pbr`
- `metadata`：`authors`、`license`、`url`、`product_type`、`generated_with`
- `settings`：v3 预览版的 `label` / `toggle` / `slider` 设置项

脚本模块依赖的版本支持 SemVer 可选后缀（官方 Script Module Versioning），如 `1.9.0`、`1.2.0-beta`、`1.4.0-internal`。

## 各类型清单的字段差异

不同包类型的 `manifest.json` 字段并不完全相同（依据 Microsoft Learn 官方示例整理），生成器会按所选包类型自动约束与校验：

| 包类型 | format_version | header 特有字段 | 模块类型 | 其他差异 |
| --- | --- | --- | --- | --- |
| 行为包 | 2 | `min_engine_version`（必填） | `data` / `client_data` / `script` | 常用 `dependencies` 关联配套资源包或脚本模块 |
| 资源包 | 2 | `min_engine_version`（必填）、`pack_scope`（可选） | `resources` | 无 dependencies |
| 皮肤包 | 1 | 无 `min_engine_version`、无 `description` | `skin_pack` | 结构最简单 |
| 世界模板 | 2 | `base_game_version`、`lock_template_options`（必需）、`allow_random_seed` | `world_template` | 用基础游戏版本锁定模板依赖的原版内容 |

生成器会给出针对性校验：例如行为包不允许 `resources` 模块、皮肤包应使用 `format_version` 1、世界模板必须设置 `lock_template_options` 等。

## 各类型清单 JSON 结构对照

以下是 Microsoft Learn 官方示例中每种包类型的最小清单结构：

**行为包（Behavior Pack）**

```json
{
  "format_version": 2,
  "header": {
    "description": "Example vanilla behavior pack",
    "name": "Vanilla Behavior Pack",
    "uuid": "<FIRST GENERATED UUID>",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    { "description": "...", "type": "data", "uuid": "<SECOND UUID>", "version": [1, 0, 0] },
    { "description": "...", "type": "client_data", "uuid": "<THIRD UUID>", "version": [1, 0, 0] }
  ],
  "dependencies": [
    { "uuid": "<RESOURCE PACK UUID>", "version": [1, 0, 0] },
    { "module_name": "@minecraft/server", "version": "1.9.0" }
  ],
  "metadata": { "authors": ["exampleAuthor"], "license": "MIT" }
}
```

**资源包（Resource Pack）**

```json
{
  "format_version": 2,
  "header": {
    "description": "Example vanilla resource pack",
    "name": "Vanilla Resource Pack",
    "uuid": "<FIRST GENERATED UUID>",
    "pack_scope": "world",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    { "description": "...", "type": "resources", "uuid": "<SECOND UUID>", "version": [1, 0, 0] }
  ]
}
```

**皮肤包（Skin Pack）**

```json
{
  "format_version": 1,
  "header": {
    "name": "pack.name",
    "uuid": "<FIRST GENERATED UUID>",
    "version": [1, 0, 0]
  },
  "modules": [
    { "type": "skin_pack", "uuid": "<SECOND UUID>", "version": [1, 0, 0] }
  ]
}
```

**世界模板（World Template）**

```json
{
  "format_version": 2,
  "header": {
    "name": "pack.name",
    "description": "pack.description",
    "version": [1, 0, 0],
    "uuid": "<FIRST GENERATED UUID>",
    "allow_random_seed": true,
    "base_game_version": [1, 20, 0],
    "lock_template_options": true
  },
  "modules": [
    { "type": "world_template", "uuid": "<SECOND UUID>", "version": [1, 0, 0] }
  ]
}
```

### 各部分差异矩阵

| JSON 部分 | 行为包 | 资源包 | 皮肤包 | 世界模板 |
| --- | --- | --- | --- | --- |
| `format_version` | 2 | 2 | 1 | 2 |
| `header.name` | ✅ | ✅ | ✅ | ✅ |
| `header.description` | ✅ 可选 | ✅ 可选 | ❌ 官方模板无 | ✅ 常用 |
| `header.uuid` / `version` | ✅ | ✅ | ✅ | ✅ |
| `header.min_engine_version` | ✅ 必需 | ✅ 必需 | ❌ | 可选 |
| `header.pack_scope` | ❌ | ✅ 可选 | ❌ | ❌ |
| `header.base_game_version` | ❌ | ❌ | ❌ | ✅ 推荐 |
| `header.lock_template_options` | ❌ | ❌ | ❌ | ✅ 必需 |
| `header.allow_random_seed` | ❌ | ❌ | ❌ | ✅ 可选 |
| `modules[].type` | `data` / `client_data` / `script` | `resources` | `skin_pack` | `world_template` |
| `dependencies` | ✅ 常用（关联资源包 / 脚本模块） | 一般无 | ❌ | ❌ |
| `capabilities` | 按需 | 按需 | ❌ | 按需 |
| `metadata` | ✅ 可选 | ✅ 可选 | ❌ | 可选 |

要点：

- 只有行为包和资源包**必须**有 `min_engine_version`；
- 只有资源包有 `pack_scope`；
- 只有世界模板有 `base_game_version`、`lock_template_options`、`allow_random_seed`；
- 只有行为包常见 `dependencies`（关联配套资源包，或声明 `@minecraft/server` 等脚本模块）；
- 皮肤包结构最简单：只有 `name` / `uuid` / `version` 加一个 `skin_pack` 模块；
- `capabilities` 与 `metadata` 是可选顶层部分，官方最小示例中通常不出现；
- v3（预览版）中所有版本号改为 SemVer 字符串，并可附加 `settings` 部分。

## 规范来源

- [Add-Ons Reference: manifest.json](https://learn.microsoft.com/minecraft/creator/reference/content/addonsreference/packmanifest)（Microsoft Learn，经由 Microsoft Learn MCP 检索确认）
- [Pack Manifest Documentation](https://learn.microsoft.com/minecraft/creator/reference/content/manifestreference/packmanifestdocument)
- [manifest.json 示例（Add-Ons Reference）](https://learn.microsoft.com/minecraft/creator/reference/content/addonsreference/examples/addonmanifest)
- [Comprehensive List of Add-On Pack Contents](https://learn.microsoft.com/minecraft/creator/documents/comprehensivepackcontents)（各类型 manifest 对照示例）
- [Packaging a Skin Pack](https://learn.microsoft.com/minecraft/creator/documents/packagingaskinpack)
- [Introduction to Behavior Packs (from Scratch)](https://learn.microsoft.com/minecraft/creator/documents/behaviorpackfromscratch)
- [Introduction to Resource Packs](https://learn.microsoft.com/minecraft/creator/documents/resourcepack)
- [Create a World Template from an Exported World](https://learn.microsoft.com/minecraft/creator/documents/createaworldtemplate)
- [Introduction to Scripting in Minecraft](https://learn.microsoft.com/minecraft/creator/documents/scripting/introduction)
