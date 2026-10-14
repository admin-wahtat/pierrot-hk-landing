/* ==========================================================================
   Pierrot 貝潔得 — 揀牙膏測驗
   規則同計劃書第 05–06 部分一致；改規則只改 RULES 同 compute()
   ========================================================================== */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- 問題
  var Q = {
    who: { q: '你幫邊個揀？', opts: [
      ['adult', '成人'], ['kid', '小朋友（2 歲或以上）']] },
    main: { q: '你最想改善邊方面？', opts: [
      ['A', '飲凍飲熱飲、食甜嘢時牙齒酸軟'], ['B', '牙齒偏黃、有漬'], ['C', '刷牙時牙齦不適'],
      ['D', '口氣'], ['E', '日常保養、預防蛀牙']] },
    extras: { q: '仲有冇其他想改善？', hint: '可多選，亦可以直接跳過', multi: true },
    q4A: { q: '酸軟情況有幾頻密？', opts: [['often', '經常，好多時都會'], ['sometimes', '間中先會']] },
    q4B: { q: '牙漬主要嚟自？', opts: [['coffee', '經常飲咖啡／茶，或者食煙'], ['natural', '牙齒自然偏黃，想光滑亮澤']] },
    q4C: { q: '牙齦情況係？', opts: [['discomfort', '刷牙時容易不適'], ['strengthen', '冇大問題，想日常強健']] },
    q4T: { q: '你鍾意咩口感？', opts: [['cool', '清涼清新'], ['herbal', '草本溫和']] },
    fl: { q: '想用含氟定無氟牙膏？', cmp: [
      ['含氟配方', '草莓味', '有助預防蛀牙', '想加強防蛀'],
      ['無氟配方', '蘋果味', '0% 氟化物，日常潔淨', '想避開氟化物']], opts: [
      ['yes', '含氟配方'], ['no', '無氟配方'], ['unsure', '唔肯定']] }
  };
  var EXTRA_LABEL = { A: '牙齒容易敏感', B: '牙齒偏黃、有漬', C: '牙齦不適', D: '口氣' };
  var TITLE_LABEL = { A: '牙齒容易敏感', B: '想亮白', C: '想呵護牙齦', D: '重視口氣清新', E: '想日常保養' };

  // ---------------------------------------------------------------- 結果
  var SM = 'sensitive-mouthwash', TM = 'total-care-mouthwash', KM = 'kids-mouthwash';
  var RULES = {
    R1: ['hap-sensitive', 'sensitive', SM, '你經常有酸軟情況。HAP 仿天然琺瑯質微粒有助填補牙齒表面微細孔洞，舒緩敏感，再配合氟化物強化琺瑯質，係我哋最推薦嘅抗敏選擇。'],
    R2: ['hap-sensitive', 'sensitive', SM, '你間中有敏感情況。升級 HAP 雙效配方有助填補牙齒表面微細孔洞、舒緩敏感，同時強化琺瑯質。'],
    R4: ['hap-whitening', 'hap-sensitive', SM, '你想牙齒亮白，但亦有敏感情況。活性炭類亮白牙膏未必適合你；HAP 系列以填補牙面微細孔洞嘅方式，令牙齒更光滑亮澤。'],
    R5: ['charcoal', 'hap-whitening', TM, '你嘅牙漬主要嚟自咖啡、茶或食煙。活性炭有助吸附呢類牙漬，雙氟配方同時強化琺瑯質、預防蛀牙。'],
    R7: ['hap-whitening', 'papaya-whitening', TM, '你嘅牙齒自然偏黃。HAP 有助填補牙齒表面微細孔洞，令牙面更平滑，自然亮澤。'],
    R8: ['aloe-gum', 'propolis-gum', TM, '刷牙時牙齦容易不適。蘆薈配合洋甘菊，溫和呵護牙齦，同時含氟預防蛀牙。'],
    R9: ['propolis-gum', 'aloe-gum', TM, '你想日常強健牙齦。天然蜂膠配合洋甘菊，固齒健齦，同時含氟預防蛀牙。'],
    R10: ['ultrafresh', 'herbal', TM, '你重視口氣，又鍾意清涼口感。Physcool® 技術清新持久唔辣口，微粒配方有助潔淨齒縫。'],
    R11: ['herbal', 'ultrafresh', TM, '你重視口氣，又鍾意草本口味。草本薄荷清香，有助減少牙菌膜積聚。'],
    R13: ['herbal', 'ultrafresh', TM, '日常全面保養之選。天然草本牙膏潔淨口腔、預防蛀牙、清新口氣。'],
    R14: ['ultrafresh', 'herbal', TM, '日常保養又鍾意清涼口感。超清新微粒潔淨牙膏清新持久，同時含氟預防蛀牙。'],
    K1: ['kids-gel-strawberry', 'kids-gel-apple', KM, '2 歲以上適用。含氟配方有助預防蛀牙，草莓香味令小朋友愛上刷牙。'],
    K2: ['kids-gel-apple', 'kids-gel-strawberry', KM, '0% 氟化物配方，蘋果香味令小朋友愛上刷牙，2 歲以上適用。'],
    K3: ['kids-gel-strawberry', 'kids-gel-apple', KM, '兩款都適合 2 歲以上小朋友，分別在於有冇氟化物。睇吓下面嘅比較；仍然唔肯定，可以先問牙醫，佢會按小朋友嘅情況建議。']
  };
  var RULE_TITLE = {
    R1: '牙齒經常敏感', R2: '牙齒間中敏感', R4: '想亮白、牙齒容易敏感', R5: '想去除咖啡茶漬',
    R7: '想牙齒光滑亮澤', R8: '牙齦容易不適', R9: '想日常強健牙齦', R10: '重視口氣清新',
    R11: '重視口氣清新', R13: '想日常保養', R14: '想日常保養',
    K1: '小朋友・含氟配方', K2: '小朋友・無氟配方', K3: '小朋友'
  };

  // ---------------------------------------------------------------- 流程
  function nextStep(a) {
    if (!a.who) return 'who';
    if (a.who !== 'adult') return a.fl ? null : 'fl';
    if (!a.main) return 'main';
    if (!a.extras) return 'extras';
    var sens = a.extras.indexOf('A') !== -1;
    if (a.main === 'B' && sens) return null;               // R4 唔使再問
    if (!a.q4) return a.main === 'A' ? 'q4A' : a.main === 'B' ? 'q4B' : a.main === 'C' ? 'q4C' : 'q4T';
    return null;
  }

  function ruleFor(a) {
    if (a.who === 'kid') return { yes: 'K1', no: 'K2', unsure: 'K3' }[a.fl];
    var sens = (a.extras || []).indexOf('A') !== -1;
    switch (a.main) {
      case 'A': return a.q4 === 'often' ? 'R1' : 'R2';
      case 'B':
        if (sens) return 'R4';
        if (a.q4 === 'coffee') return 'R5';
        return 'R7';
      case 'C': return a.q4 === 'discomfort' ? 'R8' : 'R9';
      case 'D': return a.q4 === 'cool' ? 'R10' : 'R11';
      case 'E':
        return a.q4 === 'cool' ? 'R14' : 'R13';
    }
    return null;
  }

  function compute(a) {
    var rule = ruleFor(a);
    if (!rule) return null;
    var r = RULES[rule];
    var res = { rule: rule, main: r[0], backup: r[1], backupLabel: '後備選擇', mw: r[2], why: r[3], title: RULE_TITLE[rule], notes: [] };
    if (a.who === 'adult') {
      var ex = a.extras || [];
      var sens = a.main === 'A' || ex.indexOf('A') !== -1;
      res.mw = sens ? SM : TM;
      var parts = [TITLE_LABEL[a.main]].concat(ex.map(function (x) { return TITLE_LABEL[x]; }));
      res.title = parts.filter(function (v, i, s) { return s.indexOf(v) === i; }).join('、');
      if (ex.indexOf('A') !== -1 && a.main !== 'A' && a.main !== 'B') {
        res.notes.push(['如果經常敏感，可以考慮', 'hap-sensitive']);
      }
      var gum = sens ? 'aloe-gum' : 'propolis-gum';
      var wantB = ex.indexOf('B') !== -1 && a.main !== 'B';
      var wantC = ex.indexOf('C') !== -1 && a.main !== 'C';
      if (wantC) {                       // 牙齦係次要困擾：直接推薦護齦牙膏
        res.backup = gum; res.backupLabel = '護齦之選';
      }
      if (wantB) {
        var b = sens ? 'hap-whitening' : 'papaya-whitening';
        if (b !== res.main) {
          if (wantC) res.notes.push(['想亮白，可以考慮', b]);
          else { res.backup = b; res.backupLabel = '亮白之選'; }
        }
      }
    } else {
      res.notes.push(['兒童漱口水適合 6 歲或以上小朋友。', null]);
    }
    return res;
  }

  function fromRule(rule) {
    var r = RULES[rule];
    if (!r) return null;
    return { rule: rule, main: r[0], backup: r[1], backupLabel: '後備選擇', mw: r[2], why: r[3], title: RULE_TITLE[rule], notes: [] };
  }

  var api = { Q: Q, RULES: RULES, nextStep: nextStep, compute: compute, fromRule: fromRule };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.PierrotQuiz = api;

  // ---------------------------------------------------------------- 畫面
  var box = document.getElementById('quiz');
  if (!box) return;
  var PR = root.PIERROT_PRODUCTS || {};
  var BASE = document.documentElement.getAttribute('data-base') || '';
  function u(path) { return BASE + String(path).replace(/^\//, ''); }
  var ans = {}, history = [], started = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function track(n, p) { if (root.pTrack) root.pTrack(n, p); }

  function progress() {
    var est = ans.who && ans.who !== 'adult' ? 2 : 4;
    return Math.min(95, Math.round(history.length / est * 100));
  }

  function renderStep(id) {
    var def = Q[id];
    var h = '<div class="qz-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress() + '"><span style="width:' + progress() + '%"></span></div>';
    h += '<p class="qz-step">第 ' + (history.length + 1) + ' 題</p><h2 class="qz-q">' + esc(def.q) + '</h2>';
    if (def.hint) h += '<p class="qz-hint">' + esc(def.hint) + '</p>';
    if (def.multi) {
      var opts = ['A', 'B', 'C', 'D'].filter(function (k) { return k !== ans.main; });
      h += '<div class="qz-opts">' + opts.map(function (k) {
        return '<label class="qz-opt qz-check"><input type="checkbox" value="' + k + '"><span>' + esc(EXTRA_LABEL[k]) + '</span></label>';
      }).join('') + '</div><div class="qz-nav"><button class="btn btn-primary" data-act="multi">下一步</button><button class="btn btn-outline" data-act="none">冇其他</button></div>';
    } else {
      h += '<div class="qz-opts">' + def.opts.map(function (o) {
        return '<button class="qz-opt" data-val="' + o[0] + '">' + esc(o[1]) + (o[2] ? '<span class="qz-sub">' + esc(o[2]) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    }
    if (history.length) h += '<button class="qz-back" data-act="back">← 上一題</button>';
    box.innerHTML = h;
    box.setAttribute('data-step', id);
    var first = box.querySelector('.qz-opt, input');
    if (first && started) first.focus({ preventScroll: true });
  }

  function key(id) { return id.indexOf('q4') === 0 ? 'q4' : id.indexOf('q5') === 0 ? 'q5' : id; }

  function answer(id, val) {
    if (!started) { started = true; track('quiz_start', { path: ans.who || val }); }
    history.push(id);
    ans[key(id)] = val;
    go();
  }

  function back() {
    var id = history.pop();
    if (!id) return;
    delete ans[key(id)];
    go();
  }

  function go() {
    var nxt = nextStep(ans);
    if (nxt) renderStep(nxt);
    else showResult(compute(ans), true);
  }

  function card(id, label, cls) {
    var p = PR[id];
    if (!p) return '';
    return '<div class="qz-rcard ' + (cls || '') + '"><img src="' + u(p.img) + '" alt="" width="600" height="600" loading="lazy">' +
      '<div><span class="qz-tag">' + esc(label) + '</span><h3>' + esc(p.name) + '</h3><p>' + esc(p.tagline) + '</p>' +
      '<div class="qz-ractions"><a class="btn btn-primary btn-sm" href="' + p.url + '" data-buy="' + id + '" data-source="quiz_result" target="_blank" rel="noopener">立即購買</a>' +
      '<a class="btn btn-outline btn-sm" href="' + u('/products/' + id + '.html') + '">產品詳情</a></div></div></div>';
  }

  function showResult(r, fresh) {
    if (!r) return;
    var main = PR[r.main];
    var h = '<div class="qz-result">';
    if (r.rule === 'K3') {
      h += '<p class="qz-step">你嘅推薦結果</p><h2 class="qz-q">兩款都啱小朋友，按你嘅取向揀</h2>';
      h += '<p class="qz-why">' + esc(r.why) + '</p>';
      h += '<div class="qz-cmp">' + Q.fl.cmp.map(function (c) {
        return '<div class="qz-cmp-col"><p class="qz-cmp-h">' + esc(c[0]) + '<span>' + esc(c[1]) + '</span></p>' +
          '<dl><dt>主要作用</dt><dd>' + esc(c[2]) + '</dd><dt>適合</dt><dd>' + esc(c[3]) + '</dd></dl></div>';
      }).join('') + '</div>';
      h += '<div class="qz-more qz-even">' + card(r.main, '含氟之選') + card(r.backup, '無氟之選') + '</div>';
      h += '<div class="qz-more">' + card(r.mw, '配搭使用', 'qz-pair') + '</div>';
      r.notes.forEach(function (n) { h += '<p class="qz-note">' + esc(n[0]) + '</p>'; });
      h += '<div class="qz-nav qz-end"><button class="btn btn-outline" data-act="restart">重新測驗</button><a class="btn btn-outline" href="' + u('/products/index.html') + '">睇全部產品</a></div></div>';
      return finish(h, r, fresh);
    }
    h += '<p class="qz-step">你嘅推薦結果</p><h2 class="qz-q">適合' + esc(r.title) + '嘅你</h2>';
    h += '<div class="qz-main"><div class="qz-main-img"><img src="' + u(main.img.replace('-sm.webp', '.webp')) + '" alt="Pierrot ' + esc(main.name) + '" width="1200" height="1200"></div>' +
      '<div class="qz-main-info"><span class="qz-tag qz-tag-main">最適合你</span><h3>' + esc(main.name) + '</h3><p class="qz-line">' + esc(main.tagline) + '</p>' +
      '<p class="qz-why"><strong>點解啱你：</strong>' + esc(r.why) + '</p>' +
      '<div class="qz-ractions"><a class="btn btn-primary btn-sm" href="' + main.url + '" data-buy="' + r.main + '" data-source="quiz_result_main" target="_blank" rel="noopener">立即購買</a>' +
      '<a class="btn btn-outline btn-sm" href="' + u('/products/' + r.main + '.html') + '">產品詳情</a></div></div></div>';
    h += '<div class="qz-more">' + card(r.backup, r.backupLabel || '後備選擇') + (r.mw ? card(r.mw, '配搭使用', 'qz-pair') : '') + '</div>';
    r.notes.forEach(function (n) {
      h += '<p class="qz-note">' + esc(n[0]) + (n[1] && PR[n[1]] ? ' <a href="' + u('/products/' + n[1] + '.html') + '">' + esc(PR[n[1]].name) + ' →</a>' : '') + '</p>';
    });
    h += '<div class="qz-nav qz-end"><button class="btn btn-outline" data-act="restart">重新測驗</button><a class="btn btn-outline" href="' + u('/products/index.html') + '">睇全部產品</a></div></div>';
    finish(h, r, fresh);
  }

  function finish(h, r, fresh) {
    box.innerHTML = h;
    box.setAttribute('data-step', 'result');
    box.setAttribute('data-rule', r.rule);
    if (root.pDecorateBuy) root.pDecorateBuy(box);
    if (fresh) {
      track('quiz_complete', { rule: r.rule, product: r.main });
      try { root.history.replaceState(null, '', location.pathname + '?r=' + r.rule); } catch (e) {}
      box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  box.addEventListener('click', function (ev) {
    var t = ev.target.closest('button');
    if (!t) return;
    var step = box.getAttribute('data-step');
    if (t.hasAttribute('data-val')) return answer(step, t.getAttribute('data-val'));
    var act = t.getAttribute('data-act');
    if (act === 'back') return back();
    if (act === 'none') return answer('extras', []);
    if (act === 'multi') {
      var v = Array.prototype.map.call(box.querySelectorAll('input:checked'), function (i) { return i.value; });
      return answer('extras', v);
    }
    if (act === 'restart') {
      ans = {}; history = [];
      try { root.history.replaceState(null, '', location.pathname); } catch (e) {}
      go();
    }
  });

  var shared = new URLSearchParams(location.search).get('r');
  if (shared && RULES[shared]) showResult(fromRule(shared), false);
  else go();
})(typeof window !== 'undefined' ? window : this);
