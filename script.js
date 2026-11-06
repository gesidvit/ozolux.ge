/* ============================================================
   OZOLUX — script.js
   ⚙️  ВАШИ КОНТАКТЫ — МЕНЯЙТЕ ТОЛЬКО ЗДЕСЬ (один раз).
   Тексты сайта (RU/KA/EN) — в файле i18n.js.
   ============================================================ */
const CONFIG = {
  PHONE_DISPLAY: "+995 599 079 547",   // отображаемый номер
  PHONE_TEL:     "+995599079547",      // для кнопки звонка (без пробелов)
  WHATSAPP:      "995599079547",       // WhatsApp — международный формат БЕЗ "+"
  TELEGRAM:      "ozoluxge",           // Telegram username без "@"
  EMAIL:         "gsidvit@gmail.com"   // почта для связи
};

/* ---------- Подстановка контактов ---------- */
(function fillContacts(){
  const waBase = "https://wa.me/" + CONFIG.WHATSAPP;
  const tgBase = "https://t.me/" + CONFIG.TELEGRAM;
  document.querySelectorAll("[data-phone]").forEach(el => el.textContent = CONFIG.PHONE_DISPLAY);
  document.querySelectorAll("[data-tel]").forEach(el => el.setAttribute("href", "tel:" + CONFIG.PHONE_TEL));
  document.querySelectorAll("[data-wa]").forEach(el => el.setAttribute("href", waBase));
  document.querySelectorAll("[data-tg]").forEach(el => el.setAttribute("href", tgBase));
  document.querySelectorAll("[data-email]").forEach(el => el.setAttribute("href", "mailto:" + CONFIG.EMAIL));
  document.querySelectorAll("[data-email-text]").forEach(el => el.textContent = CONFIG.EMAIL);
})();

/* ============================================================
   I18N — переключение языков RU / KA / EN
   ============================================================ */
const LANG_KEY = "ozolux_lang";
let currentLang = (function(){
  let saved; try { saved = localStorage.getItem(LANG_KEY); } catch(e){}
  if (saved && I18N[saved]) return saved;
  return "ru";
})();

function t(key){
  const dict = I18N[currentLang] || I18N.ru;
  return (key in dict) ? dict[key] : (I18N.ru[key] !== undefined ? I18N.ru[key] : key);
}

function applyLang(lang){
  if (!I18N[lang]) lang = "ru";
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch(e){}

  // Текстовые узлы
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const v = t(el.getAttribute("data-i18n"));
    if (v !== undefined) el.textContent = v;
  });
  // Плейсхолдеры
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  // Мета-описание
  document.querySelectorAll("[data-i18n-meta]").forEach(el => {
    el.setAttribute("content", t(el.getAttribute("data-i18n-meta")));
  });
  // Язык документа и заголовок
  document.documentElement.lang = I18N_HTMLLANG[lang] || lang;
  document.documentElement.setAttribute("data-lang", lang);
  document.title = t("meta.title");

  // Переключатель
  const cur = document.getElementById("langCur");
  if (cur) cur.textContent = I18N_LANGS[lang];
  const flag = document.getElementById("langFlag");
  if (flag && typeof FLAG_SVG !== "undefined") flag.innerHTML = FLAG_SVG[lang] || "";
  document.querySelectorAll("#langMenu [data-lang]").forEach(li => {
    li.classList.toggle("active", li.getAttribute("data-lang") === lang);
  });

  // Пересчитать калькулятор в новом языке
  if (typeof updateCalc === "function") updateCalc();
}

