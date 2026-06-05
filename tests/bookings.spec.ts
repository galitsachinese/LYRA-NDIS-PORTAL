import { expect, type Locator, type Page, test } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Bookings - Participant', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'participant');
  });

  test('Participant submits a booking and sees Pending status', async ({ page }) => {

    // Go directly to booking page
    await page.goto('http://localhost:4200/bookings');

    // Open booking form
    await page.getByRole('link', { name: 'Book a Service' }).click();

    // Fill booking details
    await page.getByTestId('service-select').selectOption('1');

    await page.getByTestId('date-input').fill('2026-06-16');

    // Submit booking
    await page.getByTestId('submit-btn').click();

    // ASSERT: booking status becomes Pending
    await expect(
      page.getByRole('cell', { name: 'Pending' }).first()
    ).toBeVisible();
  });

  test('Booking form shows error when date is in the past', async ({ page }) => {

    // Go to booking page
    await page.goto('http://localhost:4200/bookings');

    // Open booking form
    await page.getByRole('link', { name: 'Book a Service' }).click();

    // Select service
    await page.getByTestId('service-select').selectOption('4');

    // Enter a past date
    await page.getByTestId('date-input').fill('2026-02-17');

    // Submit booking
    await page.getByTestId('submit-btn').click();

    // ASSERT: error message is shown
    await expect(
      page.getByText('Preferred date cannot be in')
    ).toBeVisible();
  });

  test('Booking form shows error when service is not selected', async ({ page }) => {

    // Go to booking page
    await page.goto('http://localhost:4200/bookings');

    // Open booking form
    await page.getByRole('link', { name: 'Book a Service' }).click();

    // Do NOT select a service

    // Fill only date
    await page.getByTestId('date-input').fill('2026-05-31');

    // Submit booking
    await page.getByTestId('submit-btn').click();

    // ASSERT: service validation error appears
    await expect(
      page.getByText('Service is required')
    ).toBeVisible();
  });

  test('Participant sees empty state when no bookings exist', async ({ page }) => {

    // Intercept the API to guarantee there are no bookings
    await page.route('**/api/bookings', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: { Data: [], Success: true }
        });
      } else {
        await route.fallback();
      }
    });

    await openMyBookings(page);

    await expect(
      page.getByText('No bookings found')
    ).toBeVisible();

    await expect(
      page.getByText('Try changing your filter or book a new service.')
    ).toBeVisible();
  });

  test('Cancel confirmation dialog appears before cancelling', async ({ page }) => {

    // Go to My Bookings
    await page.getByRole('link', { name: 'My Bookings' }).click();

    // Open kebab menu
    await page.getByRole('row', { name: 'Personal Hygiene Assistance' }).getByRole('button').click();

    // Cancel
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });

    await expect(cancelBtn).toBeVisible();

    await cancelBtn.click();

    // Confirm modal
    await expect(
      page.getByRole('button', { name: 'Yes, Cancel Booking' })
    ).toBeVisible();
  });

  test('Participant can cancel a Pending booking', async ({ page }) => {

    // Go to My Bookings
    await page.getByRole('link', { name: 'My Bookings' }).click();

    // Open kebab menu
     await page.getByRole('row', { name: 'Personal Hygiene Assistance' }).getByRole('button').click();

    // Cancel
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });

    //await expect(cancelBtn).toBeVisible();

    await cancelBtn.click();

    // Confirm modal
    await page.getByRole('button', { name: 'Yes, Cancel Booking' }).click();

    // Assertion
    await expect(
      page.getByRole('cell', { name: 'Cancelled' }).first()
    ).toBeVisible();
  });


});

type CreatedBooking = {
  id: number;
  serviceName: string;
  preferredDate: string;
};

async function openBookingForm(page: Page) {

  await page.getByRole('link', { name: 'Book a Service' }).click();

  await expect(
    page.getByRole('heading', { name: 'Book a Service' })
  ).toBeVisible();

  await expect(
    page.locator('select')
  ).toBeVisible();
}

async function openMyBookings(page: Page) {

  const heading = page.getByRole('heading', { name: 'My Bookings' });

  if (!(await heading.isVisible())) {
    await page.getByRole('link', { name: 'My Bookings' }).click();
  }

  await expect(heading).toBeVisible();
}

