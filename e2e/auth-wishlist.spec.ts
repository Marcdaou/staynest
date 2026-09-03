import { expect, test } from '@playwright/test'
import { login } from './helpers'

test('a signed-out user is asked to log in before saving', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('listing-card').first().waitFor()
  await page.getByTestId('wishlist-toggle').first().click()
  await expect(page.getByTestId('auth-modal')).toBeVisible()
})

test('login, save a home, and see it persist in Wishlists', async ({ page }) => {
  await page.goto('/')
  await login(page)

  await page.getByTestId('listing-card').first().waitFor()
  const title = await page.getByTestId('listing-card').first().textContent()

  const heart = page.getByTestId('wishlist-toggle').first()
  await heart.click()
  await expect(heart).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/wishlists')
  await expect(page.getByTestId('wishlists-page')).toBeVisible()
  await expect(page.getByTestId('listing-card')).toHaveCount(1)

  // reload proves it came from the database, not local state
  await page.reload()
  await expect(page.getByTestId('listing-card').first()).toContainText(
    title!.split('$')[0].slice(0, 12),
  )

  // clean up so the test is repeatable
  await page.getByTestId('wishlist-toggle').first().click()
  await expect(page.getByTestId('listing-card')).toHaveCount(0)
})
