
import { test, expect } from '@playwright/test';
import {loginAs} from './helpers/auth.helper'; 

test.describe('Coordinator Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'coordinator');

    //await expect(page.getByText('Total Bookings')).toBeVisible();
  });

  // Dashboard stat cards are visible
  test('Dashboard stat cards are visible', async ({ page }) => {
  await expect(page.getByText('TOTAL BOOKINGS')).toBeVisible();
  await expect(page.getByText('PENDING APPROVAL')).toBeVisible();
  await expect(page.getByText('APPROVED', { exact: true })).toBeVisible();
  await expect(page.getByText('CANCELLED', { exact: true })).toBeVisible();
  await page.waitForTimeout(2000);
});

  // Coordinator can add a new service via modal
    test('Coordinator can add a new service via modal', async ({ page }) => {

    await page.getByRole('link', { name: 'Manage Services' }).click();

    await page.getByTestId('add-service-btn').click();

    await page.getByRole('textbox', { name: 'Enter service name' })
      .fill('Social Skill Group');

    await page.getByTestId('service-modal')
      .getByRole('combobox')
      .selectOption('Support Coordination');

    await page.getByRole('textbox', { name: 'Enter service description' })
      .fill('Focuses on improving confidence, reducing isolation and overall well being');

    await page.getByTestId('save-btn').click();

    await expect(
      page.locator('table').getByText('Social Skill Group').first()
    ).toBeVisible();
  });

  // New service appears in the services table
  test('New service appears in the services table', async ({ page }) => {
  await page.click('text=Manage Services');

  // wait for table to load
  await expect(page.locator('table')).toBeVisible();

  // FIX: scope to table + pick first match
  const serviceRow = page
    .locator('table')
    .locator('tr')
    .filter({ hasText: 'Social Skill Group' })
    .first();

  await expect(serviceRow).toBeVisible();
});

});

test('Coordinator can approve a Pending booking', async ({ page }) => {

  // STEP 1: create booking first
  await loginAs(page, 'participant');

  await page.getByRole('link', { name: 'Book a Service' }).click();

  await page.getByTestId('service-select').selectOption('1');
  await page.getByTestId('date-input').fill('2026-05-26');
  await page.getByTestId('notes-input').fill('test');

  await page.getByTestId('submit-btn').click();

 //await page.getByTestId('header-logout').click();

const logoutBtn = page
  .locator('app-dialog-ui')
  .getByRole('button', { name: 'Logout' });

  // STEP 2: switch to coordinator
  await loginAs(page, 'coordinator');

  await page.goto('/dashboard');

  await page.getByRole('link', { name: 'All Bookings' }).click();

  const row = page.locator('tr').filter({ hasText: 'Pending' }).first();
  await expect(row).toBeVisible();
  const approveBtn = row.getByRole('button', { name: 'Approve' });
  await expect(approveBtn).toBeVisible();
  await approveBtn.click();

});

    // Approved booking shows green status badge
  test('Approved booking shows green status badge', async ({ page }) => {

  await loginAs(page, 'coordinator');

  const row = page.locator('tr').filter({ hasText: 'Approved' }).first();

  await expect(row).toBeVisible();

  const statusCell = row.locator('td').filter({ hasText: 'Approved' });

  await expect(statusCell).toBeVisible();
});
