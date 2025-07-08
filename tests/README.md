# Multisynq Documentation Test Suite

Comprehensive Playwright test suite for the Multisynq documentation site. This test suite ensures all pages load correctly, navigation works properly, interactive components function as expected, and accessibility standards are met.

## 🧪 Test Coverage

### Page Loading Tests (`page-loading.spec.js`)
- **Core Pages**: Home, Quickstart, Development setup
- **Essential Guides**: Sync, Collaboration, Chat, Whiteboard, Scaling, Conflicts
- **API Reference**: Introduction, Model, View, Session documentation
- **React Together**: All hooks and components documentation
- **Performance**: Page load times, bundle sizes, response codes
- **Error Handling**: 404 pages, broken images, broken links
- **Content Validation**: Metadata, code blocks, link formatting

### Navigation Tests (`navigation.spec.js`)
- **Sidebar Navigation**: Visibility, functionality, hierarchy
- **Mobile Navigation**: Responsive menu, touch-friendly targets
- **Breadcrumbs**: Path accuracy, functional links
- **Search Functionality**: Interface accessibility, keyboard shortcuts
- **Page-to-Page Navigation**: Internal links, browser navigation, anchor links
- **Performance**: Smooth transitions, layout stability
- **Cross-Browser**: Chrome, Firefox, Safari compatibility
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support

### Interactive Components Tests (`interactive-components.spec.js`)
- **Code Blocks**: Rendering, syntax highlighting, copy functionality, accessibility
- **Documentation Components**: Cards, tabs, collapsible sections
- **Interactive Examples**: Demos, runnable code examples
- **Media**: Image loading, responsiveness, video controls
- **Forms**: Search functionality, accessibility labels
- **Accessibility**: Skip links, keyboard navigation, focus indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd docs/tests
npm install
npm run install:browsers  # Install browser dependencies
```

### Running Tests

#### Basic Test Execution
```bash
# Run all tests
npm test

# Run with browser UI visible
npm run test:headed

# Run with Playwright UI for debugging
npm run test:ui
```

#### Specific Test Categories
```bash
# Test only page loading
npm run test:pages

# Test only navigation
npm run test:navigation

# Test only interactive components  
npm run test:interactive

# Run smoke tests (basic page loading)
npm run test:smoke
```

#### Browser-Specific Testing
```bash
# Test in Chrome only
npm run test:chrome

# Test in Firefox only
npm run test:firefox

# Test in Safari only
npm run test:safari

# Test mobile viewports
npm run test:mobile
```

#### CI/CD Testing
```bash
# Run tests with CI-friendly output
npm run test:ci

# Debug mode for development
npm run test:debug
```

### Viewing Results
```bash
# View HTML test report
npm run report

# View trace files for failed tests
npm run trace
```

## 📋 Test Configuration

### Playwright Configuration (`playwright.config.js`)
- **Base URL**: `http://localhost:3000` (configurable via `DOCS_BASE_URL`)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Timeouts**: 30s per test, 15min total, 10s for assertions
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On retry

### Environment Variables
```bash
# Documentation site base URL
DOCS_BASE_URL=http://localhost:3000

# CI environment flag
CI=true
```

## 🏗️ Test Architecture

### Test Structure
```
tests/
├── playwright.config.js      # Main configuration
├── page-loading.spec.js      # Page loading and performance tests
├── navigation.spec.js        # Navigation and routing tests
├── interactive-components.spec.js  # UI component tests
├── package.json              # Dependencies and scripts
├── README.md                 # This file
└── test-results/             # Generated test artifacts
```

### Test Data Organization
Tests use arrays of page definitions with expected titles and content:

```javascript
const corePages = [
  { path: '/', title: 'Multisynq Documentation', description: 'Welcome to Multisynq' },
  { path: '/quickstart', title: 'Quickstart', description: 'Start building' },
  // ...
];
```

### Assertion Patterns
- **Response Codes**: All pages return 200 status
- **Content Presence**: Verify expected text exists
- **Performance**: Page loads within 3-5 seconds
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators
- **Responsive Design**: Mobile-friendly layouts and touch targets

## 🔧 Customization

### Adding New Tests
1. Create new spec file: `new-feature.spec.js`
2. Import test framework: `import { test, expect } from '@playwright/test';`
3. Follow existing patterns for page navigation and assertions
4. Add new script to `package.json` if needed

