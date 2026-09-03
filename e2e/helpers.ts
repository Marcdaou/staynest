import type { Page } from '@playwright/test'

export const DEMO_EMAIL = 'guest@staynest.dev'
export const DEMO_PASSWORD = 'staynest-demo-2026'

/** Signs in through the real auth modal. */
export async function login(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.getByTestId('profile-menu').click()
  await page.getByTestId('header-login').click()
  await page.getByTestId('auth-modal').waitFor()
  await page.getByTestId('auth-email').fill(email)
  await page.getByTestId('auth-password').fill(password)
  await page.getByTestId('auth-submit').click()
  await page.getByTestId('auth-modal').waitFor({ state: 'detached' })
}
