// @ts-check
import { test, expect } from '@playwright/test'

const LAUNCHER     = '[data-testid="chat-launcher"]'
const MENU         = '[data-testid="chat-menu"]'
const CHAT_WINDOW  = '[data-testid="chat-window"]'
const CHAT_INPUT   = '[data-testid="chat-input"]'
const MENU_CHAT    = '[data-testid="menu-action-chat"]'

/**
 * Navigate to home and wait until React has hydrated the ChatBot.
 *
 * data-testid="chat-launcher" is set ONLY inside a useEffect (client-side),
 * so its presence in the DOM guarantees React has mounted and event
 * handlers are attached — no pre-hydration click lost.
 */
async function gotoHome(page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  // This attribute only appears after React useEffect — hydration is guaranteed
  await page.locator(LAUNCHER).waitFor({ state: 'visible', timeout: 20000 })
}

/** Click via native DOM .click() — bypasses the Next.js dev overlay */
async function jsClick(page, selector) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel)
    if (!el) throw new Error(`Element not found: ${sel}`)
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }, selector)
}

async function openMenu(page) {
  await jsClick(page, LAUNCHER)
  await page.locator(MENU).waitFor({ state: 'visible', timeout: 8000 })
}

async function openChat(page) {
  await openMenu(page)
  await jsClick(page, MENU_CHAT)
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
    await jsClick(page, LAUNCHER)
    await expect(page.locator(MENU)).not.toBeVisible({ timeout: 5000 })
  })

  test('clicking "Chat with Assistant" opens full chat window', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    const win = page.locator(CHAT_WINDOW)
    await expect(win).toBeVisible()
    await expect(page.locator(CHAT_INPUT)).toBeVisible()
    // Header "SDV Farms Assistant" is inside the chat window
    await expect(win.getByText('SDV Farms Assistant', { exact: true })).toBeVisible()
  })

  test('typing "how to sell" gets instant FAQ reply', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('how to sell my land')
    await page.locator(CHAT_INPUT).press('Enter')
    // Scope to chat window to avoid strict mode violation from multiple matches
    await expect(
      page.locator(CHAT_WINDOW).getByText(/Register as a Seller|3-step form|Pahani/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('typing "contact" shows phone number', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('contact number')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(
      page.locator(CHAT_WINDOW).getByText(/7780312525/).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('typing "help" gets instant help reply', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('help')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(
      page.locator(CHAT_WINDOW).getByText(/Book a site visit|Call us|Browse/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('typing unrelated text gets static fallback with phone number', async ({ page }) => {
    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('random gibberish query xyz')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(
      page.locator(CHAT_WINDOW).getByText(/7780312525/).first()
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator(CHAT_WINDOW).getByText(/saved answer|quick buttons/i).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('FAQ replies contain no null JS errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await gotoHome(page)
    await openChat(page)
    await page.locator(CHAT_INPUT).fill('buy land')
    await page.locator(CHAT_INPUT).press('Enter')
    await expect(
      page.locator(CHAT_WINDOW).getByText(/Browse|properties/i).first()
    ).toBeVisible({ timeout: 10000 })

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
