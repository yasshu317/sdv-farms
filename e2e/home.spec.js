import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads and shows SDV Farms heading', async ({ page }) => {
    await expect(page).toHaveTitle(/SDV Farms/)
    await expect(page.locator('text=SDV Farms').first()).toBeVisible()
  })

  test('navbar has Properties and Services links', async ({ page }) => {
    // Scope to the <nav> element to avoid matching "Browse Properties →" in HowItWorks
    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Properties', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toBeVisible()
  })

  test('navbar has Sign in link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible()
  })

  test('Properties nav link navigates to /properties', async ({ page }) => {
    await page.locator('nav').first().getByRole('link', { name: 'Properties', exact: true }).click()
    await expect(page).toHaveURL(/\/properties/)
  })

  test('Services nav link navigates to /services', async ({ page }) => {
    await page.locator('nav').first().getByRole('link', { name: 'Services', exact: true }).click()
    await expect(page).toHaveURL(/\/services/)
  })

  test('language toggle switches to Telugu', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'తెలుగు' }).first()
    await toggle.click()
    // After switch, toggle button should now say "English"
    await expect(page.getByRole('button', { name: 'English' }).first()).toBeVisible()
  })

  test('hero section has a call-to-action button', async ({ page }) => {
    // Either "Book a Visit" or "Book Site Visit" CTA should exist
    const cta = page.locator('text=Book').first()
    await expect(cta).toBeVisible()
  })
})
