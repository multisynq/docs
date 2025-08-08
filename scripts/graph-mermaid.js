graph TD
    A[Start] --> B[Parse Source Files Directly]
    B --> C[Extract All JSDoc Comments]
    C --> D[Parse TypeScript Definitions]
    D --> E[Merge Documentation]
    E --> F[Generate Rich MDX]
    
    B --> B1[model.js]
    B --> B2[view.js]
    B --> B3[data.js]
    B --> B4[session.js]
    B --> B5[types.d.ts]
    
    C --> C1[Extract @example blocks]
    C --> C2[Extract @tutorial links]
    C --> C3[Extract @since/@deprecated]
    C --> C4[Extract @throws/@fires/@listens]
    
    F --> F1[Add Tabs for Examples]
    F --> F2[Add CodeGroup for Snippets]
    F --> F3[Add Warning/Info boxes]
    F --> F4[Add Steps for Tutorials]
    F --> F5[Add Accordion for Details]
    
    F --> G[Output: api-reference/index.mdx]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#9f9,stroke:#333,stroke-width:2px