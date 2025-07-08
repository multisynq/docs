# Multisynq Documentation Migration & Development Guide

## Overview

This document outlines the migration of Multisynq documentation from JSDoc-generated HTML to Mintlify-powered documentation, current state, completed work, remaining tasks, and process improvements.

## 1. Previous Documentation Generation Process (JSDoc)

### Repository Structure
```
0croquet/
├── croquet-docs/                    # Documentation build environment
│   ├── multisynq/                   # Multisynq-specific docs
│   │   ├── jsdoc.json              # JSDoc configuration
│   │   ├── out/                    # Generated HTML output
│   │   └── package.json            # Dependencies
│   ├── node_modules/               # JSDoc dependencies
│   └── build.sh                    # Build script
├── croquet/                        # Source code repository
│   └── packages/
│       └── croquet/                # Core Croquet source
└── multisynq-client/               # Client library
    └── docs/                       # Tutorial markdown files
```

### Previous Generation Process
1. **Source Code**: JSDoc comments in `croquet/packages/croquet/` source files
2. **Tutorials**: Markdown files in `multisynq-client/docs/`
3. **Configuration**: `croquet-docs/multisynq/jsdoc.json` with:
   ```json
   {
     "source": {
       "include": ["../../../croquet/packages/croquet/src/"],
       "includePattern": "\\.(js|ts)$"
     },
     "opts": {
       "destination": "./out/",
       "tutorials": "../../../multisynq-client/docs/"
     }
   }
   ```
4. **Build Command**: `../node_modules/.bin/jsdoc -c jsdoc.json`
5. **Output**: Static HTML files in `croquet-docs/multisynq/out/`
6. **Integration**: Files copied to `multisynq.io/multisynq/frontend/public/docs/`

### Frontend Integration (Before)
- **Route**: `multisynq.io/multisynq/frontend/src/app/(main)/docs/page.tsx`
- **Redirect**: JavaScript redirect to `/docs/index.html`
- **Build Script**: `multisynq.io/multisynq/frontend/build-docs.sh`
- **Serving**: Static files served from `public/docs/`

## 2. Current Migration State (Mintlify)

### What Has Been Completed ✅

#### Repository Setup
- **New Docs Location**: `/docs/` (root level)
- **Mintlify Config**: `docs/docs.json` with Multisynq branding
- **CLI Installation**: Mintlify CLI installed globally

#### Core Content Updates
- **Homepage** (`docs/index.mdx`): Updated to Multisynq introduction
- **Quickstart** (`docs/quickstart.mdx`): SDK installation and setup
- **API Reference** (`docs/api-reference/introduction.mdx`): Multisynq API overview

#### Build System Updates
- **Build Script**: Updated to start Mintlify dev server
- **Frontend Integration**: Updated docs route with redirect

#### Branding Applied
- **Logo**: Multisynq logo configured
- **Colors**: Multisynq blue (#006EFF) theme
- **Social Links**: Proper URLs configured

## 3. Critical Issues Identified & Fixes Needed

### 🚨 CRITICAL: Deployment-Ready Frontend Integration
**Issue**: Current implementation hardcodes localhost:3001
**Problem**: Not deployment-ready for multisynq.io domains
**Solution**: Use environment-based configuration

### 🚨 CRITICAL: Template Content Still Present
**Issue**: API endpoints still show "Plant Store" examples
**Files Affected**:
- `docs/api-reference/endpoint/get.mdx` (shows "Get Plants")
- `docs/api-reference/endpoint/create.mdx` (shows "Create Plant")
- `docs/api-reference/endpoint/delete.mdx` (shows "Delete Plant")
- `docs/api-reference/endpoint/webhook.mdx` (shows "New Plant")
- `docs/api-reference/openapi.json` (contains plant store API spec)

### 🚨 CRITICAL: Navigation Links Point to Mintlify
**Issue**: Global anchors in docs.json still point to Mintlify
**Files Affected**: `docs/docs.json`

## 4. Implementation Plan

### Phase 1: Fix Critical Issues (IMMEDIATE)
1. **Fix deployment-ready frontend integration**
2. **Replace template API endpoints with Multisynq endpoints**
3. **Update navigation links to proper Multisynq URLs**

### Phase 2: Content Migration (HIGH PRIORITY)
1. **Create missing essential pages**
2. **Extract JSDoc content from source code**
3. **Migrate tutorial content**

### Phase 3: Build System Optimization (MEDIUM PRIORITY)
1. **Implement proper static build process**
2. **Set up CI/CD integration**
3. **Configure proper routing in Next.js**

## 5. Build & Development Scripts

### Local Development
```bash
# Start Mintlify dev server
npm run docs:dev

# Build static documentation
npm run docs:build

# Deploy to frontend
npm run docs:deploy
```

### Integration with Frontend
The documentation is served through the Next.js frontend with environment-based routing to support multiple deployment environments.

## 6. Process Improvements Discovered

### Issues with Current Approach
1. **Two-Server Requirement**: Requires both Next.js and Mintlify servers
2. **Hardcoded URLs**: Not environment-aware for deployment
3. **Build Process**: Manual copying instead of automated pipeline
4. **Content Maintenance**: Scattered across multiple repositories

### Proposed Process Changes
1. **Single Repository**: Move all docs to main repo
2. **Environment-Aware Routing**: Use Next.js environment variables
3. **Automated Build Pipeline**: CI/CD integration for docs updates
4. **Static File Generation**: Build to static files instead of dev server

## 7. Remaining Tasks

### High Priority
- [ ] Fix deployment-ready frontend integration
- [ ] Replace all template API endpoints
- [ ] Update navigation links
- [ ] Create missing essential pages

### Medium Priority
- [ ] Migrate JSDoc content
- [ ] Update build process
- [ ] Add proper OpenAPI specification

### Low Priority
- [ ] Update hero images
- [ ] Add SEO metadata
- [ ] Implement analytics

## 8. Configuration

### Environment Variables
Documentation routing uses these environment variables from the frontend:
- `NEXT_PUBLIC_PRODUCTION_FLAG`: local | dev | prod
- `NEXT_PUBLIC_BASE_URL_*`: Backend URLs for different environments

### Mintlify Configuration
See `docs.json` for:
- Theme colors and branding
- Navigation structure
- Social media links
- Logo configuration

## 9. Contributing

When making changes to documentation:
1. Edit MDX files in `/docs/`
2. Test locally with `npm run docs:dev`
3. Update navigation in `docs.json` if needed
4. Follow Mintlify MDX syntax for components

## 10. Troubleshooting

### Common Issues
- **Port conflicts**: Ensure ports 3001 and 3000 are available
- **Build failures**: Check Mintlify CLI installation
- **Routing issues**: Verify environment variables are set correctly

### Getting Help
- Discord: https://discord.gg/multisynq
- GitHub Issues: Create issue in main repository
- Documentation: https://mintlify.com/docs
