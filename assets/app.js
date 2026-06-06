(function () {
  var CATEGORIES = ['医疗/住院治疗', '护理/护工', '药品/营养', '押金/预付/伙食', '器械/护理用品', '生活用品/衣物'];
  var COLORS = {
    '医疗/住院治疗': '#4d7daa',
    '护理/护工': '#ff8a0a',
    '药品/营养': '#54a24b',
    '押金/预付/伙食': '#e84b4b',
    '器械/护理用品': '#76b7b2',
    '生活用品/衣物': '#b279a2'
  };

  var SEED_ROWS = [
    ['2026-02-20', '购买入院用品', 382, '器械/护理用品', '原统计', ''],
    ['2026-02-26', '疱疹药', 461, '药品/营养', '原统计', ''],
    ['2026-02-26', '白蛋白', 2460, '药品/营养', '原统计', ''],
    ['2026-02-28', '化验尿液', 3600, '医疗/住院治疗', '原统计', ''],
    ['2026-03-05', '白蛋白', 2025, '药品/营养', '原统计', ''],
    ['2026-03-13', '重症护理费', 3150, '护理/护工', '原统计', ''],
    ['2026-03-13', '12楼护工累计10天', 2200, '护理/护工', '原统计', '已修正到3月13日'],
    ['2026-03-15', '垫单38+12', 50, '器械/护理用品', '原统计', ''],
    ['2026-03-17', '湿纸巾32+58', 90, '器械/护理用品', '原统计', '已更正'],
    ['2026-03-23', '护工费10天', 2200, '护理/护工', '原统计', ''],
    ['2026-03-28', '癫痫药', 363, '药品/营养', '原统计', ''],
    ['2026-04-02', '护工费10天', 2200, '护理/护工', '原统计', ''],
    ['2026-04-11', '钢板护腰', 79, '器械/护理用品', '原统计', ''],
    ['2026-04-12', '护工费10天', 2200, '护理/护工', '原统计', ''],
    ['2026-04-16', '轮椅', 736, '器械/护理用品', '原统计', ''],
    ['2026-04-18', '睡衣', 79, '生活用品/衣物', '原统计', '已修正为睡衣'],
    ['2026-04-18', '轮椅用坐垫及护腰', 58, '器械/护理用品', '原统计', ''],
    ['2026-04-24', '癫痫药', 363, '药品/营养', '原统计', ''],
    ['2026-04-25', '纸尿裤', 50, '器械/护理用品', '原统计', ''],
    ['2026-04-30', '白蛋白5瓶', 2025, '药品/营养', '原统计', ''],
    ['2026-05-01', '护工费', 2200, '护理/护工', '原统计', ''],
    ['2026-05-11', '护工费', 2200, '护理/护工', '原统计', ''],
    ['2026-05-11', '白蛋白5瓶', 2025, '药品/营养', '原统计', ''],
    ['2026-05-12', '护工费5天', 1100, '护理/护工', '原统计', ''],
    ['2026-05-16', '短袖套装', 67, '生活用品/衣物', '原统计', ''],
    ['2026-05-16', '中医药住院费用', 27537.62, '医疗/住院治疗', '原统计', ''],
    ['2026-05-16', '住院和护工押金', 2000, '押金/预付/伙食', '新增', ''],
    ['2026-05-16', '营养液管子7根', 245, '药品/营养', '新增', ''],
    ['2026-05-18', '气垫床', 407.16, '器械/护理用品', '新增', ''],
    ['2026-05-19', '大号保鲜袋', 11.59, '生活用品/衣物', '新增', ''],
    ['2026-05-21', '长袖两件', 41.4, '生活用品/衣物', '新增', ''],
    ['2026-05-22', '预付伙食费', 500, '押金/预付/伙食', '新增', ''],
    ['2026-05-26', '可靠湿巾纸', 38.9, '器械/护理用品', '新增', ''],
    ['2026-05-26', '鼻饲注射管', 15.9, '器械/护理用品', '新增', ''],
    ['2026-05-29', '垫单一包', 13.99, '器械/护理用品', '新增', ''],
    ['2026-05-30', '纸尿裤', 35, '器械/护理用品', '新增', ''],
    ['2026-05-31', '双灯卫生纸', 15.1, '器械/护理用品', '新增', ''],
    ['2026-06-02', '鱼跃弹力贴', 22.81, '器械/护理用品', '新增', ''],
    ['2026-06-02', '鼻饲管贴', 9.11, '器械/护理用品', '新增', '']
  ];

  var records = [];
  var keyword = '';
  var role = (localStorage.getItem('expense_role') === 'accountant' && localStorage.getItem('expense_pin')) ? 'accountant' : 'visitor';
  var cloudConnected = false;

  function $(id) { return document.getElementById(id); }
  function money(n) { return '¥' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(n) { return Number(n || 0).toFixed(2) + '%'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function isAccountant() { return role === 'accountant'; }

  function seedRecords() {
    return SEED_ROWS.map(function (r, i) {
      return { id: i + 1, expense_date: r[0], item: r[1], amount: Number(r[2]), category: r[3], source: r[4], note: r[5] };
    });
  }

  function normalize(list) {
    if (!Array.isArray(list)) return [];
    return list.map(function (x, i) {
      return {
        id: Number(x.id || i + 1),
        expense_date: String(x.expense_date || ''),
        item: String(x.item || ''),
        amount: Number(x.amount || 0),
        category: String(x.category || '器械/护理用品'),
        source: String(x.source || '新增'),
        note: String(x.note || '')
      };
    }).filter(function (x) { return x.expense_date && x.item; }).sort(function (a, b) {
      return a.expense_date.localeCompare(b.expense_date) || a.id - b.id;
    });
  }

  function setStatus(text, cls) {
    var el = $('status');
    if (!el) return;
    el.textContent = text;
    el.className = 'status ' + (cls || '');
  }

  function summarize(list) {
    var total = 0, oldTotal = 0;
    list.forEach(function (r) {
      total += r.amount;
      if (r.source === '原统计') oldTotal += r.amount;
    });
    var categories = CATEGORIES.map(function (c) {
      var rows = list.filter(function (r) { return r.category === c; });
      var value = rows.reduce(function (s, r) { return s + r.amount; }, 0);
      return { name: c, value: value, count: rows.length, percent: total ? value / total * 100 : 0 };
    });
    var monthMap = {};
    list.forEach(function (r) {
      var m = r.expense_date.slice(0, 7);
      monthMap[m] = (monthMap[m] || 0) + r.amount;
    });
    var months = Object.keys(monthMap).sort().map(function (m) { return { month: m, value: monthMap[m], percent: total ? monthMap[m] / total * 100 : 0 }; });
    return { total: total, oldTotal: oldTotal, addedTotal: total - oldTotal, categories: categories, months: months };
  }

  function render() {
    var list = records.length ? records : seedRecords();
    var s = summarize(list);
    var dates = list.map(function (r) { return r.expense_date; }).sort();
    $('range').textContent = dates[0] + ' 至 ' + dates[dates.length - 1];
    $('oldTotal').textContent = money(s.oldTotal);
    $('newTotal').textContent = money(s.addedTotal);
    $('allTotal').textContent = money(s.total);
    $('count').textContent = list.length + ' 条';
    $('newPct').textContent = '新增占总额 ' + pct(s.total ? s.addedTotal / s.total * 100 : 0);

    $('catRows').innerHTML = s.categories.map(function (c) {
      return '<tr><td>' + esc(c.name) + '</td><td class="money">' + money(c.value) + '</td><td class="pct">' + pct(c.percent) + '</td><td class="num">' + c.count + '</td><td><i class="pill" style="background:' + COLORS[c.name] + '"></i></td></tr>';
    }).join('');

    renderSourceOptions(list);
    renderPie(s);
    renderMonths(s);
    renderLedger(list);
    applyRole();
  }

  function renderSourceOptions(list) {
    var current = $('source').value || '新增';
    var values = ['新增', '原统计'];
    list.forEach(function (r) { if (values.indexOf(r.source) < 0) values.push(r.source); });
    $('sourceOptions').innerHTML = values.map(function (v) { return '<option value="' + esc(v) + '"></option>'; }).join('');
    $('source').value = current;
  }

  function arc(cx, cy, r, start, end) {
    function point(deg) {
      var rad = (deg - 90) * Math.PI / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    }
    var a = point(end), b = point(start);
    return 'M' + cx + ' ' + cy + 'L' + a[0] + ' ' + a[1] + 'A' + r + ' ' + r + ' 0 ' + (end - start > 180 ? 1 : 0) + ' 0 ' + b[0] + ' ' + b[1] + 'Z';
  }

  function renderPie(s) {
    var start = 0, paths = '', labels = '';
    s.categories.filter(function (c) { return c.value > 0; }).forEach(function (c) {
      var deg = s.total ? c.value / s.total * 360 : 0;
      var end = start + deg;
      var mid = start + deg / 2;
      var rad = (mid - 90) * Math.PI / 180;
      paths += '<path d="' + arc(150, 150, 118, start, end) + '" fill="' + COLORS[c.name] + '" stroke="#fff" stroke-width="2"/>';
      if (deg > 8) labels += '<text x="' + (150 + 75 * Math.cos(rad)) + '" y="' + (150 + 75 * Math.sin(rad)) + '" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="900">' + (c.value / s.total * 100).toFixed(1) + '%</text>';
      start = end;
    });
    $('pie').innerHTML = '<svg viewBox="0 0 300 300">' + paths + '<circle cx="150" cy="150" r="52" fill="rgba(255,255,255,.72)"/><text x="150" y="145" text-anchor="middle" font-size="13" font-weight="800" fill="#607087">总额</text><text x="150" y="166" text-anchor="middle" font-size="18" font-weight="900">' + money(s.total).replace('.00', '') + '</text>' + labels + '</svg>';
    $('legend').innerHTML = s.categories.filter(function (c) { return c.value > 0; }).map(function (c) {
      return '<div><i class="dot" style="background:' + COLORS[c.name] + '"></i><span>' + esc(c.name) + '</span><b>' + money(c.value) + '</b></div>';
    }).join('');
  }

  function renderMonths(s) {
    var max = Math.max.apply(null, s.months.map(function (m) { return m.value; }).concat([1]));
    $('months').innerHTML = s.months.map(function (m) {
      return '<div class="month"><b class="ml">' + m.month + '</b><div class="track"><div class="fill" style="width:' + Math.max(m.value / max * 100, m.value ? 1 : 0) + '%"></div></div><b class="mv">' + money(m.value) + '（' + pct(m.percent) + '）</b></div>';
    }).join('');
  }

  function filtered(list) {
    var k = keyword.trim().toLowerCase();
    if (!k) return list;
    return list.filter(function (r) { return [r.expense_date, r.item, r.category, r.source, r.note].some(function (x) { return String(x).toLowerCase().indexOf(k) >= 0; }); });
  }

  function renderLedger(list) {
    list = filtered(list || records);
    var mid = Math.ceil(list.length / 2);
    var chunks = [list.slice(0, mid), list.slice(mid)];
    $('tables').innerHTML = chunks.map(function (chunk) {
      return '<div class="tableBox"><table><thead><tr><th>日期</th><th>项目</th><th>金额</th><th>来源</th>' + (isAccountant() ? '<th>操作</th>' : '') + '</tr></thead><tbody>' + chunk.map(function (r) {
        return '<tr><td>' + r.expense_date.slice(5) + '</td><td title="' + esc(r.note) + '">' + esc(r.item) + '</td><td class="money">' + money(r.amount) + '</td><td>' + esc(r.source) + '</td>' + (isAccountant() ? '<td><button class="mini" data-a="edit" data-id="' + r.id + '">编辑</button> <button class="mini del" data-a="del" data-id="' + r.id + '">删</button></td>' : '') + '</tr>';
      }).join('') + '</tbody></table></div>';
    }).join('');
  }

  function applyRole() {
    var acc = isAccountant();
    document.body.classList.toggle('isAccountant', acc);
    $('roleBadge').textContent = acc ? '会计模式' : '访客模式';
    $('roleBadge').classList.toggle('accountant', acc);
    $('accountantBtn').textContent = acc ? '退出会计' : '会计登录';
    $('inputPanel').classList.toggle('locked', !acc);
    if (acc && localStorage.getItem('expense_pin')) $('loginPin').value = localStorage.getItem('expense_pin');
  }

  async function loadData() {
    records = seedRecords();
    render();
    setStatus('正在读取云端数据……');
    try {
      var res = await fetch('/api/expenses', { cache: 'no-store' });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || '读取失败');
      var cloud = normalize(data.records);
      if (cloud.length) records = cloud;
      cloudConnected = true;
      setStatus(isAccountant() ? '已连接Cloudflare D1，会计模式可直接保存修改。' : '已连接Cloudflare D1，访客模式仅查看。');
      render();
    } catch (err) {
      cloudConnected = false;
      setStatus('云端读取失败，当前显示内置初始记录：' + err.message, 'warn');
      render();
    }
  }

  function payload() {
    return {
      expense_date: $('date').value,
      item: $('item').value.trim(),
      amount: Number($('amount').value),
      category: $('category').value,
      source: $('source').value.trim() || '新增',
      note: $('note').value.trim()
    };
  }

  function clearForm() {
    $('form').reset();
    $('date').valueAsDate = new Date();
    $('id').value = '';
    $('save').textContent = '保存记录';
    $('cancel').classList.add('hide');
    $('source').value = '新增';
  }

  async function login(pin) {
    if (!pin) { alert('请输入会计密码。'); return; }
    try {
      var res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin }, body: JSON.stringify({ pin: pin }) });
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '会计登录失败。');
      localStorage.setItem('expense_pin', pin);
      localStorage.setItem('expense_role', 'accountant');
      role = 'accountant';
      setStatus('已进入会计模式，录入、编辑、删除无需再次输入密码。');
      render();
    } catch (err) {
      alert(err.message || '会计登录失败。');
    }
  }

  function visitorMode() {
    localStorage.removeItem('expense_role');
    role = 'visitor';
    clearForm();
    setStatus(cloudConnected ? '已切换为访客模式，仅查看统计和明细。' : '当前显示内置初始记录。');
    render();
  }

  async function saveRecord(e) {
    e.preventDefault();
    if (!isAccountant()) { alert('请先进入会计模式。'); return; }
    var id = $('id').value;
    var res = await fetch(id ? '/api/expenses/' + id : '/api/expenses', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': localStorage.getItem('expense_pin') || '' },
      body: JSON.stringify(payload())
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) { alert(data.error || '保存失败。'); return; }
    clearForm();
    loadData();
  }

  function editRecord(id) {
    if (!isAccountant()) { alert('请先进入会计模式。'); return; }
    var r = records.find(function (x) { return String(x.id) === String(id); });
    if (!r) return;
    $('id').value = r.id;
    $('date').value = r.expense_date;
    $('item').value = r.item;
    $('amount').value = r.amount;
    $('category').value = r.category;
    $('source').value = r.source;
    $('note').value = r.note;
    $('save').textContent = '更新记录';
    $('cancel').classList.remove('hide');
  }

  async function deleteRecord(id) {
    if (!isAccountant()) { alert('请先进入会计模式。'); return; }
    var r = records.find(function (x) { return String(x.id) === String(id); });
    if (!r || !confirm('确定删除：' + r.item + ' ' + money(r.amount) + '？')) return;
    var res = await fetch('/api/expenses/' + id, { method: 'DELETE', headers: { 'X-Admin-Pin': localStorage.getItem('expense_pin') || '' } });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) { alert(data.error || '删除失败。'); return; }
    loadData();
  }

  function exportCsv() {
    var rows = [['日期', '项目', '金额', '分类', '来源', '备注']].concat(records.map(function (r) { return [r.expense_date, r.item, r.amount.toFixed(2), r.category, r.source, r.note]; }));
    var text = '\ufeff' + rows.map(function (row) { return row.map(function (cell) { return '"' + String(cell).replaceAll('"', '""') + '"'; }).join(','); }).join('\n');
    var url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = '医疗费用记录.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', function () {
    CATEGORIES.forEach(function (c) { $('category').insertAdjacentHTML('beforeend', '<option>' + c + '</option>'); });
    $('date').valueAsDate = new Date();
    if (localStorage.getItem('expense_pin')) $('loginPin').value = localStorage.getItem('expense_pin');
    $('form').addEventListener('submit', saveRecord);
    $('cancel').addEventListener('click', clearForm);
    $('search').addEventListener('input', function (e) { keyword = e.target.value; render(); });
    $('refresh').addEventListener('click', loadData);
    $('exportCsv').addEventListener('click', exportCsv);
    $('loginBtn').addEventListener('click', function () { login($('loginPin').value); });
    $('loginPin').addEventListener('keydown', function (e) { if (e.key === 'Enter') login($('loginPin').value); });
    $('accountantBtn').addEventListener('click', function () { isAccountant() ? visitorMode() : $('loginPin').focus(); });
    $('visitorBtn').addEventListener('click', visitorMode);
    $('tables').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.getAttribute('data-a') === 'edit') editRecord(btn.getAttribute('data-id'));
      if (btn.getAttribute('data-a') === 'del') deleteRecord(btn.getAttribute('data-id'));
    });
    loadData();
  });
})();
