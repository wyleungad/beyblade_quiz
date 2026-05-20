import {
  LANGUAGES,
  LANG_STORAGE_KEY,
  UI,
  getStoredLang,
  t,
} from "./i18n.js";
import {
  DISPLAY_PARTS,
  DISPLAY_PARTS_STORAGE_KEY,
  getStoredDisplayParts,
  getTopParts,
  formatTopName,
} from "./name-parts.js";
import {
  SYLLABI,
  SYLLABUS_STORAGE_KEY,
  CATALOG_FILTER_STORAGE_KEY,
  getStoredSyllabi,
  getStoredCatalogFilters,
  filterTopsBySyllabus,
  deriveSyllabus,
} from "./syllabus.js";

const QUESTIONS_PER_ROUND = 10;
const CHOICES_PER_QUESTION = 4;

const screens = {
  start: document.getElementById("screen-start"),
  catalog: document.getElementById("screen-catalog"),
  quiz: document.getElementById("screen-quiz"),
  results: document.getElementById("screen-results"),
};

const els = {
  pageTitle: document.querySelector("title"),
  headerTitle: document.getElementById("header-title"),
  tagline: document.getElementById("tagline"),
  intro: document.getElementById("intro"),
  languageLabel: document.getElementById("language-label"),
  langSelect: document.getElementById("lang-select"),
  displayPartsFieldset: document.getElementById("display-parts-fieldset"),
  displayPartsLegendLabel: document.getElementById("display-parts-legend-label"),
  displayPartsPreview: document.getElementById("display-parts-preview"),
  displayPartsOptions: document.getElementById("display-parts-options"),
  syllabusFieldset: document.getElementById("syllabus-fieldset"),
  syllabusLegend: document.getElementById("syllabus-legend"),
  syllabusOptions: document.getElementById("syllabus-options"),
  deckStatus: document.getElementById("deck-status"),
  btnStart: document.getElementById("btn-start"),
  btnStartLabel: document.getElementById("btn-start-label"),
  btnStartHint: document.getElementById("btn-start-hint"),
  btnCatalog: document.getElementById("btn-catalog"),
  btnCatalogLabel: document.getElementById("btn-catalog-label"),
  btnCatalogHint: document.getElementById("btn-catalog-hint"),
  catalogTitle: document.getElementById("catalog-title"),
  catalogFilterLegend: document.getElementById("catalog-filter-legend"),
  catalogFilterOptions: document.getElementById("catalog-filter-options"),
  catalogCount: document.getElementById("catalog-count"),
  catalogGrid: document.getElementById("catalog-grid"),
  btnHeaderBack: document.getElementById("btn-header-back"),
  questionCounter: document.getElementById("question-counter"),
  scoreDisplay: document.getElementById("score-display"),
  topImageWrap: document.querySelector(".top-image-wrap"),
  topImage: document.getElementById("top-image"),
  choices: document.getElementById("choices"),
  choicesLegend: document.getElementById("choices-legend"),
  feedback: document.getElementById("feedback"),
  btnNext: document.getElementById("btn-next"),
  resultsTitle: document.getElementById("results-title"),
  finalScore: document.getElementById("final-score"),
  resultsListHeading: document.getElementById("results-list-heading"),
  roundResults: document.getElementById("round-results"),
  btnRetry: document.getElementById("btn-retry"),
  btnRetryLabel: document.getElementById("btn-retry-label"),
  btnRetryHint: document.getElementById("btn-retry-hint"),
};

let allTops = [];
let roundQuestions = [];
let roundResults = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let currentLang = getStoredLang();
let displayParts = getStoredDisplayParts();
let selectedSyllabi = getStoredSyllabi();
let catalogFilters = getStoredCatalogFilters();
let topImageAnimating = false;
let advancingQuestion = false;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitTopAnimation(element) {
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 800);
    const onEnd = (event) => {
      if (event.target !== element) return;
      window.clearTimeout(timeout);
      element.removeEventListener("animationend", onEnd);
      resolve();
    };
    element.addEventListener("animationend", onEnd);
  });
}

