import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Coordinator Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'coordinator');
  });

  test('Coordinator can add new support worker successfully', async ({ page }) => {

    await page.getByRole('link', { name: 'Support Workers' }).click();

    await page.getByRole('button', { name: 'Add Support Worker' }).click();

    // TYPE SLOWLY
    await page.getByRole('textbox', { name: 'Full Name *' })
      .pressSequentially('Genelyn Tabbuga', { delay: 30 });

    await page.getByRole('textbox', { name: 'Email *' })
      .pressSequentially('gengen@gmail.com', { delay: 30 });

    await page.getByRole('textbox', { name: 'Phone' })
      .pressSequentially('09194276138', { delay: 30 });

    await page.getByLabel('Assigned Service *Select a')
      .selectOption('1');

    await page.getByTestId('save-worker-btn').click();

    await page.waitForTimeout(2000);

    //await expect(
      //page.getByText(
     //   'Support WorkersAdd Support WorkerSupport Worker RegistryFull'
      //)).toBeVisible();

  });

  test('Validation errors appear when required fields are empty', async ({ page }) => {

    await page.getByRole('link', { name: 'Support Workers' }).click();

    await page.getByRole('button', { name: 'Add Support Worker' }).click();

    // TYPE SLOWLY
    await page.getByRole('textbox', { name: 'Full Name *' })
      .pressSequentially('Kristine Tabbuga', { delay: 30 });

    await page.getByRole('textbox', { name: 'Phone' })
      .pressSequentially('09194276138', { delay: 30 });

    await page.getByLabel('Assigned Service *Select a')
      .selectOption('1');

    await page.getByTestId('save-worker-btn').click();

    await page.waitForTimeout(2000);

    await expect(
      page.getByText('Email is required.')
    ).toBeVisible();

  });

  test('Coordinator can edit support worker information', async ({ page }) => {

    await page.getByRole('link', { name: 'Support Workers' }).click();

    await page.getByRole('button', { name: 'Edit' }).first().click();

    // CLEAR OLD VALUE
    await page.getByRole('textbox', { name: 'Phone' }).clear();

    // TYPE SLOWLY
    await page.getByRole('textbox', { name: 'Phone' })
      .pressSequentially('09610069922', { delay: 30});

    await page.getByTestId('save-worker-btn').click();

    await expect(
      page.getByText('09610069922')
    ).toBeVisible();

    await page.waitForTimeout(2000);

  });

 // test('Coordinator can delete support worker', async ({ page }) => {

   // const workerName = 'Delete Test Worker';
   // const randomEmail = `delete${Date.now()}@gmail.com`;

    //await page.getByRole('link', { name: 'Support Workers' }).click();

    // ADD SUPPORT WORKER
   // await page.getByRole('button', { name: 'Add Support Worker' }).click();

    // TYPE SLOWLY
   // await page.getByRole('textbox', { name: 'Full Name *' })
    //  .pressSequentially(workerName, { delay: 30 });

   // await page.getByRole('textbox', { name: 'Email *' })
   //   .pressSequentially(randomEmail, { delay: 30 });

   // await page.getByRole('textbox', { name: 'Phone' })
   //   .pressSequentially('09111111111', { delay: 30 });

   // await page.getByLabel('Assigned Service *Select a')
    //  .selectOption('1');

   // await page.getByTestId('save-worker-btn').click();

    // WAIT TO MAKE SURE WORKER IS ADDED
    //await page.waitForTimeout(2000);

    // CLICK DELETE BUTTON
  //  await page.getByRole('button', { name: 'Delete' }).nth(1).click();

  //  await page.waitForTimeout(1000);

   // await page.getByText('Delete', { exact: true }).click();

    // WAIT FOR DELETE PROCESS
    //await page.waitForTimeout(2000);

    // VERIFY WORKER IS REMOVED
   // await expect(
   //   page.getByText(workerName)
   // ).not.toBeVisible();


test('Coordinator can confirm worker status change', async ({ page }) => {

  await page.getByRole('link', { name: 'Support Workers' }).click();

  // Open status modal
  await page.getByRole('button', { name: 'Active' }).nth(2).click();

  // Change status
  await page.getByLabel('New statusActiveInactive')
    .selectOption('Inactive');

  // Confirm change
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Verify status badge updated
   await expect(
    page.getByText('Worker Has Upcoming Bookings')
  ).toBeVisible();

  // Verify warning message
  await expect(
    page.getByText(
      'This worker has 1 upcoming booking. Changing their status will not automatically reassign those bookings.'
    )
  ).toBeVisible();

  // Verify buttons are visible
  await expect(
    page.getByRole('button', { name: 'Cancel' })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Confirm' })
  ).toBeVisible();

// Confirm status change
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Wait for update
  await page.waitForTimeout(2000);

  // Verify worker now appears as Inactive
  await expect(
    page.getByRole('button', { name: 'Inactive' }).first()
  ).toBeVisible();

});


test('Coordinator can filter support workers by Active and Inactive status', async ({ page }) => {

  await page.getByRole('link', { name: 'Support Workers' }).click();

  const statusDropdown = page.getByLabel('StatusAllActiveInactive');

  // ACTIVE
  await statusDropdown.selectOption('active');

  await page.waitForTimeout(2000);

  let rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible();

  // INACTIVE
  await statusDropdown.selectOption('inactive');

  await page.waitForTimeout(2000);

  rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    await expect(
      rows.nth(i).getByText('Inactive', { exact: true })
    ).toBeVisible();
  }

});

test('Coordinator can filter support workers by service', async ({ page }) => {

  await page.getByRole('link', { name: 'Support Workers' }).click();

  const serviceDropdown = page.getByLabel('ServiceAll');

  // =====================================
  // PERSONAL HYGIENE ASSISTANCE
  // =====================================
  await serviceDropdown.selectOption({
    label: 'Personal Hygiene Assistance'
  });

  await page.waitForTimeout(2000);

  let rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible();

  let rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const rowText = await rows.nth(i).textContent();

    expect(rowText).toContain('Personal Hygiene Assistance');
  }
});
});
