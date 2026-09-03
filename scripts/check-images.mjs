import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await p.getByTestId('listing-card').first().waitFor()
await p.waitForTimeout(12000)
const res = await p.evaluate(async () => {
  const imgs = [...document.querySelectorAll('img')]
  await Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r })))
  return imgs.filter((i) => i.naturalWidth === 0).map((i) => i.src)
})
console.log('broken:', res.length, res.slice(0, 5))
await p.screenshot({ path: '/tmp/shots/home2.png' })
await b.close()
