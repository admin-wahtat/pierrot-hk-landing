// 測試揀牙膏測驗：行晒所有答案組合
// 用法（喺網站資料夾）：node tools/test_quiz.js
const q = require('../js/quiz.js');
const count = {}; let n = 0; const bad = [];
function walk(a) {
  const s = q.nextStep(a);
  if (!s) {
    const r = q.compute(a); n++;
    if (!r || !r.main || !r.backup || r.main === r.backup) bad.push({ a, r });
    else count[r.rule] = (count[r.rule] || 0) + 1;
    return;
  }
  if (s === 'extras') {
    const opts = ['A', 'B', 'C', 'D'].filter(k => k !== a.main);
    for (let m = 0; m < (1 << opts.length); m++) walk({ ...a, extras: opts.filter((_, i) => m >> i & 1) });
    return;
  }
  const k = s.startsWith('q4') ? 'q4' : s.startsWith('q5') ? 'q5' : s;
  for (const [v] of q.Q[s].opts) walk({ ...a, [k]: v });
}
walk({});
const unused = Object.keys(q.RULES).filter(r => !count[r]);
console.log(`共 ${n} 條答案路徑，有問題 ${bad.length} 條`);
console.log('每條規則出現次數：', count);
if (unused.length) console.log('⚠️ 冇路徑會去到嘅規則：', unused);
if (bad.length) { console.log(JSON.stringify(bad.slice(0, 5), null, 1)); process.exit(1); }
console.log('✅ 全部通過');
