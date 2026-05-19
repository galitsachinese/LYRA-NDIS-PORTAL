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
      .pressSequentially('Bhenzelaine Tabbuga', { delay: 30 });

    await page.getByRole('textbox', { name: 'Email *' })
      .pressSequentially('lenlen@gmail.com', { delay: 30 });

    await page.getByRole('textbox', { name: 'Phone' })
      .pressSequentially('09194276138', { delay: 30 });

    await page.getByLabel('Assigned Service *Select a')
      .selectOption('1');

    await page.getByTestId('save-worker-btn').click();

    await page.waitForTimeout(2000);

    await expect(
      page.getByText(
        'Support WorkersAdd Support WorkerSupport Worker RegistryFull'
      )
    ).toBeVisible();

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

    await page.getByRole('button', { name: 'Edit' }).click();

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

  test('Coordinator can delete support worker without active schedule', async ({ page }) => {

    const workerName = 'Delete Test Worker';
    const randomEmail = `delete${Date.now()}@gmail.com`;

    await page.getByRole('link', { name: 'Support Workers' }).click();

    // ADD SUPPORT WORKER
    await page.getByRole('button', { name: 'Add Support Worker' }).click();

    // TYPE SLOWLY
    await page.getByRole('textbox', { name: 'Full Name *' })
      .pressSequentially(workerName, { delay: 30 });

    await page.getByRole('textbox', { name: 'Email *' })
      .pressSequentially(randomEmail, { delay: 30 });

    await page.getByRole('textbox', { name: 'Phone' })
      .pressSequentially('09111111111', { delay: 30 });

    await page.getByLabel('Assigned Service *Select a')
      .selectOption('1');

    await page.getByTestId('save-worker-btn').click();

    // WAIT TO MAKE SURE WORKER IS ADDED
    await page.waitForTimeout(2000);

    // CLICK DELETE BUTTON
    await page.getByRole('button', { name: 'Delete' }).nth(1).click();

    await page.waitForTimeout(1000);

    await page.getByText('Delete', { exact: true }).click();

    // WAIT FOR DELETE PROCESS
    await page.waitForTimeout(2000);

    // VERIFY WORKER IS REMOVED
    await expect(
      page.getByText(workerName)
    ).not.toBeVisible();

  });

});