/* ---------- UI переключателя языков ---------- */
(function langSwitcher(){
  const sw = document.getElementById("langSwitch");
  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  if (!sw || !btn || !menu) return;

  // флаги в пунктах меню
  menu.querySelectorAll("[data-lang]").forEach(li => {
    const l = li.getAttribute("data-lang");
    if (typeof FLAG_SVG !== "undefined" && FLAG_SVG[l]) li.insertAdjacentHTML("afterbegin", '<span class="flag">' + FLAG_SVG[l] + '</span>');
  });

  const close = () => { sw.classList.remove("open"); btn.setAttribute("aria-expanded","false"); };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = sw.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("[data-lang]").forEach(li => {
    li.addEventListener("click", () => { applyLang(li.getAttribute("data-lang")); close(); });
  });
  document.addEventListener("click", (e) => { if (!sw.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

/* ---------- Год в футере ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Мобильное меню ---------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
function closeNav(){ mainNav.classList.remove("open"); navToggle.setAttribute("aria-expanded","false"); }
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));

/* ---------- Тень хедера при скролле ---------- */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
onScroll();
window.addEventListener("scroll", onScroll, { passive:true });

/* ---------- Калькулятор ---------- */
const RATE_MIN = 5, RATE_MAX = 6, MIN_ORDER = 200;
const calcType = document.getElementById("calcType");
const calcArea = document.getElementById("calcArea");
const calcCity = document.getElementById("calcCity");
const calcOut  = document.getElementById("calcOut");
const calcHint = document.getElementById("calcHint");
const areaRow  = document.getElementById("areaRow");

function formatPrice(n){ return Math.round(n).toLocaleString("ru-RU"); }

function updateCalc(){
  const isCar = calcType.value === "car";
  areaRow.style.display = isCar ? "none" : "flex";
  if (isCar){
    calcOut.textContent = t("calc.car");
    calcHint.textContent = t("calc.carHint");
    return;
  }
  const area = Math.max(0, parseFloat(calcArea.value) || 0);
  const low  = Math.max(area * RATE_MIN, MIN_ORDER);
  const high = Math.max(area * RATE_MAX, MIN_ORDER);
  calcOut.textContent = formatPrice(low) + "–" + formatPrice(high) + " ₾";
  calcHint.textContent = area > 0 ? t("calc.hint") : t("calc.hintEmpty");
}
[calcType, calcArea, calcCity].forEach(el => el && el.addEventListener("input", updateCalc));

/* ---------- Прокинуть тип объекта из калькулятора в форму ---------- */
const fTypeSel = document.getElementById("fType");
calcType && calcType.addEventListener("change", () => {
  if (fTypeSel) fTypeSel.selectedIndex = calcType.selectedIndex;
});

/* ---------- Форма заявки → WhatsApp / Telegram ---------- */
const form = document.getElementById("orderForm");
const fName = document.getElementById("fName");
const fPhone = document.getElementById("fPhone");
const formError = document.getElementById("formError");

function buildMessage(){
  const name = fName.value.trim();
  const phone = fPhone.value.trim();
  const type = document.getElementById("fType").value;
  const area = document.getElementById("fArea").value.trim();
  const city = document.getElementById("fCity").value;
  const comment = document.getElementById("fComment").value.trim();

  let msg = t("msg.greeting") + "\n";
  msg += "• " + t("msg.name") + ": " + (name || "—") + "\n";
  msg += "• " + t("msg.phone") + ": " + (phone || "—") + "\n";
  msg += "• " + t("msg.type") + ": " + type + "\n";
  if (area) msg += "• " + t("msg.area") + ": " + area + " " + t("msg.unit") + "\n";
  msg += "• " + t("msg.city") + ": " + city + "\n";
  if (comment) msg += "• " + t("msg.comment") + ": " + comment + "\n";
  return msg;
}

function validate(){
  let ok = true;
  [fName, fPhone].forEach(el => {
    if (!el.value.trim()){ el.classList.add("invalid"); ok = false; }
    else el.classList.remove("invalid");
  });
  formError.hidden = ok;
  return ok;
}
[fName, fPhone].forEach(el => el.addEventListener("input", () => {
  if (el.value.trim()) el.classList.remove("invalid");
}));

function openChannel(kind){
  if (!validate()){ (fName.value.trim() ? fPhone : fName).focus(); return; }
  const text = encodeURIComponent(buildMessage());
  const url = kind === "wa"
    ? "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + text
    : "https://t.me/" + CONFIG.TELEGRAM + "?text=" + text;
  window.open(url, "_blank", "noopener");
}
document.getElementById("sendWa").addEventListener("click", () => openChannel("wa"));
document.getElementById("sendTg").addEventListener("click", () => openChannel("tg"));
form.addEventListener("submit", e => e.preventDefault());

/* ---------- Before / After comparator ---------- */
document.querySelectorAll("[data-ba]").forEach(ba => {
  const handle = ba.querySelector(".ba-handle");
  const setPos = (clientX) => {
    const r = ba.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(0, Math.min(100, p));
    ba.style.setProperty("--pos", p + "%");
    if (handle) handle.setAttribute("aria-valuenow", Math.round(p));
  };
  const setPct = (p) => {
    p = Math.max(0, Math.min(100, p));
    ba.style.setProperty("--pos", p + "%");
    if (handle) handle.setAttribute("aria-valuenow", Math.round(p));
  };
  let dragging = false;
  ba.addEventListener("pointerdown", (e) => {
    dragging = true;
    try { ba.setPointerCapture(e.pointerId); } catch (_) {}
    setPos(e.clientX);
  });
  ba.addEventListener("pointermove", (e) => { if (dragging) setPos(e.clientX); });
  ba.addEventListener("pointerup", () => { dragging = false; });
  ba.addEventListener("pointercancel", () => { dragging = false; });
  if (handle) handle.addEventListener("keydown", (e) => {
    const cur = parseFloat(ba.style.getPropertyValue("--pos")) || 50;
    if (e.key === "ArrowLeft") { setPct(cur - 4); e.preventDefault(); }
    else if (e.key === "ArrowRight") { setPct(cur + 4); e.preventDefault(); }
    else if (e.key === "Home") { setPct(0); e.preventDefault(); }
    else if (e.key === "End") { setPct(100); e.preventDefault(); }
  });
});

/* ---------- Scroll-reveal ---------- */
const revealEls = document.querySelectorAll(".card, .service-card, .how-item, .safety-card, .tl-item, .equip-card, .price-card, .why-card, .ba-item, .section-head");
revealEls.forEach(el => el.classList.add("reveal"));
if ("IntersectionObserver" in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold:0.12, rootMargin:"0px 0px -40px 0px" });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("in"));
}

/* ---------- Применить язык при загрузке ---------- */
applyLang(currentLang);
