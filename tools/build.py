# -*- coding: utf-8 -*-
"""
產生全站 HTML 同 js/products.js
用法（喺網站資料夾入面）：  python3 tools/build.py
"""
import json, os, html, re
from products_data import PRODUCTS, FILTERS, HKTVMALL_STORE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://pierrot.com.hk"
P = {p["id"]: p for p in PRODUCTS}
e = html.escape


def buy_url(p=None):
    return (p or {}).get("hktvmall") or HKTVMALL_STORE


def img(pid, size="sm"):
    return f"/Assets/products/{pid}{'-sm' if size == 'sm' else ''}.webp"


# ---------------------------------------------------------------- icons
ICON = {
    "sensitive": '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    "whitening": '<path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.7l-1.6-5.5L5 10.6 10.4 9z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    "gum": '<path d="M12 21s-7-4.4-7-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 16.6 12 21 12 21z"/>',
    "cavity": '<path d="M12 3 5 6v5.5c0 4.3 3 8 7 9.5 4-1.5 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    "fresh": '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M3 17h7"/>',
    "kids": '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0"/><circle cx="9" cy="10" r=".6" fill="currentColor"/><circle cx="15" cy="10" r=".6" fill="currentColor"/>',
    "mouthwash": '<path d="M12 3.5s-6 6.6-6 10.8a6 6 0 0 0 12 0C18 10.1 12 3.5 12 3.5z"/>',
    "hap": '<path d="M12 2.8 19.8 7.3v9L12 20.8 4.2 16.3v-9z"/><circle cx="12" cy="12" r="2.6"/>',
    "check": '<path d="m5 12.5 4.2 4.2L19 7"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "cart": '<path d="M3.5 4.5h2l2.2 10.2h10.6l2-7.2H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
    "leaf": '<path d="M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
    "quiz": '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8v.5"/><circle cx="12" cy="16.9" r=".6" fill="currentColor"/>',
}


