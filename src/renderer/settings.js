// ==========================================================================
// Lingual Settings Controller — Antigravity Tools & Gabriel v4 Architecture
// ==========================================================================

(function () {
  // 1. Navigation & Tabs
  const navPills = document.querySelectorAll(".nav-pill");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetId = pill.dataset.tab;
      navPills.forEach((p) => p.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      pill.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // 2. Antigravity-Style 2-Column Language Popover
  const btnLangTrigger = document.getElementById("btn-lang-trigger");
  const langCurrentShort = document.getElementById("lang-current-short");
  const langPopover = document.getElementById("lang-popover");
  const langOptions = document.querySelectorAll(".lang-option");

  let activeLangCode = "zh";

  btnLangTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    langPopover.classList.toggle("hidden");
  });

  // Click outside to dismiss popover
  document.addEventListener("click", (e) => {
    if (!langPopover.contains(e.target) && e.target !== btnLangTrigger) {
      langPopover.classList.add("hidden");
    }
  });

  langOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const langCode = opt.dataset.lang;
      const shortCode = opt.dataset.short;
      activeLangCode = langCode;

      // Update active state in popover
      langOptions.forEach((o) => {
        o.classList.remove("active");
        const dot = o.querySelector(".opt-dot");
        if (dot) dot.textContent = "";
      });

      opt.classList.add("active");
      const activeDot = opt.querySelector(".opt-dot");
      if (activeDot) activeDot.textContent = "•";

      langCurrentShort.textContent = shortCode;
      langPopover.classList.add("hidden");

      // Auto update slot labels if matching native preset
      updateSlotsForLanguage(langCode);
    });
  });

  function setLanguageState(langCode) {
    activeLangCode = langCode;
    langOptions.forEach((o) => {
      const isMatch = o.dataset.lang === langCode || (langCode === "zh" && o.dataset.lang === "zh");
      o.classList.toggle("active", isMatch);
      const dot = o.querySelector(".opt-dot");
      if (dot) dot.textContent = isMatch ? "•" : "";
      if (isMatch) {
        langCurrentShort.textContent = o.dataset.short;
      }
    });
  }

  // 3. Tab 1: Flow & Segmented Trigger Control
  const segBtns = document.querySelectorAll(".seg-btn");
  let selectedTriggerKey = "Ctrl+Enter";

  segBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTriggerKey = btn.dataset.val;
    });
  });

  function setTriggerState(keyVal) {
    selectedTriggerKey = keyVal || "Ctrl+Enter";
    segBtns.forEach((b) => {
      b.classList.toggle("active", b.dataset.val === selectedTriggerKey);
    });
  }

  const checkAutoSend = document.getElementById("check-auto-send");
  const checkRecallBuffer = document.getElementById("check-recall-buffer");
  const checkAutostart = document.getElementById("check-autostart");

  // 4. Tab 2: Slot Arranger & Presets
  const slotPresetChips = document.querySelectorAll("#slot-preset-chips .chip");
  const checkSlot1 = document.getElementById("check-slot-1");
  const slot1Label = document.getElementById("slot-1-label");
  const checkSlot2 = document.getElementById("check-slot-2");
  const slot2Label = document.getElementById("slot-2-label");
  const checkSlotVocab = document.getElementById("check-slot-vocab");
  const slotVocabLabel = document.getElementById("slot-vocab-label");

  let activeSlotPreset = "developer";

  const SLOT_TEMPLATES = {
    developer: {
      slot1: { enabled: true, label: "口语" },
      slot2: { enabled: true, label: "写作" },
      vocab: { enabled: true, label: "重点" },
    },
    social: {
      slot1: { enabled: true, label: "Hook" },
      slot2: { enabled: true, label: "Deep" },
      vocab: { enabled: true, label: "重点" },
    },
    japanese: {
      slot1: { enabled: true, label: "口語" },
      slot2: { enabled: true, label: "敬語" },
      vocab: { enabled: true, label: "単語" },
    },
    academic: {
      slot1: { enabled: true, label: "Discussion" },
      slot2: { enabled: true, label: "Paper" },
      vocab: { enabled: true, label: "重点" },
    },
    compact2: {
      slot1: { enabled: true, label: "译文" },
      slot2: { enabled: false, label: "写作" },
      vocab: { enabled: false, label: "重点" },
    },
  };

  slotPresetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const presetKey = chip.dataset.preset;
      activeSlotPreset = presetKey;
      slotPresetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const tpl = SLOT_TEMPLATES[presetKey];
      if (tpl) {
        checkSlot1.checked = tpl.slot1.enabled;
        slot1Label.value = tpl.slot1.label;
        checkSlot2.checked = tpl.slot2.enabled;
        slot2Label.value = tpl.slot2.label;
        checkSlotVocab.checked = tpl.vocab.enabled;
        slotVocabLabel.value = tpl.vocab.label;
      }
    });
  });

  function updateSlotsForLanguage(lang) {
    if (lang === "ja") {
      slot1Label.value = "口語";
      slot2Label.value = "敬語";
      slotVocabLabel.value = "単語";
    } else if (lang === "en") {
      slot1Label.value = "Spoken";
      slot2Label.value = "Written";
      slotVocabLabel.value = "Vocab";
    }
  }

  // 5. Tab 3: Model Engine & Providers
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
      endpoint: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
    },
    siliconflow: {
      endpoint: "https://api.siliconflow.cn/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    groq: {
      endpoint: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
    },
    openai: {
      endpoint: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
    },
    ollama: {
      endpoint: "http://127.0.0.1:11434/v1/chat/completions",
      model: "qwen2.5:3b",
    },
  };

  modelPresetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const presetKey = chip.dataset.preset;
      modelPresetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const p = MODEL_PRESETS[presetKey];
      if (p) {
        inputEndpoint.value = p.endpoint;
        inputModel.value = p.model;
        if (presetKey === "ollama") {
          inputApiKey.value = "ollama";
        }
      }
    });
  });

  btnToggleKey.addEventListener("click", () => {
    if (inputApiKey.type === "password") {
      inputApiKey.type = "text";
      btnToggleKey.textContent = "隐藏";
    } else {
      inputApiKey.type = "password";
      btnToggleKey.textContent = "显示";
    }
  });

  // ⚡ Live Connection Latency Probe
  btnTestConnection.addEventListener("click", async () => {
    const endpoint = inputEndpoint.value.trim();
    const apiKey = inputApiKey.value.trim();
    const model = inputModel.value.trim();

    testStatus.className = "probe-result testing";
    testStatus.classList.remove("hidden");
    testStatusText.textContent = "正在探测握手延迟...";

    try {
      const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
      if (res && res.success) {
        testStatus.className = "probe-result success";
        testStatusText.textContent = `⚡ ${res.latencyMs}ms · 连接正常`;
      } else {
        testStatus.className = "probe-result error";
        testStatusText.textContent = `连接失败: ${res?.error || "服务不可达"}`;
      }
    } catch (err) {
      testStatus.className = "probe-result error";
      testStatusText.textContent = `错误: ${err.message}`;
    }
  });

  // 6. Window Controls & Save / Load
  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const saveStatus = document.getElementById("save-status");

  btnClose.addEventListener("click", () => {
    window.lingualSettingsAPI?.closeWindow();
  });
  btnCancel.addEventListener("click", () => {
    window.lingualSettingsAPI?.closeWindow();
  });

  async function loadConfig() {
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) return;

      // Language
      setLanguageState(cfg.sourceLang || "zh");

      // Flow
      setTriggerState(cfg.hotkeySubmit || "Ctrl+Enter");
      checkAutoSend.checked = cfg.autoSend !== false;
      checkRecallBuffer.checked = true;
      checkAutostart.checked = true;

      // Slots
      activeSlotPreset = cfg.slotPreset || "developer";
      slotPresetChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.preset === activeSlotPreset);
      });

      if (Array.isArray(cfg.slots)) {
        const s1 = cfg.slots.find((s) => s.id === "spoken");
        if (s1) {
          checkSlot1.checked = s1.enabled !== false;
          slot1Label.value = s1.label || "口语";
        }
        const s2 = cfg.slots.find((s) => s.id === "written");
        if (s2) {
          checkSlot2.checked = s2.enabled !== false;
          slot2Label.value = s2.label || "写作";
        }
        const sv = cfg.slots.find((s) => s.id === "vocab");
        if (sv) {
          checkSlotVocab.checked = sv.enabled !== false;
          slotVocabLabel.value = sv.label || "重点";
        }
      }

      // Model
      inputEndpoint.value = cfg.endpoint || "";
      inputApiKey.value = cfg.apiKey || "";
      inputModel.value = cfg.model || "";

      // Match model preset chip
      for (const [key, p] of Object.entries(MODEL_PRESETS)) {
        if (cfg.endpoint?.includes(p.endpoint.replace("https://", "").split("/")[0])) {
          modelPresetChips.forEach((c) => c.classList.toggle("active", c.dataset.preset === key));
          break;
        }
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  }

  btnSave.addEventListener("click", async () => {
    const dynamicSlots = [
      {
        id: "source",
        label: "原文",
        role: "source",
        enabled: true,
      },
      {
        id: "spoken",
        label: slot1Label.value.trim() || "口语",
        role: "translation",
        instruction: "Natural, fluent spoken flow (daily standup, Slack, agile collaboration, conversational banter).",
        showMeaning: true,
        enabled: checkSlot1.checked,
      },
      {
        id: "written",
        label: slot2Label.value.trim() || "写作",
        role: "translation",
        instruction: "Clear, precise, modern technical written prose (RFCs, PR descriptions, documentation, deep insight).",
        showMeaning: true,
        enabled: checkSlot2.checked,
      },
      {
        id: "vocab",
        label: slotVocabLabel.value.trim() || "重点",
        role: "vocab",
        instruction: "Adaptively extract key idiomatic collocations, phrasal verbs, or technical idioms.",
        enabled: checkSlotVocab.checked,
      },
    ];

    const patch = {
      sourceLang: activeLangCode,
      endpoint: inputEndpoint.value.trim(),
      apiKey: inputApiKey.value.trim(),
      model: inputModel.value.trim(),
      slotPreset: activeSlotPreset,
      slots: dynamicSlots,
      hotkeySubmit: selectedTriggerKey,
      autoSend: checkAutoSend.checked,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      saveStatus.textContent = "✓ 已保存并即刻生效";
      setTimeout(() => {
        window.lingualSettingsAPI?.closeWindow();
      }, 500);
    } catch (err) {
      saveStatus.textContent = "保存失败: " + err.message;
      saveStatus.style.color = "var(--error)";
    }
  });

  loadConfig();
})();
