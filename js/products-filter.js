/* 全部產品頁：功效篩選（支援 /products/?f=sensitive） */
(function () {
  'use strict';
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('#pgrid .p-card');
  var count = document.getElementById('pcount');
  if (!chips.length) return;

  function apply(f) {
    var n = 0;
    cards.forEach(function (c) {
      var show = f === 'all' || c.getAttribute('data-filters').split(' ').indexOf(f) !== -1;
      c.hidden = !show;
      if (show) n++;
    });
    chips.forEach(function (ch) {
      ch.setAttribute('aria-pressed', ch.getAttribute('data-filter') === f ? 'true' : 'false');
    });
    if (count) count.textContent = n;
  }

  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      var f = ch.getAttribute('data-filter');
      apply(f);
      var url = f === 'all' ? location.pathname : location.pathname + '?f=' + f;
      history.replaceState(null, '', url);
    });
  });

  var start = new URLSearchParams(location.search).get('f');
  // 有 chip 或者有產品屬於呢個分類（例如首頁「預防蛀牙」）都接受
  var valid = start && Array.prototype.some.call(cards, function (c) { return c.getAttribute('data-filters').split(' ').indexOf(start) !== -1; });
  apply(valid ? start : 'all');
})();
