// ============================================================================
// Lingual Caret Pebble — In-Situ Input Box Anchor & Quick Mode Switcher
// ============================================================================

(function () {
  const btnMode = document.getElementById("btn-mode");
  const btnSettings = document.getElementById("btn-settings");
  const label = document.getElementById("capsule-label");
  const pill = document.getElementById("capsule-pill");

  function updateDisplay(mode) {
    document.body.classList.remove("mode-original", "mode-off", "mode-english");
    if (mode === "english") {
      if (label) label.textContent = "EN";
      document.body.classList.add("mode-english");
    } else if (mode === "original") {
      if (label) label.textContent = "LEARN";
      document.body.classList.add("mode-original");
    } else {
      if (label) label.textContent = "OFF";
      document.body.classList.add("mode-off");
    }
  }

  // Left click on mode segment cycles mode
  btnMode?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.toggleMode();
  });

  // Left click on settings gear opens settings
  btnSettings?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.lingualAPI?.openSettings();
  });

  // Right click anywhere on the pebble also opens settings
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
