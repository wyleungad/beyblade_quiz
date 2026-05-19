const PRODUCT_RE = /^((?:[A-Z]{2,4}(?:[GHC])?)(?:-\d+)+)/;
const COMBO_RE = /([S]?\d+-\d+[A-Za-z]+)/g;

export const DISPLAY_PARTS = [
  { key: "product", labelKey: "partProduct" },
  { key: "bey", labelKey: "partBey" },
  { key: "combo", labelKey: "partCombo" },
];

export const DISPLAY_PARTS_STORAGE_KEY = "beyblade-quiz-display-parts";
export const DEFAULT_DISPLAY_PARTS = ["product", "bey", "combo"];

export function normalizeText(text) {
  return (text || "").normalize("NFKC").trim();
}

export function preprocessName(text) {
  let s = normalizeText(text);
  s = s.replace(
    /(?<=[\u3040-\u9fff\u4e00-\u9fffA-Za-z])(?=[S]?\d+-\d+[A-Za-z])/g,
    " ",
  );
  return s;
}

export function parseName(fullName) {
  const s = preprocessName(fullName);
  if (!s) {
    return { product: "", bey: "", combo: "", extra: "" };
  }

  let product = "";
  let rest = s;
  const productMatch = s.match(PRODUCT_RE);
  if (productMatch) {
    product = productMatch[1];
    rest = s.slice(productMatch[0].length).trim();
  }

  let combo = "";
  let comboSpan = null;
  for (const match of rest.matchAll(COMBO_RE)) {
    comboSpan = match;
  }

  let bey = "";
  let extra = "";
  if (comboSpan) {
    combo = comboSpan[1];
    bey = rest.slice(0, comboSpan.index).trim();
    extra = rest.slice(comboSpan.index + comboSpan[0].length).trim();
  } else {
    bey = rest.trim();
  }

  return { product, bey, combo, extra };
}

export function getStoredDisplayParts() {
  try {
    const raw = localStorage.getItem(DISPLAY_PARTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((key) =>
        DISPLAY_PARTS.some((part) => part.key === key),
      );
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_DISPLAY_PARTS];
}

export function getTopParts(top, lang) {
  if (top.parts?.[lang]) {
    return top.parts[lang];
  }
  const full =
    top.names?.[lang] || top.names?.en || top.name || "";
  return parseName(full);
}

export function formatTopName(top, lang, selectedParts) {
  const parts = getTopParts(top, lang);
  const segments = [];

  if (selectedParts.includes("product") && parts.product) {
    segments.push(parts.product);
  }
  if (selectedParts.includes("bey")) {
    let beyText = parts.bey || "";
    if (parts.extra) {
      beyText = beyText ? `${beyText} ${parts.extra}` : parts.extra;
    }
    if (beyText) {
      segments.push(beyText);
    }
  }
  if (selectedParts.includes("combo") && parts.combo) {
    segments.push(parts.combo);
  }

  if (segments.length === 0) {
    return top.names?.[lang] || top.name || "";
  }
  return segments.join(" ");
}
