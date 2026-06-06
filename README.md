# Visualization of Expense Data

江阴中医院治疗费用合并统计网站。项目用于每日录入新增费用，并自动更新总览卡片、分类汇总、饼图、月度分布和全部明细。

## 功能

- 保留当前 39 条已核对费用记录。
- 新增、编辑、删除每日费用。
- 数据保存到 Cloudflare D1。
- 图表和表格随数据自动更新。
- 支持 CSV 导出。

## 已内置的校对修正

- `12楼护工累计10天` 归到 `2026-03-13`
- `睡衣` 归到 `2026-04-18`
- `气垫床` 金额为 `407.16`
- `湿纸巾32+58` 已从误识别项更正

## 项目结构

```text
index.html
assets/styles.css
assets/app.js
functions/_lib/data.js
functions/_lib/db.js
functions/api/expenses/index.js
functions/api/expenses/[id].js
wrangler.toml
```

## Cloudflare Pages 设置

- Framework preset：`None`
- Build command：留空
- Build output directory：`.`
- D1 binding 变量名：`DB`
- 环境变量：`ADMIN_PIN`，用于保护新增、编辑、删除
- 计划域名：`exp.morandi.dpdns.org`

项目会在首次读取 `/api/expenses` 时自动建表，并在空库时自动写入 39 条初始数据。