async function playTopEnter(top) {
  const wrap = els.topImageWrap;
  const img = els.topImage;
  wrap.classList.remove("top-image-wrap--exit");
  img.classList.remove("top-image--exit", "top-image--enter");
  img.src = top.image;
  img.alt = t(currentLang, "imageAlt");

  if (prefersReducedMotion()) {
    topImageAnimating = false;
    return;
  }

  topImageAnimating = true;
  void img.offsetWidth;
  img.classList.add("top-image--enter");
  await waitTopAnimation(img);
  img.classList.remove("top-image--enter");
  topImageAnimating = false;
}

async function playTopExit() {
  const img = els.topImage;
  img.classList.remove("top-image--enter");

  if (prefersReducedMotion() || !img.src) {
    img.classList.remove("top-image--exit");
    els.topImageWrap.classList.remove("top-image-wrap--exit");
    topImageAnimating = false;
    return;
  }

  topImageAnimating = true;
  els.topImageWrap.classList.add("top-image-wrap--exit");
  img.classList.add("top-image--exit");
  await waitTopAnimation(img);
  img.classList.remove("top-image--exit");
  els.topImageWrap.classList.remove("top-image-wrap--exit");
  topImageAnimating = false;
}

function getTopName(top) {
  return formatTopName(top, currentLang, displayParts);
}

function getSelectedDisplayParts() {
  const checked = [
    ...els.displayPartsOptions.querySelectorAll('input[name="display-part"]:checked'),
  ].map((input) => input.value);
  return checked;
}

function getSelectedSyllabi() {
  return [
    ...els.syllabusOptions.querySelectorAll('input[name="syllabus"]:checked'),
  ].map((input) => input.value);
}

function getSelectedCatalogFilters() {
  return [
    ...els.catalogFilterOptions.querySelectorAll('input[name="catalog-filter"]:checked'),
  ].map((input) => input.value);
}

function getActiveDeck() {
  return filterTopsBySyllabus(allTops, selectedSyllabi);
}

function findTopById(id) {
  return allTops.find((top) => top.id === id);
}

function updateNextButtonLabel() {
  const isLast =
    roundQuestions.length > 0 && currentIndex >= roundQuestions.length - 1;
  els.btnNext.textContent = t(currentLang, isLast ? "nextLast" : "next");
}

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    const active = key === name;
    el.hidden = !active;
    el.classList.toggle("screen--active", active);
  }
  els.btnHeaderBack.hidden = name !== "quiz" && name !== "catalog";
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

function buildLanguageSelect() {
  els.langSelect.innerHTML = "";
  for (const lang of LANGUAGES) {
    const option = document.createElement("option");
    option.value = lang.code;
    option.textContent = lang.label;
    els.langSelect.appendChild(option);
  }
  els.langSelect.value = currentLang;
}

function setLanguage(lang) {
  if (!UI[lang]) return;
  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  els.langSelect.value = currentLang;
  applyLanguage();
  refreshActiveScreen();
}

function getActiveScreenName() {
  return Object.entries(screens).find(([, el]) => el.classList.contains("screen--active"))?.[0];
}

function refreshActiveScreen() {
  const screen = getActiveScreenName();
  if (screen === "catalog") {
    renderCatalog();
  } else if (screen === "quiz" && roundQuestions.length > 0) {
    refreshQuizLanguage();
  } else if (screen === "results" && roundResults.length > 0) {
    refreshResultsLanguage();
  }
}

function refreshQuizLanguage() {
  const top = roundQuestions[currentIndex];
  const total = roundQuestions.length;

  els.questionCounter.textContent = t(
    currentLang,
    "question",
    currentIndex + 1,
    total,
  );
  els.scoreDisplay.textContent = t(currentLang, "score", score);
  els.topImage.alt = t(currentLang, "imageAlt");
  updateNextButtonLabel();

  for (const button of els.choices.querySelectorAll(".choice")) {
    const option = findTopById(button.dataset.id);
    if (!option) continue;
    const name = getTopName(option);
    const label = button.querySelector(".choice__label");
    const img = button.querySelector(".choice__img");
    if (label) label.textContent = name;
    if (img) img.alt = name;
  }

  if (!answered) return;

  const lastResult = roundResults[roundResults.length - 1];
  if (!lastResult || lastResult.questionNumber !== currentIndex + 1) return;

  if (lastResult.correct) {
    els.feedback.textContent = t(currentLang, "correct");
  } else {
    const selectedTop = findTopById(lastResult.selectedId);
    const name = selectedTop ? getTopName(selectedTop) : lastResult.selectedId;
    els.feedback.textContent = t(currentLang, "wrong", name);
  }
}

