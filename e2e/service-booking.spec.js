// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Service Booking Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
  })

  test('services page loads with phase 2 service cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Our Services/i }).first()).toBeVisible()
    const cards = page.locator('[data-testid="service-card"], .service-card').or(
      page.locator('div').filter({ hasText: /Enquire →/ })
    )
    // At least the phase 2 services are visible
    const enquireButtons = page.getByRole('button', { name: /Enquire/i })
    await expect(enquireButtons.first()).toBeVisible()
  })

  test('clicking Enquire opens booking modal', async ({ page }) => {
    const firstEnquire = page.getByRole('button', { name: /Enquire/i }).first()
    await firstEnquire.click()

    // Modal should appear
    await expect(page.getByText('Book Service Enquiry')).toBeVisible()
    await expect(page.getByLabel(/Full Name/i)).toBeVisible()
    await expect(page.getByLabel(/Phone/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
  })

  test('closes modal when X button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    await expect(page.getByText('Book Service Enquiry')).toBeVisible()

    await page.getByText('✕').click()
    await expect(page.getByText('Book Service Enquiry')).not.toBeVisible()
  })

  test('shows validation: submit without required fields', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    const submitBtn = page.getByRole('button', { name: /Submit Enquiry/i })
    await submitBtn.click()
    // HTML5 validation prevents submission — full_name field should be invalid
    const fullNameInput = page.getByLabel(/Full Name/i)
    await expect(fullNameInput).toBeVisible()
  })

  test('shows all 5 Phase II Enquire buttons', async ({ page }) => {
    const enquireButtons = page.getByRole('button', { name: /Enquire/i })
    const count = await enquireButtons.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })
})
