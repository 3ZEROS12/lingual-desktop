// HUD Renderer Script
(function () {
  const container = document.getElementById("hud-container");
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

  let currentData = null;

  // Listen for data from main process
  window.lingualAPI?.onTranslationData((payload) => {
    currentData = payload;
    loadingState.classList.add("hidden");
    spotlightBox.classList.add("hidden");
    cardContent.classList.remove("hidden");

    if (payload.loading) {
      loadingState.classList.remove("hidden");
      cardContent.classList.add("hidden");
      return;
    }

    badgeMode.textContent = payload.mode || "In-Situ";

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
  });

  // Listen for spotlight opening
  window.lingualAPI?.onSpotlightOpen(() => {
    currentData = null;
    badgeMode.textContent = "Spotlight";
    spotlightBox.classList.remove("hidden");
    loadingState.classList.add("hidden");
    cardContent.classList.add("hidden");
    spotlightInput.value = "";
    setTimeout(() => spotlightInput.focus(), 50);
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

  // Interactive slot clicks
  slot1Row.addEventListener("click", () => {
    window.lingualAPI?.selectTranslation(1);
  });

  slot2Row.addEventListener("click", () => {
    window.lingualAPI?.selectTranslation(2);
  });

  btnClose.addEventListener("click", () => {
    window.lingualAPI?.dismiss();
  });

  // Global keydown handler inside HUD window
  window.addEventListener("keydown", (e) => {
    // If typing in spotlight input, don't hijack number keys
    if (document.activeElement === spotlightInput && !spotlightBox.classList.contains("hidden")) {
      return;
    }

    if (e.key === "1") {
      e.preventDefault();
      window.lingualAPI?.selectTranslation(1);
    } else if (e.key === "2") {
      e.preventDefault();
      window.lingualAPI?.selectTranslation(2);
    } else if (e.key === "Escape") {
      e.preventDefault();
      window.lingualAPI?.dismiss();
    }
  });
})();
