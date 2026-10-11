// ============================================================================
// Lingual Resident Top Pebble — Quick Mode Switcher & Drag-to-Position
// ============================================================================

(function () {
  const btnMode = document.getElementById("btn-mode");
  const btnSettings = document.getElementById("btn-settings");
  const label = document.getElementById("capsule-label");
  const pill = document.getElementById("capsule-pill");

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let hasMoved = false;
  let currentTargetLang = "EN";

  function updateDisplay(data) {
    let mode = "english";
    if (typeof data === "string") {
      mode = data;
    } else if (data && typeof data === "object") {
      mode = data.mode || "english";
      if (data.targetLang) {
        currentTargetLang = String(data.targetLang).toUpperCase();
      }
    }

    document.body.classList.remove("mode-original", "mode-off", "mode-english");
    if (mode === "english") {
      if (label) label.textContent = currentTargetLang || "EN";
      document.body.classList.add("mode-english");
    } else if (mode === "original") {
      if (label) label.textContent = "LEARN";
      document.body.classList.add("mode-original");
    } else {
      if (label) label.textContent = "OFF";
      document.body.classList.add("mode-off");
    }
  }

  // Smooth mouse dragging across screen edge
  pill?.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // Left click only
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

  // Left click on mode segment cycles mode (only if not dragging)
  btnMode?.addEventListener("click", (e) => {
    if (hasMoved) return;
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.toggleMode();
  });

  // Left click on settings gear opens settings (only if not dragging)
  btnSettings?.addEventListener("click", (e) => {
    if (hasMoved) return;
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  // Right click anywhere on the pebble opens settings
  pill?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  // Listen for mode changes from main process
  window.lingualAPI?.onModeChanged((mode) => {
    updateDisplay(mode);
  });
})();
