// ============================================================================
// Lingual Desktop HUD — Native Paper & Stone Card Renderer
// - Rounded slot cards (zero terminal ASCII tree glyphs)
// - Clickable individual Vocabulary Chips (click any phrase to copy)
// - App-Aware context pill badge
// - 5s Hover-to-Pause auto-dismiss timer
// ============================================================================

(function () {
  const hudContainer = document.getElementById("hud-container");
  const spotlightBox = document.getElementById("spotlight-box");
  const spotlightInput = document.getElementById("spotlight-input");
  const loadingState = document.getElementById("loading-state");
  const cardContent = document.getElementById("card-content");

  const btnClose = document.getElementById("btn-close");
  const badgeMode = document.getElementById("badge-mode");
  const badgeApp = document.getElementById("badge-app");

  const footerAutoHint = document.getElementById("footer-auto-hint");
  const footerConfirmHint = document.getElementById("footer-confirm-hint");
  const footerStatusBadge = document.getElementById("footer-status-badge");
  const autoDismissBar = document.getElementById("auto-dismiss-bar");

  const AUTO_DISMISS_MS = 5200;
  let dismissTimer = null;
  let dismissInterval = null;
  let remainingMs = AUTO_DISMISS_MS;
  let isHovered = false;
  let lastTick = 0;

  function clearAutoDismissTimer() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (dismissInterval) {
      clearInterval(dismissInterval);
      dismissInterval = null;
    }
    if (autoDismissBar) {
      autoDismissBar.style.width = "0%";
    }
  }

  function startAutoDismissTimer(customDurationMs) {
    clearAutoDismissTimer();
    const totalMs = typeof customDurationMs === "number" && customDurationMs > 0 ? customDurationMs : AUTO_DISMISS_MS;
    remainingMs = totalMs;
    lastTick = Date.now();
    if (autoDismissBar) {
      autoDismissBar.style.width = "100%";
    }

    dismissInterval = setInterval(() => {
      const now = Date.now();
      if (!isHovered || customDurationMs) {
        remainingMs -= now - lastTick;
        if (remainingMs <= 0) {
          clearAutoDismissTimer();
          window.lingualAPI?.dismiss();
          return;
        }
        if (autoDismissBar) {
          const pct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
          autoDismissBar.style.width = `${pct}%`;
        }
      }
      lastTick = now;
    }, 80);
  }

  hudContainer?.addEventListener("mouseenter", () => {
    isHovered = true;
  });

  hudContainer?.addEventListener("mouseleave", () => {
    isHovered = false;
    lastTick = Date.now();
  });

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseVocabIntoChips(vocabRaw) {
    const raw = String(vocabRaw || "").trim();
    if (!raw) return [];
    return raw
      .split(/\s*(?:·|•|\||；|;)\s*/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const m = item.match(/^(.+?)\s*[（(]([^）)]+)[）)]$/);
        if (m) {
          return { term: m[1].trim(), meaning: m[2].trim() };
        }
        return { term: item, meaning: "" };
      });
  }

  window.lingualAPI?.onViewState((state) => {
    clearAutoDismissTimer();
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

  window.lingualAPI?.onTranslationData((payload) => {
    clearAutoDismissTimer();
    loadingState.classList.add("hidden");
    spotlightBox.classList.add("hidden");
    cardContent.classList.remove("hidden");

    const hudPairText = document.getElementById("hud-pair-text");
    if (hudPairText && (payload.sourceLang || payload.targetLang)) {
      hudPairText.textContent = `${payload.sourceLang || "zh"} ⇄ ${payload.targetLang || "en"}`;
    }

    if (badgeApp) {
      if (payload.appBadge && payload.appBadge !== "Desktop") {
        badgeApp.textContent = payload.appBadge;
        badgeApp.classList.remove("hidden");
      } else {
        badgeApp.classList.add("hidden");
      }
    }

    if (payload.loading) {
      loadingState.classList.remove("hidden");
      cardContent.classList.add("hidden");
      return;
    }

    if (payload.isOffline) {
      badgeMode.textContent = "Offline";
      footerAutoHint.classList.add("hidden");
      footerConfirmHint.classList.remove("hidden");
    } else {
      badgeMode.textContent = payload.modeLabel || "Ready";
      if (footerStatusBadge) {
        footerStatusBadge.textContent = payload.modeLabel === "Copied ✓" ? "✓ Copied" : "✓ Ready";
      }

      if (payload.autoSent) {
        footerAutoHint.classList.remove("hidden");
        footerConfirmHint.classList.add("hidden");
        startAutoDismissTimer();
      } else {
        footerAutoHint.classList.add("hidden");
        footerConfirmHint.classList.remove("hidden");
      }
    }

    if (Array.isArray(payload.slots) && payload.slots.length > 0) {
      cardContent.innerHTML = "";

      const sourceSlot = payload.slots.find((s) => s.role === "source");
      const contentBranches = payload.slots.filter(
        (s) => s.role !== "source" && s.content && s.content.trim()
      );

      // 1. Source Quote Bar
      if (sourceSlot && sourceSlot.content && sourceSlot.content.trim()) {
        const sourceRow = document.createElement("div");
        sourceRow.className = "source-quote-bar";
        sourceRow.innerHTML = `
          <span class="source-pill">${escapeHtml(sourceSlot.label || "Source")}</span>
          <span class="source-text">${escapeHtml(sourceSlot.content)}</span>
        `;
        cardContent.appendChild(sourceRow);
      }

      // 2. Rounded Slot Cards & Clickable Vocab Chips
      let translationCount = 0;

      contentBranches.forEach((slot) => {
        if (slot.role === "translation" || slot.role === "custom") {
          translationCount++;
          const num = translationCount;
          const row = document.createElement("div");
          row.className = "slot-card interactive-slot";
          row.dataset.slot = String(num);

          row.innerHTML = `
            <div class="slot-head">
              <span class="key-badge">${num}</span>
              <span class="slot-pill">${escapeHtml(slot.label || "Translation")}</span>
            </div>
            <div class="slot-body">
              <div class="main-text">${escapeHtml(slot.content)}</div>
              ${slot.meaning ? `<div class="sub-nuance">${escapeHtml(slot.meaning)}</div>` : ""}
            </div>
          `;

          row.addEventListener("click", () => {
            if (badgeMode) badgeMode.textContent = `Copied #${num} ✓`;
            if (footerStatusBadge) footerStatusBadge.textContent = `✓ Copied #${num}`;
            window.lingualAPI?.selectTranslation(num);
            startAutoDismissTimer(900);
          });
          cardContent.appendChild(row);
        } else if (slot.role === "vocab") {
          const chips = parseVocabIntoChips(slot.content);
          if (chips.length > 0) {
            const vocabWrap = document.createElement("div");
            vocabWrap.className = "vocab-section";
            const chipsContainer = document.createElement("div");
            chipsContainer.className = "vocab-chips-wrap";

            chips.forEach((c) => {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "vocab-chip";
              btn.title = "Click to copy phrase";
              btn.innerHTML = `
                <span class="chip-term">${escapeHtml(c.term)}</span>
                ${c.meaning ? `<span class="chip-meaning">${escapeHtml(c.meaning)}</span>` : ""}
              `;
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                window.lingualAPI?.copyText(c.term);
                if (badgeMode) badgeMode.textContent = `Copied "${c.term.slice(0, 14)}" ✓`;
                if (footerStatusBadge) footerStatusBadge.textContent = `✓ Copied term`;
              });
              chipsContainer.appendChild(btn);
            });

            vocabWrap.appendChild(chipsContainer);
            cardContent.appendChild(vocabWrap);
          }
        }
      });
    } else if (payload.isOffline) {
      cardContent.innerHTML = `
        <div class="source-quote-bar">
          <span class="source-pill">Source</span>
          <span class="source-text">${escapeHtml(payload.sourceText || "")}</span>
        </div>
        <div class="slot-card">
          <div class="slot-body">
            <div class="sub-nuance">Offline — original draft preserved. Check network or API settings.</div>
          </div>
        </div>
      `;
    }

    requestAnimationFrame(() => {
      if (hudContainer) {
        const measured = Math.ceil(hudContainer.getBoundingClientRect().height + 16);
        window.lingualAPI?.reportHeight(measured);
      }
    });
  });

  btnClose?.addEventListener("click", () => {
    clearAutoDismissTimer();
    window.lingualAPI?.dismiss();
  });

  spotlightInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = spotlightInput.value.trim();
      if (val) {
        loadingState.classList.remove("hidden");
        cardContent.classList.add("hidden");
        window.lingualAPI?.submitSpotlightInput(val);
      }
    } else if (e.key === "Escape") {
      clearAutoDismissTimer();
      window.lingualAPI?.dismiss();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (document.activeElement === spotlightInput && !spotlightBox.classList.contains("hidden")) {
      return;
    }

    // Dynamic number keys 1~9 to select translation with immediate visual confirmation, 0/Escape to dismiss
    const numKey = parseInt(e.key, 10);
    if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
      e.preventDefault();
      if (badgeMode) badgeMode.textContent = `Copied #${numKey} ✓`;
      if (footerStatusBadge) footerStatusBadge.textContent = `✓ Copied #${numKey}`;
      window.lingualAPI?.selectTranslation(numKey);
      startAutoDismissTimer(900);
    } else if (e.key === "0" || e.key === "Escape") {
      e.preventDefault();
      clearAutoDismissTimer();
      window.lingualAPI?.dismiss();
    }
  });
})();
