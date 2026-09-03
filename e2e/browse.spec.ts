import { expect, test } from '@playwright/test'

test('home shows seeded listings with price and rating', async ({ page }) => {
  await page.goto('/')
  const cards = page.getByTestId('listing-card')
  await expect(cards.first()).toBeVisible()
  expect(await cards.count()).toBeGreaterThanOrEqual(20)

  const first = cards.first()
  await expect(first).toContainText(/\$\d/)
  await expect(first).toContainText(/4\.\d\d/)
})

test('every card image resolves', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('listing-card').first().waitFor()
  const broken = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')]
    await Promise.all(
      imgs.map((i) =>
        i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r }),
      ),
    )
    return imgs.filter((i) => i.naturalWidth === 0).map((i) => i.src)
  })
  expect(broken).toEqual([])
})

test('category filter narrows the results', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('listing-card').first().waitFor()
  const before = await page.getByTestId('listing-card').count()

  await page.getByTestId('category-Cabins').click()
  await expect(page.getByTestId('results-heading')).toHaveText('Cabins')
  await expect.poll(() => page.getByTestId('listing-card').count()).toBeLessThan(before)
})

test('destination search filters by city', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('search-where').fill('Kyoto')
  await page.getByTestId('search-submit').click()

  await expect(page.getByTestId('results-heading')).toContainText('Kyoto')
  const cards = page.getByTestId('listing-card')
  await expect(cards).toHaveCount(1)
  await expect(cards.first()).toContainText('Kyoto')
})

test('listing detail shows the correct price maths', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('listing-card').first().click()
  await page.getByTestId('listing-detail').waitFor()

  const breakdown = page.getByTestId('price-breakdown')
  await expect(breakdown).toBeVisible()

  const line = await breakdown.textContent()
  const m = line!.match(/\$([\d,]+) × (\d+) nights\$([\d,]+)/)
  expect(m, `unexpected breakdown text: ${line}`).not.toBeNull()

  const nightly = Number(m![1].replace(/,/g, ''))
  const nights = Number(m![2])
  const accommodation = Number(m![3].replace(/,/g, ''))
  expect(accommodation).toBe(nightly * nights)
})
