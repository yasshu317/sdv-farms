// @ts-check
import { test, expect } from '@playwright/test'

// Scope all modal assertions to this container to avoid matching Phase III email input
const MODAL = 'div.fixed:has-text("Book Service Enquiry")'

test.describe('Service Booking Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('domcontentloaded')
    // Wait for the Phase II service cards to render
    await page.getByRole('heading', { name: 'Quality Fencing' }).waitFor({ state: 'visible', timeout: 15000 })
  })

  test('services page loads with Phase II heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Our Services/i }).first()).toBeVisible()
    await expect(page.getByText('Phase II — One-Time Services')).toBeVisible()
  })

  test('shows all 5 Phase II service cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quality Fencing' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Borewell & Electricity' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Drip Irrigation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Farming Plan' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quality Plants' })).toBeVisible()
  })

  test('shows at least 5 Phase II Enquire buttons', async ({ page }) => {
    const enquireBtns = page.getByRole('button', { name: /Enquire/i })
    await expect(enquireBtns.first()).toBeVisible()
    expect(await enquireBtns.count()).toBeGreaterThanOrEqual(5)
  })

  test('clicking Enquire opens booking modal with form fields', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()

    const modal = page.locator(MODAL)
    await expect(modal).toBeVisible({ timeout: 5000 })
    await expect(modal.getByText('Book Service Enquiry')).toBeVisible()
    await expect(modal.getByText(/we.ll call you within 24 hours/i)).toBeVisible()

    // Scoped to modal — avoids matching Phase III email input
    await expect(modal.locator('input[type="tel"]')).toBeVisible()
    await expect(modal.locator('input[type="email"]')).toBeVisible()
    await expect(modal.getByRole('button', { name: /Submit Enquiry/i })).toBeVisible()
  })

  test('closes modal when X button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    const modal = page.locator(MODAL)
    await expect(modal).toBeVisible({ timeout: 5000 })

    // X button inside the modal header
    await modal.getByText('✕').click()
    await expect(modal).not.toBeVisible({ timeout: 3000 })
  })

  test('second and third Enquire buttons also open modal', async ({ page }) => {
    const btns = page.getByRole('button', { name: /Enquire/i })
    // Click second button
    await btns.nth(1).click()
    await expect(page.locator(MODAL)).toBeVisible({ timeout: 5000 })
    await page.locator(MODAL).getByText('✕').click()

    // Click third button
    await btns.nth(2).click()
    await expect(page.locator(MODAL)).toBeVisible({ timeout: 5000 })
  })

  test('Phase III shows coming soon section', async ({ page }) => {
    await expect(page.getByText('Phase III — Coming Soon')).toBeVisible()
  })

  test('notify-me form submits and shows confirmation', async ({ page }) => {
    await page.fill('input[placeholder="your@email.com"]', 'test@example.com')
    await page.getByRole('button', { name: 'Notify me' }).click()
    await expect(page.getByText(/notify you when Phase III/i)).toBeVisible()
  })
})
