// ============================================================================
// Lingual Desktop Settings Logic (Human-First, WYSIWYG Live Preview & AI Tuner)
// ============================================================================

(function () {
  // 1. Top Pill Tabs Navigation
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

  // 2. Native Language Switcher Dropdown
  const btnLangTrigger = document.getElementById("btn-lang-trigger");
  const langCurrentShort = document.getElementById("lang-current-short");
  const langPopover = document.getElementById("lang-popover");
  const langOptions = document.querySelectorAll(".lang-option");

  let activeLangCode = "zh";
  let activeTargetLang = "en";

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

  function setLanguageState(langCode) {
    activeLangCode = langCode || "zh";
    langOptions.forEach((opt) => {
      const isMatch = opt.dataset.lang === activeLangCode;
      opt.classList.toggle("active", isMatch);
      const dot = opt.querySelector(".opt-dot");
      if (dot) dot.textContent = isMatch ? "•" : "";
      if (isMatch && langCurrentShort) {
        langCurrentShort.textContent = opt.dataset.short || "母语: 中文";
      }
    });
  }

  langOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      setLanguageState(opt.dataset.lang);
      langPopover.classList.add("hidden");
      renderLiveHudPreview();
    });
  });

  // 3. Tab 1: How to Type (Target Language, Trigger Key, Auto-Send vs Manual Pick)
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");
  const segButtons = document.querySelectorAll("#trigger-segmented .seg-btn");
  const modeChoiceCards = document.querySelectorAll("#autosend-choice-grid .mode-choice-card");
  const checkAutoSend = document.getElementById("check-auto-send");
  const checkRecallBuffer = document.getElementById("check-recall-buffer");
  const checkAutostart = document.getElementById("check-autostart");

  let selectedTriggerKey = "Ctrl+Enter";

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
    });
  });

  function setTriggerState(val) {
    selectedTriggerKey = val || "Ctrl+Enter";
    segButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.val === selectedTriggerKey);
    });
  }

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTriggerState(btn.dataset.val);
    });
  });

  function setAutoSendCardState(isAutoSend) {
    if (checkAutoSend) checkAutoSend.checked = Boolean(isAutoSend);
    modeChoiceCards.forEach((card) => {
      const cardVal = card.dataset.autosend === "true";
      card.classList.toggle("active", cardVal === Boolean(isAutoSend));
    });
  }

  modeChoiceCards.forEach((card) => {
    card.addEventListener("click", () => {
      setAutoSendCardState(card.dataset.autosend === "true");
    });
  });

  // 4. Tab 2: Live HUD Preview, Conversational AI Tuner & Simple Toggles
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

  let activeSlotPreset = "developer";
  let currentSlots = [];

  function getDefaultFriendlySlots() {
    return [
      { id: "source", label: "原话", role: "source", enabled: true },
      {
        id: "spoken",
        label: "日常聊",
        role: "translation",
        instruction: "Natural, fluent spoken flow for daily chat and team messages.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "written",
        label: "正式写",
        role: "translation",
        instruction: "Clear, polite, formal written expression for emails and docs.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "vocab",
        label: "顺便记词",
        role: "vocab",
        instruction: "Extract 2-3 useful idiomatic words or phrases.",
        enabled: true,
      },
    ];
  }

  // Sample preview translations per target language so the user immediately sees a realistic card!
  const PREVIEW_SAMPLES = {
    en: {
      source: "这个功能明天能上线吗？",
      trans1: "Can we ship this feature tomorrow?",
      meaning1: "自然随和，适合平时在群里问同事",
      trans2: "Is this feature scheduled for release tomorrow?",
      meaning2: "礼貌得体，适合发正式邮件或跟客户确认",
      vocab: "ship (上线/发布) · be scheduled for (定于...)",
    },
    ja: {
      source: "这个功能明天能上线吗？",
      trans1: "この機能、明日出せるかな？",
      meaning1: "熟人同事间的自然随和口语",
      trans2: "こちらの機能は明日リリース予定でしょうか？",
      meaning2: "得体礼貌的职场标准敬语",
      vocab: "リリース (发布/上线) · 予定 (计划/安排)",
    },
    ko: {
      source: "这个功能明天能上线吗？",
      trans1: "이 기능 내일 배포할 수 있을까요?",
      meaning1: "自然温和的日常工作交流",
      trans2: "해당 기능의 내일 정식 출시가 가능한지 확인 부탁드립니다.",
      meaning2: "正式商务与邮件礼貌表达",
      vocab: "배포하다 (部署/上线) · 출시 (正式推出)",
    },
    fr: {
      source: "这个功能明天能上线吗？",
      trans1: "On peut lancer cette fonctionnalité demain ?",
      meaning1: "日常同事间轻松询问",
      trans2: "La mise en ligne de cette fonctionnalité est-elle prévue pour demain ?",
      meaning2: "正式得体的书面与邮件表达",
      vocab: "lancer (推出) · mise en ligne (上线)",
    },
    de: {
      source: "这个功能明天能上线吗？",
      trans1: "Können wir das Feature morgen live schalten?",
      meaning1: "日常团队直接沟通",
      trans2: "Ist die Veröffentlichung dieser Funktion für morgen geplant?",
      meaning2: "正式严谨的书面表达",
      vocab: "live schalten (上线) · Veröffentlichung (发布)",
    },
    es: {
      source: "这个功能明天能上线吗？",
      trans1: "¿Podemos lanzar esta función mañana?",
      meaning1: "日常自然口语询问",
      trans2: "¿Está programado el lanzamiento de esta función para mañana?",
      meaning2: "正式商务书面表达",
      vocab: "lanzar (上线/发布) · programado (排期/定于)",
    },
  };

  function renderLiveHudPreview() {
    if (!liveHudPreview) return;
    const sample = PREVIEW_SAMPLES[activeTargetLang] || PREVIEW_SAMPLES.en;
    const enabledSlots = currentSlots.filter((s) => s.enabled !== false);

    if (enabledSlots.length === 0) {
      liveHudPreview.innerHTML = `<div class="preview-row"><span class="preview-main-text" style="color:#94a3b8;">（当前未勾选任何显示项，建议至少保留 1 行译文）</span></div>`;
      return;
    }

    const sourceSlot = enabledSlots.find((s) => s.role === "source" || s.id === "source");
    const branchSlots = enabledSlots.filter((s) => s.role !== "source" && s.id !== "source");

    let html = "";

    if (sourceSlot) {
      html += `
        <div class="preview-row">
          <span class="preview-badge source">[${sourceSlot.label || "原话"}]</span>
          <span class="preview-main-text">${sample.source}</span>
          <span class="preview-explain-pill">← 你打的中文原话</span>
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
            <span class="preview-badge vocab">[${slot.label || "顺便记词"}]</span>
            <span class="preview-main-text" style="color:#a7f3d0;">${sample.vocab}</span>
            <span class="preview-explain-pill">← 顺便挑2个好词教你</span>
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
            <span class="preview-badge">[${transIdx}] ${slot.label || "译文"}</span>
            <span class="preview-main-text">${mainText}</span>
            ${showMeaning ? `<span class="preview-meaning-text">（${meaningText}）</span>` : ""}
            <span class="preview-explain-pill">← 按数字 ${transIdx} 选这句</span>
          </div>
        `;
      }
    });

    liveHudPreview.innerHTML = html;
  }

  // Sync the 4 simple plain-language checkboxes from currentSlots
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

  // Apply changes when user clicks any of the 4 simple checkboxes
  function applySimpleToggleChange() {
    const wantSource = toggleShowSource ? toggleShowSource.checked : true;
    const wantDual = toggleDualStyle ? toggleDualStyle.checked : true;
    const wantMeaning = toggleShowMeaning ? toggleShowMeaning.checked : true;
    const wantVocab = toggleShowVocab ? toggleShowVocab.checked : false;

    const existingTrans = currentSlots.filter((s) => s.role === "translation" || s.role === "custom");
    const firstTrans = existingTrans[0] || {
      id: "spoken",
      label: wantDual ? "日常聊" : "地道译文",
      role: "translation",
      instruction: "Natural, fluent everyday expression.",
    };
    const secondTrans = existingTrans[1] || {
      id: "written",
      label: "正式写",
      role: "translation",
      instruction: "Clear, polite, formal written expression.",
    };

    const nextSlots = [];
    if (wantSource) {
      nextSlots.push({ id: "source", label: "原话", role: "source", enabled: true });
    }

    nextSlots.push({
      ...firstTrans,
      label: wantDual ? (firstTrans.label === "地道译文" ? "日常聊" : firstTrans.label) : "地道译文",
      showMeaning: wantMeaning,
      enabled: true,
    });

    if (wantDual) {
      nextSlots.push({
        ...secondTrans,
        showMeaning: wantMeaning,
        enabled: true,
      });
    }

    if (wantVocab) {
      nextSlots.push({
        id: "vocab",
        label: "顺便记词",
        role: "vocab",
        instruction: "Extract 2-3 useful idiomatic words or phrases.",
        enabled: true,
      });
    }

    currentSlots = nextSlots;
    renderLiveHudPreview();
    renderSlotCards();
  }

  [toggleShowSource, toggleDualStyle, toggleShowMeaning, toggleShowVocab].forEach((el) => {
    if (el) {
      el.addEventListener("change", applySimpleToggleChange);
    }
  });

  // Built-in Conversational AI Tuner ("一句话让 AI 帮我配好")
  async function runAiSlotTuner(wishText) {
    const text = (wishText || "").trim();
    if (!text) return;

    if (inputAiWish) inputAiWish.value = text;
    if (btnAiTune) {
      btnAiTune.disabled = true;
      btnAiTune.textContent = "⏳ 正在帮你配...";
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

        if (aiTuneFeedback) {
          aiTuneFeedback.textContent = `✅ AI 已为您配好：${res.summary}（可看上方实时预览，满意请点右下角保存）`;
          aiTuneFeedback.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.error("AI slot tune error:", err);
    } finally {
      if (btnAiTune) {
        btnAiTune.disabled = false;
        btnAiTune.textContent = "✨ 让 AI 帮我配好";
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

  // Advanced Slot Cards Renderer (inside collapsed <details>)
  function renderSlotCards() {
    if (!slotCardList) return;
    slotCardList.innerHTML = "";

    currentSlots.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = `slot-card ${slot.enabled !== false ? "" : "disabled"}`;

      const isSource = slot.role === "source";
      const isVocab = slot.role === "vocab";
      const hasNuance = !isSource && !isVocab;

      card.innerHTML = `
        <div class="slot-card-header">
          <span class="slot-idx-badge">#${idx + 1}</span>
          <input type="checkbox" class="slot-checkbox" ${slot.enabled !== false ? "checked" : ""} />
          <input type="text" class="slot-input-label" value="${slot.label || ""}" placeholder="标签名" />
          <select class="slot-select-role">
            <option value="translation" ${slot.role === "translation" || slot.role === "custom" ? "selected" : ""}>外语译文</option>
            <option value="vocab" ${slot.role === "vocab" ? "selected" : ""}>好词讲解</option>
            <option value="source" ${slot.role === "source" ? "selected" : ""}>中文原话</option>
          </select>
          ${hasNuance ? `
            <label class="slot-nuance-toggle">
              <input type="checkbox" class="nuance-check" ${slot.showMeaning !== false ? "checked" : ""} />
              <span>附中文解释</span>
            </label>
          ` : ""}
          <button type="button" class="btn-delete-slot" title="删除这一行">✕</button>
        </div>
        ${!isSource ? `
          <input type="text" class="slot-input-instruction" value="${slot.instruction || ""}" placeholder="用大白话或英文写这一行的语气要求..." />
        ` : ""}
      `;

      card.querySelector(".slot-checkbox").addEventListener("change", (e) => {
        slot.enabled = e.target.checked;
        card.classList.toggle("disabled", !slot.enabled);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
      });

      card.querySelector(".slot-input-label").addEventListener("input", (e) => {
        slot.label = e.target.value.trim();
        renderLiveHudPreview();
      });

      card.querySelector(".slot-select-role").addEventListener("change", (e) => {
        slot.role = e.target.value;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
      });

      const nuanceCheck = card.querySelector(".nuance-check");
      if (nuanceCheck) {
        nuanceCheck.addEventListener("change", (e) => {
          slot.showMeaning = e.target.checked;
          syncSimpleTogglesFromSlots();
          renderLiveHudPreview();
        });
      }

      const inputInst = card.querySelector(".slot-input-instruction");
      if (inputInst) {
        inputInst.addEventListener("input", (e) => {
          slot.instruction = e.target.value;
        });
      }

      card.querySelector(".btn-delete-slot").addEventListener("click", () => {
        currentSlots.splice(idx, 1);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
      });

      slotCardList.appendChild(card);
    });
  }

  if (btnAddSlot) {
    btnAddSlot.addEventListener("click", () => {
      currentSlots.push({
        id: "custom_" + Date.now().toString(36),
        label: "新译文",
        role: "translation",
        instruction: "Express the message naturally and clearly.",
        showMeaning: true,
        enabled: true,
      });
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
    });
  }

  if (btnResetSlots) {
    btnResetSlots.addEventListener("click", () => {
      currentSlots = getDefaultFriendlySlots();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
    });
  }

  // 5. Tab 3: Translation Engine (Free Built-in vs Local Ollama vs Cloud API Key)
  const engineModeCards = document.querySelectorAll("#engine-mode-list .engine-mode-card");
  const cloudConfigBox = document.getElementById("cloud-config-box");
  const btnDetectLocal = document.getElementById("btn-detect-local");
  const localDetectStatus = document.getElementById("local-detect-status");

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
      cloudConfigBox.style.display = mode === "cloud" ? "block" : "none";
    }
  }

  engineModeCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, button, details, summary")) return;
      const mode = card.dataset.emode;
      setEngineModeUI(mode);

      if (mode === "free") {
        // Point to offline port so executeTranslation uses 0-key fast Google GTX engine immediately
        inputEndpoint.value = "http://127.0.0.1:0/free";
        inputApiKey.value = "";
      } else if (mode === "local") {
        inputEndpoint.value = "http://127.0.0.1:11434/v1/chat/completions";
        inputApiKey.value = "ollama";
        inputModel.value = "qwen2.5:3b";
      } else if (mode === "cloud") {
        if (!inputEndpoint.value || inputEndpoint.value.includes("127.0.0.1")) {
          inputEndpoint.value = MODEL_PRESETS.deepseek.endpoint;
          inputModel.value = MODEL_PRESETS.deepseek.model;
        }
      }
    });
  });

  if (btnDetectLocal) {
    btnDetectLocal.addEventListener("click", async (e) => {
      e.stopPropagation();
      setEngineModeUI("local");
      if (localDetectStatus) {
        localDetectStatus.classList.remove("hidden");
        localDetectStatus.textContent = "⏳ 正在扫描电脑上的本地 AI 端口...";
      }
      try {
        const res = await window.lingualSettingsAPI?.detectLocalAI();
        if (res && res.ollama) {
          inputEndpoint.value = "http://127.0.0.1:11434/v1/chat/completions";
          inputApiKey.value = "ollama";
          inputModel.value = inputModel.value || "qwen2.5:3b";
          if (localDetectStatus) {
            localDetectStatus.textContent = "✅ 已检测到你电脑上的 Ollama 服务！点右下角保存即可使用。";
            localDetectStatus.style.color = "#15803d";
          }
        } else if (res && res.lmstudio) {
          inputEndpoint.value = "http://127.0.0.1:1234/v1/chat/completions";
          inputApiKey.value = "lm-studio";
          if (localDetectStatus) {
            localDetectStatus.textContent = "✅ 已检测到你电脑上的 LM Studio 服务！点右下角保存即可使用。";
            localDetectStatus.style.color = "#15803d";
          }
        } else {
          if (localDetectStatus) {
            localDetectStatus.textContent = "💡 未检测到正在运行的 Ollama，软件会自动使用「内置免费快速翻译」为你保底，不影响打字！";
            localDetectStatus.style.color = "#b45309";
          }
        }
      } catch {
        if (localDetectStatus) {
          localDetectStatus.textContent = "💡 未检测到本地 AI，将继续使用内置免费翻译。";
        }
      }
    });
  }

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
      }
    });
  });

  if (btnToggleKey) {
    btnToggleKey.addEventListener("click", () => {
      if (inputApiKey.type === "password") {
        inputApiKey.type = "text";
        btnToggleKey.textContent = "隐藏";
      } else {
        inputApiKey.type = "password";
        btnToggleKey.textContent = "显示";
      }
    });
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener("click", async () => {
      const endpoint = inputEndpoint.value.trim();
      const apiKey = inputApiKey.value.trim();
      const model = inputModel.value.trim();

      testStatus.className = "probe-result testing";
      testStatus.classList.remove("hidden");
      testStatusText.textContent = "正在测试连接...";

      try {
        const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
        if (res && res.success) {
          testStatus.className = "probe-result success";
          testStatusText.textContent = `⚡ 连接成功 (${res.latencyMs}ms)，可以顺畅使用！`;
        } else {
          testStatus.className = "probe-result error";
          testStatusText.textContent = `未连上 (${res?.error || "请检查密钥是否正确"})，软件会自动用免费内置翻译保底`;
        }
      } catch (err) {
        testStatus.className = "probe-result error";
        testStatusText.textContent = `测试失败: ${err.message}`;
      }
    });
  }

  // 6. Window Controls & Save / Load
  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const saveStatus = document.getElementById("save-status");

  btnClose?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());
  btnCancel?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());

  async function loadConfig() {
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) {
        currentSlots = getDefaultFriendlySlots();
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        return;
      }

      setLanguageState(cfg.sourceLang || "zh");
      setTargetLangState(cfg.targetLang || "en");
      setTriggerState(cfg.hotkeySubmit || "Ctrl+Enter");
      setAutoSendCardState(cfg.autoSend !== false);

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultFriendlySlots();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();

      inputEndpoint.value = cfg.endpoint || "";
      inputApiKey.value = cfg.apiKey || "";
      inputModel.value = cfg.model || "";

      if (cfg.apiKey && cfg.apiKey !== "ollama" && !cfg.endpoint?.includes("127.0.0.1")) {
        setEngineModeUI("cloud");
      } else if (cfg.endpoint?.includes("11434") || cfg.endpoint?.includes("1234")) {
        setEngineModeUI("local");
      } else {
        setEngineModeUI("free");
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  }

  btnSave?.addEventListener("click", async () => {
    const patch = {
      sourceLang: activeLangCode,
      targetLang: activeTargetLang,
      endpoint: inputEndpoint.value.trim(),
      apiKey: inputApiKey.value.trim(),
      model: inputModel.value.trim(),
      slotPreset: activeSlotPreset,
      slots: currentSlots,
      hotkeySubmit: selectedTriggerKey,
      autoSend: checkAutoSend ? checkAutoSend.checked : true,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = "✅ 设置已保存并立即生效！现在可以去任何输入框打字试试了";
      }
      setTimeout(() => {
        if (saveStatus) saveStatus.textContent = "💡 修改任意选项后点击右侧保存即可生效";
      }, 3000);
    } catch (err) {
      if (saveStatus) saveStatus.textContent = "保存失败: " + err.message;
    }
  });

  loadConfig();
})();
