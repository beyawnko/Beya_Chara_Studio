import { expect, test } from '@playwright/test'

test('app renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Character Morph Creator')).toBeVisible()
})
