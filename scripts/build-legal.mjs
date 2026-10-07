// 1.4.51: builds public/privacy.html (4 languages) from scripts/legal-src.py; zh-TW / zh-CN via OpenCC.
// Usage: node scripts/build-legal.mjs [outDir] [--support] ; prints nothing on success.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
const src = JSON.parse(execFileSync('python3', ['-c', `import json,runpy;d=runpy.run_path('${new URL('./legal-src.py', import.meta.url).pathname}');print(json.dumps({k:d[k] for k in ['EFFECTIVE','MAIL','ZH','EN','SUPPORT_ZH','SUPPORT_EN']}))`]).toString());
const tw = OpenCC.Converter({ from: 'hk', to: 'twp' });
const cn = OpenCC.Converter({ from: 'hk', to: 'cn' });
const twFix = (s) => tw(s).replace(/推送/g, '推播').replace(/私隱/g, '隱私').replace(/網絡/g, '網路').replace(/香港個人資料隱私專員公署/g, '香港個人資料私隱專員公署');
const cnFix = (s) => cn(s).replace(/私隐/g, '隐私').replace(/香港个人资料隐私专员公署/g, '香港个人资料私隐专员公署').replace(/台灣|臺灣/g, '台湾');
const style = `body{font:16px/1.65 system-ui,-apple-system,"PingFang TC","Noto Sans TC",sans-serif;max-width:780px;margin:24px auto;padding:0 18px 48px;color:#243026}
h1{font-size:23px;margin-bottom:4px}h2{font-size:19px;margin-top:34px;border-bottom:1px solid #dfe6df;padding-bottom:4px}h3{font-size:16px;margin:22px 0 4px}
.meta{color:#6f7a71}a{color:#2f6f3a}ul{padding-left:22px}li{margin:3px 0}nav a{margin-right:14px}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #dfe6df;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f3f7f2}`;
export function page({ title, nav, sections }) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
${style}
</style>
</head>
<body>
<h1>${title}</h1>
<p class="meta">生效日期 Effective date：${src.EFFECTIVE} · 聯絡 Contact：<a href="mailto:${src.MAIL}">${src.MAIL}</a></p>
<nav>${nav}</nav>
${sections.map(([id, lang, h, body]) => `<section id="${id}" lang="${lang}">\n<h2>${h}</h2>\n${body}\n</section>`).join('\n')}
</body>
</html>
`;
}
export const META = { effective: src.EFFECTIVE, mail: src.MAIL };
/** [id, lang, heading, html] per language. kind = 'privacy' | 'support'. */
export function parts(kind) {
  const zh = kind === 'privacy' ? src.ZH : src.SUPPORT_ZH;
  const en = kind === 'privacy' ? src.EN : src.SUPPORT_EN;
  return [['zh-hk', 'zh-HK', '繁體中文（香港）', zh], ['zh-tw', 'zh-TW', '繁體中文（台灣）', twFix(zh)], ['zh-cn', 'zh-CN', '简体中文', cnFix(zh)], ['en', 'en', 'English', en]];
}
export function privacy(termsHref) {
  return page({
    title: '世界之樹 World Tree — 私隱政策 / Privacy Policy',
    nav: `<a href="#zh-hk">繁體中文（香港）</a><a href="#zh-tw">繁體中文（台灣）</a><a href="#zh-cn">简体中文</a><a href="#en">English</a>${termsHref ? `<a href="${termsHref}">使用條款 Terms</a>` : ''}`,
    sections: [
      ['zh-hk', 'zh-HK', '繁體中文（香港）', src.ZH],
      ['zh-tw', 'zh-TW', '繁體中文（台灣）', twFix(src.ZH)],
      ['zh-cn', 'zh-CN', '简体中文', cnFix(src.ZH)],
      ['en', 'en', 'English', src.EN],
    ],
  });
}
export function support(privacyHref) {
  return page({
    title: '世界之樹 World Tree — 支援 / Support',
    nav: `<a href="#zh-hk">繁體中文（香港）</a><a href="#zh-tw">繁體中文（台灣）</a><a href="#zh-cn">简体中文</a><a href="#en">English</a><a href="${privacyHref}">私隱政策 Privacy</a>`,
    sections: [
      ['zh-hk', 'zh-HK', '繁體中文（香港）', src.SUPPORT_ZH],
      ['zh-tw', 'zh-TW', '繁體中文（台灣）', twFix(src.SUPPORT_ZH)],
      ['zh-cn', 'zh-CN', '简体中文', cnFix(src.SUPPORT_ZH)],
      ['en', 'en', 'English', src.SUPPORT_EN],
    ],
  });
}
if (process.argv[1]?.endsWith('build-legal.mjs')) {
  process.chdir(new URL('..', import.meta.url).pathname);
  fs.writeFileSync('public/privacy.html', privacy('terms.html'));
  fs.writeFileSync('public/support.html', support('privacy.html'));
}
