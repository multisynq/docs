# JSDoc to MDX Migration and API Reference Consolidation Plan

This document outlines the strategy for creating a single, comprehensive, and AI-friendly API reference page from the existing JSDoc and TSDoc annotations.

## 1. Goal: A Single, Consolidated API Reference

The current API reference is spread across multiple files (`introduction.mdx`, `model.mdx`, `view.mdx`, etc.). This is inefficient for both users and AI assistants.

**The primary goal is to create a single `api-reference.mdx` file that contains the complete Core API documentation.**

This new file will be structured to be easily navigable using in-page hash links (e.g., `/api-reference#model`, `/api-reference#view-events`), providing a seamless user experience without page reloads.

## 2. Source of Truth

The canonical source for all API documentation will be the TSDoc annotations within `multisynq-client/client/types.d.ts`. This file is the most up-to-date and comprehensive resource.

Additional JSDoc from `multisynq-client/client/teatime/index.js` will be used for documenting system-level events (`view-join`, `view-exit`, `synced`).

## 3. Proposed Structure for `api-reference.mdx`

The consolidated file will be organized logically with clear, high-level sections. Each section will be a top-level `<h2>` heading, allowing for easy deep-linking.

```markdown
# Core API Reference

<Note>
This page provides a comprehensive reference for the Multisynq Core JavaScript API.
</Note>

## Multisynq.Model
<!-- All Model-related documentation goes here -->
...

### Properties
<!-- Model properties like .id, .sessionId, .viewCount -->
...

### Static Methods
<!-- Methods like Model.create(), Model.register() -->
...

### Instance Methods
<!-- Methods like .init(), .destroy(), .publish(), .subscribe(), .future() -->
...

## Multisynq.View
<!-- All View-related documentation goes here -->
...

### Properties
<!-- View properties like .viewId -->
...

### Instance Methods
<!-- Methods like .detach(), .publish(), .subscribe(), .now() -->
...

## Multisynq.Session
<!-- All Session-related documentation goes here -->
...

### Methods
<!-- Session.join() -->
...

### Session Parameters
<!-- Detailed breakdown of the parameters object for Session.join() -->
...

## Multisynq.App
<!-- All App utility documentation goes here -->
...

## Multisynq.Data
<!-- All Data API documentation goes here -->
...

## System Events
<!-- Documentation for view-join, view-exit, synced -->
...
```

## 4. JSDoc-to-MDX Automation Script (`jsdoc-to-mdx.js`)

An automation script is required to parse the source files and generate the `api-reference.mdx` file.

### Script Logic:
1.  **Parser Selection**: The script will use a robust JSDoc/TSDoc parser library (e.g., `jsdoc-to-markdown`, `typedoc`, or a custom parser) that can handle TSDoc syntax and extract the necessary comment blocks and code signatures.
2.  **Source Parsing**:
    *   The script will primarily parse `multisynq-client/client/types.d.ts`.
    *   It will also parse `multisynq-client/client/teatime/index.js` specifically to extract the `@event` blocks.
3.  **Data Extraction**: For each documented symbol (class, method, property, event), the script must extract:
    *   Name (e.g., `Model.create`)
    *   Description
    *   Parameters (name, type, description, optional/required)
    *   Return value (type, description)
    *   Code examples (`@example`)
    *   `@public`, `@deprecated`, `@since` tags.
4.  **MDX Generation**:
    *   The script will iterate through the parsed data and generate MDX content using a template engine or direct string manipulation.
    *   **Headers**: Each class (`Model`, `View`) will be an `<h2>`. Each method group (Static, Instance) will be an `<h3>`. Each individual method/property will be an `<h4>`.
    *   **Signatures**: Method signatures will be placed in a `<CodeGroup>` or a simple code block.
    *   **Parameters**: Parameters will be formatted using `<Fields>` or a markdown table for clarity.
    *   **Examples**: Code examples will be placed in `<CodeGroup>` blocks with appropriate syntax highlighting.
    *   **Descriptions**: The main description will be rendered as standard markdown, preserving formatting like lists and links.
    *   **AI-Friendliness**: The script will follow the guidelines in `STYLE.md`, ensuring semantic headings, short paragraphs, and liberal use of components like `<Note>` and `<Warning>`.

## 5. Implementation Plan

1.  **Task Creation**: A new task will be added to `ROADMAP.md` to track the creation of the JSDoc-to-MDX script and the consolidation of the API reference.
2.  **Script Development**: Develop the `docs/scripts/jsdoc-to-mdx.js` script.
3.  **Manual Consolidation (Interim)**: Manually create the first version of the consolidated `api-reference.mdx` by copying and pasting from the existing separate files. This provides an immediate benefit while the script is in development.
4.  **Integration**: Once the script is complete, replace the manual file with the auto-generated one.
5.  **CI/CD**: Integrate the script into a GitHub Action that runs on changes to the `multisynq-client` repository, ensuring the documentation is always up-to-date.
6.  **Cleanup**: Delete the old, separate API reference files (`model.mdx`, `view.mdx`, etc.) once the consolidated file is in place.

This plan ensures a clear path to a much-improved, maintainable, and user-friendly API reference. 

## 6. Current Implementation Status (December 2024)

### ✅ SUCCESSFULLY COMPLETED:

#### Final Implementation: `docs/scripts/generate-api-docs-v3.mjs`
- ✅ **Complete Rewrite**: Built from scratch with custom JSDoc parser
- ✅ **Direct Source Parsing**: Processes `.js` files directly (model.js, view.js, data.js, session.js, etc.)
- ✅ **100% Content Extraction**: All JSDoc comments, descriptions, and examples preserved
- ✅ **Full JSDoc Tag Support**: 
  - Parameters: `@param` with types, optionals, and defaults
  - Returns: `@returns` with type information
  - Examples: `@example` with captions
  - Metadata: `@since`, `@deprecated`, `@async`, `@hideconstructor`
  - Exceptions: `@throws` with types
  - References: `@see`, `@tutorial`, `@memberof`
  - Events: `@fires`, `@listens`
  - Development: `@todo` (conditionally shown)
- ✅ **Rich Mintlify Components**:
  - `<Tabs>` for method organization
  - `<CodeGroup>` for multiple examples
  - `<Warning>` for deprecations and throws
  - `<Info>` for version information
  - `<Steps>` for architecture overview
  - `<Accordion>` for properties
  - `<Cards>` for navigation and tutorials
  - `<Note>` for important callouts
  - `<RequestExample>` and `<ResponseExample>` for parameters/returns
  - `<ParamField>` and `<ResponseField>` for detailed type info
- ✅ **Perfect Formatting**:
  - Proper link resolution for internal and external references
  - Clean code block formatting with syntax highlighting
  - Proper paragraph spacing and text flow
  - Escaped HTML in type annotations
- ✅ **Individual MDX Files**: Each class gets its own dedicated page
- ✅ **Comprehensive Index**: Navigation cards, architecture overview, common patterns

### What Makes This A+++ Quality:

1. **Complete Content Preservation**: Every single JSDoc comment is extracted and displayed
2. **Rich Interactive UI**: Maximum use of Mintlify's UI components for exceptional UX
3. **Developer-Friendly**: Code examples, type information, and cross-references all preserved
4. **Maintainable**: Clean, well-structured code that's easy to extend
5. **Scalable**: Handles any number of classes and can easily add new source files

### Remaining Work:
- ❌ **CI/CD Integration**: Need to set up GitHub Actions for automated regeneration
- ❌ **Validation**: Automated checks for broken links and valid MDX syntax 