// ============================================================================
// Lingual HUD — In-Situ Roof-Docked Card Renderer
// Displays directly above the active text input box across any Windows app.
// ============================================================================

(function () {
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
  const footerStatusBadge = document.getElementById("footer-status-badge");

  let currentData = null;

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Listen for view state changes
  window.lingualAPI?.onViewState((state) => {
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
    loadingState.classList.add("hidden");
    spotlightBox.classList.add("hidden");
    cardContent.classList.remove("hidden");

    const hudPairText = document.getElementById("hud-pair-text");
    if (hudPairText && (payload.sourceLang || payload.targetLang)) {
      hudPairText.textContent = `[${payload.sourceLang || "zh"} ⇄ ${payload.targetLang || "en"}]`;
    }

    if (payload.loading) {
      loadingState.classList.remove("hidden");
      cardContent.classList.add("hidden");
      return;
    }

    if (payload.isOffline) {
      badgeMode.textContent = "Offline · Draft Preserved";
      footerAutoHint.classList.add("hidden");
      footerConfirmHint.classList.remove("hidden");
    } else {
      badgeMode.textContent = payload.modeLabel || (payload.autoSent ? "Ready" : "Ready");
      if (footerStatusBadge) {
        footerStatusBadge.textContent = "✓ Ready";
      }

      if (payload.autoSent) {
        footerAutoHint.classList.remove("hidden");
        footerConfirmHint.classList.add("hidden");
      } else {
        footerAutoHint.classList.add("hidden");
        footerConfirmHint.classList.remove("hidden");
      }
    }

    // Render dynamic slots
    if (Array.isArray(payload.slots) && payload.slots.length > 0) {
      cardContent.innerHTML = "";

      const sourceSlot = payload.slots.find((s) => s.role === "source");
      const contentBranches = payload.slots.filter(
        (s) => s.role !== "source" && s.content && s.content.trim()
      );

      // 1. Source row (if enabled)
      if (sourceSlot && sourceSlot.content && sourceSlot.content.trim()) {
        const sourceRow = document.createElement("div");
        sourceRow.className = "branch-row branch-source";
        sourceRow.innerHTML = `
          <span class="tree-bullet">·</span>
          <span class="tag tag-source">[${escapeHtml(sourceSlot.label || "Source")}]</span>
          <span class="branch-text">${escapeHtml(sourceSlot.content)}</span>
        `;
        cardContent.appendChild(sourceRow);
      }

      // 2. Trifecta Left-Rail Tree branches
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
          row.dataset.slot = String(num);

          row.innerHTML = `
            <div class="key-badge">${num}</div>
            <span class="tree-glyph">${glyph}</span>
            <span class="tag">[${escapeHtml(slot.label || "Translation")}]</span>
            <div class="text-group">
              <div class="branch-text main-text">${escapeHtml(slot.content)}</div>
              ${slot.meaning ? `<div class="sub-nuance">(${escapeHtml(slot.meaning)})</div>` : ""}
            </div>
          `;

          row.addEventListener("click", () => {
            if (badgeMode) badgeMode.textContent = `Copied #${num} ✓`;
            if (footerStatusBadge) footerStatusBadge.textContent = `✓ Copied #${num}`;
            window.lingualAPI?.selectTranslation(num);
          });
        } else if (slot.role === "vocab") {
          row.classList.add("branch-vocab");
          row.innerHTML = `
            <span class="tree-glyph indent-glyph">${glyph}</span>
            <span class="tag tag-vocab">[${escapeHtml(slot.label || "Vocab")}]</span>
            <div class="branch-text vocab-stream">${escapeHtml(slot.content)}</div>
          `;
        }
        cardContent.appendChild(row);
      });
    } else {
      // Legacy fallback
      textSource.textContent = payload.sourceText || payload.text || "";
      if (tagSlot1) tagSlot1.textContent = payload.slot1Label ? `[${payload.slot1Label}]` : "[Casual]";
      textSpoken.textContent = payload.spoken || "";
      meaningSpoken.textContent = payload.spokenMeaning ? `(${payload.spokenMeaning})` : "";
      meaningSpoken.style.display = payload.spokenMeaning ? "block" : "none";

      if (tagSlot2) tagSlot2.textContent = payload.slot2Label ? `[${payload.slot2Label}]` : "[Formal]";
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

    // Dynamic auto-height sensing: report measured height to main process
    requestAnimationFrame(() => {
      if (hudContainer) {
        const measured = Math.ceil(hudContainer.getBoundingClientRect().height + 16);
        window.lingualAPI?.reportHeight(measured);
      }
    });
  });

  // Slot clicks
  slot1Row?.addEventListener("click", () => {
    if (badgeMode) badgeMode.textContent = "Copied #1 ✓";
    window.lingualAPI?.selectTranslation(1);
  });

  slot2Row?.addEventListener("click", () => {
    if (badgeMode) badgeMode.textContent = "Copied #2 ✓";
    window.lingualAPI?.selectTranslation(2);
  });

  btnClose?.addEventListener("click", () => {
    window.lingualAPI?.dismiss();
  });

  // Spotlight input submission
  spotlightInput?.addEventListener("keydown", (e) => {
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

    // Dynamic number keys 1~9 to select translation
    const numKey = parseInt(e.key, 10);
    if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
      e.preventDefault();
      window.lingualAPI?.selectTranslation(numKey);
    } else if (e.key === "Escape") {
      e.preventDefault();
      window.lingualAPI?.dismiss();
    }
  });
})();
