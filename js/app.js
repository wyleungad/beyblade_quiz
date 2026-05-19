import {
  LANGUAGES,
  LANG_STORAGE_KEY,
  getStoredLang,
  bestScoreKey,
  t,
} from "./i18n.js";
import {
  DISPLAY_PARTS,
  DISPLAY_PARTS_STORAGE_KEY,
  getStoredDisplayParts,
  formatTopName,
} from "./name-parts.js";

const QUESTIONS_PER_ROUND = 10;
const CHOICES_PER_QUESTION = 4;

const screens = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  results: document.getElementById("screen-results"),
};

const els = {
  pageTitle: document.querySelector("title"),
  headerTitle: document.getElementById("header-title"),
  tagline: document.getElementById("tagline"),
  intro: document.getElementById("intro"),
  languageFieldset: document.getElementById("language-fieldset"),
  languageLegend: document.getElementById("language-legend"),
  languageOptions: document.getElementById("language-options"),
  displayPartsFieldset: document.getElementById("display-parts-fieldset"),
  displayPartsLegend: document.getElementById("display-parts-legend"),
  displayPartsOptions: document.getElementById("display-parts-options"),
  deckStatus: document.getElementById("deck-status"),
  btnStart: document.getElementById("btn-start"),
  questionCounter: document.getElementById("question-counter"),
  scoreDisplay: document.getElementById("score-display"),
  topImage: document.getElementById("top-image"),
  choices: document.getElementById("choices"),
  choicesLegend: document.getElementById("choices-legend"),
  feedback: document.getElementById("feedback"),
  btnNext: document.getElementById("btn-next"),
  resultsTitle: document.getElementById("results-title"),
  finalScore: document.getElementById("final-score"),
  bestScore: document.getElementById("best-score"),
  btnRetry: document.getElementById("btn-retry"),
  footer: document.getElementById("footer-text"),
};

let allTops = [];
let roundQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let currentLang = getStoredLang();
let displayParts = getStoredDisplayParts();

function getTopName(top) {
  return formatTopName(top, currentLang, displayParts);
}

function getSelectedDisplayParts() {
  const checked = [
    ...els.displayPartsOptions.querySelectorAll('input[name="display-part"]:checked'),
  ].map((input) => input.value);
  return checked;
}

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    const active = key === name;
    el.hidden = !active;
    el.classList.toggle("screen--active", active);
  }
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomItems(pool, count, excludeId) {
  const candidates = pool.filter((top) => top.id !== excludeId);
  return shuffle(candidates).slice(0, count);
}

function buildRound(deck) {
  const count = Math.min(QUESTIONS_PER_ROUND, deck.length);
  return shuffle(deck).slice(0, count);
}

function buildLanguageOptions() {
  els.languageOptions.innerHTML = "";
  for (const lang of LANGUAGES) {
    const id = `lang-${lang.code}`;
    const label = document.createElement("label");
    label.className = "lang-option";
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "quiz-language";
    input.id = id;
    input.value = lang.code;
    input.checked = lang.code === currentLang;

    const span = document.createElement("span");
    span.textContent = lang.label;

    label.append(input, span);
    els.languageOptions.appendChild(label);
  }
}

function buildDisplayPartOptions() {
  els.displayPartsOptions.innerHTML = "";
  for (const part of DISPLAY_PARTS) {
    const id = `part-${part.key}`;
    const label = document.createElement("label");
    label.className = "lang-option";
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "display-part";
    input.id = id;
    input.value = part.key;
    input.checked = displayParts.includes(part.key);

    const span = document.createElement("span");
    span.dataset.partKey = part.key;

    label.append(input, span);
    els.displayPartsOptions.appendChild(label);
  }
}

function applyLanguage() {
  const htmlLang =
    LANGUAGES.find((l) => l.code === currentLang)?.htmlLang || "en";
  document.documentElement.lang = htmlLang;

  els.pageTitle.textContent = t(currentLang, "pageTitle");
  els.headerTitle.textContent = t(currentLang, "title");
  els.tagline.textContent = t(currentLang, "tagline");
  els.intro.textContent = t(currentLang, "intro");
  els.languageLegend.textContent = t(currentLang, "languageLabel");
  els.displayPartsLegend.textContent = t(currentLang, "displayPartsLabel");
  els.btnStart.textContent = t(currentLang, "start");
  els.btnNext.textContent = t(currentLang, "next");
  els.resultsTitle.textContent = t(currentLang, "complete");
  els.btnRetry.textContent = t(currentLang, "playAgain");
  els.footer.textContent = t(currentLang, "footer");
  els.choicesLegend.textContent = t(currentLang, "choicesLegend");

  for (const span of els.displayPartsOptions.querySelectorAll("[data-part-key]")) {
    const part = DISPLAY_PARTS.find((p) => p.key === span.dataset.partKey);
    if (part) {
      span.textContent = t(currentLang, part.labelKey);
    }
  }

  setDeckStatus();
}