async function createBookingThroughUi(
  page: Page,
  preferredDate: string
): Promise<CreatedBooking> {

  await openBookingForm(page);

  const serviceName = await selectFirstService(page);

  await fillPreferredDate(page, preferredDate);

  await page
    .locator('textarea')
    .fill(`Playwright booking ${Date.now()}`);

  const createBookingResponse = page.waitForResponse((response) =>
    response.request().method() === 'POST' &&
    /\/api\/bookings$/i.test(
      new URL(response.url()).pathname
    )
  );

  await submitBooking(page);

  const response = await createBookingResponse;

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  const created = body.Data ?? body;

  const id = Number(created.id ?? created.Id);

  expect(id).toBeTruthy();

  // Wait until redirected back to bookings page
  await page.waitForURL('**/bookings', {
    timeout: 10000
  });

  await expect(
    page.getByRole('heading', { name: 'My Bookings' })
  ).toBeVisible();

  return {
    id,
    serviceName,
    preferredDate
  };
}

async function selectFirstService(page: Page) {

  const serviceSelect = page.locator('select');

  await expect
    .poll(async () =>
      serviceSelect.locator('option:not([disabled])').count()
    )
    .toBeGreaterThan(0);

  const firstServiceOption = serviceSelect
    .locator('option:not([disabled])')
    .first();

  const value = await firstServiceOption.getAttribute('value');

  const serviceName = (
    await firstServiceOption.innerText()
  ).trim();

  expect(value).toBeTruthy();

  await serviceSelect.selectOption(value as string);

  return serviceName;
}

async function fillPreferredDate(page: Page, date: string) {

  await page
    .locator('input[type="date"]')
    .fill(date);
}

async function submitBooking(page: Page) {

  await page.getByRole('button', {
    name: /book this service/i
  }).click();
}

async function openPendingBookings(page: Page) {

  await openMyBookings(page);

  const statusDropdown = page.locator('app-status-dropdown');

  const statusButton = statusDropdown.getByRole('button', {
    name: 'Status'
  });

  await expect(statusButton).toBeVisible();

  await statusButton.click();

  const pendingBookingsResponse = page.waitForResponse((response) => {

    const url = new URL(response.url());

    return (
      response.request().method() === 'GET' &&
      /\/bookings$/i.test(url.pathname) &&
      url.searchParams.get('status')?.toLowerCase() === 'pending'
    );
  });

  await statusDropdown
    .getByRole('button', {
      name: 'Pending',
      exact: true
    })
    .click();

  expect(
    (await pendingBookingsResponse).ok()
  ).toBeTruthy();

  await expect(
    page.getByRole('heading', {
      name: 'Pending Bookings',
      exact: true
    })
  ).toBeVisible();
}

async function findBookingRow(
  page: Page,
  booking: CreatedBooking
) {

  const row = page
    .locator('tbody tr')
    .filter({ hasText: booking.serviceName })
    .filter({
      hasText: formatDisplayedDate(
        booking.preferredDate
      )
    })
    .first();

  await expect(row).toBeVisible();

  return row;
}

async function openCancelDialogForRow(
  page: Page,
  row: Locator
) {

  await row.locator('button').last().click();

  await page
    .getByRole('button', { name: 'Cancel' })
    .click();
}

async function cancelBookingThroughUi(
  page: Page,
  booking: CreatedBooking
) {

  await openPendingBookings(page);

  const pendingRow = await findBookingRow(page, booking);

  await openCancelDialogForRow(page, pendingRow);

  await confirmCancelBooking(page, booking);
}

async function confirmCancelBooking(
  page: Page,
  booking: CreatedBooking
) {

  const confirmButton = page
    .locator('app-cancel-dialog')
    .getByRole('button', {
      name: 'Yes, Cancel Booking',
      exact: true
    });

  await expect(confirmButton).toBeVisible();

  const [deleteResponse, refreshedResponse] =
    await Promise.all([

      page.waitForResponse((response) =>
        response.request().method() === 'DELETE' &&
        new URL(response.url())
          .pathname
          .toLowerCase()
          .endsWith(`/api/bookings/${booking.id}`)
      ),

      page.waitForResponse((response) => {

        const url = new URL(response.url());

        return (
          response.request().method() === 'GET' &&
          /\/bookings$/i.test(url.pathname) &&
          url.searchParams.get('status')?.toLowerCase() === 'pending'
        );
      }),

      confirmButton.click(),
    ]);

  expect(deleteResponse.ok()).toBeTruthy();

  expect(refreshedResponse.ok()).toBeTruthy();

  const body = await refreshedResponse.json();

  const bookings = Array.isArray(body)
    ? body
    : body.Data ?? [];

  expect(
    bookings.some(
      (item: { id?: number; Id?: number }) =>
        Number(item.id ?? item.Id) === booking.id
    )
  ).toBe(false);
}

function dateInputValue(offsetDays: number) {

  const date = new Date();

  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayedDate(value: string) {

  return new Date(value).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
}
