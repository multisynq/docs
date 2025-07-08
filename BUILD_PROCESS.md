# Multisynq Documentation - Build Process & Future Automation

## Current Build System

### Local Development
```bash
# Navigate to docs directory
cd /home/will/git/0croquet/docs/

# Install dependencies
npm install

# Start development server
npm run docs:dev
# This starts Mintlify at http://localhost:3000

# Build for production
npm run docs:build
# Generates static files in .mintlify directory
```

### Build Scripts
- **`docs/package.json`** - Defines build dependencies and scripts
- **`docs/build-docs.sh`** - Shell script for build automation
- **`docs/docs.json`** - Mintlify configuration for navigation and branding

### Current Dependencies
```json
{
  "devDependencies": {
    "mintlify": "^4.0.0"
  },
  "scripts": {
    "docs:dev": "mintlify dev",
    "docs:build": "mintlify build",
    "docs:install": "mintlify install"
  }
}
```

## Sources of Truth Documentation

### Current Sources of Truth (Pre-Rebrand)

#### 1. **JSDoc Source Code**
- **Primary Location:** `/home/will/git/0croquet/croquet/packages/croquet/teatime/src/`
- **Key Files:**
  - `model.js` - Model class with JSDoc comments
  - `view.js` - View class with JSDoc comments  
  - `session.js` - Session class with JSDoc comments
  - `index.js` - Main exports and global utilities
- **Current Status:** Active development, pending Croquet → Multisynq rebrand
- **JSDoc Generation Config:** `/home/will/git/0croquet/croquet-docs/multisynq/jsdoc.json`

#### 2. **Tutorial Content**
- **Location:** `/home/will/git/0croquet/multisynq-client/docs/tutorials/`
- **Status:** Stable, comprehensive tutorial series
- **Structure:** Defined in `structure.json`
- **Content:** 10 tutorial markdown files + working examples
- **Update Frequency:** Occasional updates for API changes

#### 3. **React Together Documentation**
- **Location:** `/home/will/git/0croquet/react-together/website/src/pages/`
- **Status:** Active development
- **Content:** 17 hooks, 6 components, 20 UI integration components
- **Update Frequency:** Regular updates with new features

### Future Sources of Truth (Post-Rebrand)

#### 1. **Multisynq Core Library** (Expected)
- **Expected Location:** `/home/will/git/0croquet/multisynq/packages/multisynq/src/`
- **Impact:** All JSDoc generation paths will need updating
- **Migration Required:** Update build scripts to point to new repository structure

#### 2. **Rebranded Tutorial Content**
- **Impact:** Code examples may reference new package names
- **Migration Required:** Update import statements and package references

## Current JSDoc Generation Process

### Manual Process (Current)
```bash
# Navigate to JSDoc generation directory
cd /home/will/git/0croquet/croquet-docs/multisynq/

# Generate HTML documentation
../node_modules/.bin/jsdoc -c jsdoc.json

# Output generated in out/ directory
ls out/
# Model.html, View.html, Session.html, global.html, etc.
```

### JSDoc Configuration (`jsdoc.json`)
```json
{
  "source": {
    "include": ["../../../croquet/packages/croquet/src/"],
    "includePattern": "\\.(js|ts)$"
  },
  "opts": {
    "destination": "./out/",
    "tutorials": "../../../multisynq-client/docs/"
  },
  "plugins": ["plugins/markdown"],
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  }
}
```

## Proposed Automation Strategy

### Phase 1: Manual Migration (Current Phase)
1. **One-time conversion** of existing JSDoc HTML to Mintlify MDX
2. **Manual content creation** for missing sections
3. **Static integration** of tutorials and examples

### Phase 2: Semi-Automated Updates
1. **JSDoc extraction script** to convert comments to MDX
2. **Content synchronization** between source repos and documentation
3. **Validation scripts** for links and code examples

### Phase 3: Full Automation (Future Goal)
1. **CI/CD integration** for automatic documentation updates
2. **Real-time synchronization** with source code changes
3. **Automated testing** of documentation and examples

## Automation Implementation Plan

### 1. JSDoc → MDX Converter Script

#### Purpose
Convert JSDoc comments directly from source code to Mintlify-compatible MDX files.

#### Implementation Location
```
docs/scripts/jsdoc-to-mdx.js
```

#### Functionality
- Parse JSDoc comments from source files
- Extract class documentation, methods, parameters
- Generate MDX with proper Mintlify formatting
- Handle cross-references and links
- Preserve code examples and formatting

#### Example Usage
```bash
# Generate API documentation from source
node scripts/jsdoc-to-mdx.js \
  --source="../croquet/packages/croquet/teatime/src/" \
  --output="./api-reference/" \
  --format="mdx"
```

