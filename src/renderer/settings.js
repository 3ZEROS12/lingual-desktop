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

  // 4. Tab 2: Dynamic Slot Canvas & Presets
  const slotPresetChips = document.querySelectorAll("#slot-preset-chips .chip");
  const slotCardList = document.getElementById("slot-card-list");
  const btnAddSlot = document.getElementById("btn-add-slot");
  const btnResetSlots = document.getElementById("btn-reset-slots");

  let activeSlotPreset = "developer";
  let currentSlots = [];

  function getPresetSlots(presetKey, lang = "zh") {
    const isZh = lang === "zh" || lang === "tw";
    const isJa = lang === "ja";

    if (presetKey === "social") {
      return [
        {
          id: "twitter",
          label: "Tweet",
          role: "translation",
          instruction: "Punchy opening hook and viral developer tweet under 280 chars with authentic dev slang.",
          showMeaning: true,
          enabled: true,
        },
        {
          id: "deep",
          label: "Deep",
          role: "translation",
          instruction: "High-signal architecture reasoning and nuanced technical value.",
          showMeaning: true,
          enabled: true,
        },
        {
          id: "vocab",
          label: isZh ? "重点" : isJa ? "単語" : "Vocab",
          role: "vocab",
          instruction: "Key engagement idioms and technical phrases.",
          enabled: true,
        },
      ];
    }

    if (presetKey === "japanese") {
      return [
        { id: "source", label: isZh ? "原文" : "Source", role: "source", enabled: true },
        { id: "spoken", label: "口語", role: "translation", instruction: "親しい同僚やチームとの自然な口語表現（朝会、Slackハドル、ペアプログラミング）。", showMeaning: true, enabled: true },
        { id: "written", label: "敬語", role: "translation", instruction: "明確で洗練された現代的技術文書表現（PR概要、RFC、技術設計書）。", showMeaning: true, enabled: true },
        { id: "vocab", label: "単語", role: "vocab", instruction: "重要な連語、句動詞、技術表現の抽出。", enabled: true },
      ];
    }

    if (presetKey === "academic") {
      return [
        { id: "source", label: isZh ? "原文" : isJa ? "原文" : "Source", role: "source", enabled: true },
        { id: "spoken", label: "Discussion", role: "translation", instruction: "Academic colloquium and seminar discussion tone.", showMeaning: true, enabled: true },
        { id: "written", label: "Paper", role: "translation", instruction: "Formal, objective academic prose suitable for peer-reviewed IEEE/ACM papers.", showMeaning: true, enabled: true },
      ];
    }

    if (presetKey === "compact2") {
      return [
        { id: "source", label: isZh ? "原文" : isJa ? "原文" : "Source", role: "source", enabled: true },
        { id: "spoken", label: isZh ? "译文" : isJa ? "訳文" : "Translation", role: "translation", instruction: "Natural, authentic target language translation.", showMeaning: true, enabled: true },
      ];
    }

    // Default: developer
    return [
      { id: "source", label: isZh ? "原文" : isJa ? "原文" : "Source", role: "source", enabled: true },
      { id: "spoken", label: isZh ? "口语" : isJa ? "口語" : "Spoken", role: "translation", instruction: "Natural, fluent spoken flow (daily standup, Slack, agile collaboration).", showMeaning: true, enabled: true },
      { id: "written", label: isZh ? "写作" : isJa ? "文面" : "Written", role: "translation", instruction: "Clear, precise, modern technical written prose (RFCs, PR descriptions, documentation).", showMeaning: true, enabled: true },
      { id: "vocab", label: isZh ? "重点" : isJa ? "単語" : "Vocab", role: "vocab", instruction: "Adaptively extract key idiomatic collocations, phrasal verbs, or technical idioms.", enabled: true },
    ];
  }

  function renderSlotCards() {
    if (!slotCardList) return;
    slotCardList.innerHTML = "";

    if (currentSlots.length === 0) {
      slotCardList.innerHTML = '<div style="text-align:center; padding:16px; font-size:12px; color:var(--ink-muted);">未配置任何槽位，请点击下方添加按钮或选择预设</div>';
      return;
    }

    currentSlots.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = `slot-card ${slot.enabled ? "" : "disabled"}`;
      card.dataset.id = slot.id;

      const isSource = slot.role === "source";
      const isVocab = slot.role === "vocab";
      const hasNuance = !isSource && !isVocab;

      card.innerHTML = `
        <div class="slot-card-header">
          <span class="slot-idx-badge">#${idx + 1}</span>
          <input type="checkbox" class="slot-checkbox" ${slot.enabled ? "checked" : ""} title="开启/禁用该槽位" />
          <input type="text" class="slot-input-label" value="${slot.label || ""}" placeholder="标签名称" />
          <select class="slot-select-role">
            <option value="translation" ${slot.role === "translation" ? "selected" : ""}>译文 (Translation)</option>
            <option value="custom" ${slot.role === "custom" ? "selected" : ""}>自定义 (Custom)</option>
            <option value="vocab" ${slot.role === "vocab" ? "selected" : ""}>重点 (Vocab)</option>
            <option value="source" ${slot.role === "source" ? "selected" : ""}>母语原文 (Source)</option>
          </select>
          ${hasNuance ? `
            <label class="slot-nuance-toggle" title="是否展示针对母语的微释义标注">
              <input type="checkbox" class="nuance-check" ${slot.showMeaning !== false ? "checked" : ""} />
              <span>↳ 微释义</span>
            </label>
          ` : ""}
          <button type="button" class="btn-delete-slot" title="删除该槽位（包括原文皆可完全删除）">✕</button>
        </div>
        ${!isSource ? `
          <input type="text" class="slot-input-instruction" value="${slot.instruction || ""}" placeholder="具体风格要求 (Prompt instruction，如：严谨RFC文档、爆款推文)..." />
        ` : ""}
      `;

      // Event bindings
      const checkEnabled = card.querySelector(".slot-checkbox");
      checkEnabled.addEventListener("change", (e) => {
        slot.enabled = e.target.checked;
        card.classList.toggle("disabled", !slot.enabled);
      });

      const inputLabel = card.querySelector(".slot-input-label");
      inputLabel.addEventListener("input", (e) => {
        slot.label = e.target.value.trim();
      });

      const selectRole = card.querySelector(".slot-select-role");
      selectRole.addEventListener("change", (e) => {
        slot.role = e.target.value;
        renderSlotCards();
      });

      const nuanceCheck = card.querySelector(".nuance-check");
      if (nuanceCheck) {
        nuanceCheck.addEventListener("change", (e) => {
          slot.showMeaning = e.target.checked;
        });
      }

      const inputInst = card.querySelector(".slot-input-instruction");
      if (inputInst) {
        inputInst.addEventListener("input", (e) => {
          slot.instruction = e.target.value;
        });
      }

      const btnDelete = card.querySelector(".btn-delete-slot");
      btnDelete.addEventListener("click", () => {
        currentSlots.splice(idx, 1);
        renderSlotCards();
      });

      slotCardList.appendChild(card);
    });
  }

  // Preset chips click
  slotPresetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const presetKey = chip.dataset.preset;
      activeSlotPreset = presetKey;
      slotPresetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      currentSlots = getPresetSlots(presetKey, activeLangCode);
      renderSlotCards();
    });
  });

  // Add slot button
  if (btnAddSlot) {
    btnAddSlot.addEventListener("click", () => {
      const newId = "custom_" + Date.now().toString(36);
      const isZh = activeLangCode === "zh" || activeLangCode === "tw";
      currentSlots.push({
        id: newId,
        label: isZh ? "自定义" : "Custom",
        role: "translation",
        instruction: "Express the message accurately and authentically.",
        showMeaning: true,
        enabled: true,
      });
      renderSlotCards();
      if (slotCardList) {
        slotCardList.scrollTop = slotCardList.scrollHeight;
      }
    });
  }

  // Reset slots button
  if (btnResetSlots) {
    btnResetSlots.addEventListener("click", () => {
      activeSlotPreset = "developer";
      slotPresetChips.forEach((c) => c.classList.toggle("active", c.dataset.preset === "developer"));
      currentSlots = getPresetSlots("developer", activeLangCode);
      renderSlotCards();
    });
  }

  function updateSlotsForLanguage(lang) {
    // If current slots match initial default preset, refresh their labels to match language
    if (activeSlotPreset) {
      currentSlots = getPresetSlots(activeSlotPreset, lang);
      renderSlotCards();
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

      // Slots: 动态槽位卡片列表初始化
      activeSlotPreset = cfg.slotPreset || "developer";
      slotPresetChips.forEach((c) => {
        c.classList.toggle("active", c.dataset.preset === activeSlotPreset);
      });

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0
        ? cfg.slots
        : getPresetSlots(activeSlotPreset, cfg.sourceLang || "zh");
      renderSlotCards();

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
    const patch = {
      sourceLang: activeLangCode,
      endpoint: inputEndpoint.value.trim(),
      apiKey: inputApiKey.value.trim(),
      model: inputModel.value.trim(),
      slotPreset: activeSlotPreset,
      slots: currentSlots,
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