### Page Configuration
Update page arrays in test files when adding new documentation pages:

```javascript
// Add to appropriate array in page-loading.spec.js
const newPages = [
  { path: '/new-section/new-page', title: 'New Page', description: 'New content' }
];
```

### Custom Assertions
Extend existing test patterns for new component types:

```javascript
test('new component works', async ({ page }) => {
  await page.goto('/page-with-component');
  
  const component = page.locator('.new-component');
  await expect(component).toBeVisible();
  
  // Add component-specific tests
});
```

## 📊 Performance Benchmarks

### Expected Performance Metrics
- **Page Load Time**: < 3 seconds for initial load
- **Navigation Time**: < 2 seconds between pages  
- **Bundle Size**: < 1MB per JavaScript file
- **Image Loading**: All images load successfully
- **Interactive Time**: UI responds within 500ms

### Performance Testing
```bash
# Run performance-focused tests
npm test -- --grep="performance|load.*time"

# Test specific performance scenarios
npm test -- --grep="bundle sizes"
```

## 🐛 Debugging and Troubleshooting

### Common Issues

#### Tests Failing Locally
1. Ensure docs site is running on correct port
2. Check `DOCS_BASE_URL` environment variable
3. Install browser dependencies: `npm run install:browsers`

#### Slow Test Execution
1. Run specific test suites instead of all tests
2. Use `--workers=1` for serial execution
3. Check network connectivity for external resources

#### Browser Compatibility Issues
1. Update Playwright: `npm update @playwright/test`
2. Reinstall browsers: `npm run install:browsers`
3. Check browser-specific test configurations

### Debug Mode
```bash
# Run with step-by-step debugging
npm run test:debug

# Run single test with verbose output
npx playwright test page-loading.spec.js --debug
```

### Visual Debugging
```bash
# Open Playwright UI for interactive debugging
npm run test:ui

# Run with browser visible
npm run test:headed
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Documentation Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd docs/tests
          npm install
          npm run install:browsers
      
      - name: Start documentation site
        run: |
          cd docs
          npm run docs:dev &
          sleep 30  # Wait for site to start
      
      - name: Run tests
        run: |
          cd docs/tests
          npm run test:ci
        env:
          CI: true
          DOCS_BASE_URL: http://localhost:3000
```

### Test Reporting
- **Local**: HTML reports in `test-results/`
- **CI**: GitHub Actions integration with job summaries
- **Artifacts**: Screenshots, videos, and traces for failed tests

## 📈 Metrics and Monitoring

### Test Coverage Metrics
- **Page Coverage**: All documented pages tested
- **Feature Coverage**: Navigation, components, accessibility
- **Browser Coverage**: Chrome, Firefox, Safari, Mobile
- **Performance Coverage**: Load times, bundle sizes, responsiveness

### Success Criteria
- ✅ 100% of pages load successfully (HTTP 200)
- ✅ All navigation links functional
- ✅ No broken images or assets
- ✅ Code blocks properly formatted with syntax highlighting
- ✅ Accessibility standards met (keyboard navigation, ARIA)
- ✅ Mobile responsiveness verified
- ✅ Performance benchmarks met

## 🤝 Contributing

### Adding Tests for New Features
1. Identify the feature to test (new page, component, functionality)
2. Determine appropriate test file (page-loading, navigation, interactive)
3. Add test cases following existing patterns
4. Update page arrays with new routes
5. Test locally before submitting PR

### Test Writing Guidelines
- Use descriptive test names
- Group related tests in `test.describe()` blocks
- Add comments for complex assertions
- Follow existing naming conventions
- Include both positive and negative test cases

### Review Checklist
- [ ] Tests pass locally across all browsers
- [ ] New pages added to appropriate test arrays
- [ ] Performance assertions reasonable for new content
- [ ] Accessibility requirements verified
- [ ] Documentation updated if needed

## 📞 Support

### Getting Help
- **Issues**: Report bugs in repository issues
- **Documentation**: Refer to [Playwright documentation](https://playwright.dev/)
- **Team**: Contact Multisynq development team

### Maintenance
- **Dependencies**: Update Playwright monthly
- **Browser Updates**: Reinstall browsers with Playwright updates
- **Test Review**: Review and update tests when site structure changes
- **Performance Baselines**: Adjust benchmarks as site evolves

This test suite provides comprehensive coverage of the Multisynq documentation site, ensuring a high-quality user experience across all platforms and devices. 