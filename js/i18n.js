export const LANG_STORAGE_KEY = "beyblade-quiz-lang";
export const DEFAULT_LANG = "en";

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
    partProduct: "Product no.",
    partBey: "Bey name",
    partCombo: "Customization",
    displayPartsRequired: "Select at least one part to show in answers.",
    start: "Start quiz",
    question: (n, total) => `Question ${n} / ${total}`,
    score: (s) => `Score: ${s}`,
    imageAlt: "Identify this Beyblade X top",
    choicesLegend: "Select the name of this top",
    correct: "Correct!",
    wrong: (name) => `Not quite — it was ${name}.`,
    next: "Next question",
    complete: "Quiz complete",
    finalScore: (s, total) => `You scored ${s} out of ${total}.`,
    bestScore: (best, total) => `Best score on this device: ${best} / ${total}`,
    playAgain: "Play again",
    footer: "Client-only quiz — no server or database required.",
    deckEmpty:
      "No tops loaded yet. Add entries to data/tops.json and images under assets/images/.",
    deckNeedMore: (need, have) =>
      `Need at least ${need} tops for multiple choice (you have ${have}).`,
    deckReady: (count, questions) =>
      `${count} tops in the deck. Each round has up to ${questions} questions.`,
  },
  ja: {
    pageTitle: "ベイブレードX クイズ",
    title: "ベイブレードX クイズ",
    tagline: "画像からベイの名前を当てよう",
    intro:
      "ベイブレードXのベイの画像が表示されます。4つの選択肢から正しい名前を選んでください。",
    languageLabel: "クイズの言語",
    displayPartsLabel: "選択肢に表示する項目",
    partProduct: "製品番号",
    partBey: "ベイ名",
    partCombo: "カスタマイズ",
    displayPartsRequired: "選択肢に表示する項目を1つ以上選んでください。",
    start: "クイズを始める",
    question: (n, total) => `問題 ${n} / ${total}`,
    score: (s) => `スコア: ${s}`,
    imageAlt: "このベイの名前を当ててください",
    choicesLegend: "ベイの名前を選んでください",
    correct: "正解！",
    wrong: (name) => `不正解 — 正解は ${name} です。`,
    next: "次の問題",
    complete: "クイズ終了",
    finalScore: (s, total) => `${total} 問中 ${s} 問正解しました。`,
    bestScore: (best, total) => `この端末の最高スコア: ${best} / ${total}`,
    playAgain: "もう一度プレイ",
    footer: "クライアントのみ — サーバーやデータベースは不要です。",
    deckEmpty:
      "ベイが読み込まれていません。data/tops.json と assets/images/ を確認してください。",
    deckNeedMore: (need, have) =>
      `選択式には少なくとも ${need} 個のベイが必要です（現在 ${have} 個）。`,
    deckReady: (count, questions) =>
      `デッキに ${count} 個のベイがあります。1ラウンド最大 ${questions} 問です。`,
  },
  zh: {
    pageTitle: "爆旋陀螺X 猜謎",
    title: "爆旋陀螺X 猜謎",
    tagline: "看圖片猜出戰鬥陀螺的名稱",
    intro: "你會看到爆旋陀螺X戰鬥陀螺的圖片，請從四個選項中選出正確名稱。",
    languageLabel: "猜謎語言",
    displayPartsLabel: "答案顯示內容",
    partProduct: "產品編號",
    partBey: "陀螺名稱",
    partCombo: "改裝組合",
    displayPartsRequired: "請至少選擇一項要顯示在答案中的內容。",
    start: "開始猜謎",
    question: (n, total) => `第 ${n} 題 / 共 ${total} 題`,
    score: (s) => `得分：${s}`,
    imageAlt: "請辨識這顆戰鬥陀螺",
    choicesLegend: "選擇陀螺名稱",
    correct: "答對了！",
    wrong: (name) => `答錯了 — 正確答案是 ${name}。`,
    next: "下一題",
    complete: "猜謎結束",
    finalScore: (s, total) => `你答對了 ${s} / ${total} 題。`,
    bestScore: (best, total) => `本裝置最佳成績：${best} / ${total}`,
    playAgain: "再玩一次",
    footer: "純前端猜謎 — 無需伺服器或資料庫。",
    deckEmpty: "尚未載入陀螺資料，請檢查 data/tops.json 與 assets/images/。",
    deckNeedMore: (need, have) =>
      `選擇題至少需要 ${need} 款陀螺（目前有 ${have} 款）。`,
    deckReady: (count, questions) =>
      `牌組共有 ${count} 款陀螺，每輪最多 ${questions} 題。`,
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

export function getStoredLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && UI[stored]) return stored;
  return DEFAULT_LANG;
}

export function bestScoreKey(lang) {
  return `beyblade-x-quiz-best-${lang}`;
}