function setDeckStatus() {
  const count = allTops.length;
  const parts = getSelectedDisplayParts();

  if (parts.length === 0) {
    els.deckStatus.textContent = t(currentLang, "displayPartsRequired");
    els.deckStatus.classList.add("deck-status--warn");
    els.btnStart.disabled = true;
    return;
  }

  if (count === 0) {
    els.deckStatus.textContent = t(currentLang, "deckEmpty");
    els.deckStatus.classList.add("deck-status--warn");
    els.btnStart.disabled = true;
    return;
  }

  if (count < CHOICES_PER_QUESTION) {
    els.deckStatus.textContent = t(
      currentLang,
      "deckNeedMore",
      CHOICES_PER_QUESTION,
      count,
    );
    els.deckStatus.classList.add("deck-status--warn");
    els.btnStart.disabled = true;
    return;
  }

  els.deckStatus.classList.remove("deck-status--warn");
  els.deckStatus.textContent = t(
    currentLang,
    "deckReady",
    count,
    QUESTIONS_PER_ROUND,
  );
  els.btnStart.disabled = false;
}

async function loadTops() {
  try {
    const response = await fetch("data/tops.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    allTops = (data.tops ?? []).filter(
      (top) => top && top.id && top.image && (top.name || top.names),
    );
  } catch (error) {
    console.error("Failed to load tops:", error);
    allTops = [];
  }
  setDeckStatus();
}

function renderQuestion() {
  const top = roundQuestions[currentIndex];
  const total = roundQuestions.length;

  els.questionCounter.textContent = t(
    currentLang,
    "question",
    currentIndex + 1,
    total,
  );
  els.scoreDisplay.textContent = t(currentLang, "score", score);
  els.topImage.src = top.image;
  els.topImage.alt = t(currentLang, "imageAlt");
  els.feedback.hidden = true;
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  els.btnNext.hidden = true;
  answered = false;

  const wrongChoices = pickRandomItems(allTops, CHOICES_PER_QUESTION - 1, top.id);
  const options = shuffle([top, ...wrongChoices]);

  els.choices.innerHTML = "";
  els.choices.appendChild(els.choicesLegend);

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = getTopName(option);
    button.dataset.id = option.id;
    button.addEventListener("click", () => handleChoice(option.id, top));
    els.choices.appendChild(button);
  }
}

function highlightChoices(correctId, selectedId) {
  const buttons = els.choices.querySelectorAll(".choice");
  for (const button of buttons) {
    button.disabled = true;
    const id = button.dataset.id;
    if (id === correctId) {
      button.classList.add("choice--correct");
    } else if (id === selectedId) {
      button.classList.add("choice--wrong");
    }
  }
}

function handleChoice(selectedId, correctTop) {
  if (answered) return;
  answered = true;

  const correctName = getTopName(correctTop);
  const isCorrect = selectedId === correctTop.id;
  if (isCorrect) {
    score += 1;
    els.feedback.textContent = t(currentLang, "correct");
    els.feedback.classList.add("feedback--correct");
  } else {
    els.feedback.textContent = t(currentLang, "wrong", correctName);
    els.feedback.classList.add("feedback--wrong");
  }

  els.feedback.hidden = false;
  els.scoreDisplay.textContent = t(currentLang, "score", score);
  highlightChoices(correctTop.id, selectedId);
  els.btnNext.hidden = false;
}

function startQuiz() {
  const selected = document.querySelector('input[name="quiz-language"]:checked');
  if (selected) {
    currentLang = selected.value;
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  }

  displayParts = getSelectedDisplayParts();
  if (displayParts.length === 0) {
    setDeckStatus();
    return;
  }
  localStorage.setItem(DISPLAY_PARTS_STORAGE_KEY, JSON.stringify(displayParts));

  roundQuestions = buildRound(allTops);
  currentIndex = 0;
  score = 0;
  applyLanguage();
  showScreen("quiz");
  renderQuestion();
}

function finishQuiz() {
  const total = roundQuestions.length;
  const key = bestScoreKey(currentLang);
  const best = Number(localStorage.getItem(key) ?? 0);
  if (score > best) {
    localStorage.setItem(key, String(score));
  }
  const updatedBest = Math.max(score, best);

  els.finalScore.textContent = t(currentLang, "finalScore", score, total);
  els.bestScore.textContent = t(currentLang, "bestScore", updatedBest, total);
  showScreen("results");
}

function nextQuestion() {
  if (currentIndex < roundQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }
  finishQuiz();
}

els.languageOptions.addEventListener("change", (event) => {
  if (event.target.name !== "quiz-language") return;
  currentLang = event.target.value;
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  applyLanguage();
});

els.displayPartsOptions.addEventListener("change", (event) => {
  if (event.target.name !== "display-part") return;
  displayParts = getSelectedDisplayParts();
  localStorage.setItem(DISPLAY_PARTS_STORAGE_KEY, JSON.stringify(displayParts));
  setDeckStatus();
});

els.btnStart.addEventListener("click", startQuiz);
els.btnNext.addEventListener("click", nextQuestion);
els.btnRetry.addEventListener("click", () => {
  displayParts = getStoredDisplayParts();
  for (const input of els.displayPartsOptions.querySelectorAll('input[name="display-part"]')) {
    input.checked = displayParts.includes(input.value);
  }
  applyLanguage();
  showScreen("start");
});

buildLanguageOptions();
buildDisplayPartOptions();
applyLanguage();
loadTops();