function refreshResultsLanguage() {
  const total = roundResults.length;
  els.finalScore.textContent = t(currentLang, "finalScore", score, total);
  renderRoundResults();
}

function buildCatalogFilterOptions() {
  els.catalogFilterOptions.innerHTML = "";
  for (const syllabus of SYLLABI) {
    const id = `catalog-filter-${syllabus.key}`;
    const label = document.createElement("label");
    label.className = "lang-option";
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "catalog-filter";
    input.id = id;
    input.value = syllabus.key;
    input.checked = catalogFilters.includes(syllabus.key);

    const span = document.createElement("span");
    span.dataset.catalogFilterKey = syllabus.key;

    label.append(input, span);
    els.catalogFilterOptions.appendChild(label);
  }
}

function buildSyllabusOptions() {
  els.syllabusOptions.innerHTML = "";
  for (const syllabus of SYLLABI) {
    const id = `syllabus-${syllabus.key}`;
    const label = document.createElement("label");
    label.className = "lang-option";
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "syllabus";
    input.id = id;
    input.value = syllabus.key;
    input.checked = selectedSyllabi.includes(syllabus.key);

    const span = document.createElement("span");
    span.dataset.syllabusKey = syllabus.key;

    label.append(input, span);
    els.syllabusOptions.appendChild(label);
  }
}

function getDisplayPartsPreviewText() {
  const selected = getSelectedDisplayParts();
  const segments = DISPLAY_PARTS.filter((part) => selected.includes(part.key)).map(
    (part) => t(currentLang, part.exampleKey),
  );
  return segments.length > 0
    ? t(currentLang, "displayPartsPreview", segments.join(" "))
    : "";
}

function updateDisplayPartsPreview() {
  els.displayPartsPreview.textContent = getDisplayPartsPreviewText();
}

function buildDisplayPartOptions() {
  els.displayPartsOptions.innerHTML = "";
  for (const part of DISPLAY_PARTS) {
    const id = `part-${part.key}`;
    const label = document.createElement("label");
    label.className = "lang-option lang-option--display-part";
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "display-part";
    input.id = id;
    input.value = part.key;
    input.checked = displayParts.includes(part.key);

    const text = document.createElement("span");
    text.className = "lang-option__text";

    const name = document.createElement("span");
    name.className = "lang-option__label";
    name.dataset.partKey = part.key;

    const example = document.createElement("span");
    example.className = "lang-option__example";
    example.dataset.partExample = part.key;

    text.append(name, example);
    label.append(input, text);
    els.displayPartsOptions.appendChild(label);
  }
  updateDisplayPartsPreview();
}

