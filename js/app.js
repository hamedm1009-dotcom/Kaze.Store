const $ = (selector) => document.querySelector(selector);
let currentLanguage = localStorage.getItem("kaze-language") || "ar";
let translations = {};
let installPrompt = null;

async function loadLanguage(language) {
  try {
    const response = await fetch(`./locales/${language}.json`);
    if (!response.ok) throw new Error("Translation unavailable");
    translations = await response.json();
    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (translations[key]) element.textContent = translations[key];
    });
    $("#languageBtn").textContent = language === "ar" ? "EN" : "عربي";
    localStorage.setItem("kaze-language", language);
  } catch (error) {
    console.error("Language loading failed:", error);
  }
}

$("#languageBtn").addEventListener("click", () => {
  loadLanguage(currentLanguage === "ar" ? "en" : "ar");
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  $("#installBtn").hidden = false;
});

$("#installBtn").addEventListener("click", async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  $("#installBtn").hidden = true;
});

window.addEventListener("appinstalled", () => {
  $("#installBtn").hidden = true;
  installPrompt = null;
});

$("#year").textContent = new Date().getFullYear();

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

loadLanguage(currentLanguage);
registerServiceWorker();

// هذه نسخة واجهة أولية؛ المنتجات والسلة وFirebase ستضاف في المراحل التالية.
const storeMessage = $("#storeMessage");
if (storeMessage) {
  storeMessage.textContent = currentLanguage === "ar"
    ? "واجهة المعاينة جاهزة. ستظهر المنتجات بعد ربط قاعدة البيانات."
    : "Preview is ready. Products will appear after database setup.";
  // إزالة هياكل التحميل حتى لا تبدو الصفحة عالقة.
  document.querySelectorAll(".skeleton").forEach((item) => item.classList.remove("skeleton"));
}
