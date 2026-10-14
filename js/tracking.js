/* ==========================================================================
   Pierrot 貝潔得 — 廣告追蹤（Meta Pixel + GA4）
   上線前：將下面兩個 ID 填入（留空即唔載入）
   ========================================================================== */
window.PIERROT_TRACKING = {
  META_PIXEL_ID: '',   // 例如 '123456789012345'
  GA4_ID: ''           // 例如 'G-XXXXXXXXXX'
};

(function () {
  'use strict';
  var cfg = window.PIERROT_TRACKING;

  // ---- 載入 GA4
  if (cfg.GA4_ID) {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.GA4_ID);
  }

  // ---- 載入 Meta Pixel
  if (cfg.META_PIXEL_ID) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', cfg.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // ---- 統一事件函數：pTrack('quiz_complete', {rule:'R4', product:'hap-whitening'})
  window.pTrack = function (name, params) {
    params = params || {};
    try { if (window.gtag) window.gtag('event', name, params); } catch (e) {}
    try { if (window.fbq) window.fbq('trackCustom', name, params); } catch (e) {}
    if (window.console && /localhost|127\.0\.0\.1|pages\.dev/.test(location.hostname)) {
      console.log('[track]', name, params);
    }
  };

  // ---- HKTVmall link 自動加 UTM
  function withUtm(href, content) {
    if (href.indexOf('hktvmall.com') === -1) return href;
    var sep = href.indexOf('?') === -1 ? '?' : '&';
    return href + sep + 'utm_source=pierrot.com.hk&utm_medium=referral&utm_campaign=site&utm_content=' +
      encodeURIComponent(content || 'store');
  }
  window.pBuyUrl = withUtm;

  function decorate(root) {
    (root || document).querySelectorAll('a[data-buy]:not([data-utm])').forEach(function (a) {
      a.href = withUtm(a.getAttribute('href'), a.getAttribute('data-buy'));
      a.setAttribute('data-utm', '1');
    });
  }
  window.pDecorateBuy = decorate;
  document.addEventListener('DOMContentLoaded', function () {
    decorate();
    var pd = document.querySelector('[data-product]');
    if (pd) window.pTrack('view_product', { product: pd.getAttribute('data-product') });
  });

  // ---- 撳購買掣
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-buy]');
    if (!a) return;
    var isHk = a.href.indexOf('hktvmall.com') !== -1;
    window.pTrack(isHk ? 'click_hktvmall' : 'click_retailer', {
      product: a.getAttribute('data-buy'),
      source: a.getAttribute('data-source') || ''
    });
  });
})();
