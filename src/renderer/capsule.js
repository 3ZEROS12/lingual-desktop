// ============================================================================
// Lingual Resident Top Pebble — 4-Mode Switcher, Pre-Send ⚡ Polish & Dragging
// ============================================================================

(function () {
  const btnMode = document.getElementById("btn-mode");
  const btnRewrite = document.getElementById("btn-rewrite");
  const btnSettings = document.getElementById("btn-settings");
  const label = document.getElementById("capsule-label");
  const pill = document.getElementById("capsule-pill");

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hasMoved = false;
  let currentTargetLang = "EN";

  function updateDisplay(data) {
    let mode = "original";
    if (typeof data === "string") {
      mode = data;
    } else if (data && typeof data === "object") {
      mode = data.mode || "original";
      if (data.targetLang) {
        currentTargetLang = String(data.targetLang).toUpperCase();
      }
    }

    document.body.classList.remove("mode-original", "mode-off", "mode-english", "mode-select");
    if (mode === "english") {
      if (label) label.textContent = currentTargetLang || "EN";
      document.body.classList.add("mode-english");
    } else if (mode === "original") {
      if (label) label.textContent = "LEARN";
      document.body.classList.add("mode-original");
    } else if (mode === "select") {
      if (label) label.textContent = "PICK 3";
      document.body.classList.add("mode-select");
    } else {
      if (label) label.textContent = "OFF";
      document.body.classList.add("mode-off");
    }
  }

  pill?.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
    hasMoved = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.screenX - dragStartX;
    const dy = e.screenY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
      dragStartX = e.screenX;
      dragStartY = e.screenY;
      window.lingualAPI?.dragMove(dx, dy);
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (hasMoved) {
        window.lingualAPI?.saveCapsulePos();
      }
    }
  });

  btnMode?.addEventListener("click", (e) => {
    if (hasMoved) return;
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.toggleMode();
  });

  btnRewrite?.addEventListener("click", (e) => {
    if (hasMoved) return;
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.triggerPreSendRewrite();
  });

  btnSettings?.addEventListener("click", (e) => {
    if (hasMoved) return;
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  pill?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  window.lingualAPI?.onModeChanged((mode) => {
    updateDisplay(mode);
  });
})();
