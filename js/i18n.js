export const LANG_STORAGE_KEY = "beyblade-quiz-lang";
export const DEFAULT_LANG = "zh";

export const LANGUAGES = [
  { code: "en", label: "English", htmlLang: "en" },
  { code: "zh", label: "繁體中文", htmlLang: "zh-Hant" },
  { code: "ja", label: "日本語", htmlLang: "ja" },
];

export const UI = {
  en: {
    pageTitle: "Beyblade X Quiz",
    title: "Beyblade X Quiz",
    tagline: "Name the battling top from its image",
    intro:
      "You will see images of Beyblade X battling tops. Pick the correct name from four choices.",
    languageLabel: "Quiz language",
    displayPartsLabel: "Show in answers",
    syllabusLabel: "Quiz syllabus",
    syllabusBx: "BX",
    syllabusBxc: "BXC",
    syllabusBxh: "BXH",
    syllabusBxg: "BXG",
    syllabusCx: "CX",
    syllabusUx: "UX",
    syllabusRequired: "Select at least one syllabus line.",
    syllabusNoMatch:
      "No tops match the selected syllabus lines. Try selecting more lines.",
    partProduct: "Product no.",
    partProductExample: "BX-04",
    partBey: "Bey name",
    partBeyExample: "DRANSWORD",
    partCombo: "Customization",
    partComboExample: "3-80N",
    displayPartsPreview: (sample) => `e.g. ${sample}`,
    displayPartsRequired: "Select at least one part to show in answers.",
    start: "Start",
    startHint: "Random image quiz",
    catalog: "Catalog",
    catalogHint: "Browse every top",
    catalogFilter: "Filter by line",
    catalogCount: (count) => `${count} tops`,
    catalogEmpty: "No tops match the selected lines.",
    catalogFilterRequired: "Select at least one line.",
    question: (n, total) => `Question ${n} / ${total}`,
    score: (s) => `Score: ${s}`,
    imageAlt: "Identify this Beyblade X top",
    choicesLegend: "Select the name of this top",
    correct: "Correct!",
    wrong: (name) => `Not quite — it was ${name}.`,
    next: "Next question",
    nextLast: "See results",
    backToStart: "Back",
    complete: "Quiz complete",
    resultsListHeading: "Your answers",
    resultQuestion: (n) => `Question ${n}`,
    resultStatusCorrect: "Correct",
    resultStatusWrong: "Wrong",
    resultYourAnswer: (name) => `Your answer: ${name}`,
    finalScore: (s, total) => `You scored ${s} out of ${total}.`,
    playAgain: "Play again",
    playAgainHint: "Shuffle a new round",
    deckEmpty:
      "No tops loaded yet. Add entries to data/tops.json and images under assets/images/.",
    deckNeedMore: (need, have) =>
      `Need at least ${need} tops for multiple choice (you have ${have}).`,
    deckReady: (count) => `${count} tops.`,
  },
  ja: {
    pageTitle: "ベイブレードX クイズ",
    title: "ベイブレードX クイズ",
    tagline: "画像からベイの名前を当てよう",
    intro:
      "ベイブレードXのベイの画像が表示されます。4つの選択肢から正しい名前を選んでください。",
    languageLabel: "クイズの言語",
    displayPartsLabel: "選択肢に表示する項目",
    syllabusLabel: "出題シラバス",
    syllabusBx: "BX",
    syllabusBxc: "BXC",
    syllabusBxh: "BXH",
    syllabusBxg: "BXG",
    syllabusCx: "CX",
    syllabusUx: "UX",
    syllabusRequired: "出題するシラバスを1つ以上選んでください。",
    syllabusNoMatch:
      "選択したシラバスに該当するベイがありません。選択を増やしてください。",
    partProduct: "製品番号",
    partProductExample: "BX-04",
    partBey: "ベイ名",
    partBeyExample: "ドランソード",
    partCombo: "カスタマイズ",
    partComboExample: "3-80N",
    displayPartsPreview: (sample) => `例：${sample}`,
    displayPartsRequired: "選択肢に表示する項目を1つ以上選んでください。",
    start: "開始",
    startHint: "ランダム出題クイズ",
    catalog: "図鑑",
    catalogHint: "すべてのベイを見る",
    catalogFilter: "シリーズで絞り込み",
    catalogCount: (count) => `${count} 個のベイ`,
    catalogEmpty: "選択したシリーズに該当するベイがありません。",
    catalogFilterRequired: "シリーズを1つ以上選んでください。",
    question: (n, total) => `問題 ${n} / ${total}`,
    score: (s) => `スコア: ${s}`,
    imageAlt: "このベイの名前を当ててください",
    choicesLegend: "ベイの名前を選んでください",
    correct: "正解！",
    wrong: (name) => `不正解 — 正解は ${name} です。`,
    next: "次の問題",
    nextLast: "クイズ結果",
    backToStart: "戻る",
    complete: "クイズ終了",
    resultsListHeading: "回答一覧",
    resultQuestion: (n) => `問題 ${n}`,
    resultStatusCorrect: "正解",
    resultStatusWrong: "不正解",
    resultYourAnswer: (name) => `あなたの回答: ${name}`,
    finalScore: (s, total) => `${total} 問中 ${s} 問正解しました。`,
    playAgain: "もう一度プレイ",
    playAgainHint: "新しい問題で挑戦",
    deckEmpty:
      "ベイが読み込まれていません。data/tops.json と assets/images/ を確認してください。",
    deckNeedMore: (need, have) =>
      `選択式には少なくとも ${need} 個のベイが必要です（現在 ${have} 個）。`,
    deckReady: (count) => `ベイは ${count} 個。`,
  },
  zh: {
    pageTitle: "爆旋陀螺X 測驗",
    title: "爆旋陀螺X 測驗",
    tagline: "看圖片猜出戰鬥陀螺的名稱",
    intro: "你會看到爆旋陀螺X戰鬥陀螺的圖片，請從四個選項中選出正確名稱。",
    languageLabel: "猜謎語言",
    displayPartsLabel: "答案顯示內容",
    syllabusLabel: "出題範圍",
    syllabusBx: "BX",
    syllabusBxc: "BXC",
    syllabusBxh: "BXH",
    syllabusBxg: "BXG",
    syllabusCx: "CX",
    syllabusUx: "UX",
    syllabusRequired: "請至少選擇一個出題系列。",
    syllabusNoMatch: "沒有符合所選系列的陀螺，請多選幾個系列。",
    partProduct: "產品編號",
    partProductExample: "BX-04",
    partBey: "陀螺名稱",
    partBeyExample: "騎士重盾",
    partCombo: "改裝組合",
    partComboExample: "3-80N",
    displayPartsPreview: (sample) => `例：${sample}`,
    displayPartsRequired: "請至少選擇一項要顯示在答案中的內容。",
    start: "開始",
    startHint: "隨機出題測驗",
    catalog: "圖鑑",
    catalogHint: "瀏覽全部陀螺",
    catalogFilter: "依系列篩選",
    catalogCount: (count) => `共 ${count} 款陀螺`,
    catalogEmpty: "沒有符合所選系列的陀螺。",
    catalogFilterRequired: "請至少選擇一個系列。",
    question: (n, total) => `第 ${n} 題 / 共 ${total} 題`,
    score: (s) => `得分：${s}`,
    imageAlt: "請辨識這顆戰鬥陀螺",
    choicesLegend: "選擇陀螺名稱",
    correct: "答對了！",
    wrong: (name) => `答錯了 — 正確答案是 ${name}。`,
    next: "下一題",
    nextLast: "測驗結果",
    backToStart: "返回",
    complete: "測驗結束",
    resultsListHeading: "作答紀錄",
    resultQuestion: (n) => `第 ${n} 題`,
    resultStatusCorrect: "答對",
    resultStatusWrong: "答錯",
    resultYourAnswer: (name) => `你的答案：${name}`,
    finalScore: (s, total) => `你答對了 ${s} / ${total} 題。`,
    playAgain: "再玩一次",
    playAgainHint: "重新隨機出題",
    deckEmpty: "尚未載入陀螺資料，請檢查 data/tops.json 與 assets/images/。",
    deckNeedMore: (need, have) =>
      `選擇題至少需要 ${need} 款陀螺（目前有 ${have} 款）。`,
    deckReady: (count) => `共有 ${count} 款陀螺`,
  },
};

export function t(lang, key, ...args) {
  const strings = UI[lang] || UI.en;
  const value = strings[key];
  if (typeof value === "function") {
    return value(...args);
  }
  return value ?? UI.en[key] ?? key;
}

export function normalizeLang(code) {
  const lang = (code || "").toLowerCase();
  if (lang && UI[lang]) return lang;
  return null;
}

export function getLangFromUrl() {
  return normalizeLang(new URLSearchParams(window.location.search).get("lang"));
}

export function getInitialLang() {
  const fromUrl = getLangFromUrl();
  if (fromUrl) {
    localStorage.setItem(LANG_STORAGE_KEY, fromUrl);
    return fromUrl;
  }
  return getStoredLang();
}

export function setLangUrlParam(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
}

export function getStoredLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && UI[stored]) return stored;
  return DEFAULT_LANG;
}

