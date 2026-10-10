// Settings Controller with Gabriel Design Language
(function () {
  const selectPreset = document.getElementById("select-preset");
  const inputEndpoint = document.getElementById("input-endpoint");
  const inputApiKey = document.getElementById("input-apikey");
  const inputModel = document.getElementById("input-model");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const btnTestConnection = document.getElementById("btn-test-connection");
  const testStatus = document.getElementById("test-status");
  const testStatusText = document.getElementById("test-status-text");

  const selectTrigger = document.getElementById("select-trigger");
  const checkAutoSend = document.getElementById("check-auto-send");
  const checkRecallBuffer = document.getElementById("check-recall-buffer");
  const checkAutostart = document.getElementById("check-autostart");

  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const saveStatus = document.getElementById("save-status");

  const PRESETS = {
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

  // 1. Preset change listener
  selectPreset.addEventListener("change", () => {
    const val = selectPreset.value;
    if (PRESETS[val]) {
      inputEndpoint.value = PRESETS[val].endpoint;
      inputModel.value = PRESETS[val].model;
      if (val === "ollama") {
        inputApiKey.value = "ollama";
      }
    }
  });

  // 2. Toggle password visibility
  btnToggleKey.addEventListener("click", () => {
    if (inputApiKey.type === "password") {
      inputApiKey.type = "text";
      btnToggleKey.textContent = "隐藏";
    } else {
      inputApiKey.type = "password";
      btnToggleKey.textContent = "显示";
    }
  });

  // 3. Test Connection with real latency ping
  btnTestConnection.addEventListener("click", async () => {
    const endpoint = inputEndpoint.value.trim();
    const apiKey = inputApiKey.value.trim();
    const model = inputModel.value.trim();

    testStatus.className = "test-status testing";
    testStatus.classList.remove("hidden");
    testStatusText.textContent = "正在握手测速...";

    try {
      const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
      if (res && res.success) {
        testStatus.className = "test-status success";
        testStatusText.textContent = `⚡ ${res.latencyMs}ms · 连接成功`;
      } else {
        testStatus.className = "test-status error";
        testStatusText.textContent = `连接失败: ${res?.error || "服务不可达"}`;
      }
    } catch (err) {
      testStatus.className = "test-status error";
      testStatusText.textContent = `错误: ${err.message}`;
    }
  });

  // 4. Load initial config from main process
  async function loadConfig() {
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) return;

      inputEndpoint.value = cfg.endpoint || "";
      inputApiKey.value = cfg.apiKey || "";
      inputModel.value = cfg.model || "";

      // Detect matching preset
      for (const [key, p] of Object.entries(PRESETS)) {
        if (cfg.endpoint?.includes(p.endpoint.replace("https://", "").split("/")[0])) {
          selectPreset.value = key;
          break;
        }
      }

      selectTrigger.value = cfg.hotkeySubmit || "Ctrl+Enter";
      checkAutoSend.checked = cfg.autoSend !== false;
      checkRecallBuffer.checked = true;
      checkAutostart.checked = true;
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  }

  // 5. Save config
  btnSave.addEventListener("click", async () => {
    const patch = {
      endpoint: inputEndpoint.value.trim(),
      apiKey: inputApiKey.value.trim(),
      model: inputModel.value.trim(),
      hotkeySubmit: selectTrigger.value,
      autoSend: checkAutoSend.checked,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      saveStatus.textContent = "✓ 已保存并即刻生效";
      setTimeout(() => {
        window.lingualSettingsAPI?.closeWindow();
      }, 600);
    } catch (err) {
      saveStatus.textContent = "保存失败: " + err.message;
      saveStatus.style.color = "var(--error)";
    }
  });

  // 6. Close / Cancel window
  btnClose.addEventListener("click", () => {
    window.lingualSettingsAPI?.closeWindow();
  });
  btnCancel.addEventListener("click", () => {
    window.lingualSettingsAPI?.closeWindow();
  });

  loadConfig();
})();