function applyLanguage() {
  const htmlLang =
    LANGUAGES.find((l) => l.code === currentLang)?.htmlLang || "en";
  document.documentElement.lang = htmlLang;

  els.pageTitle.textContent = t(currentLang, "pageTitle");
  els.headerTitle.textContent = t(currentLang, "title");
  els.tagline.textContent = t(currentLang, "tagline");
  els.intro.textContent = t(currentLang, "intro");
  els.languageLabel.textContent = t(currentLang, "languageLabel");
  els.langSelect.value = currentLang;
  els.displayPartsLegendLabel.textContent = t(currentLang, "displayPartsLabel");
  els.syllabusLegend.textContent = t(currentLang, "syllabusLabel");
  els.btnStartLabel.textContent = t(currentLang, "start");
  els.btnStartHint.textContent = t(currentLang, "startHint");
  els.btnCatalogLabel.textContent = t(currentLang, "catalog");
  els.btnCatalogHint.textContent = t(currentLang, "catalogHint");
  els.catalogTitle.textContent = t(currentLang, "catalog");
  els.catalogFilterLegend.textContent = t(currentLang, "catalogFilter");
  els.btnHeaderBack.textContent = t(currentLang, "backToStart");
  updateNextButtonLabel();
  els.resultsTitle.textContent = t(currentLang, "complete");
  els.resultsListHeading.textContent = t(currentLang, "resultsListHeading");
  els.btnRetryLabel.textContent = t(currentLang, "playAgain");
  els.btnRetryHint.textContent = t(currentLang, "playAgainHint");
  els.choicesLegend.textContent = t(currentLang, "choicesLegend");

  for (const span of els.displayPartsOptions.querySelectorAll("[data-part-key]")) {
    const part = DISPLAY_PARTS.find((p) => p.key === span.dataset.partKey);
    if (part) {
      span.textContent = t(currentLang, part.labelKey);
    }
  }

  for (const span of els.displayPartsOptions.querySelectorAll("[data-part-example]")) {
    const part = DISPLAY_PARTS.find((p) => p.key === span.dataset.partExample);
    if (part) {
      span.textContent = t(currentLang, part.exampleKey);
    }
  }

  updateDisplayPartsPreview();

  for (const span of els.syllabusOptions.querySelectorAll("[data-syllabus-key]")) {
    const syllabus = SYLLABI.find((s) => s.key === span.dataset.syllabusKey);
    if (syllabus) {
      span.textContent = t(currentLang, syllabus.labelKey);
    }
  }

  for (const span of els.catalogFilterOptions.querySelectorAll(
    "[data-catalog-filter-key]",
  )) {
    const syllabus = SYLLABI.find((s) => s.key === span.dataset.catalogFilterKey);
    if (syllabus) {
      span.textContent = t(currentLang, syllabus.labelKey);
    }
  }

  setDeckStatus();
  if (getActiveScreenName() === "catalog") {
    renderCatalog();
  }
}

function sortCatalogTops(tops) {
  return [...tops].sort((a, b) => {
    const productA = getTopParts(a, "en").product || "";
    const productB = getTopParts(b, "en").product || "";
    const lineA = deriveSyllabus(a) || "";
    const lineB = deriveSyllabus(b) || "";
    if (lineA !== lineB) return lineA.localeCompare(lineB);
    return productA.localeCompare(productB, undefined, { numeric: true });
  });
}

function renderCatalog() {
  const filters = getSelectedCatalogFilters();
  els.catalogGrid.innerHTML = "";

  if (filters.length === 0) {
    els.catalogCount.textContent = t(currentLang, "catalogFilterRequired");
    els.catalogCount.classList.add("catalog-count--warn");
    return;
  }

  const tops = sortCatalogTops(filterTopsBySyllabus(allTops, filters));
  els.catalogCount.classList.remove("catalog-count--warn");

  if (tops.length === 0) {
    els.catalogCount.textContent = t(currentLang, "catalogEmpty");
    return;
  }

  els.catalogCount.textContent = t(currentLang, "catalogCount", tops.length);

  for (const top of tops) {
    const line = deriveSyllabus(top);
    const syllabus = SYLLABI.find((s) => s.key === line);
    const name = getTopName(top);

    const card = document.createElement("article");
    card.className = "catalog-item";

    const img = document.createElement("img");
    img.className = "catalog-item__img";
    img.src = top.image;
    img.alt = name;
    img.width = 140;
    img.height = 140;
    img.loading = "lazy";

    const badge = document.createElement("span");
    badge.className = "catalog-item__badge";
    badge.textContent = syllabus ? t(currentLang, syllabus.labelKey) : line || "";

    const label = document.createElement("p");
    label.className = "catalog-item__name";
    label.textContent = name;

    card.append(img, badge, label);
    els.catalogGrid.appendChild(card);
  }
}

function openCatalog() {
  catalogFilters = getStoredCatalogFilters();
  for (const input of els.catalogFilterOptions.querySelectorAll(
    'input[name="catalog-filter"]',
  )) {
    input.checked = catalogFilters.includes(input.value);
  }
  applyLanguage();
  showScreen("catalog");
  renderCatalog();
}

