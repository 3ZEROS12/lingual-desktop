// ============================================================================
// Lingual Desktop Settings — Minimalist English Editorial Controller
// - Clean 3-Mode Control (Translate / Learn / Off)
// - Non-Intrusive Shortcuts (Alt+E / Alt+S / Alt+Enter)
// - Live Card Preview & Natural Language Preset Tuner
// - Zero Local-Model Clutter (Built-in Fast Cloud vs Custom API Key)
// - Instant Auto-Save on Every Action
// ============================================================================

(function () {
  // 1. Navigation Tabs
  const navPills = document.querySelectorAll(".nav-pill");
  const tabPanes = document.querySelectorAll(".tab-pane");

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

  // State
  let activeSourceLang = "zh";
  let activeTargetLang = "en";
  let activeCompanionMode = "english";
  let selectedTriggerKey = "Alt+E";
  let activeSlotPreset = "developer";
  let currentSlots = [];
  let isInitialLoading = true;

  // 2. Tab 1: General (Operating Mode, Target Language, Trigger Shortcut, Replacement Action)
  const modeSegButtons = document.querySelectorAll("#companion-mode-segmented .seg-btn");
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");
  const triggerSegButtons = document.querySelectorAll("#trigger-segmented .seg-btn");
  const autoSendCards = document.querySelectorAll("#autosend-choice-grid .choice-card");
  const checkAutoSend = document.getElementById("check-auto-send");

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

  function setTriggerState(val) {
    const safeVal =
      !val || val.toLowerCase() === "enter" || val.toLowerCase() === "ctrl+enter"
        ? "Alt+E"
        : val;
    selectedTriggerKey = safeVal;
    triggerSegButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.val === selectedTriggerKey);
    });
  }

  triggerSegButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTriggerState(btn.dataset.val);
      autoSaveNow();
    });
  });

  function setAutoSendState(isAutoSend) {
    if (checkAutoSend) checkAutoSend.checked = Boolean(isAutoSend);
    autoSendCards.forEach((card) => {
      const cardVal = card.dataset.autosend === "true";
      card.classList.toggle("active", cardVal === Boolean(isAutoSend));
    });
  }

  autoSendCards.forEach((card) => {
    card.addEventListener("click", () => {
      setAutoSendState(card.dataset.autosend === "true");
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
          <span class="preview-meta">Original input</span>
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
            <span class="preview-meta">Key terms</span>
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
            <span class="preview-meta">Key ${transIdx}</span>
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
      btnAiTune.textContent = "Applying...";
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
          aiTuneFeedback.textContent = "Preset applied and saved.";
          aiTuneFeedback.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.error("AI slot tune error:", err);
    } finally {
      if (btnAiTune) {
        btnAiTune.disabled = false;
        btnAiTune.textContent = "Apply";
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
        btnToggleKey.textContent = "Hide";
      } else {
        inputApiKey.type = "password";
        btnToggleKey.textContent = "Show";
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
      hotkeySubmit: selectedTriggerKey,
      autoSend: checkAutoSend ? checkAutoSend.checked : true,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = "Saved · Active immediately";
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
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        isInitialLoading = false;
        return;
      }

      activeSourceLang = cfg.sourceLang || "zh";
      setCompanionModeState(cfg.mode || "english");
      setTargetLangState(cfg.targetLang || "en");
      setTriggerState(cfg.hotkeySubmit || "Alt+E");
      setAutoSendState(cfg.autoSend !== false);

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultSlotsList();
      normalizeSlotLabelsToEnglish(currentSlots);
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
