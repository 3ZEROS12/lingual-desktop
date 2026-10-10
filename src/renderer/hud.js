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

    badgeMode.textContent = payload.modeLabel || (payload.autoSent ? "Auto-Sent" : "Ready");

    textSource.textContent = payload.sourceText || payload.text || "";
    textSpoken.textContent = payload.spoken || "";
    meaningSpoken.textContent = payload.spokenMeaning ? `(${payload.spokenMeaning})` : "";
    meaningSpoken.style.display = payload.spokenMeaning ? "block" : "none";

    textWritten.textContent = payload.written || "";
    meaningWritten.textContent = payload.writtenMeaning ? `(${payload.writtenMeaning})` : "";
    meaningWritten.style.display = payload.writtenMeaning ? "block" : "none";

    if (payload.vocab) {
      textVocab.textContent = payload.vocab;
      vocabRow.classList.remove("hidden");
    } else {
      vocabRow.classList.add("hidden");
    }

    // Toggle footer hint based on autoSent
    if (payload.autoSent) {
      footerAutoHint.classList.remove("hidden");
      footerConfirmHint.classList.add("hidden");
      startAutoDismissCountdown();
    } else {
      footerAutoHint.classList.add("hidden");
      footerConfirmHint.classList.remove("hidden");
    }
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
      if (countdownTimer) clearInterval(countdownTimer);
      window.lingualAPI?.dismiss();
    }
  });
})();
