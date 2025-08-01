# Multisynq Documentation Roadmap

This document outlines the development roadmap for the Multisynq documentation. It summarizes completed work and details the next set of critical tasks.

## ✅ **Project Phase 1: Foundation & Migration - COMPLETED**

The initial phase of the documentation project is complete. This included a full migration from a JSDoc-based system to a modern Mintlify documentation site.

### **Key Achievements:**
-   **16/16 Tutorials Migrated**: All practical and conceptual tutorials were migrated to MDX, enhanced with interactive components, and verified for technical accuracy.
-   **Core API Documented**: API reference for `Session`, `Model`, and `View` was created.
-   **Infrastructure Established**: The Mintlify project was set up with proper branding, navigation, and a functional build system.
-   **Content Polish**: A massive cleanup effort removed over 15 vestigial files and ~350KB of duplicate/unnecessary content.
-   **React Together Docs (Initial)**: Foundational pages for React Together were created.

---

## 🚀 **Project Phase 2: Automation, Expansion & Polish**

This next phase focuses on automating documentation generation, expanding content to cover all Multisynq packages, and refining the user experience.

### **Outstanding Tasks:**

#### **1. 🛠️ Automated JSDoc-to-MDX Pipeline**

-   **Goal**: Create a fully automated pipeline to generate API reference documentation directly from JSDoc comments in the Multisynq source code.
-   **Source of Truth**: `multisynq/packages/multisynq/src/` (and other packages).
-   **Key Steps**:
    1.  Develop a script (`docs/scripts/jsdoc-to-mdx.js`) that parses JSDoc comments from source files.
    2.  The script must convert JSDoc tags into Mintlify-compatible MDX components.
    3.  Integrate the script into a CI/CD workflow (GitHub Actions) that triggers on changes to the source repositories.
    4.  Ensure the generated documentation is automatically validated for broken links and correct formatting.

#### **2. ⚛️ Comprehensive `multisynq-react` Documentation**

-   **Goal**: Create complete documentation for the `multisynq-react` package.
-   **Source of Truth**: The `multisynq/multisynq-react` repository, particularly the `website/` and `packages/` directories.
-   **Content to be created/migrated**:
    -   **Hooks**: `useStateTogether`, `useFunctionTogether`, `useChat`, `useCursors`, and all other hooks (17+ total).
    -   **Components**: `ReactTogether`, `SessionManager`, `Chat`, `Cursors`, and other pre-built components.
    -   **Utilities**: Documentation for all helper functions.
    -   **UI Library Integrations**: Guides for using the Ant Design and PrimeReact component wrappers.
    -   **Interactive Demos**: Integrate the 7+ playground examples into the documentation.

#### **3. 🗺️ Navigation and Layout Restructuring**

-   **Goal**: Restructure the `docs.json` navigation to clearly represent each individual NPM package and its corresponding documentation.
-   **Proposed Structure**:
    -   **Multisynq (Core JS)**
        -   Getting Started
        -   Tutorials
        -   API Reference
    -   **React Together (`multisynq-react`)**
        -   Getting Started
        -   Hooks
        -   Components
        -   Utilities
    -   **Three.js Together (`multisynq-three`)**
        -   (Content to be created)
    -   **AI Development**
        -   Vibe Coding

#### **4. 🤖 Fix and Enhance the "Vibe Coding" / AI Integration Section**

-   **Goal**: The `vibe-coding.mdx` page and its associated components are currently broken. This section needs to be fixed and enhanced.
-   **Key Issues**:
    -   The interactive context previews and copy buttons are not functional.
    -   The content needs to be updated to reflect the latest "magic prompts" and AI development patterns.
    -   The context files (`multisynq-js.txt`, etc.) were integrated and then deleted, but the front-end components need to be re-wired to a new, more maintainable source of context.
-   **Plan**:
    1.  Debug the React components that power the interactive elements on the page.
    2.  Refactor the context management to be more robust. Instead of large text files, consider using hidden MDX files or a structured JSON file.
    3.  Review and update all "magic prompts" to ensure they are effective with modern LLMs.
    4.  Add a section for Three.js-specific "vibe coding".

#### **5. ✅ Update Build Process to Modern Mintlify CLI - COMPLETED**

-   **Goal**: Update all build scripts and developer instructions to use the latest Mintlify CLI commands.
-   **Action**:
    1.  Investigated and confirmed the modern equivalent of `mintlify dev` and `mintlify build` (likely `mint dev` and `mint build`).
    2.  Updated the `scripts` in `package.json`.
    3.  Updated any developer-facing documentation (`README.md`, `CURSOR.md`) to reflect the new commands.

#### **6. ✅ Implement Contextual AI Menu - COMPLETED**

-   **Goal**: Add the Mintlify `contextual` menu to `docs.json` for enhanced AI integration.
-   **Action**: Added the following configuration to `docs.json`:
    -   Enabled default options: `copy`, `view`, `chatgpt`, `claude`, `perplexity`.
    -   Added a custom option for "Ask Gemini".
    -   Added a custom option for "Add the Multisynq MCP" using the `npx mint-mcp add multisynq.io` command.
    -   Created supporting pages `mcp-setup.mdx` and `llms.txt.mdx`.

#### **7. ✅ Full Content Accuracy Review**

-   **Goal**: Perform a comprehensive review of all non-copied documentation to ensure 100% accuracy.
-   **Action**:
    1.  Review every page that is not a direct copy from a source repository.
    2.  Validate all API signatures, import paths, and architectural descriptions against the canonical sources of truth.
    3.  Ensure there are no remaining fabricated examples or APIs.

#### **8. ✅ Consolidate API Reference & Automate from JSDoc**

-   **Goal**: Replace the fragmented API reference with a single, comprehensive page that is automatically generated from TSDoc/JSDoc comments in the source code.
-   **Plan**: Follow the detailed strategy outlined in `JSDOC_MIGRATION_PLAN.md`.
-   **Key Steps**:
    1.  **Manual Consolidation (Interim)**: Combine `api-reference/introduction.mdx`, `api-reference/model.mdx`, `api-reference/view.mdx`, and `api-reference/session.mdx` into a single `api-reference/index.mdx`.
    2.  **Script Development**: Create the `docs/scripts/jsdoc-to-mdx.js` automation script.
    3.  **CI/CD Integration**: Set up a GitHub Action to run the script and keep the documentation in sync with the source code. 