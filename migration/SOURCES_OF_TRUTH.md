# Multisynq Documentation - Sources of Truth & Automation Strategy

## Overview

This document defines the authoritative sources for all Multisynq documentation content and outlines strategies for automating documentation updates as the codebase evolves, particularly during the upcoming Croquet → Multisynq rebrand.

## Current Sources of Truth

### 1. **Core API Documentation**

#### Primary Source
- **Repository:** `croquet/`
- **Specific Path:** `packages/croquet/teatime/src/`
- **Key Files:**
  - `model.js` - Model class implementation with JSDoc
  - `view.js` - View class implementation with JSDoc
  - `session.js` - Session class implementation with JSDoc
  - `index.js` - Main exports and global utilities
- **Documentation Method:** JSDoc comments in source code
- **Update Frequency:** Active development (multiple times per week)
- **Owner:** Core Croquet/Multisynq development team

#### JSDoc Generation Configuration
- **Config File:** `croquet-docs/multisynq/jsdoc.json`
- **Output Directory:** `croquet-docs/multisynq/out/`
- **Generated Files:**
  - `Model.html` - Complete Model class documentation
  - `View.html` - Complete View class documentation
  - `Session.html` - Complete Session class documentation
  - `global.html` - Global events, constants, utilities

#### Current JSDoc Extraction Command
```bash
cd croquet-docs/multisynq/
../node_modules/.bin/jsdoc -c jsdoc.json
```

### 2. **Tutorial Content**

#### Primary Source
- **Repository:** `multisynq-client/`
- **Specific Path:** `docs/tutorials/`
- **Key Files:**
  - `QUICKSTART.md` - Main getting started guide (223 lines)
  - `structure.json` - Tutorial organization and navigation
  - `1_1_hello_world.md` - Foundation tutorial (301 lines)
  - `1_2_simple_animation.md` - Animation concepts (146 lines)
  - `1_3_multiuser_chat.md` - Chat implementation (287 lines)
  - 7 additional tutorial files (view smoothing, 3D, etc.)
- **Content Type:** Markdown with embedded CodePen examples
- **Update Frequency:** Monthly updates for API changes
- **Owner:** Developer Relations team

#### Supporting Assets
- **Images:** `docs/tutorials/images/`
- **Working Examples:** HTML/JS/CSS files in numbered directories
- **Assets Include:**
  - `SessionBadge.png` - Session UI components
  - `HelloWorldSettings.png` - CodePen configuration guides
  - `overview.svg` - Architecture diagrams
  - `multiblaster.gif` - Game demo assets

### 3. **React Together Documentation**

#### Primary Source
- **Repository:** `react-together/`
- **Specific Path:** `website/src/pages/`
- **Content Structure:**
  - **Main README:** Project overview and basic usage
  - **Website Pages:** Comprehensive component and hook documentation
  - **Package READMEs:** Individual component library documentation
  - **Playground:** Live examples and demos

#### Key Content Areas
- **17 React Hooks:** Complete API reference with examples
- **6 Core Components:** ReactTogether, Chat, Cursors, etc.
- **20 UI Integration Components:** Ant Design + PrimeReact wrappers
- **7 Interactive Demos:** Gallery, RPG, Chat, etc.
- **Update Frequency:** Bi-weekly releases with new features
- **Owner:** React Together development team

### 4. **Contributing Guidelines**

#### Primary Source
- **Repository:** `react-together/`
- **Specific Path:** `contributing/`
- **Files:**
  - `CODE_OF_CONDUCT.md`
  - `CODING_STANDARDS.md`
  - `CONTRIBUTING.md`
  - `TERMS_AND_CONDITIONS.md`

## Future Sources of Truth (Post-Rebrand)

### Expected Changes During Croquet → Multisynq Rebrand

#### 1. **Repository Structure Changes**
- **Current:** `croquet/packages/croquet/`
- **Expected:** `multisynq/packages/multisynq/`
- **Impact:** All JSDoc generation paths must be updated

#### 2. **Package Name Changes**
- **Current:** `@croquet/croquet`
- **Expected:** `@multisynq/multisynq`
- **Impact:** All import statements in tutorials need updating

