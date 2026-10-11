// ============================================================================
// Lingual Floating Pebble — Mouse Drag, Mode Display, and Click Router
// ============================================================================

(function () {
  const container = document.getElementById("capsule-container");
  const pill = document.getElementById("capsule-pill");
  const label = document.getElementById("capsule-label");

  let isPointerDown = false;
  let hasDragged = false;
  let lastScreenX = 0;
  let lastScreenY = 0;

  function updateDisplay(mode) {
    document.body.classList.remove("mode-original", "mode-off");
    if (mode === "english") {
      label.textContent = "EN";
    } else if (mode === "original") {
      label.textContent = "LEARN";
      document.body.classList.add("mode-original");
    } else {
      label.textContent = "OFF";
      document.body.classList.add("mode-off");
    }
  }

  // Smooth mouse drag on floating pebble
  pill.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isPointerDown = true;
    hasDragged = false;
    lastScreenX = e.screenX;
    lastScreenY = e.screenY;
    document.body.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPointerDown) return;
    const dx = e.screenX - lastScreenX;
    const dy = e.screenY - lastScreenY;
    if (Math.hypot(dx, dy) > 2) {
      hasDragged = true;
      window.lingualAPI?.dragMove(dx, dy);
      lastScreenX = e.screenX;
      lastScreenY = e.screenY;
    }
  });

  window.addEventListener("mouseup", () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    document.body.classList.remove("dragging");
    if (hasDragged) {
      window.lingualAPI?.saveCapsulePos();
    }
  });

  // Left click toggles mode (only when not dragging)
  pill.addEventListener("click", (e) => {
    if (hasDragged) {
      e.stopPropagation();
      return;
    }
    window.lingualAPI?.toggleMode();
  });

  // Right click opens settings
  pill.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  // Initial and dynamic mode updates
  window.lingualAPI?.onModeChanged((mode) => {
    updateDisplay(mode);
  });
})();