function setDeckStatus() {
  const parts = getSelectedDisplayParts();
  const syllabi = getSelectedSyllabi();
  const deck = filterTopsBySyllabus(allTops, syllabi);
  const count = deck.length;

  if (parts.length === 0) {
    els.deckStatus.textContent = t(currentLang, "displayPartsRequired");
    els.deckStatus.classList.add("deck-status--warn");
    els.btnStart.disabled = true;
    return;
  }

  if (syllabi.length === 0) {
    els.deckStatus.textContent = t(currentLang, "syllabusRequired");
    els.deckStatus.classList.add("deck-status--warn");
    els.btnStart.disabled = true;
    return;
  }

  if (allTops.length > 0 && count === 0) {
    els.deckStatus.textContent = t(currentLang, "syllabusNoMatch");
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
  els.deckStatus.textContent = t(currentLang, "deckReady", count);
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
  void playTopEnter(top);
  els.feedback.hidden = true;
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
  els.btnNext.hidden = true;
  answered = false;
  updateNextButtonLabel();

  const wrongChoices = pickRandomItems(
    getActiveDeck(),
    CHOICES_PER_QUESTION - 1,
    top.id,
  );
  const options = shuffle([top, ...wrongChoices]);

  els.choices.classList.remove("choices--revealed", "choices--revealing");
  els.choices.innerHTML = "";
  els.choices.appendChild(els.choicesLegend);

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.dataset.id = option.id;

    const media = document.createElement("span");
    media.className = "choice__media";

    const mediaInner = document.createElement("span");
    mediaInner.className = "choice__media-inner";

    const img = document.createElement("img");
    img.className = "choice__img";
    img.src = option.image;
    img.alt = getTopName(option);
    img.width = 120;
    img.height = 96;

    const label = document.createElement("span");
    label.className = "choice__label";
    label.textContent = getTopName(option);

    mediaInner.append(img);
    media.append(mediaInner);
    button.append(media, label);
    button.addEventListener("click", () => handleChoice(option.id, top));
    els.choices.appendChild(button);
  }
}

function revealChoices(correctId, selectedId) {
  const buttons = [...els.choices.querySelectorAll(".choice")];

  for (const [index, button] of buttons.entries()) {
    button.disabled = true;
    button.style.setProperty("--reveal-index", String(index));
    const id = button.dataset.id;

    if (id === correctId) {
      button.classList.add("choice--correct");
    } else if (id === selectedId) {
      button.classList.add("choice--wrong");
    }
  }

  els.choices.classList.add("choices--revealing");

  requestAnimationFrame(() => {
    els.choices.classList.add("choices--revealed");
    requestAnimationFrame(() => {
      for (const button of buttons) {
        button.classList.add("choice--revealed");
      }
      els.choices.classList.remove("choices--revealing");
    });
  });
}

function handleChoice(selectedId, correctTop) {
  if (answered) return;
  answered = true;

  const correctName = getTopName(correctTop);
  const isCorrect = selectedId === correctTop.id;
  const selectedTop = findTopById(selectedId);
  const selectedName = selectedTop ? getTopName(selectedTop) : selectedId;

  roundResults.push({
    questionNumber: currentIndex + 1,
    top: correctTop,
    selectedId,
    correct: isCorrect,
  });

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
  revealChoices(correctTop.id, selectedId);
  updateNextButtonLabel();
  els.btnNext.hidden = false;
}

function startQuiz() {
  displayParts = getSelectedDisplayParts();
  if (displayParts.length === 0) {
    setDeckStatus();
    return;
  }
  localStorage.setItem(DISPLAY_PARTS_STORAGE_KEY, JSON.stringify(displayParts));

  selectedSyllabi = getSelectedSyllabi();
  if (selectedSyllabi.length === 0) {
    setDeckStatus();
    return;
  }
  localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(selectedSyllabi));

  const deck = getActiveDeck();
  if (deck.length < CHOICES_PER_QUESTION) {
    setDeckStatus();
    return;
  }

  roundQuestions = buildRound(deck);
  roundResults = [];
  currentIndex = 0;
  score = 0;
  applyLanguage();
  showScreen("quiz");
  renderQuestion();
}