#### 3. **API Surface Changes**
- **Current:** `Croquet.Session.join()`, `Croquet.Model`, `Croquet.View`
- **Expected:** `Multisynq.Session.join()`, `Multisynq.Model`, `Multisynq.View`
- **Impact:** All code examples need updating

#### 4. **Documentation URLs**
- **Current:** References to croquet-related URLs
- **Expected:** All URLs updated to multisynq.io domain
- **Impact:** Link validation and update required

## Automation Strategy

### Phase 1: Current Manual Process (Immediate)

#### Documentation Update Workflow
1. **Monitor source repositories** for significant changes
2. **Manually extract** updated content when needed
3. **Convert content** to Mintlify MDX format
4. **Test and validate** all links and examples
5. **Deploy updates** to documentation site

#### Monitoring Triggers
- **API Changes:** When JSDoc comments are updated
- **Tutorial Updates:** When tutorial files are modified
- **React Together Releases:** When new versions are published
- **Breaking Changes:** When API signatures change

### Phase 2: Semi-Automated Extraction (3-6 months)

#### JSDoc → MDX Converter
```bash
# Proposed automation script
docs/scripts/extract-jsdoc.js \
  --source="croquet/packages/croquet/teatime/src/" \
  --output="./api-reference/" \
  --format="mdx"
```

#### Features
- **Parse JSDoc comments** from source files
- **Generate MDX files** with proper Mintlify formatting
- **Preserve code examples** and cross-references
- **Handle method signatures** and parameter documentation
- **Generate navigation** entries automatically

#### Tutorial Synchronization
```bash
# Proposed tutorial sync script
docs/scripts/sync-tutorials.js \
  --source="multisynq-client/docs/" \
  --output="./tutorials/" \
  --convert-codepen \
  --update-assets
```

### Phase 3: Full Automation (6-12 months)

#### CI/CD Integration
```yaml
# .github/workflows/docs-update.yml
name: Auto-update Documentation
on:
  repository_dispatch:
    types: [api-updated, tutorials-updated, react-together-updated]

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout documentation repo
      - name: Extract updated JSDoc content
      - name: Sync tutorial changes
      - name: Update React Together docs
      - name: Validate all links and examples
      - name: Build and deploy documentation
      - name: Notify team of updates
```

#### Real-time Monitoring
- **Git webhooks** from source repositories
- **File change detection** for incremental updates
- **API versioning** to track breaking changes
- **Automated testing** of code examples

## Automation Implementation Details

### 1. **JSDoc Extraction Automation**

#### Current Manual Process
```bash
# Generate JSDoc HTML (current)
cd croquet-docs/multisynq/
../node_modules/.bin/jsdoc -c jsdoc.json

# Manual conversion to MDX (current process)
# 1. Open generated HTML files
# 2. Extract content manually
# 3. Convert to MDX format
# 4. Add Mintlify components
```

#### Proposed Automated Process
```javascript
// docs/scripts/jsdoc-extractor.js
const jsdoc = require('jsdoc-api');
const fs = require('fs');

async function extractAPIDocs() {
  // Parse source files for JSDoc comments
  const docs = await jsdoc.explain({ 
    files: '../croquet/packages/croquet/teatime/src/**/*.js' 
  });
  
  // Group by class (Model, View, Session)
  const classes = groupByClass(docs);
  
  // Generate MDX for each class
  for (const [className, classDocs] of Object.entries(classes)) {
    const mdxContent = generateMDX(className, classDocs);
    fs.writeFileSync(`./api-reference/${className.toLowerCase()}.mdx`, mdxContent);
  }
}
```

### 2. **Tutorial Content Synchronization**

#### Content Transformation Pipeline
```javascript
// docs/scripts/tutorial-sync.js
async function syncTutorials() {
  const tutorialDir = '../multisynq-client/docs/tutorials/';
  const outputDir = './tutorials/';
  
  // Read structure.json for organization
  const structure = JSON.parse(fs.readFileSync(tutorialDir + 'structure.json'));
  
  // Process each tutorial
  for (const tutorial of structure.tutorials) {
    const content = fs.readFileSync(tutorialDir + tutorial.file);
    
    // Convert markdown to MDX
    const mdx = await convertToMDX(content, {
      convertCodePen: true,
      updateAssets: true,
      addMintlifyComponents: true
    });
    
    fs.writeFileSync(outputDir + tutorial.slug + '.mdx', mdx);
  }
}
```