def icon(name, cls="icon"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>')


def leaf_badge():
    return ('<span class="badge badge-leaf"><svg class="icon" viewBox="0 0 24 24" fill="#4F8A3E" aria-hidden="true">'
            '<path d="M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14z"/></svg>天然成分</span>')


def spain_badge():
    return '<span class="badge badge-spain"><span class="flag-chip" aria-hidden="true"></span>西班牙原廠</span>'


# ---------------------------------------------------------------- layout
CUR = ' aria-current="page"'
NAV = [("/products/", "產品系列", "products"), ("/hap/", "HAP 科技", "hap"),
       ("/quiz/", "揀牙膏測驗", "quiz"), ("/about/", "品牌故事", "about"),
       ("/where-to-buy/", "購買渠道", "buy")]


def layout(*, path, title, desc, body, active="", og_img="/Assets/web/hap-models.webp",
           extra_head="", scripts=()):
    base = "../" * (path.strip("/").count("/") + (0 if path.endswith(".html") or path == "/" else 1)) if path != "/" else ""
    nav = "".join(
        f'<a href="{h}"{CUR if k == active else ""}>{t}</a>' for h, t, k in NAV)
    js = "".join(f'<script src="{s}"></script>' for s in ("/js/tracking.js", "/js/main.js", *scripts))
    return relativize(f"""<!DOCTYPE html>
<html lang="zh-Hant-HK" data-base="{base}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE}{og_img}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:locale" content="zh_HK">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/pages.css">
{extra_head}
</head>
<body>
<a class="skip-link" href="#main">跳至主要內容</a>

<header class="site-header" id="siteHeader">
  <div class="header-inner">
    <a href="/" class="logo-lockup" aria-label="Pierrot 貝潔得 首頁">
      <img src="/Assets/Logo/pierrot.png" alt="Pierrot oral care" class="logo-img">
      <span class="logo-divider" aria-hidden="true"></span>
      <img src="/Assets/Logo/貝潔得-logo.png" alt="貝潔得" class="logo-zh-img">
    </a>
    <nav class="site-nav" aria-label="主要導覽">{nav}</nav>
    <a href="/quiz/" class="header-buy"><span class="hq-spark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7.6 4C5.3 4 3.8 5.9 3.8 8.4c0 2.3 1 3.9 1.6 6.2.5 2.4.9 4.9 2.4 4.9 1.4 0 1.7-2 2.2-3.9.3-1 .8-1.6 1.7-1.6s1.4.6 1.7 1.6c.5 1.9.8 3.9 2.2 3.9 1.5 0 1.9-2.5 2.4-4.9.6-2.3 1.6-3.9 1.6-6.2C19.6 5.9 18.1 4 15.8 4c-1.7 0-2.6.9-4.1.9S9.3 4 7.6 4z" fill="#fff"/><path d="M6.6 8.2c.3-1 1-1.6 2-1.6" fill="none" stroke="#9FD8F7" stroke-width="1.4" stroke-linecap="round"/><path d="M20.5 1.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="#fff"/></svg></span><span class="hq-text"><small>30 秒</small>揀牙膏測驗</span><span class="hq-arrow" aria-hidden="true">→</span></a>
    <button class="nav-toggle" aria-label="開啟導覽選單" aria-expanded="false" aria-controls="mobileNav">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="mobile-nav" id="mobileNav" aria-label="手機導覽">{nav}</nav>
</header>

<main id="main">
{body}
</main>

<footer class="site-footer">
  <div class="footer-cols section-inner">
    <div class="footer-brand">
      <div class="footer-logo">
        <img src="/Assets/Logo/pierrot.png" alt="Pierrot oral care" class="logo-img logo-img-footer">
        <img src="/Assets/Logo/貝潔得-logo.png" alt="貝潔得" class="logo-zh-img">
      </div>
      <p>1945 年創立於西班牙 · 專業口腔護理</p>
      <div class="footer-social">
        <a href="https://www.instagram.com/pierrot.oralcare.hk/" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61593249612863" target="_blank" rel="noopener" class="social-icon" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M13.5 20.4v-6.2h2.1l.3-2.4h-2.4V10.2c0-.7.2-1.2 1.2-1.2h1.3V6.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.7H8.9v2.4H11v6.2"/></svg>
        </a>
      </div>
    </div>
    <div>
      <h3>產品</h3>
      <a href="/products/?f=hap">HAP 系列</a>
      <a href="/products/?f=sensitive">防敏感</a>
      <a href="/products/?f=whitening">亮白</a>
      <a href="/products/?f=gum">護齦</a>
      <a href="/products/?f=kids">兒童</a>
      <a href="/products/?f=mouthwash">漱口水</a>
    </div>
    <div>
      <h3>了解更多</h3>
      <a href="/hap/">HAP 科技</a>
      <a href="/quiz/">揀牙膏測驗</a>
      <a href="/about/">品牌故事</a>
      <a href="/where-to-buy/">購買渠道</a>
      <a href="https://www.pierrot.es" target="_blank" rel="noopener">Pierrot 西班牙官網 →</a>
    </div>
  </div>
  <p class="footer-copy">© 2026 Pierrot 貝潔得 Hong Kong · 香港總代理：華達藥業有限公司</p>
</footer>
{js}
</body>
</html>
""", base)


def relativize(doc, base):
    """將 href="/..." src="/..." 改做相對路徑，令網站喺本機 / Live Server / Cloudflare 都正常"""
    def fix(m):
        attr, url = m.group(1), m.group(2)
        path, q = (url.split("?", 1) + [""])[:2]
        if path.endswith("/"):
            path += "index.html"
        rel = base + path.lstrip("/")
        return f'{attr}="{rel}{"?" + q if q else ""}"'
    doc = re.sub(r'(href|src)="(/(?!/)[^"]*)"', fix, doc)
    def fix_set(m):
        parts = [x.strip() for x in m.group(1).split(",")]
        out = []
        for part in parts:
            url, *rest = part.split(" ", 1)
            if url.startswith("/") and not url.startswith("//"):
                url = base + url.lstrip("/")
            out.append(" ".join([url] + rest))
        return 'srcset="' + ", ".join(out) + '"'
    return re.sub(r'srcset="([^"]*)"', fix_set, doc)


# ---------------------------------------------------------------- components
def product_card(p, source="grid"):
    tags = " ".join(p["filters"])
    return f"""<article class="p-card" data-filters="{tags}">
  <a href="/products/{p['id']}.html" class="p-card-img">
    <img src="{img(p['id'])}" alt="Pierrot {e(p['name'])}" loading="lazy" width="600" height="600">
  </a>
  <div class="p-card-body">
    <p class="p-card-cat">{e(p['category'])}{(' · ' + p['size']) if p.get('size') else ''}</p>
    <h3><a href="/products/{p['id']}.html">{e(p['name'])}</a></h3>
    <p class="p-card-line">{e(p['tagline'])}</p>
    <div class="p-card-actions">
      <a href="/products/{p['id']}.html" class="btn btn-outline btn-sm">了解更多</a>
      <a href="{buy_url(p)}" class="btn btn-primary btn-sm" data-buy="{p['id']}" data-source="{source}" target="_blank" rel="noopener">立即購買</a>
    </div>
  </div>
</article>"""


def mini_card(p, label, source):
    return f"""<a class="mini-card" href="/products/{p['id']}.html">
  <img src="{img(p['id'])}" alt="" loading="lazy" width="600" height="600">
  <span><small>{e(label)}</small>{e(p['name'])}</span>
</a>"""


NEED_TILES = [
    ("sensitive", "防敏感", "冷熱酸甜都自在"),
    ("whitening", "亮白", "回復自然光澤"),
    ("gum", "護齦", "呵護牙齦健康"),
    ("fresh", "清新口氣", "持久清新"),
    ("cavity", "預防蛀牙", "日常防蛀保養"),
    ("kids", "小朋友護齒", "2 歲起愛上刷牙"),
]


def need_tiles():
    return "".join(
        f'<a class="need-tile reveal" href="/products/?f={k}"><img src="/Assets/icons/need-{k}.webp" alt="" class="need-ico" width="400" height="400"><strong>{t}</strong><span>{s}</span></a>'
        for k, t, s in NEED_TILES)


def quiz_band():
    return f"""<section class="quiz-band" aria-labelledby="quiz-band-h">
  <div class="section-inner quiz-band-inner reveal">
    <div>
      <p class="eyebrow">唔知揀邊款？</p>
      <h2 id="quiz-band-h">30 秒搵啱你嘅牙膏</h2>
      <p>答幾條簡單問題，我哋按你嘅需要推薦最合適嘅產品組合。</p>
    </div>
    <a href="/quiz/" class="btn btn-lg btn-white">{icon("quiz")}開始測驗</a>
  </div>
</section>"""


# ---------------------------------------------------------------- pages
def page_products():
    chips = "".join(
        f'<button class="chip" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{t}</button>'
        for k, t in FILTERS)
    cards = "\n".join(product_card(p) for p in PRODUCTS)
    body = f"""
<section class="page-hero">
  <div class="section-inner">
    <p class="eyebrow">產品系列</p>
    <h1>全部產品</h1>
    <p class="section-lead">西班牙原廠製造，由防敏感、亮白、護齦到兒童護理，總有一款啱你。</p>
  </div>
</section>
<section class="plist">
  <div class="section-inner">
    <div class="chip-row" role="group" aria-label="按功效篩選">{chips}</div>
    <p class="plist-count" aria-live="polite"><span id="pcount">{len(PRODUCTS)}</span> 款產品</p>
    <div class="p-grid" id="pgrid">
{cards}
    </div>
  </div>
</section>
{quiz_band()}
"""
    return layout(path="/products/", title="全部產品 | Pierrot 貝潔得",
                  desc="Pierrot 貝潔得全系列：HAP 升級雙效牙膏、防敏感、亮白、護齦、清新口氣、兒童牙膏及漱口水。西班牙原廠製造。",
                  body=body, active="products", scripts=("/js/products-filter.js",))


def page_product(p):
    pts = "".join(f'<li>{icon("check", "icon li-ico")}<div><strong>{e(a)}</strong><span>{e(b)}</span></div></li>' for a, b in p["points"])
    suit = "".join(f'<li>{icon("check", "icon li-ico")}{e(s)}</li>' for s in p["suitable"])
    ingr = "".join(f'<div class="ingr"><strong>{e(a)}</strong><span>{e(b)}</span></div>' for a, b in p["ingredients"])
    badges = (leaf_badge() if p.get("natural") else "") + spain_badge()
    if "hap" in p["filters"]:
        badges = '<span class="badge badge-hap">HAP 升級雙效</span>' + badges
    note = f'<p class="pd-note">{e(p["note"])}</p>' if p.get("note") else ""
    up = ""
    if p.get("upgrade"):
        u = P[p["upgrade"]]
        up = f'<p class="pd-note pd-note-info">想再升級？<a href="/products/{u["id"]}.html">{e(u["name"])}</a> 加入 HAP 仿天然琺瑯質微粒，雙效呵護敏感牙齒。</p>'
    gum = '<p class="pd-small">如牙齦持續出血、腫痛，請諮詢牙醫。</p>' if p.get("gum_note") else ""
    pair = P[p["pair"]]
    rel = "".join(mini_card(P[r], "相關產品", "related") for r in p["related"] if r != p["pair"])
    ld = {
        "@context": "https://schema.org", "@type": "Product",
        "name": f"Pierrot 貝潔得 {p['name']}", "alternateName": f"Pierrot {p['en']}",
        "image": f"{SITE}{img(p['id'], 'lg')}", "description": p["intro"],
        "brand": {"@type": "Brand", "name": "Pierrot 貝潔得"},
        "countryOfOrigin": "ES", "category": p["category"],
    }
    body = f"""
<nav class="crumbs section-inner" aria-label="麵包屑"><a href="/">首頁</a><span>/</span><a href="/products/">產品系列</a><span>/</span><span aria-current="page">{e(p['name'])}</span></nav>
<section class="pd" data-product="{p['id']}">
  <div class="section-inner pd-grid">
    <div class="pd-media">
      <img src="{img(p['id'], 'lg')}" alt="Pierrot 貝潔得 {e(p['name'])}" width="1200" height="1200">
    </div>
    <div class="pd-info">
      <div class="badge-row">{badges}</div>
      <p class="pd-cat">{e(p['category'])} · {e(p['en'])}{(' · ' + p['size']) if p.get('size') else ''}</p>
      <h1>{e(p['name'])}</h1>
      <p class="pd-headline pd-{p['accent']}">{e(p['headline'])}</p>
      <p class="pd-intro">{e(p['intro'])}</p>
      <ul class="pd-points">{pts}</ul>
      {note}{up}
      <div class="pd-actions">
        <a href="{buy_url(p)}" class="btn btn-primary btn-lg" data-buy="{p['id']}" data-source="product_page" target="_blank" rel="noopener">{icon("cart")}立即購買</a>
        <a href="/quiz/" class="btn btn-outline btn-lg">唔肯定？做個測驗</a>
      </div>
    </div>
  </div>
</section>

<section class="pd-more">
  <div class="section-inner pd-more-grid">
    <div class="pd-box reveal">
      <h2>適合你，如果…</h2>
      <ul class="pd-suit">{suit}</ul>
    </div>
    <div class="pd-box reveal">
      <h2>使用方法</h2>
      <p class="pd-usage">{e(p['usage'])}</p>
      {gum}
    </div>
  </div>
</section>

<section class="pd-pair">
  <div class="section-inner">
    <p class="eyebrow reveal">配搭使用</p>
    <h2 class="reveal">一齊用，護理更全面</h2>
    <div class="pair-row reveal">
      {mini_card(pair, "建議配搭", "pair")}
      {rel}
    </div>
  </div>
</section>

<div class="buy-bar" aria-hidden="false">
  <span>{e(p['name'])}</span>
  <a href="{buy_url(p)}" class="btn btn-primary btn-sm" data-buy="{p['id']}" data-source="sticky_bar" target="_blank" rel="noopener">立即購買</a>
</div>
"""
    return layout(path=f"/products/{p['id']}.html", title=f"{p['name']} | Pierrot 貝潔得",
                  desc=f"Pierrot 貝潔得 {p['name']}：{p['tagline']}。西班牙原廠製造，HKTVmall 有售。",
                  body=body, active="products", og_img=img(p["id"], "lg"),
                  extra_head=f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')


HAP_FAQ = [
    ("HAP 係咩？", "HAP（Hydroxyapatite，羥基磷灰石）係牙齒琺瑯質嘅主要礦物成分。Pierrot 採用 HAP（Micro）仿天然琺瑯質微粒，結構接近牙齒琺瑯質，有助填補牙齒表面嘅微細孔洞，令牙齒表面更平滑緊密。"),
    ("HAP 牙膏同一般含氟牙膏有咩分別？", "一般含氟牙膏主要靠氟化物強化琺瑯質、預防蛀牙。Pierrot HAP 升級雙效系列同時含有 HAP 同氟化物：HAP 負責填補表面微細孔洞，氟化物負責強化琺瑯質、預防蛀牙，兩者各司其職。"),
    ("市面上有唔少 HAP 牙膏，Pierrot 有咩唔同？", "唔少 HAP 牙膏係無氟配方。Pierrot HAP 升級雙效系列保留 1450ppm 氟化物，同時加入 HAP 仿天然琺瑯質微粒，雙效配合，由西班牙原廠製造。"),
    ("亮白版同抗敏版點揀？", "如果最想改善牙齒對冷熱酸甜敏感，揀 HAP升級雙效抗敏牙膏，配方較溫和；如果想牙齒更光滑亮澤、去除日常茶漬咖啡漬，揀 HAP升級雙效亮白牙膏。兩樣都想兼顧？可以做我哋嘅 30 秒測驗。"),
    ("可以每日用嗎？", "可以。建議每天早晚刷牙最少兩次，每次約兩分鐘，持續使用。"),
    ("幾耐見效？", "效果因人而異。建議配合正確刷牙習慣，持續每日使用。如牙齒敏感持續或加劇，請諮詢牙醫。"),
    ("小朋友可以用嗎？", "HAP 升級雙效系列係成人配方，12 歲以下兒童請在成人監督下使用。2 歲或以上小朋友，可以揀我哋嘅兒童啫喱牙膏。"),
]


def page_hap():
    s, w = P["hap-sensitive"], P["hap-whitening"]
    faq = "".join(f'<details class="faq-item"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in HAP_FAQ)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in HAP_FAQ]}

    def hap_card(p, tone, title, who):
        pts = "".join(f'<li>{icon("check", "icon li-ico")}{e(a)}</li>' for a, _ in p["points"])
        return f"""<article class="hap-pick hap-pick-{tone} reveal">
  <span class="hap-pick-tag">{title}</span>
  <h3>{e(p['name'])}</h3>
  <p class="hap-pick-who">{who}</p>
  <ul>{pts}</ul>
  <div class="hap-pick-actions">
    <a href="/products/{p['id']}.html" class="btn btn-outline btn-sm">產品詳情</a>
    <a href="{buy_url(p)}" class="btn btn-primary btn-sm" data-buy="{p['id']}" data-source="hap_page" target="_blank" rel="noopener">立即購買</a>
  </div>
</article>"""

    body = f"""
<section class="hap-info" aria-labelledby="hap-info-h">
  <div class="hap-info-inner">
    <h1 id="hap-info-h" class="sr-only">HAP 升級雙效系列：琺瑯填補技術</h1>
    <div class="sr-only">
      <p>琺瑯填補技術，填補牙齒表面微細孔洞。微米級琺瑯質同源成分 Micro HAP，95% 貼近天然琺瑯質。</p>
      <p>日常飲食、磨損會令牙齒表面出現肉眼睇唔到嘅微細孔洞同刮痕，仿天然琺瑯質微粒有助填補呢啲孔洞同刮痕。</p>
      <p>填補表面微孔；表面更平滑，減少色素依附，牙齒更有光澤；舒緩敏感，減少冷、熱、酸、甜對牙齒嘅刺激。</p>
      <p>HAP升級雙效亮白牙膏：重拾亮白笑容。HAP升級雙效抗敏牙膏：舒緩牙齒敏感不適。</p>
    </div>
    <img src="/Assets/web/hap-info-1.webp" alt="" width="1080" height="1263" fetchpriority="high">
    <img src="/Assets/web/hap-info-2.webp" alt="" width="1080" height="1263">
    <img src="/Assets/web/hap-info-3.webp" alt="" width="1080" height="1263" loading="lazy">
    <img src="/Assets/web/hap-info-4.webp" alt="" width="1080" height="1263" loading="lazy">
    <img src="/Assets/web/hap-info-5.webp" alt="" width="1080" height="1259" loading="lazy">
    <div class="hap-info-buy">
      <a href="{buy_url(w)}" class="hap-buy hap-buy-w" data-buy="{w['id']}" data-source="hap_page" target="_blank" rel="noopener"><small>HAP升級雙效</small>亮白牙膏 · 立即購買</a>
      <a href="{buy_url(s)}" class="hap-buy hap-buy-s" data-buy="{s['id']}" data-source="hap_page" target="_blank" rel="noopener"><small>HAP升級雙效</small>抗敏牙膏 · 立即購買</a>
    </div>
  </div>
</section>

<section class="faq">
  <div class="section-inner faq-inner">
    <p class="eyebrow reveal">常見問題</p>
    <h2 class="reveal">HAP 牙膏 FAQ</h2>
    <div class="faq-list reveal">{faq}</div>
  </div>
</section>

<section class="trust-strip">
  <div class="section-inner trust-strip-inner reveal">
    <div><span class="spain-flag-icon" aria-hidden="true"></span><strong>1945</strong> 創立於西班牙</div>
    <div>ISO 22716 認證</div>
    <div>ISO 13485 認證</div>
    <a href="{HKTVMALL_STORE}" class="btn btn-primary" data-buy="store" data-source="hap_trust" target="_blank" rel="noopener">{icon("cart")}立即購買</a>
  </div>
</section>
"""
    return layout(path="/hap/", title="HAP 牙膏 | HAP 升級雙效系列 | Pierrot 貝潔得",
                  desc="Pierrot HAP 升級雙效系列：HAP（Micro）仿天然琺瑯質微粒填補牙齒表面微細孔洞，加 1450ppm 氟化物強化琺瑯質。亮白與抗敏兩款配方，西班牙原廠製造。",
                  body=body, active="hap", og_img=img("hap-sensitive", "lg"),
                  extra_head=f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>')


def page_quiz():
    body = """
<section class="quiz-sec">
  <div class="section-inner quiz-wrap">
    <div class="quiz-head">
      <p class="eyebrow">揀牙膏測驗</p>
      <h1>30 秒搵啱你嘅牙膏</h1>
      <p class="section-lead">答幾條簡單問題，我哋按你嘅需要推薦產品組合。</p>
    </div>
    <div class="quiz-card" id="quiz" aria-live="polite">
      <noscript><p>測驗需要啟用 JavaScript。你亦可以<a href="/products/">瀏覽全部產品</a>。</p></noscript>
    </div>
    <p class="quiz-disclaimer">以上建議只供參考，唔可以代替專業意見。如有持續不適，請諮詢牙醫。</p>
  </div>
</section>
"""
    return layout(path="/quiz/", title="30 秒揀牙膏測驗 | Pierrot 貝潔得",
                  desc="唔知揀邊款牙膏？答幾條問題，按你嘅需要推薦 Pierrot 貝潔得牙膏同漱口水組合。",
                  body=body, active="quiz", scripts=("/js/products.js", "/js/quiz.js"))


MILESTONES = [
    ("1945", "一切由此開始", "Pierrot 品牌喺西班牙誕生，以品質、創新同貼心服務守護口腔健康。", "1945-brand"),
    ("1989", "走向國際", "Pierrot 開始拓展海外市場，將口腔護理帶到唔同國家同文化。", None),
    ("2006", "全新廠房", "啟用現代化高效廠房，持續提升設施、設備同產品質素。", "factory"),
    ("2007", "榮獲 Premio Cotidiano", "獲頒 Premio Cotidiano 獎項，表揚兼具功能、設計同創新，改善日常生活嘅產品。", None),
    ("2012", "專利創新：Sharky 兒童牙刷", "推出專利設計嘅 Sharky 兒童牙刷，令刷牙變得有趣又有效。", "sharky-parts"),
    ("2016", "全新實驗室", "自設實驗室，提升產能，更能掌握配方研發。", "line-filling"),
    ("2022", "推出 Pierrot Green", "可生物降解牙刷，可堆肥、純素、不含 BPA，並獲 FSC 認證。", None),
    ("2025", "80 周年", "八十年歷史，見證 Pierrot 喺口腔護理嘅專業，同埋對「西班牙製造」嘅堅持。", "line-brushes"),
]


def milestone_img(year, default):
    """Assets/about/<年份>.webp/.jpg/.png 存在就用嗰張（例如官方網站相），否則用預設 catalogue 相"""
    for ext in ("webp", "jpg", "jpeg", "png"):
        if os.path.exists(os.path.join(ROOT, "Assets", "about", f"{year}.{ext}")):
            return f"/Assets/about/{year}.{ext}"
    return f"/Assets/about/{default}.webp" if default else None


def page_about():
    cards = []
    for i, (y, t, d, im) in enumerate(MILESTONES):
        src = milestone_img(y, im)
        pic = f'<img src="{src}" alt="Pierrot {y}：{e(t)}" loading="lazy">' if src else ""
        cards.append(f"""<article class="ms-card{' ms-has-img' if src else ''}" style="--i:{i}">
  <p class="ms-year">{y}</p>
  <h3>{e(t)}</h3>
  <p>{e(d)}</p>
  {pic}
</article>""")
    body = f"""
<section class="about-hero" aria-labelledby="about-h">
  <div class="about-hero-media">
    <figure class="ah-main"><img src="/Assets/about/factory.webp" alt="Pierrot 西班牙廠房外貌" width="925" height="735" fetchpriority="high"></figure>
    <figure class="ah-sm ah-1"><img src="/Assets/about/line-toothpaste.webp" alt="Pierrot 牙膏生產線"></figure>
    <figure class="ah-sm ah-2"><img src="/Assets/about/line-filling.webp" alt="Pierrot 漱口水生產線"></figure>
    <figure class="ah-sm ah-3"><img src="/Assets/about/line-brush-head.webp" alt="Pierrot 牙刷生產"></figure>
    <figure class="ah-sm ah-4"><img src="/Assets/about/line-tubes.webp" alt="Pierrot 牙膏包裝"></figure>
  </div>
  <div class="about-hero-copy">
    <p class="ah-eyebrow"><span class="flag-chip" aria-hidden="true"></span>品牌故事 · Since 1945</p>
    <h1 id="about-h">源自西班牙，<br>1945 年至今</h1>
    <p class="ah-lead">由牙刷到牙膏、漱口水，Pierrot 全部喺西班牙自家廠房生產。八十年來專注口腔護理，產品銷售超過 60 個國家。</p>
    <dl class="ah-facts">
      <div><dt>1945</dt><dd>創立於西班牙</dd></div>
      <div><dt>80 年</dt><dd>專注口腔護理</dd></div>
      <div><dt>60+</dt><dd>個國家有售</dd></div>
      <div><dt>自家廠房</dt><dd>西班牙原廠生產</dd></div>
    </dl>
  </div>
</section>

<section class="milestones" aria-labelledby="ms-h">
  <div class="section-inner ms-grid">
    <div class="ms-intro">
      <p class="eyebrow eyebrow-light">里程碑</p>
      <h2 id="ms-h">我們的里程碑</h2>
      <p>由 1945 年創立，到成為西班牙以外都備受認可嘅口腔護理品牌，Pierrot 每一步都堅持品質、創新同責任。</p>
      <p>一路走嚟，我哋獲得國際認證、商業獎項，亦參與國際牙科展覽。呢啲里程碑唔係終點，而係推動我哋繼續進步嘅起點。</p>
    </div>
    <div class="ms-stack">
      {"".join(cards)}
    </div>
  </div>
</section>

<section class="certs">
  <div class="section-inner">
    <p class="eyebrow reveal">保證與認可</p>
    <h2 class="reveal">國際認證</h2>
    <div class="cert-grid">
      <div class="cert reveal"><strong>ISO 9001</strong><span>品質管理體系（AENOR 認證）</span></div>
      <div class="cert reveal"><strong>ISO 13485</strong><span>醫療器械品質管理體系</span></div>
      <div class="cert reveal"><strong>ISO 22716</strong><span>化妝品優良製造規範</span></div>
      <div class="cert reveal"><strong>EcoVadis</strong><span>企業可持續發展評估銀獎</span></div>
    </div>
  </div>
</section>

<section class="brand-story">
  <div class="section-inner">
    <p class="eyebrow reveal">原廠製造</p>
    <h2 class="reveal">你嘅牙刷，從何而來？</h2>
    <p class="section-lead reveal">由西班牙原廠製造流程，了解 Pierrot 點樣堅持 80 年嘅品質承諾。</p>
    <a class="video-frame reveal" href="https://www.youtube.com/watch?v=jcl7QS_8xTE" target="_blank" rel="noopener" aria-label="喺 YouTube 觀看：你嘅牙刷，從何而來？">
      <img src="https://img.youtube.com/vi/jcl7QS_8xTE/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/jcl7QS_8xTE/hqdefault.jpg';" alt="Pierrot Oral Care 品牌影片封面" class="video-thumb" loading="lazy">
      <span class="video-play-btn" aria-hidden="true"><svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M45 24 27 14v20" fill="#fff"/></svg></span>
    </a>
  </div>
</section>
"""
    return layout(path="/about/", title="品牌故事 | Pierrot 貝潔得",
                  desc="Pierrot 貝潔得 1945 年創立於西班牙，80 年口腔護理專業，銷售超過 60 個國家。ISO 9001、ISO 13485、ISO 22716 認證。",
                  body=body, active="about")


def buy_cards(source):
    return f"""<div class="buy-grid buy-grid-4">
      <div class="buy-card reveal">
        <span class="buy-mark buy-mark-logo"><img src="/Assets/Logo/hktvmall-mark.png" alt="HKTVmall" class="buy-mark-img"></span>
        <h3>HKTVmall</h3>
        <p>富山健康官方店舖</p>
        <a href="{HKTVMALL_STORE}" target="_blank" rel="noopener" class="btn btn-primary" data-buy="store" data-source="{source}">立即選購</a>
      </div>
      <div class="buy-card reveal">
        <span class="buy-mark buy-mark-solid"><img src="/Assets/Logo/Health3-logo.png" alt="Health3" class="buy-mark-img"></span>
        <h3>Health3</h3>
        <p>官方合作網店</p>
        <a href="https://www.health3.com.hk" target="_blank" rel="noopener" class="btn btn-primary" data-buy="health3" data-source="{source}">立即選購</a>
      </div>
      <div class="buy-card reveal">
        <span class="buy-mark"><img src="/Assets/Logo/wahtat-logo.png" alt="Wahtat" class="buy-mark-img"></span>
        <h3>Wahtat</h3>
        <p>官方合作網店</p>
        <a href="https://www.wahtat-hk.com/collections/貝潔得-pierrot" target="_blank" rel="noopener" class="btn btn-primary" data-buy="wahtat" data-source="{source}">立即選購</a>
      </div>
      <div class="buy-card reveal">
        <span class="buy-mark buy-mark-grey"><img src="/Assets/Logo/各大藥房藥行-logo.png" alt="各大藥房藥行" class="buy-mark-img"></span>
        <h3>各大藥房藥行</h3>
        <p>香港各區合作藥房</p>
      </div>
    </div>"""


def page_buy():
    body = f"""
<section class="page-hero">
  <div class="section-inner">
    <h1>購買渠道</h1>
    <p class="section-lead">Pierrot 貝潔得喺 HKTVmall、官方合作網店及香港各大藥房有售。</p>
  </div>
</section>
<section class="where-to-buy wtb-page">
  <div class="section-inner">
    {buy_cards("where_to_buy")}
  </div>
</section>
"""
    return layout(path="/where-to-buy/", title="購買渠道 | Pierrot 貝潔得",
                  desc="Pierrot 貝潔得喺 HKTVmall、Health3、Wahtat 及香港各大藥房有售。",
                  body=body, active="buy")


BUNDLES = [
    ("sensitive-set", "防敏感組合", ["sensitive", "sensitive-mouthwash"], "刷牙加漱口，日常減輕冷熱酸甜敏感。", "blue"),
    ("kids-set", "兒童護齒組合", ["kids-gel-strawberry", "kids-mouthwash"], "草莓味刷牙、漱口一齊做（漱口水適合 6 歲或以上）。", "rose"),
    ("hap-set", "HAP 升級雙效組合", ["hap-sensitive", "hap-whitening"], "抗敏、亮白兩款 HAP 配方，一次擁有。", "navy"),
    ("gum-set", "護齦組合", ["propolis-gum", "aloe-gum"], "天然蜂膠同蘆薈，兩款護齦配方。", "teal"),
]


def bundle_card(n, key, title, ids, desc, tone):
    a, b = P[ids[0]], P[ids[1]]
    return f"""<article class="bundle bundle-{tone} reveal">
  <div class="bundle-visual">
    <div class="bundle-head">
      <span class="bundle-tag"><i aria-hidden="true"></i>{e(title)}</span>
      <span class="bundle-no" aria-hidden="true">{n:02d}</span>
    </div>
    <img src="/Assets/web/bundle-{key}.webp" alt="Pierrot {e(title)}：{e(a['name'])} 及 {e(b['name'])}" loading="lazy" width="1200" height="900">
  </div>
  <div class="bundle-body">
    <p class="bundle-items"><a href="/products/{a['id']}.html">{e(a['name'])}</a><span>＋</span><a href="/products/{b['id']}.html">{e(b['name'])}</a></p>
    <p class="bundle-desc">{e(desc)}</p>
    <a href="{HKTVMALL_STORE}" class="bundle-btn" data-buy="{key}" data-source="home_bundle" target="_blank" rel="noopener">立即購買<span aria-hidden="true">→</span></a>
  </div>
</article>"""


def page_home():
    s, w = P["hap-sensitive"], P["hap-whitening"]
    bundles = "\n".join(bundle_card(i + 1, *b) for i, b in enumerate(BUNDLES))
    body = f"""
<section class="home-banner" id="top">
  <h1 class="sr-only">Pierrot 貝潔得 Oral Hygiene 專業口腔護理</h1>
  <picture>
    <source media="(max-width:700px)" srcset="/Assets/web/home-banner-mobile.webp">
    <img src="/Assets/web/home-banner-1400.webp" srcset="/Assets/web/home-banner-1400.webp 1400w, /Assets/web/home-banner.webp 2400w" sizes="100vw" alt="Pierrot 貝潔得 Oral Hygiene 專業口腔護理：來自西班牙，1945 年創立" class="home-banner-img" width="2400" height="1275">
  </picture>
  <div class="banner-mobile-copy">
    <p class="banner-mobile-h">Oral Hygiene<span>專業口腔護理</span></p>
    <p class="banner-mobile-sub"><span class="spain-flag-icon" aria-hidden="true"></span>來自西班牙 · 1945 年創立</p>
    <p class="banner-mobile-trust">ISO 22716 認證 · ISO 13485 認證</p>
  </div>
</section>

<section class="needs" aria-labelledby="needs-h">
  <div class="section-inner">
    <p class="eyebrow reveal">按需要揀</p>
    <h2 id="needs-h" class="reveal">你最想改善咩？</h2>
    <div class="need-grid">{need_tiles()}</div>
  </div>
</section>

<section class="home-hap" aria-labelledby="home-hap-h">
  <div class="section-inner">
    <h2 id="home-hap-h" class="sr-only">HAP 升級雙效系列：琺瑯填補技術，填補牙齒表面微細孔洞</h2>
    <a href="/hap/" class="hap-home-banner reveal" aria-label="了解 HAP 琺瑯填補技術">
      <img src="/Assets/web/hap-banner.webp" srcset="/Assets/web/hap-banner-900.webp 900w, /Assets/web/hap-banner.webp 1600w" sizes="(max-width:1180px) 100vw, 1180px" alt="琺瑯填補技術：填補牙齒表面微細孔洞，Micro HAP" width="1600" height="976" loading="lazy">
    </a>
    <div class="tech-card-grid reveal">
      <article class="tech-card tech-card-blue">
        <img src="{img(w['id'])}" alt="Pierrot {e(w['name'])}" class="tech-card-product-img" loading="lazy">
        <span class="tech-card-tag">拋光亮白配方</span>
        <h3>{e(w['name'])}<span class="tech-card-zh">Whitening Protect</span></h3>
        <p class="tech-card-desc">{e(w['intro'])}</p>
        <p class="tech-card-target">為想牙齒光滑亮澤、去除日常牙漬嘅您而設。</p>
        <a href="/products/{w['id']}.html" class="btn btn-outline btn-sm">了解更多</a>
      </article>
      <article class="tech-card tech-card-pink">
        <img src="{img(s['id'])}" alt="Pierrot {e(s['name'])}" class="tech-card-product-img" loading="lazy">
        <span class="tech-card-tag">溫和抗敏配方</span>
        <h3>{e(s['name'])}<span class="tech-card-zh">Sensitive Protect</span></h3>
        <p class="tech-card-desc">{e(s['intro'])}</p>
        <p class="tech-card-target">為牙齒容易對冷熱酸甜敏感嘅您而設。</p>
        <a href="/products/{s['id']}.html" class="btn btn-outline btn-sm">了解更多</a>
      </article>
    </div>
    <p class="center-link reveal"><a href="/hap/" class="btn btn-primary">了解 HAP 科技 →</a></p>
  </div>
</section>

{quiz_band()}

<section class="home-bundles" aria-labelledby="bundle-h">
  <div class="section-inner">
    <p class="eyebrow reveal">組合產品</p>
    <h2 id="bundle-h" class="reveal">一齊用，護理更全面</h2>
    <div class="bundle-grid">
{bundles}
    </div>
    <p class="center-link reveal"><a href="/products/" class="btn btn-outline">睇全部 {len(PRODUCTS)} 款產品 →</a></p>
  </div>
</section>

<section class="brand-story" aria-labelledby="brand-story-heading">
  <div class="section-inner">
    <p class="eyebrow reveal">品牌故事</p>
    <h2 id="brand-story-heading" class="reveal">你嘅牙刷，從何而來？</h2>
    <p class="section-lead reveal">由西班牙原廠製造流程，了解 Pierrot 點樣堅持 80 年嘅品質承諾。<a href="/about/" class="inline-link">了解品牌故事 →</a></p>
    <a class="video-frame reveal" href="https://www.youtube.com/watch?v=jcl7QS_8xTE" target="_blank" rel="noopener" aria-label="喺 YouTube 觀看：你嘅牙刷，從何而來？">
      <img src="https://img.youtube.com/vi/jcl7QS_8xTE/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/jcl7QS_8xTE/hqdefault.jpg';" alt="Pierrot Oral Care 品牌影片封面" class="video-thumb" loading="lazy">
      <span class="video-play-btn" aria-hidden="true"><svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/><path d="M45 24 27 14v20" fill="#fff"/></svg></span>
    </a>
  </div>
</section>

<section class="cross-sell" aria-labelledby="crosssell-heading">
  <div class="section-inner">
    <p class="eyebrow reveal">你可能仲有興趣</p>
    <div class="cross-sell-card reveal">
      <div class="cross-sell-media"><img src="/Assets/web/ortho-brush.webp" alt="Pierrot Specialist 正畸專用牙刷" class="cross-sell-img" loading="lazy"></div>
      <div class="cross-sell-copy">
        <h2 id="crosssell-heading">Pierrot Specialist<br>正畸專用牙刷</h2>
        <p class="cross-sell-lead">專為箍牙、種植牙同難以觸及嘅部位而設計，刷頭精準清潔牙套周邊，配合人體工學手柄，啱正畸療程期間每日使用。</p>
        <div class="badge-row"><span class="badge">箍牙適用</span><span class="badge">植牙適用</span><span class="badge">難以觸及部位</span></div>
        <a href="/where-to-buy/" class="btn btn-outline">購買渠道</a>
      </div>
    </div>
  </div>
</section>

<section class="where-to-buy" id="where-to-buy" aria-labelledby="wtb-heading">
  <div class="section-inner">
    <p class="eyebrow reveal">購買渠道</p>
    <h2 id="wtb-heading" class="reveal">香港各大藥房及網店有售</h2>
    {buy_cards("home_buy")}
  </div>
</section>
"""
    return layout(path="/", title="Pierrot 貝潔得 — 西班牙口腔護理專家 | HAP 升級雙效牙膏",
                  desc="Pierrot 貝潔得 1945 年創立於西班牙。全新 HAP 升級雙效系列：HAP（Micro）仿天然琺瑯質微粒＋氟化物。防敏感、亮白、護齦、兒童牙膏及漱口水，HKTVmall 有售。",
                  body=body, active="")


# ---------------------------------------------------------------- write
def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  wrote", rel)


def main():
    write("index.html", page_home())
    write("products/index.html", page_products())
    for p in PRODUCTS:
        write(f"products/{p['id']}.html", page_product(p))
    write("hap/index.html", page_hap())
    write("quiz/index.html", page_quiz())
    write("about/index.html", page_about())
    write("where-to-buy/index.html", page_buy())
    data = [{k: p.get(k) for k in ("id", "name", "category", "tagline", "hktvmall", "size")} for p in PRODUCTS]
    for d in data:
        d["url"] = d.pop("hktvmall") or HKTVMALL_STORE
        d["img"] = img(d["id"])
    write("js/products.js", "/* 自動產生，請改 tools/products_data.py 再執行 tools/build.py */\n"
          "window.PIERROT_PRODUCTS = " + json.dumps({d["id"]: d for d in data}, ensure_ascii=False, indent=1) + ";\n")
    urls = ["/", "/products/", "/hap/", "/quiz/", "/about/", "/where-to-buy/"] + [f"/products/{p['id']}.html" for p in PRODUCTS]
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "".join(f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /tools/\nSitemap: {SITE}/sitemap.xml\n")


if __name__ == "__main__":
    main()
