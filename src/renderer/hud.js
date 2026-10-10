// HUD & Ambient Capsule Renderer Script
(function () {
  const viewCapsule = document.getElementById("view-capsule");
  const viewHud = document.getElementById("view-hud");

  const capsulePill = document.getElementById("capsule-pill");
  const capsuleModeLabel = document.getElementById("capsule-mode-label");

  const hudContainer = document.getElementById("hud-container");
  const spotlightBox = document.getElementById("spotlight-box");
  const spotlightInput = document.getElementById("spotlight-input");
  const loadingState = document.getElementById("loading-state");
  const cardContent = document.getElementById("card-content");

  const textSource = document.getElementById("text-source");
  const textSpoken = document.getElementById("text-spoken");
  const meaningSpoken = document.getElementById("meaning-spoken");
  const textWritten = document.getElementById("text-written");
  const meaningWritten = document.getElementById("meaning-written");
  const textVocab = document.getElementById("text-vocab");
  const vocabRow = document.getElementById("vocab-row");

  const slot1Row = document.getElementById("slot1-row");
  const slot2Row = document.getElementById("slot2-row");
  const tagSlot1 = document.getElementById("tag-slot1");
  const tagSlot2 = document.getElementById("tag-slot2");
  const btnClose = document.getElementById("btn-close");
  const badgeMode = document.getElementById("badge-mode");

  const footerAutoHint = document.getElementById("footer-auto-hint");
  const footerConfirmHint = document.getElementById("footer-confirm-hint");
  const countdownNum = document.getElementById("countdown-num");

  let currentData = null;
  let countdownTimer = null;

  function updateCapsuleMode(mode) {
    capsulePill.classList.remove("capsule-mode-zh", "capsule-mode-off");
    if (mode === "english") {
      capsuleModeLabel.textContent = "EN";
    } else if (mode === "original") {
      capsuleModeLabel.textContent = "ZH";
      capsulePill.classList.add("capsule-mode-zh");
    } else {
      capsuleModeLabel.textContent = "OFF";
      capsulePill.classList.add("capsule-mode-off");
    }
  }

  function setViewState(state) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    if (state === "capsule") {
      viewCapsule.classList.remove("hidden");
      viewHud.classList.add("hidden");
    } else if (state === "hud" || state === "spotlight") {
      viewCapsule.classList.add("hidden");
      viewHud.classList.remove("hidden");
    }
  }

  function startAutoDismissCountdown() {
    let secondsLeft = 3;
    countdownNum.textContent = String(secondsLeft);
    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        window.lingualAPI?.dismiss();
      } else {
        countdownNum.textContent = String(secondsLeft);
      }
    }, 1000);
  }

  // Capsule pill click toggles mode
  capsulePill.addEventListener("click", () => {
    window.lingualAPI?.toggleMode();
  });

  // Listen for mode changes
  window.lingualAPI?.onModeChanged((mode) => {
    updateCapsuleMode(mode);
  });

  // Listen for view state changes
  window.lingualAPI?.onViewState((state) => {
    setViewState(state);
    if (state === "spotlight") {
      spotlightBox.classList.remove("hidden");
      cardContent.classList.add("hidden");
      loadingState.classList.add("hidden");
      badgeMode.textContent = "Spotlight";
      spotlightInput.value = "";
      setTimeout(() => spotlightInput.focus(), 60);
    } else {
      spotlightBox.classList.add("hidden");
    }
  });

  // Listen for translation payload
  window.lingualAPI?.onTranslationData((payload) => {
    currentData = payload;
    setViewState("hud");
    loadingState.classList.add("hidden");
    spotlightBox.classList.add("hidden");
    cardContent.classList.remove("hidden");

    if (payload.loading) {
      loadingState.classList.remove("hidden");
      cardContent.classList.add("hidden");
      return;
    }

    if (payload.isOffline) {
      badgeMode.textContent = "⚠️ Offline · Draft Preserved";
      badgeMode.style.background = "rgba(239, 68, 68, 0.15)";
      badgeMode.style.color = "#f87171";
      badgeMode.style.borderColor = "rgba(239, 68, 68, 0.35)";
      footerAutoHint.classList.add("hidden");
      footerConfirmHint.classList.remove("hidden");
    } else {
      badgeMode.style.background = "";
      badgeMode.style.color = "";
      badgeMode.style.borderColor = "";
      badgeMode.textContent = payload.modeLabel || (payload.autoSent ? "Auto-Sent" : "Ready");

      // Toggle footer hint based on autoSent
      if (payload.autoSent) {
        footerAutoHint.classList.remove("hidden");
        footerConfirmHint.classList.add("hidden");
        startAutoDismissCountdown();
      } else {
        footerAutoHint.classList.add("hidden");
        footerConfirmHint.classList.remove("hidden");
      }
    }

    // If dynamic slots array is provided, render arbitrary multi-slot tree branches
    if (Array.isArray(payload.slots) && payload.slots.length > 0) {
      cardContent.innerHTML = "";

      // 1. 提取原文槽位与非原文分支列表
      const sourceSlot = payload.slots.find((s) => s.role === "source");
      const contentBranches = payload.slots.filter(
        (s) => s.role !== "source" && s.content && s.content.trim()
      );

      // 2. 原文行渲染（支持用户完全关闭隐藏！）
      if (sourceSlot && sourceSlot.content && sourceSlot.content.trim()) {
        const sourceRow = document.createElement("div");
        sourceRow.className = "branch-row branch-source";
        sourceRow.innerHTML = `
          <span class="tree-bullet">·</span>
          <span class="tag tag-source">[${sourceSlot.label || "Original"}]</span>
          <span class="branch-text">${sourceSlot.content}</span>
        `;
        cardContent.appendChild(sourceRow);
      }

      // 3. 动态计算树状分支图腾（严格执行 Trifecta 盒模型闭合，末行必须以 └ 闭合）
      const totalBranches = contentBranches.length;
      let translationCount = 0;

      contentBranches.forEach((slot, i) => {
        const row = document.createElement("div");
        row.className = "branch-row";

        let glyph = "├";
        if (totalBranches === 1) {
          glyph = "└";
        } else if (i === 0) {
          glyph = "┌";
        } else if (i === totalBranches - 1) {
          glyph = "└";
        }

        if (slot.role === "translation" || slot.role === "custom") {
          translationCount++;
          const num = translationCount;
          row.classList.add("branch-slot", "interactive-slot");
          const tagClass = num === 1 ? "tag-spoken" : "tag-written";
          row.innerHTML = `
            <div class="key-badge">${num}</div>
            <span class="tree-glyph">${glyph}</span>
            <span class="tag ${tagClass}">[${slot.label || (num === 1 ? "Spoken" : "Written")}]</span>
            <div class="text-group">
              <div class="branch-text main-text">${slot.content}</div>
              ${slot.meaning ? `<div class="sub-nuance">(${slot.meaning})</div>` : ""}
            </div>
          `;
          row.addEventListener("click", () => {
            if (countdownTimer) clearInterval(countdownTimer);
            window.lingualAPI?.selectTranslation(num);
          });
        } else if (slot.role === "vocab") {
          row.classList.add("branch-vocab");
          row.innerHTML = `
            <span class="tree-glyph indent-glyph">${glyph}</span>
            <span class="tag tag-vocab">[${slot.label || "Vocab"}]</span>
            <div class="branch-text vocab-stream">${slot.content}</div>
          `;
        }
        cardContent.appendChild(row);
      });
    } else {
      // Fallback to legacy static slot elements
      textSource.textContent = payload.sourceText || payload.text || "";
      if (tagSlot1) tagSlot1.textContent = payload.slot1Label ? `[${payload.slot1Label}]` : "[Spoken]";
      textSpoken.textContent = payload.spoken || "";
      meaningSpoken.textContent = payload.spokenMeaning ? `(${payload.spokenMeaning})` : "";
      meaningSpoken.style.display = payload.spokenMeaning ? "block" : "none";

      if (tagSlot2) tagSlot2.textContent = payload.slot2Label ? `[${payload.slot2Label}]` : "[Written]";
      textWritten.textContent = payload.written || "";
      meaningWritten.textContent = payload.writtenMeaning ? `(${payload.writtenMeaning})` : "";
      meaningWritten.style.display = payload.writtenMeaning ? "block" : "none";

      if (payload.vocab) {
        textVocab.textContent = payload.vocab;
        vocabRow.classList.remove("hidden");
      } else {
        vocabRow.classList.add("hidden");
      }
    }

    // Dynamic auto-height sensing: measure actual rendered height and report to main process
    requestAnimationFrame(() => {
      if (hudContainer) {
        const measured = Math.ceil(hudContainer.getBoundingClientRect().height + 24);
        window.lingualAPI?.reportHeight(measured);
      }
    });
  });

  // Interactive slot clicks
  slot1Row.addEventListener("click", () => {
    if (countdownTimer) clearInterval(countdownTimer);
    window.lingualAPI?.selectTranslation(1);
  });

  slot2Row.addEventListener("click", () => {
    if (countdownTimer) clearInterval(countdownTimer);
    window.lingualAPI?.selectTranslation(2);
  });

  btnClose.addEventListener("click", () => {
    if (countdownTimer) clearInterval(countdownTimer);
    window.lingualAPI?.dismiss();
  });

  // Spotlight input submission
  spotlightInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = spotlightInput.value.trim();
      if (val) {
        loadingState.classList.remove("hidden");
        cardContent.classList.add("hidden");
        window.lingualAPI?.submitSpotlightInput(val);
      }
    } else if (e.key === "Escape") {
      window.lingualAPI?.dismiss();
    }
  });

  // Keydown shortcuts
  window.addEventListener("keydown", (e) => {
    if (document.activeElement === spotlightInput && !spotlightBox.classList.contains("hidden")) {
      return;
    }

    if (e.key === "1") {
      e.preventDefault();
      if (countdownTimer) clearInterval(countdownTimer);
      window.lingualAPI?.selectTranslation(1);
    } else if (e.key === "2") {
      e.preventDefault();
      if (countdownTimer) clearInterval(countdownTimer);
      window.lingualAPI?.selectTranslation(2);
    } else if (e.key === "Escape") {
      e.preventDefault();
      // If escaping during the 3-second auto-send countdown, execute instant physical Undo
      if (countdownTimer && currentData?.autoSent) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        window.lingualAPI?.undo();
      } else {
        if (countdownTimer) clearInterval(countdownTimer);
        window.lingualAPI?.dismiss();
      }
    }
  });
})();
