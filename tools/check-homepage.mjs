// Run with: node tools/check-homepage.mjs
// Read-only checks using the real homepage script and a small DOM test double.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8");
const code = readFileSync(new URL("assets/site.js", root), "utf8");
const css = readFileSync(new URL("assets/site.css", root), "utf8");
const storeURL = "https://apps.apple.com/us/app/bondset-trust-on-the-court/id6827380778";

const staticStore = html.match(/<a\b([^>]*\bid="store"[^>]*)>([^<]+)<\/a>/);
assert.ok(staticStore, "Download must be a static anchor, including when JavaScript is disabled");
assert.ok(staticStore[1].includes(`href="${storeURL}"`));
assert.ok(staticStore[1].includes('class="store"'));
assert.equal(staticStore[2], "前往AppStore下载");
assert.ok(!staticStore[1].includes("disabled"));
assert.ok(!/即将|即將|Coming soon|近日公開|출시 예정/.test(html + code));
assert.ok(html.includes('href="https://easonzz.github.io/Airborne/"'));
assert.ok(html.includes("site.js?v=app-store-launch"));
assert.ok(html.includes("site.css?v=app-store-launch"));
assert.ok(css.includes("background: var(--game-orange)"), "Keep the existing orange button styling");
assert.ok(css.includes("text-decoration: none"));

const expected = {
  zh: { language: "zh-Hans", text: "前往AppStore下载" },
  "zh-hant": { language: "zh-Hant", text: "前往App Store下載" },
  ja: { language: "ja", text: "App Storeでダウンロード" },
  ko: { language: "ko", text: "App Store에서 다운로드" },
  en: { language: "en", text: "Download on the App Store" },
};

function element() {
  const attrs = new Map();
  return {
    textContent: "",
    href: "",
    dataset: {},
    setAttribute(name, value) { attrs.set(name, value); },
    removeAttribute(name) { attrs.delete(name); },
    getAttribute(name) { return attrs.get(name); },
  };
}

function check(search, browserLanguage, locale) {
  const ids = ["intro", "language-menu", "footer-menu", "privacy-link", "support-link", "store"];
  const nodes = Object.fromEntries(ids.map(id => [id, element()]));
  const languageLinks = Object.keys(expected).map(language => {
    const link = element();
    link.dataset.lang = language;
    link.setAttribute("aria-current", "true");
    return link;
  });
  const image = element();
  const document = {
    documentElement: {},
    getElementById(id) { assert.ok(nodes[id], `Unknown element ${id}`); return nodes[id]; },
    querySelector(selector) { assert.equal(selector, ".device img"); return image; },
    querySelectorAll(selector) { assert.equal(selector, "[data-lang]"); return languageLinks; },
  };
  vm.runInNewContext(code, {
    document, URLSearchParams,
    location: { search },
    navigator: { language: browserLanguage },
  }, { filename: fileURLToPath(new URL("assets/site.js", root)) });
  assert.equal(nodes.store.href, storeURL);
  assert.equal(nodes.store.textContent, expected[locale].text);
  assert.equal(document.documentElement.lang, expected[locale].language);
  assert.equal(nodes["privacy-link"].href, "./privacy/#" + locale);
  assert.equal(nodes["support-link"].href, "./support/#" + locale);
  assert.ok(document.title.startsWith("BondSet"));
  for (const link of languageLinks) {
    assert.equal(link.getAttribute("aria-current"), link.dataset.lang === locale ? "true" : undefined);
  }
}

for (const locale of Object.keys(expected)) check("?lang=" + locale, "en-US", locale);
for (const [browser, locale] of [
  ["zh-CN", "zh"], ["zh-TW", "zh-hant"], ["zh-HK", "zh-hant"],
  ["zh-Hant", "zh-hant"], ["zh-Hans", "zh"], ["ja-JP", "ja"],
  ["ko-KR", "ko"], ["en-US", "en"], ["fr-FR", "en"],
]) check("", browser, locale);
check("?lang=ja", "ko-KR", "ja");
check("?lang=unknown", "zh-TW", "en");

assert.equal(readFileSync(new URL("app-ads.txt", root), "utf8").trim(),
  "google.com, pub-2642408114689975, DIRECT, f08c47fec0942fa0");
console.log("Static no-JavaScript download link, five locales, language fallbacks and current privacy/support links passed.");
console.log("Official App Store URL, preserved orange button and authorization publisher ID passed.");
