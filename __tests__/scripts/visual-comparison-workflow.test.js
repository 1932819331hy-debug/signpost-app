const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const workflow = fs.readFileSync(
  path.join(root, '.github/workflows/visual-regression.yml'),
  'utf8',
);
const config = fs.readFileSync(
  path.join(root, 'playwright.visual.config.ts'),
  'utf8',
);

describe('Storybook baseline comparison (#43)', () => {
  it('compares committed screenshots without overwriting them', () => {
    expect(workflow).toContain('run: npm run test:visual');
    expect(workflow).not.toContain('test:visual:update');
    expect(workflow).not.toContain('Regenerate Storybook visual baselines');
  });

  it('preserves the pinned Playwright runtime and PR triggers', () => {
    expect(workflow).toContain('mcr.microsoft.com/playwright:v1.61.1-noble');
    expect(workflow).toMatch(/pull_request:\s*\n\s*branches:\s*\n\s*- main/);
    expect(workflow).toContain('npm ci --no-audit --no-fund');
  });

  it('uploads failure images and a browsable HTML report', () => {
    expect(workflow).toContain('if: failure()');
    expect(workflow).toContain('name: visual-regression-report');
    expect(workflow).toContain('playwright-report/');
    expect(workflow).toContain('test-results/');
    expect(config).toContain("['html', { open: 'never' }]");
  });
});
