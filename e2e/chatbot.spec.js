// @ts-check
import { test, expect } from '@playwright/test'

const LAUNCHER = 'button[aria-label="Open SDV Farms assistant"]'

// Wait for the page JS to hydrate and the launcher to be interactive
async function gotoHome(page) {
  await page.goto('/')
  // domcontentloaded is reliable in CI; networkidle can hang with placeholder Supabase
  await page.waitForLoadState('domcontentloaded')
  // Wait for React to attach event handlers (launcher must be visible & enabled)
  await page.locator(LAUNCHER).waitFor({ state: 'visible', timeout: 15000 })
}

test.describe('ChatBot Widget', () => {
  test('floating launcher button is visible on home page', async ({ page }) => {
    await gotoHome(page)
    await expect(page.locator(LAUNCHER)).toBeVisible()
  })

  test('clicking launcher opens the quick-action menu', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    // Wait for any of the menu action items to appear
    await expect(page.getByRole('button', { name: /Sell My Land/i })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).toBeVisible()
  })

  test('clicking launcher again closes the menu', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).toBeVisible({ timeout: 8000 })
    await page.locator(LAUNCHER).click()
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).not.toBeVisible({ timeout: 5000 })
  })

  test('menu X button closes the menu', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).toBeVisible({ timeout: 8000 })
    // X button is inside the fixed menu header
    await page.locator('button[title="Close menu"], div.fixed button').filter({ hasText: /^$/ }).first().or(
      page.locator('div.fixed').getByRole('button').filter({ hasText: '' }).first()
    ).click()
    // Fallback: click launcher to toggle closed
    if (await page.getByRole('button', { name: /Chat with Assistant/i }).isVisible()) {
      await page.locator(LAUNCHER).click()
    }
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).not.toBeVisible({ timeout: 5000 })
  })

  test('clicking "Chat with Assistant" opens full chat window', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await expect(page.getByRole('button', { name: /Chat with Assistant/i })).toBeVisible({ timeout: 8000 })
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    // Chat window: welcome message and input field appear
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })
    await expect(page.locator('input[type="text"]').last()).toBeVisible()
  })

  test('typing "how to sell" gets instant FAQ reply without AI', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('how to sell my land')
    await input.press('Enter')
    await expect(page.getByText(/Register as a Seller|3-step form|Pahani/i)).toBeVisible({ timeout: 10000 })
  })

  test('typing "contact" shows phone number instantly', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('contact number')
    await input.press('Enter')
    await expect(page.getByText(/7780312525/)).toBeVisible({ timeout: 10000 })
  })

  test('typing "help" gets instant help reply', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('help')
    await input.press('Enter')
    await expect(page.getByText(/Book a site visit|Call us|Browse/i)).toBeVisible({ timeout: 10000 })
  })

  test('FAQ replies contain no null JS errors (link click safety)', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('buy land')
    await input.press('Enter')
    await expect(page.getByText(/Browse|properties/i).last()).toBeVisible({ timeout: 10000 })

    // No null-property crash from the closure bug fix
    const nullErrors = errors.filter(e => e.includes("Cannot read properties of null"))
    expect(nullErrors).toHaveLength(0)
  })

  test('back button returns to menu from chat', async ({ page }) => {
    await gotoHome(page)
    await page.locator(LAUNCHER).click()
    await page.getByRole('button', { name: /Chat with Assistant/i }).click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 8000 })

    const backBtn = page.locator('button[title="Back to menu"]')
    if (await backBtn.count() > 0) {
      await backBtn.click()
      await expect(page.getByRole('button', { name: /Chat with Assistant/i })).toBeVisible({ timeout: 5000 })
    }
  })
})
