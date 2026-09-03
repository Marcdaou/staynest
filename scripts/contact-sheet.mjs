import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const ids = readFileSync('/tmp/pool.txt', 'utf8').trim().split('\n')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } })

for (const [part, slice] of [[1, ids.slice(0, 56)], [2, ids.slice(56)]]) {
  const html = `<body style="margin:0;font:11px system-ui;display:grid;grid-template-columns:repeat(8,1fr);gap:2px;background:#111;color:#fff">
  ${slice.map((id, i) => `<div><div style="text-align:center">${(part - 1) * 56 + i}</div><img src="https://images.unsplash.com/${id}?w=300&h=200&fit=crop&q=60" style="width:100%;height:110px;object-fit:cover"></div>`).join('')}
  </body>`
  await p.setContent(html)
  await p.waitForLoadState('load')
  await p.waitForTimeout(6000)
  await p.screenshot({ path: `/tmp/shots/sheet${part}.png`, fullPage: true })
}
await b.close()
