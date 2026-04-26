import { test, expect } from '@playwright/test'

test.describe('Buyer Land Request Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/buyer-request')
  })

  test('shows Post a Land Request heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /post a land request/i })).toBeVisible()
  })

  test('has name and phone fields', async ({ page }) => {
    await expect(page.getByPlaceholder('Your name')).toBeVisible()
    await expect(page.getByPlaceholder('+91 98765 43210')).toBeVisible()
  })

  test('has optional location dropdowns', async ({ page }) => {
    // State dropdown should be present
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })

  test('shows soil type chips', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Black' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Red' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
  })

  test('soil type chip toggles active state', async ({ page }) => {
    const blackBtn = page.getByRole('button', { name: 'Black' })
    await blackBtn.click()
    // After click it should have active styling (border-turmeric)
    await expect(blackBtn).toHaveClass(/border-turmeric/)
  })

  test('validation requires name and phone', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit Request' }).click()
    // HTML5 required validation fires — name field should be focused
    const nameInput = page.getByPlaceholder('Your name')
    await expect(nameInput).toBeFocused()
  })

  test('state dropdown populates district dropdown', async ({ page }) => {
    const stateSelect = page.getByRole('combobox').first()
    await stateSelect.selectOption('Telangana')
    // District dropdown should now appear
    const districtSelect = page.getByRole('combobox').nth(1)
    await expect(districtSelect).toBeVisible()
  })

  test('district dropdown populates mandal dropdown', async ({ page }) => {
    await page.getByRole('combobox').first().selectOption('Telangana')
    const districtSelect = page.getByRole('combobox').nth(1)
    await districtSelect.selectOption('Rangareddy')
    const mandalSelect = page.getByRole('combobox').nth(2)
    await expect(mandalSelect).toBeVisible()
  })

  test('has link to property listings (breadcrumb or main nav)', async ({ page }) => {
    const listingsCrumb = page.getByRole('link', { name: /^Listings$/ })
    const navProperties = page.locator('header').getByRole('link', { name: /properties|ఆస్తులు/i })
    await expect(listingsCrumb.or(navProperties).first()).toBeVisible()
  })
})
