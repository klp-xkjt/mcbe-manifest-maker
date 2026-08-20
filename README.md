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
2. 按需添加/删除模块（modules）、依赖（dependencies）、能力（capabilities）与元数据（metadata）；
3. 右侧实时预览生成的 `manifest.json`，点击「复制 JSON」或「下载 manifest.json」即可；
4. 也可以点「行为包示例 / 资源包示例 / 皮肤包示例」一键载入官方模板再修改。

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

## 规范来源

- [Add-Ons Reference: manifest.json](https://learn.microsoft.com/minecraft/creator/reference/content/addonsreference/packmanifest)（Microsoft Learn，经由 Microsoft Learn MCP 检索确认）
- [Pack Manifest Documentation](https://learn.microsoft.com/minecraft/creator/reference/content/manifestreference/packmanifestdocument)
- [Introduction to Resource Packs](https://learn.microsoft.com/minecraft/creator/documents/resourcepack)
