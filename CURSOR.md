# Multisynq Documentation Context for AI Assistants

## Critical Base Instruction

**NEVER make up ANYTHING (imports, types, function or object names, etc.) about implementation and usage details for any document. Instead, reference the actual source material when new content must be generated (vs. copied). For all non-copied content (anything newly written), ensure accuracy and correctness by referencing the corresponding code directly (e.g., type definitions, `multisynq-client` exported functions, `react-together/packages/react-together` exports, `croquet/packages/croquet/teatime/*.js` files) or one of the summary files.**

**ALWAYS read `ROADMAP.md` and `STYLE.md` before starting any new task.**

-   **`ROADMAP.md`** contains the high-level project goals, outstanding tasks, and priorities.
-   **`STYLE.md`** contains the content, formatting, and style guidelines for all documentation.

## Project Overview

This is the central repository for the Multisynq documentation, built with [Mintlify](https://mintlify.com/). The project has recently undergone a major migration from a set of disparate, JSDoc-generated HTML files and markdown documents into this unified, modern documentation platform.

### Key Technologies
-   **Mintlify**: The static site generator and documentation framework.
-   **MDX**: The format for all content pages, allowing for React components within Markdown.
-   **React**: Used for custom interactive components within the documentation.
-   **GitHub Actions**: For CI/CD and future automation pipelines.

### Repository Structure
-   `docs/`: The root directory for all documentation content.
    -   `docs.json`: The master configuration file for Mintlify, defining navigation, branding, and theme.
    -   `index.mdx`: The homepage.
    -   `api-reference/`: API documentation.
    -   `essentials/`: Core concepts of Multisynq.
    -   `tutorials/`: Step-by-step guides for building applications.
    -   `react-together/`: Documentation specific to the `multisynq-react` library.
    -   `images/` & `logo/`: Static assets.
    -   `package.json`: Project dependencies and scripts.
    -   `ROADMAP.md`: High-level goals and outstanding tasks.
    -   `STYLE.md`: Content and style guide.
    -   `CURSOR.md`: This file.

## Sources of Truth & Automation Strategy

The documentation is a living project that must stay in sync with several source code repositories.

### Primary Sources of Truth
1.  **Core API (`@multisynq/multisynq`)**: JSDoc comments within the source code at `multisynq/packages/multisynq/src/`.
2.  **Tutorial Content**: The `multisynq-client/docs/tutorials/` directory contains the canonical markdown and code for the core tutorials.
3.  **React Together (`@multisynq/multisynq-react`)**: The `react-together/website/` and `react-together/packages/` directories contain the source documentation for all React hooks, components, and utilities.

### Automation Goal
A key objective, as outlined in `ROADMAP.md` and the original migration documents (`AUTOMATED_SYNCING_STRATEGY.md`, `BUILD_PROCESS.md`), is to create a fully automated pipeline for documentation generation. This involves:
-   A **JSDoc-to-MDX converter** that automatically generates API reference pages.
-   **Content synchronization scripts** that pull updates from the tutorial and React Together repositories.
-   A **CI/CD pipeline** that triggers these scripts on changes to the source repositories, ensuring the documentation is always up-to-date.

## Development Workflow

### Local Development
1.  `cd docs/`
2.  `npm install`
3.  `npm run docs:dev` (starts dev server at `http://localhost:3001`)

### Building for Production
1.  `npm run docs:build`

### Contributing
1.  Adhere to the guidelines in `STYLE.md`.
2.  Consult `ROADMAP.md` for current priorities.
3.  For any new content, cite the source of truth (the specific file in the source code repository).
4.  Ensure all code examples are tested and functional. 