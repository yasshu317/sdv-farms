import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
  })

  test('loads with Our Services heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /our services/i })).toBeVisible()
  })

  test('shows Phase II services section', async ({ page }) => {
    await expect(page.getByText('Phase II — One-Time Services')).toBeVisible()
  })

  test('shows all 5 Phase II services', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quality Fencing' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Borewell & Electricity' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Drip Irrigation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Farming Plan' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quality Plants' })).toBeVisible()
  })

  test('shows Phase III coming soon section', async ({ page }) => {
    await expect(page.getByText('Phase III — Coming Soon')).toBeVisible()
    await expect(page.getByText(/Coming Soon/i).first()).toBeVisible()
  })

  test('Phase III has notify-me email form', async ({ page }) => {
    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]')
    await expect(emailInput).toBeVisible()
    const notifyBtn = page.getByRole('button', { name: 'Notify me' })
    await expect(notifyBtn).toBeVisible()
  })

  test('notify-me form submits and shows confirmation', async ({ page }) => {
    await page.fill('input[placeholder="your@email.com"]', 'test@example.com')
    await page.getByRole('button', { name: 'Notify me' }).click()
    await expect(page.getByText(/notify you when Phase III/i)).toBeVisible()
  })

  test('each service has an enquiry link', async ({ page }) => {
    const enquiryLinks = page.getByRole('link', { name: /Book Enquiry/i })
    await expect(enquiryLinks.first()).toBeVisible()
    const count = await enquiryLinks.count()
    expect(count).toBe(5)
  })

  test('home page language toggle switches services link to Telugu', async ({ page }) => {
    // Language toggle lives in Navbar on the home page
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'తెలుగు' }).first()
    await toggle.click()
    // Services nav link should now show in Telugu
    await expect(page.getByRole('link', { name: 'సేవలు' }).first()).toBeVisible()
  })
})
