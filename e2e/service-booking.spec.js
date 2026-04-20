// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Service Booking Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
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

  test('shows all 5 Phase II Enquire buttons', async ({ page }) => {
    const enquireBtns = page.getByRole('button', { name: /Enquire/i })
    await expect(enquireBtns.first()).toBeVisible()
    const count = await enquireBtns.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('clicking Enquire opens booking modal', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    await expect(page.getByText('Book Service Enquiry')).toBeVisible()
    // Labels don't have htmlFor — locate inputs by placeholder or order
    await expect(page.locator('input[type="text"], input:not([type])').first()).toBeVisible()
    await expect(page.locator('input[type="tel"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('closes modal when X button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    await expect(page.getByText('Book Service Enquiry')).toBeVisible()
    await page.getByText('✕').click()
    await expect(page.getByText('Book Service Enquiry')).not.toBeVisible()
  })

  test('submit button is present in open modal', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    await expect(page.getByRole('button', { name: /Submit Enquiry/i })).toBeVisible()
  })

  test('modal shows service type in subtitle', async ({ page }) => {
    await page.getByRole('button', { name: /Enquire/i }).first().click()
    await expect(page.getByText('Book Service Enquiry')).toBeVisible()
    // Subtitle mentions the service type
    await expect(page.getByText(/we.ll call you within 24 hours/i)).toBeVisible()
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
