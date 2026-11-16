const release = {
  available: false,
  url: "https://apps.apple.com/app/id6827380778",
};

const translations = {
  zh: {
    lang: "zh-Hans",
    title: "BondSet · 排球战术游戏",
    intro: "BondSet 是一款六人制排球战术游戏。担任二传，读懂拦网和队友跑位，选出这一球的攻手，带领原创校队征战联赛。",
    screenshot: "BondSet 实机画面，二传正在为黑汐队选择进攻路线。",
    upcoming: "即将登陆 App Store",
    download: "在 App Store 下载",
    privacy: "隐私政策",
    privacyAnchor: "zh",
    support: "联系支持",
    languageMenu: "语言",
    footerMenu: "隐私政策和支持",
    badge: "zh-cn",
  },
  "zh-hant": {
    lang: "zh-Hant",
    title: "BondSet · 排球戰術遊戲",
    intro: "BondSet 是一款六人制排球戰術遊戲。擔任舉球員，讀懂對手的攔網和隊友跑位，選出這一球的攻擊手，帶領原創校隊征戰聯賽。",
    screenshot: "BondSet 實機畫面，舉球員正在為黑汐隊選擇進攻路線。",
    upcoming: "即將登上 App Store",
    download: "在 App Store 下載",
    privacy: "隱私權政策",
    privacyAnchor: "zh-hant",
    support: "聯絡支援",
    languageMenu: "語言",
    footerMenu: "隱私權政策與支援",
    badge: "zh-tw",
  },
  ja: {
    lang: "ja",
    title: "BondSet · バレーボール戦術ゲーム",
    intro: "BondSetは6人制バレーボールの戦術ゲーム。セッターとしてブロックと味方の動きを読み、誰にトスを上げるかを決めよう。オリジナルの学校チームを率いてリーグを戦おう。",
    screenshot: "BondSetの試合画面。黒潮チームのセッターが攻撃の選択肢を見極めている。",
    upcoming: "App Storeで近日公開",
    download: "App Storeからダウンロード",
    privacy: "プライバシーポリシー",
    privacyAnchor: "ja",
    support: "サポート",
    languageMenu: "言語",
    footerMenu: "プライバシーポリシーとサポート",
    badge: "ja-jp",
  },
  ko: {
    lang: "ko",
    title: "BondSet · 배구 전략 게임",
    intro: "BondSet은 6인제 배구 전략 게임입니다. 세터가 되어 상대의 블로킹과 팀원의 움직임을 읽고, 누구에게 토스할지 결정하세요. 나만의 학교 팀을 이끌고 리그에 도전하세요.",
    screenshot: "BondSet 경기 화면. 구로시오 팀의 세터가 공격 경로를 선택하고 있습니다.",
    upcoming: "App Store 출시 예정",
    download: "App Store에서 다운로드",
    privacy: "개인정보 처리방침",
    privacyAnchor: "ko",
    support: "지원 문의",
    languageMenu: "언어",
    footerMenu: "개인정보 처리방침 및 지원",
    badge: "ko-kr",
  },
  en: {
    lang: "en",
    title: "BondSet · Volleyball Strategy Game",
    intro: "BondSet is a six-on-six volleyball strategy game. Play as the setter, read the block and your teammates’ runs, and pick your hitter. Lead an original school team through the league.",
    screenshot: "An BondSet match. Kuroshio’s setter is choosing an attack option.",
    upcoming: "Coming soon to the App Store",
    download: "Download on the App Store",
    privacy: "Privacy Policy",
    privacyAnchor: "en",
    support: "Contact Support",
    languageMenu: "Language",
    footerMenu: "Privacy and support",
    badge: "en-us",
  },
};

const requestedLanguage = new URLSearchParams(location.search).get("lang");
const preferredLanguage = (requestedLanguage || navigator.language).toLowerCase();
const [language, ...subtags] = preferredLanguage.split("-");
const traditionalChinese = language === "zh"
  && !subtags.includes("hans")
  && subtags.some((tag) => ["hant", "tw", "hk", "mo"].includes(tag));
const preferredLocale = traditionalChinese ? "zh-hant" : language;
const locale = Object.hasOwn(translations, preferredLocale) ? preferredLocale : "en";
const copy = translations[locale];

document.documentElement.lang = copy.lang;
document.title = copy.title;
document.getElementById("intro").textContent = copy.intro;
document.querySelector(".device img").alt = copy.screenshot;
document.getElementById("language-menu").setAttribute("aria-label", copy.languageMenu);
document.getElementById("footer-menu").setAttribute("aria-label", copy.footerMenu);
document.querySelectorAll("[data-lang]").forEach((link) => {
  if (link.dataset.lang === locale) {
    link.setAttribute("aria-current", "true");
  } else {
    link.removeAttribute("aria-current");
  }
});

const privacy = document.getElementById("privacy-link");
privacy.textContent = copy.privacy;
privacy.href = "./privacy/#" + copy.privacyAnchor;
const support = document.getElementById("support-link");
support.textContent = copy.support;
support.href = "./support/#" + locale;

const store = document.getElementById("store");
store.textContent = copy.upcoming;

if (release.available) {
  const link = document.createElement("a");
  link.className = "store-badge";
  link.href = release.url;

  const badge = document.createElement("img");
  badge.src = "./assets/app-store-" + copy.badge + ".svg";
  badge.alt = copy.download;
  badge.height = 47;
  link.append(badge);
  store.replaceWith(link);
}
