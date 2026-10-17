# lingual-desktop · 全環境対応 デスクトップ常駐型言語コンパニオン

> **既存の日本語入力（IME）を置き換えない · Enter キーを押すだけのシームレス翻訳 ＆ 伴走学習 · 画面上部に常駐する自由ドラッグ対応カプセル · クリップボード履歴を一切汚さない**  
> Windows 標準の Microsoft IME、Google 日本語入力、ATOK などをそのまま使えます。普段通りにタイピングし、Enter キーを押すだけで、`lingual-desktop` が自然言語を検知して自動分流。入力欄のテキストをそのまま送信、あるいは洗練された英語に置き換えて送信し、その場に 3 秒間のデュアルレジスター伴走カードを展開します。

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE) [![Tests: 28/28 Pass](https://img.shields.io/badge/Tests-28%2F28%20Pass-brightgreen)](tests/engine.test.ts) [![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-blue)](https://microsoft.com)

[English](README.md) | [简体中文](README_zh.md) | **日本語**

---

## lingual-desktop とは？

`lingual-desktop` は **IME（日本語入力ソフト）の代替ソフトではありません**。長年使い慣れた IME をアンインストールする必要も、入力の癖を変える必要もありません。

Windows デスクトップ上に常駐する軽量なコンパニオンレイヤーとして動作します：
* **翻訳モード (`[EN]`)**：任意の入力欄で日本語を入力し、**`Enter`** を押すだけ。自然言語を自動識別し、選択されたエンジンで自然な英語に置き換えて送信。同時に 3 秒間伴走カードを表示（3 秒後に自動非表示。送信後 3 秒以内に Esc を押せば即座に送信前の日本語草稿を復元）。
* **伴走学習モード (`[LEARN]`)**：**`Enter`** を押すと 0ms の非ブロッキングで日本語がそのまま送信され、裏で伴走カードが非同期に開いて生きた英語表現やコロケーションを学べます。
* **オフモード (`[OFF]`)**：完全透過。フックは一切動作しません。
* **改行ショートカットの完全保護**：単一の Enter 打鍵のみを対象とし、**`Ctrl+Enter` や `Shift+Enter` による通常の改行操作は 100% そのまま通過**します。

---

## インタラクションフロー (Interaction Model)

```
[通常入力状態]
Slack、Discord、ブラウザ、Notion 等で普段通りに入力：
                      
   キャレット ➔ このアプローチは少し過剰設計気味なので、素直に標準ライブラリで|      [⇄ EN]  <-- 画面上部に常駐するカプセル

────────────────────────────────────────────────────────────────────────────────────────────
[Enter 打鍵時]

  【翻訳モードの場合】：
  1. 入力内容を自動判定（コード、CLI コマンド、英数字のみの場合は 0ms パススルー）；
  2. 翻訳エンジンを実行（ローカル Pi モデル / 無料 Web 翻訳 / クラウド LLM）；
  3. 入力欄のテキストを英語に置換して送信；
  4. HUD カードがその場に展開：
     · [Source]  このアプローチは少し過剰設計気味なので、素直に標準ライブラリで
     ┌ [Casual]  This feels a bit over-engineered; we'd be much better off with the standard library.
     │           (Slack や日常スタンドアップ向けの自然な口語)
     ├ [Formal]  The proposed approach introduces unnecessary complexity. Standard library is preferred.
     │           (PR レビューや RFC、公式ドキュメント向けの厳密な技術英語)
     └ [Vocab]   over-engineered · be better off with · stick with
     (3 秒後に自動フェードアウト。3 秒以内に Esc キーを押すと送信を取消し元テキストを復元)
```

---

## 主な機能と設計

### 1. 安定した常駐表示 ＋ 自由なマウスドラッグと位置記憶
* **不快なチラつきを排除**：不安定な Windows キャレット座標ポーリングに依存せず、画面端に安定したカプセルを常駐。
* **任意の位置へドラッグ可能**：マウスドラッグでカプセルを画面の好きな位置に移動できます。位置座標（`capsulePos: { x, y }`）は自動で記憶されます。
* **直感的な操作**：左クリックでモード切替（`EN` ⇄ `LEARN` ⇄ `OFF`）、右クリックで設定画面を開きます。

### 2. Enter キー連動 ＋ ターミナル環境の完全隔離
* `pi-lingual` と同様のシンプルな操作感：複雑なショートカットキーを覚える必要はありません。
* **ターミナル保護ガード**：ターミナルプロセス（`WindowsTerminal`、`PowerShell`、`cmd`、`WezTerm`、`Mintty`）を自動検知。ターミナル内での入力は 100% スルーされ、開発作業を一切邪魔しません。

### 3. 用途に合わせた 3 段階のエンジン選択（完全無料オプション含む）
* **プラン 1：ローカル Pi モデルの再利用（推奨・追加コスト 0 円）**：`~/.pi/agent/models.json` に設定済みのモデル（`gemini-3.8-flash` など）を自動検知して共有。
* **プラン 2：キー不要の Web 翻訳（Google / MyMemory）**：登録・アカウント・API キー不要のパブリック Web 翻訳を利用（初期導入やオフライン環境に最適）。
* **プラン 3：無料枠付きクラウド LLM またはカスタム API キー**：GLM-4-Flash、Qwen2.5-7B、Groq、DeepSeek、OpenAI などの API キーを自由に設定可能。

### 4. Paper & Stone 編集部ライクなミニマルデザイン
* 暖かみのあるペーパーキャンバス（`#fbfaf8`）とチャコールストーン（`#1c1917`）の洗練されたタイポグラフィ。
* **装飾的な絵文字を排除**：モノスペースのタグと読みやすいレイアウト。
* **多言語 UI 切り替え**：`EN`、`ZH`、`TW`、`JA` の 4 言語にワンクリックで切り替え可能。

### 5. 自然言語によるレイアウト調整 ＋ リアルタイムプレビュー
* 「チャット用に 1 行だけで表示したい」「丁寧なカスタマーサポート風の返信スロットを作って」など、自然言語でカードの構成を指示できます。
* スロット設定を変更すると、設定画面内のプレビューカードがリアルタイムに更新されます。

---

## システムアーキテクチャ

```
┌────────────────────────────────────────────────────────┐
│                   Windows アプリケーション             │
│         (X / ブラウザ、Slack、Discord、Notion 等)      │
└──────────────────────────┬─────────────────────────────┘
                           │ 1. テキスト入力 ＆ Enter 打鍵
                           ▼
┌────────────────────────────────────────────────────────┐
│              lingual-desktop ホスト層                  │
│     (Electron ＋ MinGW GCC ネイティブ C ＆ C# UIA)     │
│  - UIA ValuePattern UTF-8 ダイレクト読み取り (< 2ms)   │
│  - ターミナルプロセス保護 (WindowsTerminal ガード)     │
│  - 常駐カプセルのドラッグ＆位置記憶                    │
│  - モード状態マシンと Enter ディスパッチルーター       │
└──────────────────────────┬─────────────────────────────┘
                           │ 2. デュアルレジスター翻訳
                           ▼
┌────────────────────────────────────────────────────────┐
│           翻訳推論エンジン ＆ フェイルオーバー         │
│  - Tier 1: ローカル Pi モデルの自動検知 (追加コスト $0)│
│  - Tier 2: キー不要 Web 翻訳 (Google / MyMemory GTX)   │
│  - Tier 3: 各種クラウド LLM API (GLM / Qwen / Groq)    │
│  - クリップボードトランザクション監視 (< 160ms)        │
└────────────────────────────────────────────────────────┘
```

---

## ビルドと品質検証

```bash
# MinGW C および C# UIA ネイティブヘルパーのコンパイル
npm run build:native

# Electron メインプロセスおよび Preload バンドルのビルド
npm run build:main

# 全自動ユニットテストの実行 (28/28 Pass)
npm test
```

---

## エコシステム：Pi ターミナル＆デスクトップ連携

各拡張機能は互いに干渉しない独立したスロット（`aboveEditor`、`belowEditor`、ステータスバー、Windows デスクトップ）で動作します：

| パッケージ | 動作環境・スロット | 役割とメカニズム | インストール / リンク |
| :--- | :--- | :--- | :--- |
| **[`lingual-desktop`](https://github.com/3ZEROS12/lingual-desktop)** *(本アプリ)* | Windows デスクトップ Dynamic Island | 低レベルキーボードフック（`WH_KEYBOARD_LL`）、原位 3 秒カード ＆ システム全体入力ブリッジ | [GitHub Release](https://github.com/3ZEROS12/lingual-desktop/releases) |
| **[`pi-lingual`](https://github.com/3ZEROS12/pi-lingual)** | ターミナル `aboveEditor` HUD | デュアルレジスター伴走カード（≤9 行、UAX #11 ツリー）＆ 0 トークン仕様変換 | `pi install npm:pi-lingual` |
| **[`toolflow`](https://github.com/3ZEROS12/toolflow)** | ターミナルツールサンドボックス | 段階的ツールマウント ＆ 40 行超ログの自動脱水（コンテキスト消費 -95%） | `pi install npm:toolflow` |
| **[`pi-tui-status-beautifier`](https://github.com/3ZEROS12/pi-tui-status-beautifier)** | ターミナルフッターステータスバー | 6 種のプリセットバッジ、80 桁未満の自動折りたたみ、ディスク I/O ゼロ | `pi install npm:pi-tui-status-beautifier` |
| **[`pi-anchor`](https://github.com/3ZEROS12/anchor)** | ターミナル `belowEditor` ドック | 1 行常驻付箋、0ms `pin:` 割り込み、進捗バー ＆ セッション復帰 | `pi install npm:pi-anchor` |

---

## ライセンス

MIT © Jason & Lingual Contributors
