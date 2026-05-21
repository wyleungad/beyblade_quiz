import { getTopParts } from "./name-parts.js";

const PRODUCT_SYLLABUS_RE = /^(BXG|BXC|BXH|BX|CX|UX)/i;

export const SYLLABI = [
  { key: "bx", labelKey: "syllabusBx" },
  { key: "bxc", labelKey: "syllabusBxc" },
  { key: "bxh", labelKey: "syllabusBxh" },
  { key: "bxg", labelKey: "syllabusBxg" },
  { key: "cx", labelKey: "syllabusCx" },
  { key: "ux", labelKey: "syllabusUx" },
];

export const SYLLABUS_STORAGE_KEY = "beyblade-quiz-syllabus";
export const CATALOG_FILTER_STORAGE_KEY = "beyblade-quiz-catalog-filter";
export const DEFAULT_QUIZ_SYLLABI = ["ux"];
export const DEFAULT_CATALOG_FILTERS = SYLLABI.map((s) => s.key);

export function deriveSyllabus(top) {
  const product = getTopParts(top, "en").product;
  if (!product) return null;
  const match = product.match(PRODUCT_SYLLABUS_RE);
  return match ? match[1].toLowerCase() : null;
}

function getStoredSyllabusKeys(storageKey, defaultKeys) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((key) => SYLLABI.some((s) => s.key === key));
    }
  } catch {
    /* ignore */
  }
  return [...defaultKeys];
}

export function getStoredSyllabi() {
  return getStoredSyllabusKeys(SYLLABUS_STORAGE_KEY, DEFAULT_QUIZ_SYLLABI);
}

export function getStoredCatalogFilters() {
  return getStoredSyllabusKeys(CATALOG_FILTER_STORAGE_KEY, DEFAULT_CATALOG_FILTERS);
}

export function filterTopsBySyllabus(tops, selectedSyllabi) {
  const selected = new Set(selectedSyllabi);
  return tops.filter((top) => {
    const syllabus = deriveSyllabus(top);
    return syllabus && selected.has(syllabus);
  });
}
