# Multisynq Documentation Style Guide

This document provides style and formatting guidelines for all Multisynq documentation. Following these guidelines ensures our content is clear, consistent, professional, and easily digestible by both human readers and AI assistants.

## Guiding Principle: AI-First Content

Structure your documentation to help AI assistants provide accurate, relevant answers. Clear organization and comprehensive context benefit both human readers and AI understanding.

## Structure and Organization

-   **Use semantic markup**: Use `h1`, `h2`, `h3`, etc. correctly to structure the page.
-   **Write descriptive headings**: Section titles should clearly describe their content.
-   **Create a logical information hierarchy**: Information should flow from general to specific.
-   **Use consistent formatting**: Follow the styles and components established in the existing documentation.
-   **Include comprehensive metadata**: Use frontmatter on each page to define `title` and `description`.
-   **Break up long blocks of text**: Use shorter paragraphs, lists, and callouts to improve readability.

## Context and Content

-   **Define specific terms**: Define any specific terms, acronyms, or concepts when they are first introduced.
-   **Provide conceptual content**: Include sufficient conceptual documentation about features and procedures. Don't just show *how*, explain *why*.
-   **Include examples and use cases**: Every feature should have a practical, working code example.
    -   All code examples must work with the current Multisynq APIs.
    -   Include all necessary imports and setup instructions.
    -   Use realistic application IDs (e.g., `"com.example.myapp"`).
    -   Include error handling where appropriate.
    -   Show both minimal and complete examples where helpful.
-   **Cross-reference related topics**: Link to other relevant pages in the documentation to provide a more complete picture.
-   **Add hidden pages for AI context**: If there's additional context that users don't need to see but would be valuable for an AI assistant, you can create hidden pages for the assistant to reference.
-   **Document APIs thoroughly**:
    -   Document all parameters and return values.
    -   Include practical usage examples for each method.
    -   Note any version compatibility issues.
    -   Cross-reference related methods or classes.

## Mintlify Components

Use Mintlify's built-in components to enhance content presentation:

-   `<Card>`: For highlighting features.
-   `<CodeGroup>`: To show code for different languages or frameworks (e.g., npm, yarn).
-   `<Tabs>`: To switch between related content, like JavaScript vs. React examples.
-   `<Warning>`: For critical information that users must not ignore.
-   `<Note>`: For helpful tips or information that is good to know.
-   `<Steps>`: For step-by-step instructions.
-   `<Accordion>`: To hide and show long content blocks. 