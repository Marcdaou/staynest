import { chromium } from '@playwright/test'

const url = process.argv[2]
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
await p.goto(url, { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(6000)
for (const f of p.frames()) {
  const ids = await f.evaluate(() =>
    [...document.querySelectorAll('input')].map((i) => i.id || i.name).filter(Boolean),
  ).catch(() => [])
  if (ids.length) console.log('FRAME', f.url().slice(0, 70), '=>', ids.join(','))
}
await p.screenshot({ path: '/tmp/shots/checkout.png' })
await b.close()
