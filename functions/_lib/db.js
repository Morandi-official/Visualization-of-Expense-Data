import { INITIAL_RECORDS } from './data.js';

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }
});

export async function ensureDatabase(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_date TEXT NOT NULL,
      item TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      category TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '新增',
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare('CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)').run();

  await seedIfEmpty(db);
}

export async function seedIfEmpty(db) {
  const row = await db.prepare('SELECT COUNT(*) AS count FROM expenses').first();
  if (Number(row?.count || 0) > 0) return;

  const stmt = db.prepare(
    'INSERT INTO expenses(expense_date, item, amount, category, source, note) VALUES (?, ?, ?, ?, ?, ?)'
  );

  // 逐条插入比一次 batch 更便于 Cloudflare D1 失败定位，也避免空库初始化时静默失败。
  for (const record of INITIAL_RECORDS) {
    await stmt.bind(...record).run();
  }
}

export function requireAdmin(request, env) {
  if (!env.ADMIN_PIN) {
    return {
      ok: false,
      response: json({ error: '后台尚未设置 ADMIN_PIN，已禁止写入。请在 Cloudflare Pages 环境变量中添加 ADMIN_PIN。' }, 403)
    };
  }

  const pin = request.headers.get('X-Admin-Pin') || '';
  if (pin !== env.ADMIN_PIN) {
    return {
      ok: false,
      response: json({ error: '管理员口令不正确，无法保存修改。' }, 401)
    };
  }

  return { ok: true };
}

export function clean(raw) {
  const expense_date = String(raw.expense_date || raw.date || '').trim();
  const item = String(raw.item || '').trim();
  const amount = Number(raw.amount);
  const category = String(raw.category || '').trim();
  const source = String(raw.source || '新增').trim();
  const note = String(raw.note || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) throw Error('日期格式应为 YYYY-MM-DD。');
  if (!item) throw Error('项目名称不能为空。');
  if (!Number.isFinite(amount) || amount < 0) throw Error('金额必须是大于等于0的数字。');
  if (!category) throw Error('分类不能为空。');

  return { expense_date, item, amount, category, source, note };
}
