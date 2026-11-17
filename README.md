<h1><img src="assets/icon.png" width="42" alt=""> BondSet</h1>

BondSet is a six-on-six volleyball strategy game for iPhone. Play as the setter, read the block and your teammates’ movement, choose your hitter, and lead your school team through the league.

BondSet 是一款 iPhone 六人制排球战术游戏。担任二传，观察对手拦网和队友跑位，选出这一球的攻手，带领校队征战联赛。

[BondSet 官方网站](https://easonzz.github.io/Airborne/)

[前往 App Store 下载](https://apps.apple.com/us/app/bondset-trust-on-the-court/id6827380778)

官网首页的下载入口已切换为正式 App Store 商品页；保留原橙色按钮样式，简中、繁中、日文、韩文、英文均显示对应下载文字。不依赖 JavaScript 的静态 HTML 也可以点击下载。

## 隐私与支持

官网地址保留 `/Airborne/`，不改仓库名称。

- [隐私政策](privacy/index.html)提供简体中文、繁體中文、日本語、한국어、English，各语言入口与[支持页](support/index.html)和[首页](assets/site.js)对应。
- 网页政策的新增译文不改变数据处理方式。1.0（build 7）内置政策仍为英／简中；不会因网站更新自动变化，本次下载入口更新也不需重建 App。
- 公网生效需由用户将本仓库 main 推送到 GitHub，并确认 Pages 部署成功；本地提交不等于线上发布。

## AdMob 授权与验证

- 本仓库的[广告授权文件](app-ads.txt)已存在，发布后的项目地址为 `https://easonzz.github.io/Airborne/app-ads.txt`。
- AdMob 从 App Store 的 Marketing URL 提取 hostname，因此实际抓取 `https://easonzz.github.io/app-ads.txt`。GitHub 仓库根目录不等于网站域名根路径；项目目录里的文件不能替代域名根路径文件。
- 2026-11-17 实查两处均 HTTP 200、`text/plain; charset=utf-8`，内容都为正确发布者授权行。已公开的 App Store 数据中 sellerUrl 是现有 `https://easonzz.github.io/Airborne/`，无需改为 GitHub 仓库地址或完整 txt 地址。
- 不需要再创建任何仓库或迁移官网；现有域名根路径文件应保留。不要仅为 AdMob 空列表重复上传、删除现有根站点或更换域名。
- 最新 AdMob 截图已关联商店 ID `6827380778`，应用验证为「未经验证」、审批状态为「需要审核」。在 BondSet → 应用设置 → 应用验证中点 **Verify app** 后，10:08截图提示「详细信息与AdMob账号中的信息不一致」，并非明确HTTP404。截图提供的授权片段与两处线上文件字节一致，无BOM，不能据此擅自改发布者ID或认定根站点方案错误。
- 在这个验证页点击 **检查是否更新／Check for updates**，记录检查时间及结果。刚关联商店或更新网站时可有识别／抓取延迟，官方建议至少等待24小时再看状态，页面另提示域名变更识别最长可能需7天；不保证立即验证成功，也不要求频繁重传相同文件。
- 如果更新检查后仍失败，核对验证页显示的实际请求 URL 和抓取时间；本地模拟Google-adstxt User-Agent可读不等于真实Google抓取已成功。旧缓存、不同抓取URL或Google端访问问题尚未确定，不能将其中一种写成已确认原因。文件和商店关联均正确仍持续失败时，携App ID、商店ID、根URL及错误截图联系Google官方支持。
- 验证通过后继续应用就绪审核；公开文件可访问不代表账号／应用已批准正式投放。空的app-ads.txt列表也不能独立证明文件放错。

官方：[Google的hostname与根路径规则](https://support.google.com/admob/answer/9363762?hl=en)、[应用验证的Check for updates流程](https://support.google.com/admob/answer/14538460?hl=en)、[排查验证与抓取问题](https://support.google.com/admob/answer/9776740?hl=en)。

## 本地验证

```sh
node --check assets/site.js
node tools/check-homepage.mjs
python3 -B tools/check-policy-localizations.py
```

首页检查使用真实脚本和轻量 DOM 测试替身覆盖下载链接、五语及浏览器语言回退；不是浏览器视觉测试。不会请求正式广告或部署网站。
