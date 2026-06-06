import { INITIAL_RECORDS } from '../_lib/data.js';
import { ensureDatabase, json, requireAdmin } from '../_lib/db.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: '未找到 D1 绑定 DB。' }, 500);

  const auth = requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  try {
    await ensureDatabase(env.DB);
    await env.DB.prepare('DELETE FROM expenses').run();

    const stmt = env.DB.prepare(
      'INSERT INTO expenses(expense_date, item, amount, category, source, note) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const record of INITIAL_RECORDS) {
      await stmt.bind(...record).run();
    }

    return json({ ok: true, inserted: INITIAL_RECORDS.length });
  } catch (error) {
    return json({ error: error.message || '初始化费用数据失败。' }, 500);
  }
}
