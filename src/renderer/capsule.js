// ============================================================================
// Lingual Caret Pebble — In-Situ Input Box Anchor & Quick Mode Switcher
// ============================================================================

(function () {
  const pill = document.getElementById("capsule-pill");
  const label = document.getElementById("capsule-label");

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

  // Left click toggles companion mode
  pill?.addEventListener("click", (e) => {
    e.stopPropagation();
    window.lingualAPI?.toggleMode();
  });

  // Right click opens Settings window
  pill?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  // Listen for mode changes
  window.lingualAPI?.onModeChanged((mode) => {
    updateDisplay(mode);
  });
})();
