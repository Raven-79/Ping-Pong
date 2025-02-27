import { reMount } from "../App.js";
import { i18n } from "./i18n.js";
export function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  i18n.locale = lang;
  // reMount();
}

export function getLanguage(defaultLang) {
  const lang = localStorage.getItem("lang");
  if (!lang) {
    localStorage.setItem("lang", defaultLang);
    return defaultLang;
  }
  return lang;
}
