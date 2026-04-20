// @ts-check
import { test, expect } from '@playwright/test'

// The floating launcher button has a stable aria-label
const LAUNCHER = 'button[aria-label="Open SDV Farms assistant"]'

test.describe('ChatBot Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('floating launcher button is visible on home page', async ({ page }) => {
    await expect(page.locator(LAUNCHER)).toBeVisible()
  })

  test('clicking launcher opens the quick-action menu', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('How can we help?')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Browse Properties').first()).toBeVisible()
    await expect(page.getByText('Chat with Assistant')).toBeVisible()
  })

  test('clicking launcher again closes the menu', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('How can we help?')).toBeVisible()
    // Toggle closed
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('How can we help?')).not.toBeVisible({ timeout: 3000 })
  })

  test('menu X button closes the menu', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('How can we help?')).toBeVisible()
    // X button inside the menu header
    await page.locator('div.fixed').filter({ hasText: 'How can we help?' }).locator('button').first().click()
    await expect(page.getByText('How can we help?')).not.toBeVisible({ timeout: 3000 })
  })

  test('clicking "Chat with Assistant" opens full chat window', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('Chat with Assistant')).toBeVisible()
    await page.getByText('Chat with Assistant').click()
    // Input field and welcome message should be visible
    await expect(page.locator('input[placeholder*="anything"], input[type="text"]').last()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible()
  })

  test('quick chip "How to sell my land?" gets instant FAQ reply', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    const sellChip = page.getByRole('button', { name: /how to sell my land/i })
    if (await sellChip.count() > 0) {
      await sellChip.click()
      await expect(page.getByText(/Register as a Seller|3-step form|Pahani/i)).toBeVisible({ timeout: 8000 })
    }
  })

  test('typing "how to sell" gets instant FAQ reply', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('how to sell my land')
    await input.press('Enter')
    await expect(page.getByText(/Register as a Seller|3-step form|Pahani/i)).toBeVisible({ timeout: 8000 })
  })

  test('typing "contact" shows phone number', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('contact number')
    await input.press('Enter')
    await expect(page.getByText(/7780312525/)).toBeVisible({ timeout: 8000 })
  })

  test('typing "help" gets instant menu reply', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('help')
    await input.press('Enter')
    await expect(page.getByText(/Browse Properties|Book a site visit|Call us/i)).toBeVisible({ timeout: 8000 })
  })

  test('FAQ links do not throw null JS errors when clicked', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    const input = page.locator('input[type="text"]').last()
    await input.fill('buy land')
    await input.press('Enter')
    await expect(page.getByText(/Browse|properties|site visit/i)).toBeVisible({ timeout: 8000 })

    // Assert no null-reading crash from the closure bug fix
    const nullErrors = errors.filter(e => e.includes("Cannot read properties of null"))
    expect(nullErrors).toHaveLength(0)
  })

  test('back button (‹) returns to menu from full chat', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await page.getByText('Chat with Assistant').click()
    await expect(page.getByText(/SDV Farms assistant/i)).toBeVisible({ timeout: 5000 })

    // Back button has title="Back to menu"
    const backBtn = page.locator('button[title="Back to menu"]')
    if (await backBtn.count() > 0) {
      await backBtn.click()
      await expect(page.getByText('How can we help?')).toBeVisible({ timeout: 3000 })
    }
  })

  test('menu "Browse Properties" navigates to /properties', async ({ page }) => {
    await page.locator(LAUNCHER).click()
    await expect(page.getByText('How can we help?')).toBeVisible()

    // The Browse Properties item is a button that pushes the route
    const browseBtn = page.getByText('Browse Properties').first()
    await browseBtn.click()
    await expect(page).toHaveURL(/\/properties/, { timeout: 8000 })
  })
})
