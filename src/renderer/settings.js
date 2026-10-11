// ============================================================================
// Lingual Desktop Settings — Pure pi-lingual Parity Controller
// - Enter-Driven Automatic Dispatch (Translate / Learn / Off)
// - Persistent UI Language Switcher (EN / ZH / TW / JA)
// - 3 Transparent Engine Modes:
//     1. Reuse Local Pi Model ($0 extra)
//     2. Free Web Translate (Google / MyMemory — $0, no key)
//     3. Free-Tier LLM (GLM-4-Flash ¥0 / SiliconFlow Qwen ¥0 / Groq Free) or Custom Key
// - Functional Natural Language Layout Tuner + Real-Time WYSIWYG Preview
// - Instant Auto-Save on Every Action
// ============================================================================

(function () {
  const UI_I18N = {
    en: {
      nav_general: "General",
      nav_cards: "Cards",
      nav_engine: "Engine",
      sec_mode_title: "Operating Mode",
      sec_mode_desc:
        "Just press Enter in any input box. Lingual automatically detects natural language and dispatches to the active engine (commands, code, terminals, and Ctrl+Enter / Shift+Enter newlines pass through untouched). Cycle anytime with Alt + Q:",
      mode_en_title: "Translate",
      mode_en_sub: "Press Enter ➔ Translates, replaces & submits + shows card",
      mode_orig_title: "Learn",
      mode_orig_sub: "Press Enter ➔ Submits original immediately + shows card",
      mode_off_title: "Off",
      mode_off_sub: "Inactive; no translation or popup",
      sec_slang_title: "Source Language",
      sec_slang_desc: "The primary language you type in:",
      sec_tlang_title: "Target Language",
      sec_tlang_desc: "The target language to translate into:",
      sec_widget_title: "Top Floating Island",
      sec_widget_desc: "A minimal status island anchored at the top edge of your screen:",
      tog_widget_title: "Show Top Floating Island (⇄ EN)",
      tog_widget_desc: "Anchored at screen top edge. Click to cycle mode; drag to move anywhere.",
      preview_title: "Live Preview",
      preview_hint: 'Sample: "Can we release this feature tomorrow?"',
      ai_tuner_title: "Natural Language Layout Tuner",
      ai_tuner_desc: "Type any custom instruction or click a preset below to reconfigure the card:",
      ai_tuner_placeholder: "e.g. Single line only for fast chat, no source row or vocab...",
      ai_tuner_btn: "Apply",
      wish_1: "Single line (Minimal)",
      wish_2: "Casual + Formal",
      wish_3: "Customer Support",
      wish_4: "Social / X",
      wish_5: "Language Study",
      manual_toggle_title: "Visible Rows",
      tog_source_title: "Source text row",
      tog_source_desc: "Displays your initial input on top",
      tog_dual_title: "Dual tone comparison",
      tog_dual_desc: "Compares Casual spoken vs. Formal written",
      tog_meaning_title: "Nuance annotations",
      tog_meaning_desc: "Displays brief tone explanations below phrases",
      tog_vocab_title: "Vocabulary highlights",
      tog_vocab_desc: "Extracts key collocations and idioms at the bottom",
      adv_slots_summary: "Advanced slot configuration",
      btn_add_row: "+ Add Row",
      btn_reset_rows: "Reset Default",
      engine_choose_title: "Translation Engine Options",
      engine_choose_desc: "Select how translations are powered:",
      emode_pi_title: "1. Reuse Local Pi Model (Recommended · $0 Setup)",
      emode_pi_desc:
        "Automatically shares the model configured in ~/.pi/agent/models.json. Supports full dual-register comparison, vocabulary notes, and AI layout tuning with zero extra setup.",
      emode_free_title: "2. Free Web Translate (Google / MyMemory · No Key)",
      emode_free_desc:
        "Uses public web translation APIs (Google Translate + MyMemory) with zero registration or API keys. Note: As standard machine translation (non-LLM), it provides 1 direct translation line without dual-tone comparison.",
      emode_custom_title: "3. Custom LLM API Key (GLM-4 / SiliconFlow / Groq / OpenAI)",
      emode_custom_desc:
        "Connect to high-tier reasoning or lightweight models via standard OpenAI-compatible endpoints:",
      btn_show: "Show",
      btn_hide: "Hide",
      btn_test: "Test",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Changes save automatically",
      footer_saved: "Saved · Active immediately",
      btn_close: "Close",
      btn_done: "Done",
      meta_orig: "Original input",
      meta_key: "Key {n}",
      meta_vocab: "Key terms",
    },
    zh: {
      nav_general: "常规",
      nav_cards: "卡片",
      nav_engine: "引擎",
      sec_mode_title: "运行模式（与 pi-lingual 完全一致）",
      sec_mode_desc:
        "在任何输入框打完字直接按回车 (Enter)，自动判断是否需要翻译并交给所选引擎（代码、命令、终端窗口及 Ctrl+Enter / Shift+Enter 换行自动原样放行）。随时可按 Alt + Q 切换模式：",
      mode_en_title: "译文 (Translate)",
      mode_en_sub: "按回车 ➔ 自动翻译替换并发出 + 展开对照卡片",
      mode_orig_title: "伴学 (Learn)",
      mode_orig_sub: "按回车 ➔ 原文直接发出 + 后台展开对照卡片",
      mode_off_title: "关闭 (Off)",
      mode_off_sub: "静默待机，不触发任何翻译或弹窗",
      sec_slang_title: "源语言 (Source)",
      sec_slang_desc: "你日常打字输入的母语：",
      sec_tlang_title: "目标语言 (Target)",
      sec_tlang_desc: "希望转换成的目标外语：",
      sec_widget_title: "屏幕顶端悬浮岛",
      sec_widget_desc: "常驻屏幕最顶部中央的极简状态胶囊，实时显示模式状态并支持拖拽位置：",
      tog_widget_title: "显示屏幕顶端悬浮岛 (⇄ EN)",
      tog_widget_desc: "常驻屏幕顶端，点击切换模式，支持鼠标按住拖拽至屏幕任意位置。",
      preview_title: "实时预览",
      preview_hint: "示例：「这个功能明天能上线吗？」",
      ai_tuner_title: "一句话定制版式",
      ai_tuner_desc: "输入你的日常用途（支持任意自然语言描述）或直接点选下方预设：",
      ai_tuner_placeholder: "例如：只要一行极简译文，不显示原文和词汇...",
      ai_tuner_btn: "应用",
      wish_1: "单行极简（纯打字）",
      wish_2: "口语 + 书面双轨",
      wish_3: "商务与客服回复",
      wish_4: "社媒与推特短句",
      wish_5: "外语伴学（含词汇）",
      manual_toggle_title: "显示行项",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "首行显示你输入的原话",
      tog_dual_title: "双语气对照 (Casual / Formal)",
      tog_dual_desc: "同时展示日常口语与正式书面语",
      tog_meaning_title: "语境微释义 (Nuance)",
      tog_meaning_desc: "在译文下方附简短语气说明",
      tog_vocab_title: "重点词汇 (Vocab)",
      tog_vocab_desc: "底部提取实用短语与搭配",
      adv_slots_summary: "高级行项配置",
      btn_add_row: "+ 新增行",
      btn_reset_rows: "重置默认",
      engine_choose_title: "翻译驱动引擎 (支持 3 种透明配置方案)",
      engine_choose_desc: "根据你的使用习惯选择翻译来源：",
      emode_pi_title: "1. 复用本地 Pi Agent 模型 (推荐 · 零额外配置)",
      emode_pi_desc:
        "自动复用 ~/.pi/agent/models.json 中配置的模型通道，无需重复填 Key，完整支持双语气对比与重点词汇。",
      emode_free_title: "2. 公共网页基础翻译 (免注册 / 免 API 密钥)",
      emode_free_desc:
        "调用公共网页基础翻译接口（Google 翻译与 MyMemory），免注册免 Key，直接输出标准译文。",
      emode_custom_title: "3. 自定义大模型 API 密钥 (智谱 / 硅基 / Groq / OpenAI 等)",
      emode_custom_desc:
        "支持任意兼容 OpenAI 标准格式的模型接口，填入对应 API Key 即可享受完整双语气对照能力：",
      btn_show: "显示",
      btn_hide: "隐藏",
      btn_test: "测试",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "所有改动自动保存并即时生效",
      footer_saved: "已保存 · 即时生效",
      btn_close: "关闭",
      btn_done: "完成",
      meta_orig: "输入原文",
      meta_key: "按 {n} 选择",
      meta_vocab: "重点短语",
    },
    "zh-TW": {
      nav_general: "常規",
      nav_cards: "卡片",
      nav_engine: "引擎",
      sec_mode_title: "運行模式（與 pi-lingual 完全一致）",
      sec_mode_desc:
        "在任何輸入框打完字直接按 Enter，自動判斷是否需要翻譯並交給所選引擎（代碼、命令、終端窗口及 Ctrl+Enter / Shift+Enter 換行自動原樣放行）。隨時可按 Alt + Q 切換模式：",
      mode_en_title: "譯文 (Translate)",
      mode_en_sub: "按 Enter ➔ 自動翻譯替換並發出 + 展開對照卡片",
      mode_orig_title: "伴學 (Learn)",
      mode_orig_sub: "按 Enter ➔ 原文直接發出 + 後台展開對照卡片",
      mode_off_title: "關閉 (Off)",
      mode_off_sub: "靜默待機，不觸發任何翻譯或彈窗",
      sec_slang_title: "源語言 (Source)",
      sec_slang_desc: "你日常打字輸入的母語：",
      sec_tlang_title: "目標語言 (Target)",
      sec_tlang_desc: "希望轉換成的目標外語：",
      sec_widget_title: "螢幕頂端懸浮島",
      sec_widget_desc: "常駐螢幕頂部的極簡狀態膠囊，即時顯示模式狀態並支援拖拽位置：",
      tog_widget_title: "顯示螢幕頂端懸浮島 (⇄ EN)",
      tog_widget_desc: "常駐螢幕頂端，點擊切換模式，支援滑鼠按住拖拽至螢幕任意位置。",
      preview_title: "即時預覽",
      preview_hint: "示例：「這個功能明天能上線嗎？」",
      ai_tuner_title: "一句話定制版式",
      ai_tuner_desc: "輸入你的日常用途或點選下方預設：",
      ai_tuner_placeholder: "例如：只要一行極簡譯文，不顯示原文和詞彙...",
      ai_tuner_btn: "應用",
      wish_1: "單行極簡（純打字）",
      wish_2: "口語 + 書面雙軌",
      wish_3: "商務與客服回覆",
      wish_4: "社媒與推特短句",
      wish_5: "外語伴學（含詞彙）",
      manual_toggle_title: "顯示行項",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "首行顯示你輸入的原話",
      tog_dual_title: "雙語氣對照 (Casual / Formal)",
      tog_dual_desc: "同時展示日常口語與正式書面語",
      tog_meaning_title: "語境微釋義 (Nuance)",
      tog_meaning_desc: "在譯文下方附簡短語氣說明",
      tog_vocab_title: "重點詞彙 (Vocab)",
      tog_vocab_desc: "底部提取實用短語與搭配",
      adv_slots_summary: "高級行項配置",
      btn_add_row: "+ 新增行",
      btn_reset_rows: "重置默認",
      engine_choose_title: "翻譯驅動引擎 (支援 3 種透明配置方案)",
      engine_choose_desc: "根據你的使用習慣選擇翻譯來源：",
      emode_pi_title: "1. 複用本地 Pi Agent 模型 (推薦 · 零額外配置)",
      emode_pi_desc:
        "自動讀取複用你電腦上 ~/.pi/agent/models.json 已配好的模型通道，無需重複填 Key。",
      emode_free_title: "2. 公共網頁基礎翻譯 (免註冊 / 免 API 密鑰)",
      emode_free_desc:
        "直接調用公共網頁翻譯接口（Google + MyMemory），無需註冊帳號。注：屬於傳統機器翻譯，每次僅輸出 1 行標準譯文。",
      emode_custom_title: "3. 自定義大模型 API 密鑰 (智譜 / 矽基 / Groq / OpenAI 等)",
      emode_custom_desc:
        "支援任意相容 OpenAI 格式的模型接口，填入對應 API Key 即可享受完整雙語氣能力：",
      btn_show: "顯示",
      btn_hide: "隱藏",
      btn_test: "測試",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "所有改動自動保存並即時生效",
      footer_saved: "已保存 · 即時生效",
      btn_close: "關閉",
      btn_done: "完成",
      meta_orig: "輸入原文",
      meta_key: "按 {n} 選擇",
      meta_vocab: "重點短語",
    },
    ja: {
      nav_general: "一般",
      nav_cards: "カード",
      nav_engine: "エンジン",
      sec_mode_title: "動作モード（pi-lingual と完全共通）",
      sec_mode_desc:
        "入力欄で Enter を押すだけで、自然言語かどうかを自動判定して処理します（コード、コマンド、ターミナル、Ctrl+Enter / Shift+Enter の改行はそのまま通過）。Alt + Q でモード切替：",
      mode_en_title: "翻訳 (Translate)",
      mode_en_sub: "Enter ➔ 翻訳して置換・送信＋カード表示",
      mode_orig_title: "学習 (Learn)",
      mode_orig_sub: "Enter ➔ 原文をそのまま即送信＋カード表示",
      mode_off_title: "オフ (Off)",
      mode_off_sub: "待機状態（翻訳・ポップアップなし）",
      sec_slang_title: "ソース言語 (Source)",
      sec_slang_desc: "普段入力する言語：",
      sec_tlang_title: "ターゲット言語 (Target)",
      sec_tlang_desc: "翻訳先の言語：",
      sec_widget_title: "画面上部フローティングアイランド",
      sec_widget_desc: "画面上部に常駐するミニマルなカプセルで、動作状態を一目で確認：",
      tog_widget_title: "画面上部フローティングアイランドを表示 (⇄ EN)",
      tog_widget_desc: "画面最上部に常駐。クリックでモード切替、ドラッグで自由移動。",
      preview_title: "プレビュー",
      preview_hint: "例：「この機能、明日リリースできる？」",
      ai_tuner_title: "自然言語プリセット",
      ai_tuner_desc: "用途を入力するか下のプリセットを選択：",
      ai_tuner_placeholder: "例：シンプルな翻訳1行のみ、原文と単語は非表示...",
      ai_tuner_btn: "適用",
      wish_1: "1行ミニマル（入力のみ）",
      wish_2: "口語 + フォーマル比較",
      wish_3: "ビジネス・サポート対応",
      wish_4: "SNS / X ショート文",
      wish_5: "語学学習（単語付き）",
      manual_toggle_title: "表示項目",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "先頭行に入力した原文を表示",
      tog_dual_title: "2トーン比較 (Casual / Formal)",
      tog_dual_desc: "カジュアル口語とフォーマル文面を併記",
      tog_meaning_title: "ニュアンス注釈 (Nuance)",
      tog_meaning_desc: "各翻訳の下にトーン解説を表示",
      tog_vocab_title: "重要表現 (Vocab)",
      tog_vocab_desc: "下部に有用な連語・イディオムを抽出",
      adv_slots_summary: "詳細スロット設定",
      btn_add_row: "+ 行を追加",
      btn_reset_rows: "リセット",
      engine_choose_title: "翻訳エンジン（3つの方式から選択）",
      engine_choose_desc: "翻訳エンジンの駆動方式を選択：",
      emode_pi_title: "1. ローカル Pi モデルを共有（推奨 · 追加費用 $0）",
      emode_pi_desc:
        "~/.pi/agent/models.json に設定済みのモデルを自動共有します。追加設定なしで2トーン比較・語彙解説を利用可能。",
      emode_free_title: "2. 無料 Web 翻訳 (Google / MyMemory · キー不要)",
      emode_free_desc:
        "登録やAPIキー不要の公開Web翻訳API（Google + MyMemory）を使用します（標準翻訳1行のみ出力）。",
      emode_custom_title: "3. カスタム LLM API Key (OpenAI / Groq 等)",
      emode_custom_desc:
        "標準的な OpenAI 互換エンドポイントをサポート。API Key を入力して利用：",
      btn_show: "表示",
      btn_hide: "隠す",
      btn_test: "テスト",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "変更は自動的に保存・反映されます",
      footer_saved: "保存済み · 即時反映",
      btn_close: "閉じる",
      btn_done: "完了",
      meta_orig: "入力原文",
      meta_key: "{n} キーで選択",
      meta_vocab: "重要語彙",
    },
  };

  let activeUiLang = "en";
  let activeSourceLang = "zh";
  let activeTargetLang = "en";
  let activeCompanionMode = "english";
  let activeEngineMode = "pi";
  let activeSlotPreset = "developer";
  let currentSlots = [];
  let isInitialLoading = true;

  function t(key) {
    const dict = UI_I18N[activeUiLang] || UI_I18N.en;
    return dict[key] || UI_I18N.en[key] || key;
  }

  function applyInterfaceLanguage(langCode) {
    activeUiLang = UI_I18N[langCode] ? langCode : "en";
    const dict = UI_I18N[activeUiLang] || UI_I18N.en;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key && dict[key]) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
  }

  // 1. Top Pill Tabs & Language Switcher
  const navPills = document.querySelectorAll(".nav-pill");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const btnLangTrigger = document.getElementById("btn-lang-trigger");
  const langCurrentCode = document.getElementById("lang-current-code");
  const langPopover = document.getElementById("lang-popover");
  const langOpts = document.querySelectorAll(".lang-opt");

  navPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetTab = pill.dataset.tab;
      navPills.forEach((p) => p.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      pill.classList.add("active");
      const activePane = document.getElementById(targetTab);
      if (activePane) activePane.classList.add("active");
    });
  });

  if (btnLangTrigger && langPopover) {
    btnLangTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      langPopover.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!langPopover.contains(e.target) && e.target !== btnLangTrigger) {
        langPopover.classList.add("hidden");
      }
    });
  }

  function setUiLangState(langCode) {
    const normalized = UI_I18N[langCode] ? langCode : "en";
    activeUiLang = normalized;

    langOpts.forEach((opt) => {
      const isMatch = opt.dataset.lang === normalized;
      opt.classList.toggle("active", isMatch);
      if (isMatch && langCurrentCode) {
        langCurrentCode.textContent = opt.dataset.code || "EN";
      }
    });

    applyInterfaceLanguage(normalized);
    renderLiveHudPreview();
    renderSlotCards();
  }

  langOpts.forEach((opt) => {
    opt.addEventListener("click", () => {
      setUiLangState(opt.dataset.lang);
      langPopover.classList.add("hidden");
      autoSaveNow();
    });
  });

  // 2. Tab 1: General (Operating Mode, Source Language, Target Language)
  const modeSegButtons = document.querySelectorAll("#companion-mode-segmented .seg-btn");
  const sourceLangChips = document.querySelectorAll("#source-lang-chips .chip");
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");
  const checkShowCapsule = document.getElementById("check-show-capsule");

  if (checkShowCapsule) {
    checkShowCapsule.addEventListener("change", () => autoSaveNow());
  }

  function setCompanionModeState(mode) {
    activeCompanionMode = mode || "english";
    modeSegButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === activeCompanionMode);
    });
  }

  modeSegButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setCompanionModeState(btn.dataset.mode);
      autoSaveNow();
    });
  });

  function setSourceLangState(slang) {
    activeSourceLang = slang || "zh";
    sourceLangChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.slang === activeSourceLang);
    });
  }

  sourceLangChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setSourceLangState(chip.dataset.slang);
      autoSaveNow();
    });
  });

  function setTargetLangState(tlang) {
    activeTargetLang = tlang || "en";
    targetLangChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.tlang === activeTargetLang);
    });
    renderLiveHudPreview();
  }

  targetLangChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setTargetLangState(chip.dataset.tlang);
      autoSaveNow();
    });
  });

  // 3. Tab 2: Cards (Live Preview, Natural Language Tuner, Visible Rows, Advanced Slots)
  const liveHudPreview = document.getElementById("live-hud-preview");
  const inputAiWish = document.getElementById("input-ai-wish");
  const btnAiTune = document.getElementById("btn-ai-tune");
  const wishChips = document.querySelectorAll("#wish-bubbles .wish-chip");
  const aiTuneFeedback = document.getElementById("ai-tune-feedback");

  const toggleShowSource = document.getElementById("toggle-show-source");
  const toggleDualStyle = document.getElementById("toggle-dual-style");
  const toggleShowMeaning = document.getElementById("toggle-show-meaning");
  const toggleShowVocab = document.getElementById("toggle-show-vocab");

  const slotCardList = document.getElementById("slot-card-list");
  const btnAddSlot = document.getElementById("btn-add-slot");
  const btnResetSlots = document.getElementById("btn-reset-slots");

  function getDefaultSlotsList() {
    return [
      { id: "source", label: "Source", role: "source", enabled: true },
      {
        id: "spoken",
        label: "Casual",
        role: "translation",
        instruction: "Natural, fluent spoken flow for daily chat and team messages.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "written",
        label: "Formal",
        role: "translation",
        instruction: "Clear, polite, formal written expression for emails and documentation.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "vocab",
        label: "Vocab",
        role: "vocab",
        instruction: "Extract 2-3 key idiomatic phrases or collocations.",
        enabled: true,
      },
    ];
  }

  const PREVIEW_SAMPLES = {
    en: {
      source: "这个功能明天能上线吗？",
      trans1: "Can we ship this feature tomorrow?",
      meaning1: "Casual & natural for team chat",
      trans2: "Is this feature scheduled for release tomorrow?",
      meaning2: "Polite & formal for emails or docs",
      vocab: "ship (release) · be scheduled for (planned for)",
    },
    ja: {
      source: "这个功能明天能上线吗？",
      trans1: "この機能、明日出せるかな？",
      meaning1: "Casual phrasing among teammates",
      trans2: "こちらの機能は明日リリース予定でしょうか？",
      meaning2: "Polite workplace honorifics (Keigo)",
      vocab: "リリース (release) · 予定 (schedule)",
    },
    zh: {
      source: "Can we ship this feature tomorrow?",
      trans1: "这个功能明天能发吗？",
      meaning1: "Casual daily team chat",
      trans2: "请问该功能预计明天可以正式上线吗？",
      meaning2: "Polite formal workplace communication",
      vocab: "上线 (go live) · 预计 (scheduled)",
    },
    es: {
      source: "这个功能明天能上线吗？",
      trans1: "¿Podemos lanzar esta función mañana?",
      meaning1: "Natural spoken question",
      trans2: "¿Está programado el lanzamiento de esta función para mañana?",
      meaning2: "Formal business phrasing",
      vocab: "lanzar (launch) · programado (scheduled)",
    },
    de: {
      source: "这个功能明天能上线吗？",
      trans1: "Können wir das Feature morgen live schalten?",
      meaning1: "Direct team chat",
      trans2: "Ist die Veröffentlichung dieser Funktion für morgen geplant?",
      meaning2: "Formal written prose",
      vocab: "live schalten (go live) · Veröffentlichung (release)",
    },
    fr: {
      source: "这个功能明天能上线吗？",
      trans1: "On peut lancer cette fonctionnalité demain ?",
      meaning1: "Casual question to colleagues",
      trans2: "La mise en ligne de cette fonctionnalité est-elle prévue pour demain ?",
      meaning2: "Formal written expression",
      vocab: "lancer (launch) · mise en ligne (release)",
    },
    ko: {
      source: "这个功能明天能上线吗？",
      trans1: "이 기능 내일 배포할 수 있을까요?",
      meaning1: "Friendly daily team communication",
      trans2: "해당 기능의 내일 정식 출시가 가능한지 확인 부탁드립니다.",
      meaning2: "Formal business & email expression",
      vocab: "배포하다 (deploy) · 출시 (release)",
    },
  };

  function renderLiveHudPreview() {
    if (!liveHudPreview) return;
    const sample = PREVIEW_SAMPLES[activeTargetLang] || PREVIEW_SAMPLES.en;
    const enabledSlots = currentSlots.filter((s) => s.enabled !== false);

    if (enabledSlots.length === 0) {
      liveHudPreview.innerHTML = `<div class="preview-row"><span class="preview-text" style="color:#a8a29e;">No active rows selected</span></div>`;
      return;
    }

    const sourceSlot = enabledSlots.find((s) => s.role === "source" || s.id === "source");
    const branchSlots = enabledSlots.filter((s) => s.role !== "source" && s.id !== "source");

    let html = "";

    if (sourceSlot) {
      html += `
        <div class="preview-row">
          <span class="preview-tag source">[${sourceSlot.label || "Source"}]</span>
          <span class="preview-text">${sample.source}</span>
          <span class="preview-meta">${t("meta_orig")}</span>
        </div>
      `;
    }

    let transIdx = 0;
    branchSlots.forEach((slot, i) => {
      const isLast = i === branchSlots.length - 1;
      const treeChar = isLast ? "└" : "├";

      if (slot.role === "vocab") {
        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-tag vocab">[${slot.label || "Vocab"}]</span>
            <span class="preview-text">${sample.vocab}</span>
            <span class="preview-meta">${t("meta_vocab")}</span>
          </div>
        `;
      } else {
        transIdx++;
        const mainText = transIdx === 1 ? sample.trans1 : sample.trans2;
        const meaningText = transIdx === 1 ? sample.meaning1 : sample.meaning2;
        const showMeaning = slot.showMeaning !== false;

        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-tag">[${transIdx}] ${slot.label || "Translation"}</span>
            <span class="preview-text">${mainText}</span>
            ${showMeaning ? `<span class="preview-nuance">(${meaningText})</span>` : ""}
            <span class="preview-meta">${t("meta_key").replace("{n}", String(transIdx))}</span>
          </div>
        `;
      }
    });

    liveHudPreview.innerHTML = html;
  }

  function syncSimpleTogglesFromSlots() {
    const hasSource = currentSlots.some((s) => (s.role === "source" || s.id === "source") && s.enabled !== false);
    const transSlots = currentSlots.filter((s) => (s.role === "translation" || s.role === "custom") && s.enabled !== false);
    const hasDual = transSlots.length >= 2;
    const hasMeaning = transSlots.some((s) => s.showMeaning !== false);
    const hasVocab = currentSlots.some((s) => s.role === "vocab" && s.enabled !== false);

    if (toggleShowSource) toggleShowSource.checked = hasSource;
    if (toggleDualStyle) toggleDualStyle.checked = hasDual;
    if (toggleShowMeaning) toggleShowMeaning.checked = hasMeaning;
    if (toggleShowVocab) toggleShowVocab.checked = hasVocab;
  }

  function applySimpleToggleChange() {
    const wantSource = toggleShowSource ? toggleShowSource.checked : true;
    const wantDual = toggleDualStyle ? toggleDualStyle.checked : true;
    const wantMeaning = toggleShowMeaning ? toggleShowMeaning.checked : true;
    const wantVocab = toggleShowVocab ? toggleShowVocab.checked : false;

    const existingTrans = currentSlots.filter((s) => s.role === "translation" || s.role === "custom");
    const firstTrans = existingTrans[0] || {
      id: "spoken",
      label: wantDual ? "Casual" : "Translation",
      role: "translation",
      instruction: "Natural, fluent everyday expression.",
    };
    const secondTrans = existingTrans[1] || {
      id: "written",
      label: "Formal",
      role: "translation",
      instruction: "Clear, polite, formal written expression.",
    };

    const nextSlots = [];
    if (wantSource) {
      nextSlots.push({ id: "source", label: "Source", role: "source", enabled: true });
    }

    nextSlots.push({
      ...firstTrans,
      label: wantDual ? "Casual" : "Translation",
      showMeaning: wantMeaning,
      enabled: true,
    });

    if (wantDual) {
      nextSlots.push({
        ...secondTrans,
        label: "Formal",
        showMeaning: wantMeaning,
        enabled: true,
      });
    }

    if (wantVocab) {
      nextSlots.push({
        id: "vocab",
        label: "Vocab",
        role: "vocab",
        instruction: "Extract 2-3 key idiomatic phrases or collocations.",
        enabled: true,
      });
    }

    currentSlots = nextSlots;
    renderLiveHudPreview();
    renderSlotCards();
    autoSaveNow();
  }

  [toggleShowSource, toggleDualStyle, toggleShowMeaning, toggleShowVocab].forEach((el) => {
    if (el) {
      el.addEventListener("change", applySimpleToggleChange);
    }
  });

  async function runAiSlotTuner(wishText) {
    const text = (wishText || "").trim();
    if (!text) return;

    if (inputAiWish) inputAiWish.value = text;
    if (btnAiTune) {
      btnAiTune.disabled = true;
      btnAiTune.textContent = "...";
    }

    try {
      let res = null;
      if (window.lingualSettingsAPI?.aiTuneSlots) {
        res = await window.lingualSettingsAPI.aiTuneSlots(text);
      }

      if (res && res.success && Array.isArray(res.slots)) {
        currentSlots = res.slots;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        await autoSaveNow();

        if (aiTuneFeedback) {
          aiTuneFeedback.textContent = res.summary || t("footer_saved");
          aiTuneFeedback.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.error("AI slot tune error:", err);
    } finally {
      if (btnAiTune) {
        btnAiTune.disabled = false;
        btnAiTune.textContent = t("ai_tuner_btn");
      }
    }
  }

  if (btnAiTune) {
    btnAiTune.addEventListener("click", () => {
      runAiSlotTuner(inputAiWish?.value || "");
    });
  }

  if (inputAiWish) {
    inputAiWish.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runAiSlotTuner(inputAiWish.value);
      }
    });
  }

  wishChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      runAiSlotTuner(chip.dataset.wish || "");
    });
  });

  function renderSlotCards() {
    if (!slotCardList) return;
    slotCardList.innerHTML = "";

    currentSlots.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = "slot-row-item";

      const isSource = slot.role === "source";
      const isVocab = slot.role === "vocab";
      const hasNuance = !isSource && !isVocab;

      card.innerHTML = `
        <div class="slot-row-top">
          <span class="slot-idx">#${idx + 1}</span>
          <input type="checkbox" class="slot-checkbox" ${slot.enabled !== false ? "checked" : ""} />
          <input type="text" class="input-text slot-label-input" value="${slot.label || ""}" placeholder="Label" />
          <select class="slot-role-select">
            <option value="translation" ${slot.role === "translation" || slot.role === "custom" ? "selected" : ""}>Translation</option>
            <option value="vocab" ${slot.role === "vocab" ? "selected" : ""}>Vocab</option>
            <option value="source" ${slot.role === "source" ? "selected" : ""}>Source</option>
          </select>
          ${hasNuance ? `
            <label class="slot-nuance-lbl">
              <input type="checkbox" class="nuance-check" ${slot.showMeaning !== false ? "checked" : ""} />
              <span>Nuance</span>
            </label>
          ` : ""}
          <button type="button" class="btn-icon-subtle btn-del-slot" title="Remove row">✕</button>
        </div>
        ${!isSource ? `
          <input type="text" class="input-text slot-inst-input" value="${slot.instruction || ""}" placeholder="Prompt instruction..." />
        ` : ""}
      `;

      card.querySelector(".slot-checkbox").addEventListener("change", (e) => {
        slot.enabled = e.target.checked;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-label-input").addEventListener("input", (e) => {
        slot.label = e.target.value.trim();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-role-select").addEventListener("change", (e) => {
        slot.role = e.target.value;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        autoSaveNow();
      });

      const nuanceCheck = card.querySelector(".nuance-check");
      if (nuanceCheck) {
        nuanceCheck.addEventListener("change", (e) => {
          slot.showMeaning = e.target.checked;
          syncSimpleTogglesFromSlots();
          renderLiveHudPreview();
          autoSaveNow();
        });
      }

      const inputInst = card.querySelector(".slot-inst-input");
      if (inputInst) {
        inputInst.addEventListener("input", (e) => {
          slot.instruction = e.target.value;
          autoSaveNow();
        });
      }

      card.querySelector(".btn-del-slot").addEventListener("click", () => {
        currentSlots.splice(idx, 1);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        autoSaveNow();
      });

      slotCardList.appendChild(card);
    });
  }

  if (btnAddSlot) {
    btnAddSlot.addEventListener("click", () => {
      currentSlots.push({
        id: "custom_" + Date.now().toString(36),
        label: "Custom",
        role: "translation",
        instruction: "Express the message naturally and clearly.",
        showMeaning: true,
        enabled: true,
      });
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
      autoSaveNow();
    });
  }

  if (btnResetSlots) {
    btnResetSlots.addEventListener("click", () => {
      currentSlots = getDefaultSlotsList();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
      autoSaveNow();
    });
  }

  // 4. Tab 3: Translation Engine (Pi Reuse vs Free Web vs Custom/Free-Tier LLM)
  const engineModeCards = document.querySelectorAll("#engine-mode-list .choice-card");
  const cloudConfigBox = document.getElementById("cloud-config-box");
  const piModelBadge = document.getElementById("pi-model-badge");

  const modelPresetChips = document.querySelectorAll("#model-preset-chips .chip");
  const inputEndpoint = document.getElementById("input-endpoint");
  const inputApiKey = document.getElementById("input-apikey");
  const inputModel = document.getElementById("input-model");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const btnTestConnection = document.getElementById("btn-test-connection");
  const testStatus = document.getElementById("test-status");
  const testStatusText = document.getElementById("test-status-text");

  const MODEL_PRESETS = {
    zhipu_free: {
      endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      model: "glm-4-flash",
    },
    siliconflow_free: {
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    groq_free: {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
    },
    deepseek: {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
    },
    openai: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    },
  };

  function setEngineModeUI(mode) {
    activeEngineMode = mode || "pi";
    engineModeCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.emode === activeEngineMode);
    });
    if (cloudConfigBox) {
      cloudConfigBox.style.display = activeEngineMode === "custom" ? "flex" : "none";
    }
  }

  engineModeCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, button, details, summary")) return;
      const mode = card.dataset.emode;
      setEngineModeUI(mode);

      if (mode === "custom" && (!inputEndpoint.value || inputEndpoint.value.includes("127.0.0.1"))) {
        inputEndpoint.value = MODEL_PRESETS.zhipu_free.endpoint;
        inputModel.value = MODEL_PRESETS.zhipu_free.model;
      }
      autoSaveNow();
    });
  });

  modelPresetChips.forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      setEngineModeUI("custom");
      const presetKey = chip.dataset.preset;
      modelPresetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const preset = MODEL_PRESETS[presetKey];
      if (preset) {
        inputEndpoint.value = preset.endpoint;
        inputModel.value = preset.model;
        autoSaveNow();
      }
    });
  });

  if (inputApiKey) {
    inputApiKey.addEventListener("input", () => autoSaveNow());
  }
  if (inputEndpoint) {
    inputEndpoint.addEventListener("input", () => autoSaveNow());
  }
  if (inputModel) {
    inputModel.addEventListener("input", () => autoSaveNow());
  }

  if (btnToggleKey) {
    btnToggleKey.addEventListener("click", () => {
      if (inputApiKey.type === "password") {
        inputApiKey.type = "text";
        btnToggleKey.textContent = t("btn_hide");
      } else {
        inputApiKey.type = "password";
        btnToggleKey.textContent = t("btn_show");
      }
    });
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener("click", async () => {
      const endpoint = inputEndpoint.value.trim();
      const apiKey = inputApiKey.value.trim();
      const model = inputModel.value.trim();

      testStatus.classList.remove("hidden");
      testStatusText.textContent = "Testing connection...";

      try {
        const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
        if (res && res.success) {
          testStatusText.textContent = `Connected (${res.latencyMs}ms)`;
          await autoSaveNow();
        } else {
          testStatusText.textContent = `Connection failed (${res?.error || "Check API Key"}). Free web fallback active.`;
        }
      } catch (err) {
        testStatusText.textContent = `Error: ${err.message}`;
      }
    });
  }

  // 5. Auto-Save & Window Controls
  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const saveStatus = document.getElementById("save-status");

  async function autoSaveNow() {
    if (isInitialLoading) return;
    const patch = {
      uiLang: activeUiLang,
      engineProvider: activeEngineMode,
      mode: activeCompanionMode,
      sourceLang: activeSourceLang,
      targetLang: activeTargetLang,
      slotPreset: activeSlotPreset,
      slots: currentSlots,
      hotkeySubmit: "Enter",
      autoSend: true,
      showCapsule: checkShowCapsule ? checkShowCapsule.checked : true,
    };

    if (activeEngineMode === "custom") {
      patch.endpoint = inputEndpoint ? inputEndpoint.value.trim() : "";
      patch.apiKey = inputApiKey ? inputApiKey.value.trim() : "";
      patch.model = inputModel ? inputModel.value.trim() : "";
    }

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = t("footer_saved");
        saveStatus.style.color = "#16a34a";
        setTimeout(() => {
          if (saveStatus) {
            saveStatus.textContent = t("footer_hint");
            saveStatus.style.color = "";
          }
        }, 2200);
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }

  function handleCloseWindow() {
    try {
      window.lingualSettingsAPI?.closeWindow();
    } catch {}
    try {
      window.close();
    } catch {}
  }

  btnClose?.addEventListener("click", handleCloseWindow);
  btnCancel?.addEventListener("click", handleCloseWindow);
  btnSave?.addEventListener("click", async () => {
    await autoSaveNow();
    handleCloseWindow();
  });

  async function loadConfig() {
    isInitialLoading = true;
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) {
        currentSlots = getDefaultSlotsList();
        setUiLangState("en");
        setSourceLangState("zh");
        setTargetLangState("en");
        setEngineModeUI("pi");
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        isInitialLoading = false;
        return;
      }

      setCompanionModeState(cfg.mode || "english");
      setSourceLangState(cfg.sourceLang || "zh");
      setTargetLangState(cfg.targetLang || "en");
      if (checkShowCapsule) {
        checkShowCapsule.checked = cfg.showCapsule !== false;
      }

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultSlotsList();
      setUiLangState(cfg.uiLang || "en");
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();

      if (piModelBadge) {
        if (cfg.piModelInfo && cfg.piModelInfo.model) {
          piModelBadge.textContent = `Active: ${cfg.piModelInfo.model}`;
        } else {
          piModelBadge.textContent = "Auto-Fallback";
        }
      }

      setEngineModeUI(cfg.engineProvider || (cfg.piModelInfo ? "pi" : "free"));

      if (cfg.engineProvider === "custom") {
        inputEndpoint.value = cfg.endpoint || "";
        inputApiKey.value = cfg.apiKey || "";
        inputModel.value = cfg.model || "";
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      isInitialLoading = false;
    }
  }

  loadConfig();
})();