### 2. Content Synchronization System

#### Purpose
Monitor source repositories for changes and update documentation accordingly.

#### Components
- **File watcher** for source code changes
- **Content differ** to identify what changed
- **Update generator** to create new documentation
- **Validation system** to ensure quality

#### Implementation
```bash
# Watch for changes in source repositories
docs/scripts/watch-sources.js

# Manual sync command
npm run docs:sync-sources
```

### 3. Tutorial Validation System

#### Purpose
Ensure all code examples in tutorials work with current API.

#### Features
- **Code extraction** from tutorial markdown
- **Automated testing** of examples
- **Link validation** across documentation
- **Asset integrity checking**

#### Implementation
```bash
# Validate all tutorials
npm run docs:validate

# Test specific tutorial
npm run docs:test-tutorial hello-world
```

### 4. Build Pipeline Integration

#### CI/CD Workflow
```yaml
# .github/workflows/docs.yml
name: Documentation Update
on:
  push:
    paths:
      - 'croquet/packages/croquet/teatime/src/**'
      - 'multisynq-client/docs/**'
      - 'react-together/website/**'

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout docs repo
      - name: Run JSDoc extraction
      - name: Update tutorials
      - name: Validate documentation
      - name: Build Mintlify docs
      - name: Deploy to production
```

## Source Repository Monitoring

### Repositories to Monitor
1. **Core API Source:**
   - Current: `/home/will/git/0croquet/croquet/packages/croquet/teatime/src/`
   - Future: `/home/will/git/0croquet/multisynq/packages/multisynq/src/`

2. **Tutorial Content:**
   - Location: `/home/will/git/0croquet/multisynq-client/docs/`
   - Monitor: `tutorials/` directory and `QUICKSTART.md`

3. **React Together:**
   - Location: `/home/will/git/0croquet/react-together/`
   - Monitor: `website/src/pages/`, `packages/*/README.md`

### Change Detection Strategy
1. **Git hooks** to trigger documentation updates
2. **File modification timestamps** for incremental updates
3. **Content hashing** to detect actual changes vs. metadata changes
4. **API versioning** to track breaking changes

## Migration Timeline for Automation

### Immediate (Manual Process)
- **Current Phase:** Manual migration of existing content
- **Tools:** Direct file editing and conversion
- **Timeline:** 2-3 weeks for complete migration

### Short Term (3-6 months)
- **Semi-automated extraction** from JSDoc comments
- **Basic validation scripts** for links and examples
- **Standardized build process** for consistent updates

### Medium Term (6-12 months)
- **Full CI/CD integration** with source repositories
- **Automated testing** of documentation examples
- **Real-time synchronization** for most content types

### Long Term (12+ months)
- **Intelligent content updates** using AI assistance
- **Multi-repository coordination** for complex changes
- **Performance optimization** for large documentation sets

## Handling the Croquet → Multisynq Rebrand

### Impact Assessment
1. **Package Names:** All import statements will change
2. **Repository Structure:** Source file locations may change
3. **API Names:** Some class or method names may change
4. **URLs:** Documentation links may need updating

### Migration Strategy
1. **Preparation Phase:**
   - Document current file locations
   - Create mapping of old → new package names
   - Prepare search-and-replace scripts

2. **Rebrand Phase:**
   - Update JSDoc generation paths
   - Mass update of import statements in tutorials
   - Update package.json dependencies
   - Regenerate all API documentation

3. **Validation Phase:**
   - Test all code examples with new packages
   - Validate all links and references
   - Ensure build process works with new structure

### Automation for Rebrand
```bash
# Script to update package references
docs/scripts/rebrand-packages.js \
  --old-package="@croquet/croquet" \
  --new-package="@multisynq/multisynq" \
  --update-tutorials \
  --update-examples
```

## Future Documentation Generation

### Ideal Automated Workflow
1. **Developer makes changes** to source code with JSDoc comments
2. **Git hook triggers** documentation extraction script
3. **Script generates** updated MDX files for changed classes/methods
4. **Validation system** tests all affected examples and links
5. **Build process** generates updated documentation
6. **Deployment system** publishes changes to multisynq.io
7. **Notification system** alerts team of documentation updates

### Monitoring and Quality Assurance
- **Automated link checking** for broken references
- **Code example testing** to ensure functionality
- **Performance monitoring** for build times
- **Version tracking** for documentation changes
- **Rollback capability** for problematic updates

### Integration with Development Workflow
- **Documentation reviews** as part of code review process
- **Breaking change detection** with automatic documentation updates
- **Version synchronization** between code and documentation
- **Developer tooling** for easy documentation contribution

This build process documentation provides a clear path from the current manual migration to a fully automated documentation system that will keep the Multisynq documentation current and comprehensive as the platform evolves.