import { test, expect } from '@playwright/test';

test.describe('Funnel Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should display the initial UI correctly', async ({ page }) => {
    // Check for header
    await expect(page.getByRole('heading', { name: 'Boron Builder' })).toBeVisible();

    // Check for empty state in preview pane
    await expect(page.getByText('No funnel yet')).toBeVisible();
    await expect(page.getByText(/Start by describing your product in the chat/i)).toBeVisible();

    // Check for message input placeholder
    const textarea = page.getByPlaceholder(/Describe your product/i);
    await expect(textarea).toBeVisible();

    // Check for device toggle buttons
    await expect(page.getByRole('button', { name: 'Mobile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Desktop' })).toBeVisible();
  });

  test('should show empty state with example prompts', async ({ page }) => {
    // Check for example prompts in the empty state
    await expect(page.getByText(/Try examples like:/i)).toBeVisible();
    await expect(page.getByText(/Organic sleep gummies/i)).toBeVisible();
    await expect(page.getByText(/Sustainable yoga mats/i)).toBeVisible();
    await expect(page.getByText(/Premium cold brew coffee/i)).toBeVisible();
  });

  test('should accept user input and enable send button', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send button should be disabled initially
    await expect(sendButton).toBeDisabled();

    // Type a message
    await textarea.fill('Organic sleep gummies with melatonin');

    // Send button should now be enabled
    await expect(sendButton).toBeEnabled();
  });

  test('should submit message on Enter key', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);

    // Type and press Enter
    await textarea.fill('Organic sleep gummies');
    await textarea.press('Enter');

    // Message should appear in chat
    await expect(page.getByText('Organic sleep gummies')).toBeVisible();
  });

  test('should add newline on Shift+Enter', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);

    // Type and press Shift+Enter
    await textarea.fill('Line 1');
    await textarea.press('Shift+Enter');
    await textarea.type('Line 2');

    // Textarea should contain both lines
    const value = await textarea.inputValue();
    expect(value).toContain('Line 1\nLine 2');
  });

  test('should toggle between mobile and desktop preview modes', async ({ page }) => {
    const mobileButton = page.getByRole('button', { name: 'Mobile' });
    const desktopButton = page.getByRole('button', { name: 'Desktop' });

    // Mobile should be selected by default
    await expect(mobileButton).toHaveClass(/bg-white/);

    // Click desktop
    await desktopButton.click();
    await expect(desktopButton).toHaveClass(/bg-white/);

    // Click mobile again
    await mobileButton.click();
    await expect(mobileButton).toHaveClass(/bg-white/);
  });

  test('should clear message input after sending', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Fill and send
    await textarea.fill('Test message');
    await sendButton.click();

    // Textarea should be empty after sending
    await expect(textarea).toHaveValue('');
  });

  test('should display streaming indicator when generating funnel', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send a message
    await textarea.fill('Organic sleep gummies');
    await sendButton.click();

    // Send button should be disabled while streaming
    await expect(sendButton).toBeDisabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return an error
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send a message
    await textarea.fill('Test product');
    await sendButton.click();

    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  test('should display chat history', async ({ page }) => {
    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send multiple messages (mock the API)
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Mock response',
          funnel: null,
        }),
      });
    });

    // Send first message
    await textarea.fill('First message');
    await sendButton.click();
    await page.waitForTimeout(500);

    // Send second message
    await textarea.fill('Second message');
    await sendButton.click();
    await page.waitForTimeout(500);

    // Both messages should be visible
    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
  });

  test('should render funnel preview when API returns valid JSON', async ({ page }) => {
    // Mock successful API response with a funnel
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Generated funnel',
          funnel: {
            id: 'test-funnel-id',
            name: 'Test Funnel',
            product: {
              title: 'Test Product',
              description: 'A test product',
              price: 29.99,
              currency: 'USD',
            },
            blocks: [
              {
                id: 'block-1',
                type: 'Callout',
                props: {
                  title: 'Welcome to Test Product',
                  subtitle: 'The best test product ever',
                  align: 'center',
                },
              },
              {
                id: 'block-2',
                type: 'AddToCartButton',
                props: {
                  text: 'Buy Now - $29.99',
                  link: '#',
                  variant: 'primary',
                  size: 'lg',
                },
              },
            ],
          },
        }),
      });
    });

    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send a message
    await textarea.fill('Test product');
    await sendButton.click();

    // Wait for funnel to render
    await page.waitForTimeout(1000);

    // Check that funnel blocks are rendered
    await expect(page.getByText('Welcome to Test Product')).toBeVisible();
    await expect(page.getByText('The best test product ever')).toBeVisible();
    await expect(page.getByText('Buy Now - $29.99')).toBeVisible();
  });

  test('should persist state in localStorage', async ({ page, context }) => {
    // Mock API response
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          message: 'Mock response',
          funnel: {
            id: 'persist-test',
            name: 'Persist Test',
            product: {
              title: 'Persist Product',
              description: 'Test',
              price: 10,
              currency: 'USD',
            },
            blocks: [],
          },
        }),
      });
    });

    const textarea = page.getByPlaceholder(/Describe your product/i);
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send a message
    await textarea.fill('Persistence test');
    await sendButton.click();
    await page.waitForTimeout(1000);

    // Create a new page in the same context
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Check that message history persists
    await expect(newPage.getByText('Persistence test')).toBeVisible();

    await newPage.close();
  });
});
