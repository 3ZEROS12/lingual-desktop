# lingual-desktop · 全平台通用 Windows 双轨伴写中间层

> **跨软件即写即译 · 硅谷地道口语 ⇄ 规范技术书面 · 0 触碰输入法驱动 · 剪贴板历史零污染**  
> 无论是在 X (推特)、Slack、Discord、VS Code 还是网页与文档中，打下母语草稿，一键原地完成“地道口语”与“硬核书面”双轨对冲并瞬发替换。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 8/8 Pass](https://img.shields.io/badge/Tests-8%2F8%20Pass-brightgreen)](tests/win32.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

[English](README.md) | **简体中文**

---

## 为什么需要 lingual-desktop？

在海外社交平台（X/Twitter、Reddit）发帖互动、在 Slack 与跨国团队协作、或在 GitHub 提交 Issue 时，开发者频繁面临三大高频摩擦：

1. **频繁切屏的“打断惩罚”**：每次组织语言都要在当前应用与翻译软件（DeepL、Google 翻译、ChatGPT）之间来回 `Alt+Tab`，思路瞬间被打断。
2. **机翻的“机械生硬感”**：普通机翻完全是死板教科书直译，不懂美式技术圈日常口语交流、Slack 互动与推特 Hook 的俚语表达，写出来的英文往往僵硬冰冷。
3. **黑盒替换的“失控恐惧”**：市面上的原地重写插件直接盲目覆盖文本，用户完全不知道翻得是否准确、细微语气是否得体，丧失了学习与纠偏的机会。

`lingual-desktop` 常驻于 Windows 系统托盘，充当你的**轻量级全局语言图层**——不替换你的输入法，但在你需要的地方，毫秒级就地完成语感升华与回填。

---

## 核心能力

```
  · [Original] 这个方案有点过度设计了，不如直接用标准库实现
  [1] ┌ [Spoken]   This feels a bit over-engineered; we'd be much better off sticking with the standard library.
      │            (感觉有点过度设计了，用标准库划算得多)
  [2] ├ [Written]  The proposed approach introduces unnecessary complexity. Leveraging native standard library implementations is preferred.
      │            (该方案引入了不必要的复杂度，建议优先采用原生标准库实现)
      └ [Vocab]    over-engineered · be better off · stick with · leverage
  ────────────────────────────────────────────────────────────────────────
  [1] 选口语 · [2] 选书面 · [Esc] 取消
```

### 1. 原地划选重写 (`Alt+E`)
在任何 Windows 软件（推文编辑框、Slack 对话、GitHub PR、VS Code 注释）中选中文本，按下 `Alt+E`：
* 悬浮卡片紧贴当前光标位置弹出；
* 按 **`1`**：原地写入地道口语表达（适合日常讨论、Slack、推特开场 Hook）；
* 按 **`2`**：原地写入规范技术书面（适合 RFC、PR、技术规范、严肃推文）；
* 按 **`Esc`**：静默退出，原文完好保留。

### 2. 随身灵感盒 (`Alt+Space`)
在任意界面准备构思一条全新推文或消息时，按下 `Alt+Space`：
* 屏幕正中弹出一个极简输入胶囊；
* 敲入母语草稿并按 `Enter`；
* 实时预览双语域生成卡片，敲 `1` 或 `2` 直接把选定译文注入刚才的前台软件。

### 3. 原子剪贴板事务守卫 (Clipboard Guard)
彻底告别暴力覆写导致剪贴板损坏的顽疾：
* 执行替换前自动原子备份系统剪贴板；
* 注入完成后延迟 160ms 自动还原原本的历史内容；
* 保证 Windows 11 的 `Win+V` 历史记录干净无污染。

### 4. 0ms 代码与终端命令护盾 (Shield)
集成自 `@lingual/core` 的规则拦截器：
* 40+ 种命令行前缀（`git`, `npm`, `cargo`, `docker`, `curl` 等）和常见编程语言代码块 0ms 瞬间直通，绝不浪费 1 个 Token。

### 5. 本地优先与模型解耦
* **默认本地**：无缝直连本地 Ollama（`http://127.0.0.1:11434`，推荐 `qwen2.5:3b`），零费用、零延迟、100% 隐私离线。
* **极速云端**：可在 `~/.lingual/config.json` 配置任何 OpenAI 兼容端点（Groq, DeepSeek, OpenAI, Gemini）。

---

## 快速上手与验证

```bash
cd D:/Workspace/projects/lingual-desktop
npm install
npm run build   # 编译原生 C 桥接组件与主进程
npm test        # 8/8 物理测试全绿通过
npm start       # 启动托盘后台服务
```

---

## 配置文件 (`~/.lingual/config.json`)

```json
{
  "endpoint": "http://127.0.0.1:11434/v1/chat/completions",
  "apiKey": "ollama",
  "model": "qwen2.5:3b",
  "sourceLang": "zh",
  "targetLang": "en",
  "hotkeyRewrite": "Alt+E",
  "hotkeySpotlight": "Alt+Space"
}
```

---

## 开源协议

MIT © [Jason Song](https://github.com/3ZEROS12)
