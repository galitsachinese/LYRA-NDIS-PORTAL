import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Coordinator Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'coordinator');
  });

  test('Dashboard stat cards are visible', async ({ page }) => {
    await expect(page.getByText('TOTAL BOOKINGS')).toBeVisible();
    await expect(page.getByText('PENDING APPROVAL')).toBeVisible();
    await expect(page.getByText('APPROVED', { exact: true })).toBeVisible();
    await expect(page.getByText('CANCELLED', { exact: true })).toBeVisible();
  });

  test('Coordinator can add a new service via modal', async ({ page }) => {

    await page.getByRole('link', { name: 'Manage Services' }).click();

    await page.getByTestId('add-service-btn').click();

    await page.getByRole('textbox', { name: 'Service Name *' })
      .fill('Social Skill Group');

    await page.getByTestId('service-modal')
      .getByRole('combobox')
      .selectOption('Support Coordination');

    await page.getByRole('textbox', { name: 'Description' })
      .fill('Focuses on improving confidence, reducing isolation and overall well being');

    await page.getByTestId('save-btn').click();

    await expect(
      page.locator('table').getByText('Social Skill Group').first()
    ).toBeVisible();
  });

  test('New service appears in the services table', async ({ page }) => {

    await page.getByRole('link', { name: 'Manage Services' }).click();

    await expect(page.locator('table')).toBeVisible();

    const serviceRow = page
      .locator('table')
      .locator('tr')
      .filter({ hasText: 'Social Skill Group' })
      .first();

    await expect(serviceRow).toBeVisible();
  });

  test('Coordinator can approve a Pending booking', async ({ page, browser }) => {

    // Create booking as participant
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();

    await loginAs(participantPage, 'participant');

    await participantPage.getByRole('link', { name: 'Book a Service' }).click();

    await participantPage.getByTestId('service-select').selectOption('1');

    await participantPage.getByTestId('date-input')
      .fill('2026-06-16');

    await participantPage.getByTestId('notes-input')
      .fill('test');

    await participantPage.getByTestId('submit-btn').click();

    await participantContext.close();

    // Coordinator approves booking
    await page.goto('/dashboard/bookings');

    const row = page.locator('tr').filter({ hasText: 'Pending' }).first();

    await expect(row).toBeVisible();

    const approveBtn = row.getByRole('button', {
      name: /approve/i
    });

    await expect(approveBtn).toBeVisible();

    await approveBtn.click();
  });

  test('Approved booking shows green status badge', async ({ page }) => {

    await page.goto('/dashboard/bookings');

    const row = page.locator('tr')
      .filter({ hasText: 'Approved' })
      .first();

    await expect(row).toBeVisible();

    const statusCell = row.locator('td')
      .filter({ hasText: 'Approved' });

    await expect(statusCell).toBeVisible();
  });

  test('Coordinator can assign a support worker to a booking', async ({ page }) => {

    await page.goto('/dashboard/bookings');

    await expect(page).toHaveURL(/bookings/);

    // Filter approved bookings
    await page.getByRole('button', { name: /status/i }).click();

    await page.getByRole('button', {
      name: 'Approved',
      exact: true
    }).click();

    await page.waitForTimeout(1000);

    const bookingRow = page.locator('tbody tr').first();

    await expect(bookingRow).toBeVisible();

    // Open action menu
    await bookingRow.getByTestId('menu-btn').click();

    // Click Assign Worker
    await page.getByRole('button', { name: 'Assign Worker' }).click();

    // Verify modal opens
    await expect(
      page.getByRole('heading', {
        name: /assign worker/i
      })
    ).toBeVisible();

    // Select worker
    await page.getByRole('combobox')
      .selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Assign Worker' }).nth(1).click();
  });

// LOG IN TO PARTICIPANT THAT VIEWS WHO IS MY WORKER

 test('Participant can view assigned worker details', async ({ page }) => {

  await page.goto('http://localhost:4200/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('participant1@ndisportal.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test@1234');
  await page.getByRole('button', { name: 'Log in' }).click();
  //await page.getByRole('link', { name: 'My Bookings' }).click();
  //await page.getByRole('button', { name: 'View' }).click();
  //await page.getByText('Close').click();

    // Navigate to My Bookings
    await page.getByRole('link', { name: 'My Bookings' }).click();

    // Verify booking table is visible
    await expect(
      page.locator('table')
    ).toBeVisible();

    // Find an approved booking
    const bookingRow = page.locator('tbody tr')
      .filter({ hasText: 'Approved' })
      .first();

    await expect(bookingRow).toBeVisible();

   // Click View button under "Who is my worker?"
    await bookingRow.getByRole('button', {
      name: /view/i
    }).click();

    // Verify worker details modal/page opens
    await expect(
      page.getByRole('heading', { name: 'Booking Notes' })
    ).toBeVisible();

    // Verify worker information is displayed
    await expect(
      page.getByText('Jimwell Buensalida')
    ).toBeVisible();

    await expect(
      page.getByText('09122343341')
    ).toBeVisible();

    await expect(
      page.locator('span').filter({ hasText: /^Short Term Respite Accommodation$/ })
    ).toBeVisible();

  });

});
