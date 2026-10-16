
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

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
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    const languageButton = $("#languageBtn");
    if (languageButton) {
      languageButton.textContent = language === "ar" ? "EN" : "عربي";
    }

    localStorage.setItem("kaze-language", language);

    const storeMessage = $("#storeMessage");
    if (storeMessage) {
      storeMessage.textContent = language === "ar"
        ? "متجر KAZE جاهز للربط. المنتجات ستظهر بعد إعداد قاعدة البيانات."
        : "KAZE is ready for database setup. Products will appear after configuration.";

      document.querySelectorAll(".skeleton").forEach((item) => {
        item.classList.remove("skeleton");
      });
    }
  } catch (error) {
    console.error("Language loading failed:", error);
  }
}

const languageButton = $("#languageBtn");
if (languageButton) {
  languageButton.addEventListener("click", () => {
    loadLanguage(currentLanguage === "ar" ? "en" : "ar");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;

  const installButton = $("#installBtn");
  if (installButton) installButton.hidden = false;
});

const installButton = $("#installBtn");
if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    installPrompt = null;
    installButton.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  const button = $("#installBtn");
  if (button) button.hidden = true;
  installPrompt = null;
});

const yearElement = $("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

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

// تم تهيئة Firebase، لكن تسجيل الدخول والمنتجات
// لن يعملا حتى استكمال الإعدادات وقواعد Firestore.
console.info("KAZE Firebase initialized", {
  projectId: firebaseConfig.projectId,
  authenticationReady: Boolean(auth),
  databaseReady: Boolean(db)
});
    
