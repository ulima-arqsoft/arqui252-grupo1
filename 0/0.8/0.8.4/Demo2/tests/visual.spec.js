import 'dotenv/config';
import { test } from '@playwright/test';
import { Eyes, Target } from '@applitools/eyes-playwright';

test('Visual Test - Banner + Card', async ({ page }) => {
  const eyes = new Eyes();

  await eyes.open(page, 'Demo Visual', 'Comparación Visual');

  await page.goto('http://localhost:5173');

  await eyes.check('Pantalla principal', Target.window());

  await eyes.close();
});