function renderRoundResults() {
  els.roundResults.innerHTML = "";

  for (const result of roundResults) {
    const item = document.createElement("li");
    item.className = `result-item result-item--${result.correct ? "correct" : "wrong"}`;

    const media = document.createElement("div");
    media.className = "result-item__media";

    const badge = document.createElement("span");
    badge.className = "result-item__badge";
    badge.textContent = t(
      currentLang,
      result.correct ? "resultStatusCorrect" : "resultStatusWrong",
    );

    const img = document.createElement("img");
    img.className = "result-item__img";
    img.src = result.top.image;
    img.alt = getTopName(result.top);
    img.width = 96;
    img.height = 96;

    media.append(badge, img);

    const body = document.createElement("div");
    body.className = "result-item__body";

    const question = document.createElement("p");
    question.className = "result-item__question";
    question.textContent = t(currentLang, "resultQuestion", result.questionNumber);

    const correctName = getTopName(result.top);

    const name = document.createElement("p");
    name.className = "result-item__name";
    name.textContent = correctName;

    body.append(question, name);

    if (!result.correct) {
      const selectedTop = findTopById(result.selectedId);
      const selectedName = selectedTop
        ? getTopName(selectedTop)
        : result.selectedId;
      const pick = document.createElement("p");
      pick.className = "result-item__pick";
      pick.textContent = t(currentLang, "resultYourAnswer", selectedName);
      body.append(pick);
    }

    item.append(media, body);
    els.roundResults.appendChild(item);
  }
}

function goToStartScreen() {
  roundQuestions = [];
  roundResults = [];
  currentIndex = 0;
  score = 0;
  answered = false;
  els.topImage.classList.remove("top-image--enter", "top-image--exit");
  els.topImageWrap.classList.remove("top-image-wrap--exit");
  topImageAnimating = false;
  showScreen("start");
  setDeckStatus();
}

function finishQuiz() {
  const total = roundQuestions.length;
  els.finalScore.textContent = t(currentLang, "finalScore", score, total);
  els.resultsListHeading.textContent = t(currentLang, "resultsListHeading");
  renderRoundResults();
  showScreen("results");
}

async function nextQuestion() {
  if (advancingQuestion) return;
  advancingQuestion = true;
  els.btnNext.disabled = true;

  await playTopExit();

  if (currentIndex < roundQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    advancingQuestion = false;
    return;
  }
  advancingQuestion = false;
  finishQuiz();
}

els.langSelect.addEventListener("change", () => {
  setLanguage(els.langSelect.value);
});

els.displayPartsOptions.addEventListener("change", (event) => {
  if (event.target.name !== "display-part") return;
  displayParts = getSelectedDisplayParts();
  localStorage.setItem(DISPLAY_PARTS_STORAGE_KEY, JSON.stringify(displayParts));
  updateDisplayPartsPreview();
  setDeckStatus();
});

els.syllabusOptions.addEventListener("change", (event) => {
  if (event.target.name !== "syllabus") return;
  selectedSyllabi = getSelectedSyllabi();
  localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(selectedSyllabi));
  setDeckStatus();
});

els.btnStart.addEventListener("click", startQuiz);
els.btnCatalog.addEventListener("click", openCatalog);
els.btnHeaderBack.addEventListener("click", goToStartScreen);
els.catalogFilterOptions.addEventListener("change", (event) => {
  if (event.target.name !== "catalog-filter") return;
  catalogFilters = getSelectedCatalogFilters();
  localStorage.setItem(CATALOG_FILTER_STORAGE_KEY, JSON.stringify(catalogFilters));
  renderCatalog();
});
els.btnNext.addEventListener("click", nextQuestion);
els.btnRetry.addEventListener("click", () => {
  displayParts = getStoredDisplayParts();
  for (const input of els.displayPartsOptions.querySelectorAll('input[name="display-part"]')) {
    input.checked = displayParts.includes(input.value);
  }
  selectedSyllabi = getStoredSyllabi();
  for (const input of els.syllabusOptions.querySelectorAll('input[name="syllabus"]')) {
    input.checked = selectedSyllabi.includes(input.value);
  }
  applyLanguage();
  goToStartScreen();
});

buildLanguageSelect();
buildDisplayPartOptions();
buildSyllabusOptions();
buildCatalogFilterOptions();
applyLanguage();
loadTops();
