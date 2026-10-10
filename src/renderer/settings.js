// ============================================================================
// Lingual Desktop Settings — Pure pi-lingual Parity Controller
// - Enter-Driven Automatic Dispatch (Translate / Learn / Off)
// - Clean Language Code Switcher (EN / ZH / TW / JA)
// - Source & Target Language Chips (ZH / EN / JA / ES / DE / FR / KO)
// - Live Card Preview & Natural Language Preset Tuner
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
        "Just press Enter in any input box. Lingual automatically detects natural language and dispatches to the configured model (commands, code, and Ctrl+Enter / Shift+Enter newlines pass through untouched). Cycle anytime with Alt + Q:",
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
      preview_title: "Live Preview",
      preview_hint: 'Sample: "Can we release this feature tomorrow?"',
      ai_tuner_title: "Natural Language Preset",
      ai_tuner_desc: "Describe your preferred layout or select a preset below:",
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
      banner_ready: "Fast cloud translation active. Zero configuration required.",
      engine_choose_title: "Translation Provider",
      emode_free_title: "Built-in Fast Cloud (Default)",
      emode_free_desc: "Free zero-key translation. Instant out of the box with zero account setup.",
      emode_cloud_title: "Custom LLM API Key",
      emode_cloud_desc: "Enables dual tone comparisons (Casual + Formal) and vocabulary extraction:",
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
        "在任何输入框打完字直接按回车 (Enter)，自动判断是否需要翻译并交给所配置的模型（代码、命令及 Ctrl+Enter / Shift+Enter 换行自动原样放行）。随时可按 Alt + Q 切换模式：",
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
      preview_title: "实时预览",
      preview_hint: "示例：「这个功能明天能上线吗？」",
      ai_tuner_title: "一句话定制版式",
      ai_tuner_desc: "输入你的日常用途或点选下方预设：",
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
      banner_ready: "内置高速云端翻译与本机模型已就绪，打字按回车即可触发。",
      engine_choose_title: "翻译服务商",
      emode_free_title: "内置高速云（默认）",
      emode_free_desc: "免费免 Key 直连，无需配置账号即可直接打字翻译。",
      emode_cloud_title: "自定义大模型 API Key",
      emode_cloud_desc: "启用口语/书面双语气对比与词汇提取：",
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
        "在任何輸入框打完字直接按 Enter，自動判斷是否需要翻譯並交給所配置的模型（代碼、命令及 Ctrl+Enter / Shift+Enter 換行自動原樣放行）。隨時可按 Alt + Q 切換模式：",
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
      banner_ready: "內置高速雲端翻譯與本機模型已就緒，打字按 Enter 即可觸發。",
      engine_choose_title: "翻譯服務商",
      emode_free_title: "內置高速雲（默認）",
      emode_free_desc: "免費免 Key 直連，無需配置帳號即可直接打字翻譯。",
      emode_cloud_title: "自定義大模型 API Key",
      emode_cloud_desc: "啟用口語/書面雙語氣對比與詞彙提取：",
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
        "入力欄で Enter を押すだけで、自然言語かどうかを自動判定して設定モデルへ送信します（コード、コマンド、Ctrl+Enter / Shift+Enter の改行はそのまま通過）。Alt + Q でモード切替：",
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
      banner_ready: "高速クラウド翻訳が有効です。Enter を押すだけで動作します。",
      engine_choose_title: "翻訳プロバイダー",
      emode_free_title: "内蔵高速クラウド（デフォルト）",
      emode_free_desc: "APIキー不要で即座に利用可能。",
      emode_cloud_title: "カスタム LLM API Key",
      emode_cloud_desc: "2トーン比較と重要語彙の抽出を有効化：",
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
    });
  });

  // 2. Tab 1: General (Operating Mode, Source Language, Target Language)
  const modeSegButtons = document.querySelectorAll("#companion-mode-segmented .seg-btn");
  const sourceLangChips = document.querySelectorAll("#source-lang-chips .chip");
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");

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

  function normalizeSlotLabelsToEnglish(slots) {
    const map = {
      原话: "Source",
      原文: "Source",
      日常聊: "Casual",
      口语: "Casual",
      口語: "Casual",
      正式写: "Formal",
      写作: "Formal",
      文面: "Formal",
      敬語: "Formal",
      地道译文: "Translation",
      译文: "Translation",
      訳文: "Translation",
      顺便记词: "Vocab",
      重点: "Vocab",
      単語: "Vocab",
    };
    slots.forEach((s) => {
      if (s.label && map[s.label]) {
        s.label = map[s.label];
      }
    });
  }

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
        normalizeSlotLabelsToEnglish(currentSlots);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        await autoSaveNow();

        if (aiTuneFeedback) {
          aiTuneFeedback.textContent = t("footer_saved");
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

  // 4. Tab 3: Translation Provider (Built-in Fast Cloud vs Custom LLM API Key)
  const engineModeCards = document.querySelectorAll("#engine-mode-list .choice-card");
  const cloudConfigBox = document.getElementById("cloud-config-box");

  const modelPresetChips = document.querySelectorAll("#model-preset-chips .chip");
  const inputEndpoint = document.getElementById("input-endpoint");
  const inputApiKey = document.getElementById("input-apikey");
  const inputModel = document.getElementById("input-model");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const btnTestConnection = document.getElementById("btn-test-connection");
  const testStatus = document.getElementById("test-status");
  const testStatusText = document.getElementById("test-status-text");

  const MODEL_PRESETS = {
    deepseek: {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
    },
    siliconflow: {
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    groq: {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
    },
    openai: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    },
  };

  let activeEngineMode = "free";

  function setEngineModeUI(mode) {
    activeEngineMode = mode;
    engineModeCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.emode === mode);
    });
    if (cloudConfigBox) {
      cloudConfigBox.style.display = mode === "cloud" ? "flex" : "none";
    }
  }

  engineModeCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, button, details, summary")) return;
      const mode = card.dataset.emode;
      setEngineModeUI(mode);

      if (mode === "free") {
        inputEndpoint.value = "http://127.0.0.1:0/free";
        inputApiKey.value = "";
      } else if (mode === "cloud") {
        if (!inputEndpoint.value || inputEndpoint.value.includes("127.0.0.1:0") || inputEndpoint.value.includes("11434")) {
          inputEndpoint.value = MODEL_PRESETS.deepseek.endpoint;
          inputModel.value = MODEL_PRESETS.deepseek.model;
        }
        if (inputApiKey.value === "ollama") {
          inputApiKey.value = "";
        }
      }
      autoSaveNow();
    });
  });

  modelPresetChips.forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      setEngineModeUI("cloud");
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
          testStatusText.textContent = `Connection failed (${res?.error || "Check API Key"}). Built-in cloud fallback active.`;
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
      mode: activeCompanionMode,
      sourceLang: activeSourceLang,
      targetLang: activeTargetLang,
      endpoint: inputEndpoint ? inputEndpoint.value.trim() : "",
      apiKey: inputApiKey ? inputApiKey.value.trim() : "",
      model: inputModel ? inputModel.value.trim() : "",
      slotPreset: activeSlotPreset,
      slots: currentSlots,
      hotkeySubmit: "Enter",
      autoSend: true,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = t("footer_saved");
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }

  btnClose?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());
  btnCancel?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());
  btnSave?.addEventListener("click", async () => {
    await autoSaveNow();
    window.lingualSettingsAPI?.closeWindow();
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
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        isInitialLoading = false;
        return;
      }

      setCompanionModeState(cfg.mode || "english");
      setSourceLangState(cfg.sourceLang || "zh");
      setTargetLangState(cfg.targetLang || "en");

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultSlotsList();
      normalizeSlotLabelsToEnglish(currentSlots);
      setUiLangState("en");
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();

      const cleanKey = cfg.apiKey === "ollama" ? "" : cfg.apiKey || "";
      const cleanEndpoint =
        cfg.endpoint && !cfg.endpoint.includes("11434") ? cfg.endpoint : "";
      const cleanModel = cfg.model === "qwen2.5:3b" ? "" : cfg.model || "";

      inputEndpoint.value = cleanEndpoint;
      inputApiKey.value = cleanKey;
      inputModel.value = cleanModel;

      if (!cleanKey || cleanEndpoint.includes("127.0.0.1:0")) {
        setEngineModeUI("free");
      } else {
        setEngineModeUI("cloud");
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      isInitialLoading = false;
    }
  }

  loadConfig();
})();
