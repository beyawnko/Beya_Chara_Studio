import { expect, test } from '@playwright/test'

test('digital tailor mode toggles', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Enter Digital Tailor').click()
  await expect(page.getByText('Digital Tailor')).toBeVisible()
  await page.getByText('Back to Character Mode').click()
  await expect(page.getByText('Character Morph Creator')).toBeVisible()
})
