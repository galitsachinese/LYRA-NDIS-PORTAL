import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Services Recommendation', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'participant');
  });

  test('participant can open Service Recommendation page', async ({ page }) => {
    
    await page.getByRole('button', { name: 'lightbulb Service' }).click();
   
    // verify recommendation section is visible
    await expect(
      page.getByRole('heading', { name: 'Find the Right Service for Me' })).toBeVisible();

  });

 test('User can proceed to step 2 after entering situation', async ({ page }) => {
  

 await loginAs(page, 'participant');

  // Go directly to services (or landing page after login)
  await page.goto('http://localhost:4200/services');

  // Step 1: Open service flow
  await page.getByRole('button', { name: /lightbulb service/i }).click();

  // Enter situation
  await page.getByRole('textbox', { name: 'Type your situation here...' }).fill(
    'I am 45 years old suffering from head injury'
  );

  // Continue to Step 2
  await page.getByRole('button', { name: 'Continue' }).click();

  // ✅ ASSERT: Step 2 is reached
  await expect(
    page.getByRole('textbox', { name: 'Type your support needs here' })
  ).toBeVisible();
});

    
  test('User cannot continue when situation input is empty', async ({ page }) => {
  await loginAs(page, 'participant');
 
 // Step 1
  await page.getByRole('button', { name: /lightbulb service/i }).click();

  const situationBox = page.getByRole('textbox', {
    name: 'Type your situation here...'
  });

  // ❌ Leave EMPTY (DO NOT use '\n')
  await situationBox.fill('');

  // ✅ ASSERT: Continue is disabled (this is the real requirement)
  await expect(
    page.getByRole('button', { name: /continue/i })
  ).toBeDisabled();
});


  test('User cannot generate recommendations with empty support input', async ({ page }) => {
    // Step 1
  await page.getByRole('button', { name: /lightbulb service/i }).click();

  await page.getByRole('textbox', {
    name: 'Type your situation here...'
  }).fill("i'm 40 years old having hard time walking");

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2 must appear
  const supportBox = page.getByRole('textbox', {
    name: 'Type your support needs here'
  });

  await expect(supportBox).toBeVisible();

  // ❌ DO NOT fill Step 2 input (leave empty)

  const getRecommendationsBtn = page.getByRole('button', {
    name: /get recommendations/i
  });

  // ✅ ASSERT: user cannot proceed
  await expect(getRecommendationsBtn).toBeDisabled();
  });

  
  test('Recommendation cards display service title and description', async ({ page }) => {
   
     // Step 1
  await page.getByRole('button', { name: /lightbulb service/i }).click();

  await page.getByRole('textbox', {
    name: 'Type your situation here...'
  }).fill("i'm 40 years old having trouble with hearing");

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2
  await page.getByRole('textbox', {
    name: 'Type your support needs here'
  }).fill('i need help with my hearing');

  await page.getByRole('button', {
    name: /get recommendations/i
  }).click();

  // ✅ ASSERT: recommendation card title is visible
  await expect(
    page.getByText('Personal Hygiene Assistance')
  ).toBeVisible();

  // ✅ ASSERT: recommendation description is visible
  await expect(
    page.getByText('Help with daily')
  ).toBeVisible();
  });

  test('User can click recommendation card and open service details', async ({ page }) => {
    
  // Step 1
  await page.getByRole('button', { name: /lightbulb service/i }).click();

  await page.getByRole('textbox', {
    name: 'Type your situation here...'
  }).fill("I'm 40 years old having hard time eating");

  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2
  await page.getByRole('textbox', {
    name: 'Type your support needs here'
  }).fill('I need help for my eating routine');

  await page.getByRole('button', {
    name: /get recommendations/i
  }).click();


  // Book the service
  await page.getByRole('button', {
    name: 'Book this Service'
  }).click();
  });

});