### 3. **React Together Integration**

#### Component Documentation Extraction
```javascript
// docs/scripts/react-together-sync.js
async function syncReactTogether() {
  const sourceDir = '../react-together/website/src/pages/';
  const outputDir = './react-together/';
  
  // Extract hook documentation
  await extractHookDocs(sourceDir + 'hooks/', outputDir + 'hooks/');
  
  // Extract component documentation
  await extractComponentDocs(sourceDir + 'components/', outputDir + 'components/');
  
  // Extract integration guides
  await extractIntegrationDocs('../react-together/packages/', outputDir + 'integrations/');
}
```

## Change Detection Strategy

### 1. **File Modification Monitoring**
```bash
# Watch source directories for changes
fswatch -o croquet/packages/croquet/teatime/src/ | \
  xargs -n1 docs/scripts/api-changed.sh

fswatch -o multisynq-client/docs/ | \
  xargs -n1 docs/scripts/tutorials-changed.sh
```

### 2. **Git Hook Integration**
```bash
# Post-commit hook in source repositories
#!/bin/bash
# .git/hooks/post-commit

# Check if documentation-relevant files changed
if git diff --name-only HEAD~1 HEAD | grep -E '\.(js|md)$'; then
  # Trigger documentation update
  curl -X POST https://api.github.com/repos/multisynq/docs/dispatches \
    -H "Authorization: token $GITHUB_TOKEN" \
    -d '{"event_type": "source-updated"}'
fi
```

### 3. **Content Hashing for Change Detection**
```javascript
// docs/scripts/change-detector.js
const crypto = require('crypto');

function detectChanges(sourceFile, lastKnownHash) {
  const content = fs.readFileSync(sourceFile);
  const currentHash = crypto.createHash('sha256').update(content).digest('hex');
  
  if (currentHash !== lastKnownHash) {
    return { changed: true, newHash: currentHash };
  }
  
  return { changed: false, newHash: currentHash };
}
```

## Rebrand Migration Strategy

### Pre-Rebrand Preparation
1. **Document current state** of all source locations
2. **Create mapping files** for package name changes
3. **Prepare search-and-replace scripts** for mass updates
4. **Test automation scripts** with current structure

### During Rebrand
1. **Update all source paths** in automation scripts
2. **Mass update package references** in tutorials
3. **Regenerate all API documentation** from new locations
4. **Validate all links and examples** work with new packages

### Post-Rebrand Validation
1. **Test entire build process** with new structure
2. **Validate all code examples** work with new packages
3. **Check all links** point to correct resources
4. **Performance test** automated update process

### Rebrand Automation Scripts
```bash
# Mass update package references
docs/scripts/rebrand-migration.js \
  --old-package="@croquet/croquet" \
  --new-package="@multisynq/multisynq" \
  --old-namespace="Croquet" \
  --new-namespace="Multisynq" \
  --update-tutorials \
  --update-examples \
  --update-imports
```

## Quality Assurance & Validation

### Automated Testing
1. **Link validation** across all documentation
2. **Code example testing** to ensure functionality
3. **Asset integrity checking** for images and media
4. **Build process validation** for each update
5. **Performance monitoring** for documentation site

### Content Quality Metrics
- **Documentation coverage** of all API surfaces
- **Tutorial completeness** and learning progression
- **Example functionality** and current relevance
- **Link health** and reference accuracy
- **Build reliability** and deployment success

### Error Handling & Rollback
- **Validation gates** before publishing updates
- **Automatic rollback** for failed builds
- **Error notification** for manual intervention
- **Backup systems** for previous documentation versions

This sources of truth documentation ensures that the Multisynq documentation remains accurate, current, and automatically synchronized with the evolving codebase while handling the complexity of the upcoming rebrand transition.