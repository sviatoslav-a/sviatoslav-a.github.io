import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/call', timeout: 90000, expect: { timeout: 20000 }, workers: 1,
  outputDir: process.env.TEST_OUTPUT || './test-results/call',
  reporter: [['list'], ['json', { outputFile: process.env.TEST_REPORT || './test-results/call/results.json' }]],
  use: { baseURL: process.env.BASE_URL || 'http://localhost:4187', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'], launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } }
  ]
});
