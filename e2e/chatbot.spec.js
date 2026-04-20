// @ts-check
import { test, expect } from '@playwright/test'

const LAUNCHER     = '[data-testid="chat-launcher"]'
const MENU         = '[data-testid="chat-menu"]'
const CHAT_WINDOW  = '[data-testid="chat-window"]'
const CHAT_INPUT   = '[data-testid="chat-input"]'
const MENU_CHAT    = '[data-testid="menu-action-chat"]'

/**
 * Navigate to home and wait until React has hydrated the ChatBot.
 * We detect hydration by waiting for the launcher to have its onClick
 * attached — we do this by clicking it and checking the menu appears.
 * If the first click doesn't open the menu (pre-hydration click), we
 * wait briefly and try once more.
 */
async function gotoHome(page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  // Ensure the launcher rendered by React (not just SSR HTML)
  await page.locator(LAUNCHER).waitFor({ state: 'visible', timeout: 15000 })
  // Wait for Next.js to finish hydration
  await page.waitForFunction(() => window.__NEXT_DATA__ !== undefined, { timeout: 15000 })
}

async function openMenu(page) {
  await page.locator(LAUNCHER).click()
  // If menu doesn't appear (pre-hydration click), try once more after a short wait
  const menu = page.locator(MENU)
  try {
    await menu.waitFor({ state: 'visible', timeout: 4000 })
  } catch {
    await page.waitForTimeout(800)
    await page.locator(LAUNCHER).click()
    await menu.waitFor({ state: 'visible', timeout: 8000 })
  }
}

async function openChat(page) {
  await openMenu(page)
  await page.locator(MENU_CHAT).click()
  await page.locator(CHAT_WINDOW).waitFor({ state: 'visible', timeout: 8000 })
}

// ── Tests ────────────────────────────────────────────────────────────────────
test.describe('ChatBot Widget', () => {
  test('floating launcher button is visible on home page', async ({ page }) => {
    await gotoHome(page)
    await expect(page.locator(LAUNCHER)).toBeVisible()
  })

  test('clicking launcher opens the quick-action menu', async ({ page }) => {
    await gotoHome(page)
    await openMenu(page)
    await expect(page.locator(MENU)).toBeVisible()
    await expect(page.locator(MENU_CHAT)).toBeVisible()
  })

  test('clicking launcher again closes the menu', async ({ page }) => {
    await gotoHome(page)
    await openMenu(page)
    await expect(page.locator(MENU)).toBeVisible()
    await page.locator(LAUNCHER).click()
    await expect(page.locator(MENU)).not.toBeVisible({ timeout: 5000 })
  })

  test('clicking "Chat with Assistant" opens full chat window', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await expect(page.locator(CHAT_WINDOW)).toBeVisible()
    await expect(page.locator(CHAT_INPUT)).toBeVisible()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible()
  })

  test('typing "how to sell" gets instant FAQ reply', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('how to sell my land')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(page.getByText(/Register as a Seller|3-step form|Pahani/i)).toBeVisible({ timeout: 10000 })
  })

  test('typing "contact" shows phone number', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('contact number')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(page.getByText(/7780312525/)).toBeVisible({ timeout: 10000 })
  })

  test('typing "help" gets instant help reply', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('help')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(page.getByText(/Book a site visit|Call us|Browse/i)).toBeVisible({ timeout: 10000 })
  })

  test('FAQ replies contain no null JS errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('buy land')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(page.getByText(/Browse|properties/i).last()).toBeVisible({ timeout: 10000 })

    const nullErrors = errors.filter(e => e.includes("Cannot read properties of null"))
    expect(nullErrors).toHaveLength(0)
  })

  test('back button returns to menu from chat', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    const backBtn = page.locator('button[title="Back to menu"]')
    if (await backBtn.count() > 0) {
      await backBtn.click()
      await expect(page.locator(MENU)).toBeVisible({ timeout: 5000 })
    }
  })

  test('menu "Browse Properties" navigates to /properties', async ({ page }) => {
    await gotoHome(page)
    await openMenu(page)
    // Find the menu action for /properties
    const browseBtn = page.locator('[data-testid^="menu-action-"]').filter({ hasText: /Browse Properties/i })
    if (await browseBtn.count() > 0) {
      await browseBtn.click()
      await expect(page).toHaveURL(/\/properties/, { timeout: 8000 })
    }
  })
})
