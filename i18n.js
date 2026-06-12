const SUPPORTED_LANGS = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "fi", label: "Suomi" },
];

const STORAGE_KEY = "language";
const DEFAULT_LANG = "en";

let currentLang = DEFAULT_LANG;
let messages = {};

function normalizeLangCode(code) {
  if (!code) return DEFAULT_LANG;
  const base = code.split("-")[0].toLowerCase();
  return SUPPORTED_LANGS.some((l) => l.code === base) ? base : DEFAULT_LANG;
}

function detectBrowserLang() {
  if (typeof chrome !== "undefined" && chrome.i18n?.getUILanguage) {
    return normalizeLangCode(chrome.i18n.getUILanguage());
  }
  return normalizeLangCode(navigator.language);
}

async function loadMessages(lang) {
  const normalized = normalizeLangCode(lang);
  const url = chrome.runtime.getURL(`_locales/${normalized}/messages.json`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("locale not found");
    messages = await response.json();
    currentLang = normalized;
  } catch {
    if (normalized !== DEFAULT_LANG) {
      await loadMessages(DEFAULT_LANG);
    }
  }
}

function t(key, ...args) {
  const entry = messages[key];
  if (!entry?.message) return key;
  let text = entry.message;
  args.forEach((arg, i) => {
    text = text.replace(`$${i + 1}`, String(arg));
  });
  return text;
}

function getLanguage() {
  return currentLang;
}

function getSupportedLangs() {
  return SUPPORTED_LANGS;
}

async function initI18n() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const lang = stored[STORAGE_KEY]
    ? normalizeLangCode(stored[STORAGE_KEY])
    : detectBrowserLang();
  await loadMessages(lang);
  document.documentElement.lang = currentLang;
}

async function setLanguage(lang) {
  const normalized = normalizeLangCode(lang);
  await chrome.storage.local.set({ [STORAGE_KEY]: normalized });
  await loadMessages(normalized);
  applyI18n();
  populateLanguageSelect();
}

function applyI18n() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.placeholder = t(key);
  });
}

function populateLanguageSelect() {
  const select = document.getElementById("languageSelect");
  if (!select) return;

  select.innerHTML = "";
  SUPPORTED_LANGS.forEach(({ code, label }) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    if (code === currentLang) option.selected = true;
    select.appendChild(option);
  });
}
