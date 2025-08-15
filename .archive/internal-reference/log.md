the multisynq.io docs are in the process of           │
│   migration. placeholder values for all the pages are   │
│   currently used. finish the migration of all           │
│   multisynq.io frontend docs to the docs/ mintlify      │
│   repo such that all text/implementation steps values   │
│   params etc are correct, all links work, all demos     │
│   work, all branding is consistent and the readme.md    │
│   is accurate and build steps work. youll need to       │
│   review the multisynq-client/docs and croquet-docs     │
│   repos, the latter contains jsdoc global/view/model    │
│   classes/api and the former contains tutorials. we     │
│   also need the react-together documentation in the     │
│   mintlify docs. first do a full /init with all         │
│   necessary info, paths/repos/resources and             │
│   implementation steps listed, then execute

 save the full init report to relevant md files. make  │
│   sure all information including repo structure,        │
│   paths/folders, build process, jsdoc info, etc is      │
│   included. make sure implementation plan is fully      │
│   documented separately as TODO.md. document            │
│   everything you've learned then execute the            │
│   migration. Make sure to document how to generate the  │
│   docs in the future and WHERE SOURCES OF TRUTH ARE     │
│   eg right now they are in croquet/croquet for the      │
│   classes - croquet is being rebranded to multisynq -   │
│   so eventually the jsdoc generation will change. how   │
│   can we automate inclusion of the jsdoc text/docs      │
│   into these mintlify docs?  

 Update Todos
  ⎿ ☒ Explore current docs/ mintlify repo structure   
      and understand placeholder content
    ☒ Review multisynq-client/docs repo for tutorials 
      and content
    ☒ Review croquet-docs repo for JSDoc 
      global/view/model classes/API
    ☒ Analyze react-together documentation 
      requirements
    ☐ Audit current mintlify docs for placeholder 
      values and broken links
    ☐ Migrate tutorial content from
      multisynq-client/docs
    ☐ Migrate API documentation from croquet-docs
    ☐ Add react-together documentation to mintlify
    ☐ Fix all broken links and ensure navigation
      works
    ☐ Ensure all demos work and are properly
      configured
    ☐ Update branding consistency across all docs
    ☐ Update README.md with accurate information
    ☐ Verify build steps work correctly

● Now let me audit the current mintlify docs for
  placeholder values and broken links:

● Task(Audit mintlify docs placeholders)
  ⎿  Done (34 tool uses · 62.4k tokens · 2m 42.3s)    

● Update Todos
  ⎿ ☒ Explore current docs/ mintlify repo structure   
      and understand placeholder content
    ☒ Review multisynq-client/docs repo for tutorials 
      and content
    ☒ Review croquet-docs repo for JSDoc 
      global/view/model classes/API
    ☒ Analyze react-together documentation 
      requirements
    ☒ Audit current mintlify docs for placeholder 
      values and broken links
    ☐ Migrate tutorial content from
      multisynq-client/docs
    ☐ Migrate API documentation from croquet-docs
    ☐ Add react-together documentation to mintlify
    ☐ Fix all broken links and ensure navigation
      works
    ☐ Ensure all demos work and are properly
      configured
    ☐ Update branding consistency across all docs
    ☐ Update README.md with accurate information
    ☐ Verify build steps work correctly

● Based on my comprehensive analysis, I now have a
  complete understanding of the documentation
  migration needs. Let me provide you with the Full 
  /init Report with all necessary information, paths,
  resources, and implementation steps:

  🚀 MULTISYNQ.IO DOCUMENTATION MIGRATION - FULL /INIT
   REPORT

  📋 EXECUTIVE SUMMARY

  The multisynq.io documentation migration is
  transitioning from JSDoc-generated HTML to a modern
  Mintlify-powered documentation system. The current
  state shows a functional framework with critical
  placeholder content that needs immediate attention,
  combined with comprehensive source material ready
  for migration.

  🗂️ REPOSITORY STRUCTURE & RESOURCES

  Primary Repositories:

  - docs/ - Mintlify
  documentation (TARGET)
  - multisynq-client/docs/ -
  Tutorial content (SOURCE)
  - croquet-docs/multisynq/ -
  JSDoc API docs (SOURCE)
  - react-together/ - React
  Together docs (SOURCE)

  Key Configuration Files:

  - docs/docs.json - Mintlify navigation & branding
  - docs/package.json - Build dependencies
  - docs/build-docs.sh - Build script
  - multisynq-client/docs/tutorials/structure.json -
  Tutorial organization

  Asset Locations:

  - docs/images/ - Hero images, screenshots
  - docs/logo/ - Brand assets (light/dark)
  - multisynq-client/docs/tutorials/images/ - Tutorial
   assets
  - croquet-docs/multisynq/out/images/ - API
  documentation assets

  🎯 IMPLEMENTATION PLAN

  PHASE 1: CRITICAL FIXES (IMMEDIATE)

  1.1 Fix OpenAPI Specification

  - File: docs/api-reference/openapi.json
  - Action: Replace entire Plant Store template with
  Multisynq API
  - Resources: Use JSDoc Session class, Model class,
  View class methods
  - Priority: 🚨 CRITICAL

  1.2 Fix Broken Navigation Links

  - Files: docs/index.mdx, docs/quickstart.mdx,
  docs/api-reference/introduction.mdx
  - Action: Create missing pages OR update links to
  existing pages
  - Missing pages: conflicts.mdx, scaling.mdx,
  chat.mdx, whiteboard.mdx, etc.
  - Priority: 🚨 CRITICAL

  1.3 Update Template Content

  - Files: docs/essentials/settings.mdx,
  docs/development.mdx
  - Action: Replace Mintlify examples with Multisynq
  examples
  - Priority: 🚨 CRITICAL

  PHASE 2: CONTENT MIGRATION (HIGH PRIORITY)

  2.1 Migrate Core Tutorials

  - Source: multisynq-client/docs/tutorials/
  - Target: docs/tutorials/
  - Content: 10 tutorial files + working examples
  - Key files: 1_1_hello_world.md,
  1_2_simple_animation.md, etc.
  - Priority: 🔥 HIGH

  2.2 Migrate API Documentation

  - Source: croquet-docs/multisynq/out/
  - Target: docs/api-reference/
  - Content: Model, View, Session classes + global
  events
  - Key files: Model.html, View.html, Session.html,
  global.html
  - Priority: 🔥 HIGH

  2.3 Migrate Quickstart Guide

  - Source: multisynq-client/docs/QUICKSTART.md
  - Target: docs/quickstart.mdx (UPDATE existing)
  - Content: 223 lines of getting started content
  - Priority: 🔥 HIGH

  PHASE 3: REACT TOGETHER INTEGRATION (HIGH PRIORITY)

  3.1 Create React Together Section

  - Source: react-together/website/src/pages/
  - Target: docs/react-together/
  - Content: 17 hooks, 6 components, 20 UI components
  - Structure: Getting Started, Hooks API, Components
  API, UI Integrations
  - Priority: 🔥 HIGH

  3.2 Update Navigation Structure

  - File: docs/docs.json
  - Action: Add React Together tab with proper
  grouping
  - Priority: 🔥 HIGH

  PHASE 4: SYSTEM INTEGRATION (MEDIUM PRIORITY)

  4.1 Fix Asset Dependencies

  - Files: docs/essentials/images.mdx
  - Action: Replace external Mintlify CDN with local
  assets
  - Priority: 🟡 MEDIUM

  4.2 Update Build System

  - Files: docs/build-docs.sh, docs/package.json
  - Action: Ensure proper static build for production
  - Priority: 🟡 MEDIUM

  PHASE 5: FINALIZATION (LOW PRIORITY)

  5.1 Update README & Documentation

  - Files: docs/README.md
  - Action: Update with accurate build steps and
  project info
  - Priority: 🟢 LOW

  5.2 Verify Build Process

  - Action: Test all build commands and deployment
  - Priority: 🟢 LOW

  📊 CONTENT INVENTORY

  Tutorial Content (multisynq-client/docs)

  - 💻 Interactive Tutorials: 6 tutorials with CodePen
   examples
  - 💡 Conceptual Tutorials: 4 architecture
  explanations
  - 🎯 Working Examples: 5 complete HTML/JS/CSS
  examples
  - 📊 Assets: 6 images, diagrams, screenshots

  API Documentation (croquet-docs/multisynq)

  - 📚 Core Classes: Model, View, Session classes
  - 🌐 Global Events: System events and constants
  - 🔧 Utilities: App utilities and helper functions
  - 📖 Generated Content: 10 HTML pages ready for
  conversion

  React Together Content (react-together)

  - 🎣 Hooks Documentation: 17 hooks with examples
  - 🧩 Components: 6 core components
  - 🎨 UI Integrations: 20 Ant Design + PrimeReact
  components
  - 🎮 Demos: 7 interactive playground examples

  🛠️ TECHNICAL REQUIREMENTS

  Tools Needed:

  - Mintlify CLI - For development and building
  - Node.js - Runtime environment
  - MDX Support - For enhanced markdown
  - Asset Management - For images and media

  Dependencies:

  - Mintlify - Documentation platform
  - React - For MDX components
  - Syntax Highlighting - For code blocks
  - Interactive Examples - CodePen/StackBlitz
  integration

  🚀 EXECUTION STRATEGY

  Step 1: Critical Fixes

  1. Replace OpenAPI specification with actual
  Multisynq API
  2. Fix all broken navigation links
  3. Remove template content from existing pages

  Step 2: Content Migration

  1. Start with Hello World tutorial (foundation)
  2. Migrate core API documentation (Model, View,
  Session)
  3. Add remaining tutorials in learning order

  Step 3: React Together Integration

  1. Create new navigation section
  2. Migrate hooks documentation
  3. Add component documentation
  4. Integrate UI library guides

  Step 4: Testing & Validation

  1. Test all links and navigation
  2. Verify code examples work
  3. Ensure build process functions
  4. Validate branding consistency

  🎯 SUCCESS METRICS

  Completion Criteria:

  - ✅ No broken links in navigation
  - ✅ All placeholder content replaced
  - ✅ Complete tutorial progression (Hello World →
  Advanced)
  - ✅ Full API reference documentation
  - ✅ React Together integration complete
  - ✅ Build process works end-to-end
  - ✅ Professional branding consistency

  Quality Metrics:

  - 📖 Comprehensive coverage of all Multisynq
  features
  - 🎯 Clear learning progression for new users
  - 🔧 Complete API reference for developers
  - 🎨 Consistent branding and design
  - 🚀 Fast build and deployment process

  ⚠️ RISK MITIGATION

  Potential Issues:

  1. CodePen Dependencies - Convert to static code
  blocks
  2. Asset Management - Ensure all images are local
  3. API Changes - Verify current API matches
  documentation
  4. Build Process - Test deployment pipeline

  Mitigation Strategies:

  1. Incremental Migration - Test each section before
  moving to next
  2. Asset Audit - Verify all images and media are
  accessible
  3. Link Validation - Check all internal and external
   links
  4. Build Testing - Validate each phase builds
  successfully

  This comprehensive migration plan provides a clear
  roadmap for transforming the multisynq.io
  documentation into a modern, professional, and
  comprehensive resource for developers using the
  Multisynq platform.

  Now I'll begin executing this plan...

  🎉 MIGRATION STATUS UPDATE

  ✅ COMPLETED TASKS

  1. Full Documentation: Created comprehensive
  analysis files:
    - MIGRATION_ANALYSIS.md - Complete overview of
  migration scope
    - TODO.md - Detailed implementation plan with time
   estimates
    - BUILD_PROCESS.md - Build system and future
  automation strategy
    - SOURCES_OF_TRUTH.md - Source management and
  rebrand preparation
  2. Critical Fixes:
    - OpenAPI Specification: Replaced Plant Store
  template with actual Multisynq API
    - Broken Navigation: Fixed all broken links by
  creating missing essential pages
    - Essential Pages: Created conflicts.mdx,
  scaling.mdx, chat.mdx, whiteboard.mdx

  🚀 MIGRATION EXECUTION IN PROGRESS

  The migration is now executing according to the
  plan. Key accomplishments:

  - 🗂️ Complete Repository Analysis: Mapped all source
   content from 3 repositories
  - 📋 Detailed Implementation Plan: 69-93 hour
  roadmap with clear priorities
  - 🔧 Critical Infrastructure: Fixed placeholder
  content and broken links
  - 📚 Foundation Content: Created comprehensive
  essential pages

  📊 NEXT STEPS

  The migration will continue with:
  1. Hello World Tutorial Migration (in progress)
  2. Core API Documentation (Model, View, Session
  classes)
  3. React Together Integration
  4. Complete Tutorial Suite
  5. Final Testing & Validation

  🎯 KEY DOCUMENTATION HIGHLIGHTS

  - Sources of Truth: Documented current locations and
   automation strategy for Croquet→Multisynq rebrand
  - Build Process: Comprehensive automation roadmap
  including JSDoc→MDX conversion
  - Migration Analysis: Complete audit showing 17
  files, 11+ broken links fixed, template content
  replaced
  - Implementation Plan: Phase-by-phase execution with
   5 priority levels and time estimates

  The foundation is now solid and the migration is
  proceeding systematically according to the
  documented plan!

  read@TODO.md then
1. update it with current progress and any identified additional discovered todos
2. add a next task for: Carefully review ALL CURRENT /docs documentation that was NOT copied verbatim (so basically anything not in the react-together section) to ensure validity and accuracy - see the Critical Base Instruction 
3. add a todo for strategizing automated syncing for croquet classes, multisynq-client docs (incl tutorials), Tutorials Repo List (this file doesnt exist create it and put @https://github.com/multisynq/physics-fountain , @https://github.com/multisynq/multiblaster-lobby and @https://github.com/multisynq/vibecoded-gallery  in it
4. add a todo for writing a super thorough test suite for all /docs pages and navigation/ui/images/interactive components using playwright 
5. continue working on the todos until all are complete

7/24/2025
read @Mintlify and the relevant project files eg @package.json @docs.json @README.md as well as the fragmented summary and overview files:@AUTOMATED_SYNCING_STRATEGY.md @MIGRATION_ANALYSIS.md @SOURCES_OF_TRUTH.md and the Proposed Automation Strategy from @BUILD_PROCESS.md . then, assimilate this information carefully and create a CURSOR.md file with detailed context/info (review any other files you normally would for this and include all info you normally would as well as what you learned from reading the referenced files). it should also include the Critical Base Instruction from @TODOv1.md and instruct the llm reader to ALWAYS also read ROADMAP.md (create this file, it will include a summary of the previously completed todo.md files and ALL THE OUTSTANDING TODOs, ESPECIALLY jsdoc to mdx automated pipeline from the original source, and the COMPLETELY MISSING multisynq/react docs, https://github.com/multisynq/multisynq-react as well as a layout/navigation restructuring to clearly show each of our npm packages and their corresponding docs, as well as fixing the broken vibe coding // ai integration section + mdx file) and STYLE.md (create this file and have it include the tips from mintlify docs below to ensure ai-assistant-friendly formatting and other mintlify best practices you saw in the rest of the mintlify docs)
<@https://mintlify.com/docs/guides/assistant >
Making content AI ingestible
Structure your documentation to help the assistant provide accurate, relevant answers. Clear organization and comprehensive context benefit both human readers and AI understanding.
Structure and organization
Use semantic markup.
Write descriptive headings for sections.
Create a logical information hierarchy.
Use consistent formatting across your docs.
Include comprehensive metadata in page frontmatter.
Break up long blocks of text into shorter paragraphs.
Context
Define specific terms and acronyms when first introduced.
Provide sufficient conceptual content about features and procedures.
Include examples and use cases.
Cross-reference related topics.
Add hidden pages with additional context that users don’t need, but the assistant can reference.
</@https://mintlify.com/docs/guides/assistant >

now read all files in @/migration and look for discrepencies and inconsistencies with the 3 new files you created. dont edit those yet. instead create DISCREPENCIES.md with numbered items to investigate, then proceed to investigate each one and update DISCREPENCIES.md with your findings. then add a conclusion at the end of the file with proposed changes, but dont implement them yet. Lastly, review mintlify changelog and see what outstanding steps we need to take, for example i believe 'mintlify' is deprecated and we need to update build scripts and readme/developer instructions to use the new 'mint' command. also add other missing todos you've uncovered from all your research for example the @https://mintlify.com/docs/ai/contextual-menu config lines in @docs.json that should include 'copy page', 'view as markdown', 'open in claude', 'open in chatgpt', 'view llms.txt' 'view llms-full.txt', 'Ask Gemini', and 'Add the Multisynq MCP' that uses the commands described in @https://mintlify.com/docs/mcp  

1. review the @vibe-coding.mdx and related navigation and linked assets and fix all the errors and reformat as necessary to include mcp info, all the Contextual link guides/info (people may not know what open in chatgpt does, etc) and also make sure the preview embed for the 4 files @multisynq-js.txt @multisynq-react.txt @multisynq-react-llm.md @multisynq-js-llm.md work and that they have download and copy buttons for the entire content of each, with explanations on when they should be used.

2. create the jsdoc to mdx conversion script

3. add redirects to @docs.json so any model/view/introduction/session links and any previous /Model.html#methods links work. see below for legacy docs page (to understand what hashtag headers used to exist):
<div class="main-wrapper"><section class="readme"><h1 class="title has-anchor">Multisynq 1.0.4<a href="#" class="link-anchor">#</a></h1><article><p><em>Multisynq lets you build real-time multiuser apps without writing server-side code. Unlike traditional client/server architectures, the multiplayer code is executed on each client in a synchronized virtual machine, rather than on a server. Multisynq is available as a JavaScript library that synchronizes apps using Multisynq's global DePIN network.</em></p><p>Please join the Multisynq <a href="https://multisynq.io/discord/"><strong>Developer Discord</strong></a> for any questions.</p><ul><li><a href="#quickstart">Quickstart</a></li><li><a href="#what-is-multisynq%3F">What is Multisynq?</a></li><li><a href="#main-concepts">Main Concepts</a></li><li><a href="#creating-a-multisynq-app">Creating a Multisynq App</a></li><li><a href="#models">Models</a></li><li><a href="#views">Views</a></li><li><a href="#events">Events</a></li><li><a href="#time">Time</a></li><li><a href="#snapshots">Snapshots</a></li><li><a href="#random">Random</a></li></ul><h1 id="quickstart" class="has-anchor">Quickstart<a href="#quickstart" class="link-anchor">#</a></h1><p><strong><em>First, get a free Multisynq API key from <a href="https://multisynq.io/coder/">multisynq.io/coder</a></em></strong> <em>(you can also run your own server but you won't get the benefit of automatic global scaling)</em></p><p>Multisynq runs fine without a bundler. Just put it in a script tag in your HTML:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL0')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL0">Copied!</div></button></div><pre class="prettyprint source language-html" tabindex="0" data-lang="code" id="ScDloZOMdL0" style="max-height: 366px;"><code class="language-html hljs language-xml"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">charset</span>=<span class="hljs-string">"utf-8"</span>&gt;</span></td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2"><span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">"https://cdn.jsdelivr.net/npm/@multisynq/client@1.0.4/bundled/multisynq-client.min.js"</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span></td></tr></tbody></table></code></pre></div><p>This makes <code>Multisynq</code> globally available. The <code>charset="utf-8"</code> declaration is necessary to get identical code hashing across browsers.</p><p>You can also import it directly as a module in your JS file:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL1')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL1">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL1" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">import</span> * <span class="hljs-keyword">as</span> <span class="hljs-title class_">Multisynq</span> <span class="hljs-keyword">from</span> <span class="hljs-string">"https://cdn.jsdelivr.net/npm/@multisynq/client@1.0.4/bundled/multisynq-client.esm.js"</span>;</td></tr></tbody></table></code></pre></div><p>That same module URL works fine in HTML in an import map.</p><p><strong><em>Alternatively, use the package with a bundler:</em></strong></p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL2')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL2">Copied!</div></button></div><pre class="prettyprint source language-sh" tabindex="0" data-lang="code" id="ScDloZOMdL2" style="max-height: 366px;"><code class="language-sh hljs language-bash"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1">npm install @multisynq/client</td></tr></tbody></table></code></pre></div><p>Then import it in your JS file:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL3')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL3">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL3" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">import</span> * <span class="hljs-keyword">as</span> <span class="hljs-title class_">Multisynq</span> <span class="hljs-keyword">from</span> <span class="hljs-string">"@multisynq/client"</span></td></tr></tbody></table></code></pre></div><p>Again, make sure to specify the <code>charset</code> for your HTML or your script tags.</p><h2 id="main-concepts" class="has-anchor">Main Concepts<a href="#main-concepts" class="link-anchor">#</a></h2><p>Every Multisynq application must consist of two largely independent parts:</p><ul><li><p>The <strong>models</strong> handle all calculation and simulation. This is where the actual work of the application takes place. The model computation is synchronized automatically.</p></li><li><p>The <strong>views</strong> handle user input and output. They process all keyboard / mouse / touch events, and determine what is displayed on the screen.</p></li></ul><p><strong>Models are guaranteed to always be identical for all users.</strong> However, the views are not. Different users might be running on different hardware platforms, or might display different representations of the models.</p><p>When you launch a Multisynq application, you automatically join a shared <strong>session</strong>. As long as you're in the session, your models will be identical to the models of every other user in the session.</p><p>To maintain this synchronization, models for all users execute in lockstep based on a shared session <strong>time</strong>.</p><p>The views interact with the models through <strong>events</strong>. When you publish an event from a view, it's mirrored to everyone else in your session, so everyone's models receive exactly the same event stream.</p><p><strong><em>THE MAIN RULE OF MULTISYNQ IS THAT THE MODEL MUST BE COMPLETELY SELF-CONTAINED!</em></strong></p><p><em>Model code must not access any state outside the model, and the model state must never be changed from the view directly. The view can read from a model but must never write. Any external change to the model must be via a published event that the model subscribes to.</em></p><p>There are no special data structures you need to use, and the whole model is synchronized automatically without designating which parts to synchronize. Inside the model you can use almost any JavaScript, <em>except</em> for storing functions (that precludes any async execution, too). That's because the entire state of the model needs to be snapshottable, and JavaScript code cannot access state captured in functions.</p><h2 id="creating-a-multisynq-app" class="has-anchor">Creating a Multisynq App<a href="#creating-a-multisynq-app" class="link-anchor">#</a></h2><p>To create a new a Multisynq app, you define your own models and views. These classes inherit from the base classes <a href="Model.html">Model</a> and <a href="View.html">View</a> in the Multisynq client library.</p><p>A simple app often only has one model and one view. In that case, the view contains all your input and output code, and the model contains all your simulation code.</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL4')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL4">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL4" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">class</span> <span class="hljs-title class_">MyModel</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Multisynq.Model</span> {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2">    <span class="hljs-title function_">init</span>(<span class="hljs-params"></span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="3"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="3">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="4"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="4">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="5"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="5">}</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="6"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="6"><span class="hljs-title class_">MyModel</span>.<span class="hljs-title function_">register</span>(<span class="hljs-string">"MyModel"</span>);</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="7"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="7"> </td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="8"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="8"><span class="hljs-keyword">class</span> <span class="hljs-title class_">MyView</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Multisynq.View</span> {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="9"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="9">    <span class="hljs-title function_">constructor</span>(<span class="hljs-params">model</span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="10"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="10">        <span class="hljs-variable language_">super</span>(model);</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="11"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="11">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="12"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="12">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="13"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="13"> </td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="14"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="14">    <span class="hljs-title function_">update</span>(<span class="hljs-params">time</span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="15"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="15">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="16"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="16">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="17"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="17">}</td></tr></tbody></table></code></pre></div><p>You then join a session by calling <a href="Session.html#.join">Session.join()</a> and passing it your model and view classes. <code>Session.join</code> automatically connects to a nearby reflector, synchronizes your model with the models of any other users already in the same session, and starts executing.</p><p>You do need to provide some session meta data, like your API key, an appId, session name, and a password. Below we use <code>autoSession</code>/<code>autoPassword</code> but you can instead use whatever makes most sense for your app. In the tutorials we even often use constants for all, but you should not do that in production because it wouldn't be end-to-end encrypted anymore if the password is known.</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL5')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL5">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL5" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">const</span> apiKey = <span class="hljs-string">"your_api_key"</span>; <span class="hljs-comment">// paste from multisynq.io/coder</span></td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2"><span class="hljs-keyword">const</span> appId = <span class="hljs-string">"com.example.myapp"</span>;</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="3"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="3"><span class="hljs-keyword">const</span> name = <span class="hljs-title class_">Multisynq</span>.<span class="hljs-property">App</span>.<span class="hljs-title function_">autoSession</span>();</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="4"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="4"><span class="hljs-keyword">const</span> password = <span class="hljs-title class_">Multisynq</span>.<span class="hljs-property">App</span>.<span class="hljs-title function_">autoPassword</span>();</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="5"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="5"><span class="hljs-title class_">Multisynq</span>.<span class="hljs-property">Session</span>.<span class="hljs-title function_">join</span>({apiKey, appId, name, password, <span class="hljs-attr">model</span>: <span class="hljs-title class_">MyModel</span>, <span class="hljs-attr">view</span>: <span class="hljs-title class_">MyView</span>});</td></tr></tbody></table></code></pre></div><p>That's it. You don't need to worry about setting up a server, or writing special synchronization code. Multisynq handles all of that invisibly, allowing you to concentrate on what your app <em>does</em>.</p><h1 id="models" class="has-anchor">Models<a href="#models" class="link-anchor">#</a></h1><p>Multisynq models are a little different from normal JavaScript classes. For one thing, instead of having a constructor, they have an <a href="Model.html#init">init()</a> method. <code>init</code> only executes the <em>very first time</em> the model is instantiated within a brand new session. If you join a session that's already in progress, your model will be initialized from a snapshot instead.</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL6')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL6">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL6" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">class</span> <span class="hljs-title class_">MyModel</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Multisynq.Model</span> {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2">    <span class="hljs-title function_">init</span>(<span class="hljs-params"></span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="3"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="3">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="4"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="4">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="5"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="5">}</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="6"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="6"><span class="hljs-title class_">MyModel</span>.<span class="hljs-title function_">register</span>(<span class="hljs-string">"MyModel"</span>);</td></tr></tbody></table></code></pre></div><p>Also, every Multisynq model class needs to have its static <a href="Model.html#.register">register()</a> method called after it is defined. This registers the model class with Multisynq's internal class database so it can be properly retrieved when a snapshot is resumed.</p><p>The root model of your app (the one named in <code>Session.join()</code>) is instantiated automatically. If your application uses multiple models, you instantiate them by calling <a href="Model.html#.create">create()</a> instead of <code>new</code>.</p><p>See <a href="Model.html">Model</a> for the full class documentation.</p><h1 id="views" class="has-anchor">Views<a href="#views" class="link-anchor">#</a></h1><p>When <a href="Session.html#.join">Session.join</a> creates the local root model and root view, it passes the view a reference to the model. This way the view can initialize itself to reflect whatever state the model may currently be in. Remember that when you join a session, your model might have been initalized by running its <code>init()</code> method, or it might have been loaded from an existing snapshot. Having direct access to the model allows the view to configure itself properly no matter how the model was initialized.</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL7')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL7">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL7" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-keyword">class</span> <span class="hljs-title class_">MyView</span> <span class="hljs-keyword">extends</span> <span class="hljs-title class_ inherited__">Multisynq.View</span> {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2">    <span class="hljs-title function_">constructor</span>(<span class="hljs-params">model</span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="3"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="3">        <span class="hljs-variable language_">super</span>(model);</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="4"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="4">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="5"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="5">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="6"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="6"> </td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="7"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="7">    <span class="hljs-title function_">update</span>(<span class="hljs-params">time</span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="8"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="8">        ...</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="9"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="9">    }</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="10"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="10">}</td></tr></tbody></table></code></pre></div><p>This illustrates an important feature of Multisynq: <strong>A view can read directly from a model at any time.</strong> A view doesn't need to receive an event from a model to update itself. It can just pull whatever data it needs directly from the model whenever it wants. (Of course, a view must never <em>write</em> directly to a model, because that would break synchronization.)</p><p>The root view's <a href="View.html#update">update()</a> method is called automatically for every animation frame (usually 60 times a second). This allows the view to continually refresh itself, which is useful for continuous animation (as opposed to updating only when an event is received). Internally this uses a callback via the browser's <code>requestAnimationFrame</code> function, and the callback timestamp is passed as <code>update(timestamp)</code>.</p><p>If your app uses hierarchical views, your root view's <code>update</code> method needs to call all other views' <code>update</code>.</p><p>See <a href="View.html">View</a> for the full class documentation.</p><h1 id="events" class="has-anchor">Events<a href="#events" class="link-anchor">#</a></h1><p>Even though views can read directly from models, the only way for a view to interact with a model is through events.</p><p>To send an event, call <code>publish()</code>:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL8')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL8">Copied!</div></button></div><pre data-lang="code" id="ScDloZOMdL8" class="prettyprint" style="max-height: 366px;"><code class="hljs language-scss"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1">this<span class="hljs-selector-class">.publish</span>(scope, event, data)</td></tr></tbody></table></code></pre></div><ul><li><em>Scope</em> is a namespace so you can use the same event in different contexts.</li><li><em>Event</em> is the name of the event itself.</li><li><em>Data</em> is an optional data object containing addtional information.</li></ul><p>And to receive an event, call <code>subscribe()</code>:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL9')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL9">Copied!</div></button></div><pre data-lang="code" id="ScDloZOMdL9" class="prettyprint" style="max-height: 366px;"><code class="hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-variable language_">this</span>.<span class="hljs-title function_">subscribe</span>(scope, event, <span class="hljs-variable language_">this</span>.<span class="hljs-property">handler</span>)</td></tr></tbody></table></code></pre></div><ul><li><em>Scope</em> is a namespace so you can use the same event in different contexts.</li><li><em>Event</em> is the name of the event itself.</li><li><em>Handler</em> is the method that will be called when the event is published. (The handler accepts the data object as an argument.)</li></ul><p>An event is routed automatically based on who publishes and who subscribes to it:</p><p><strong><em>Input events</em> (<a href="View.html#publish">published</a> by a view and <a href="Model.html#subscribe">handled</a> by a model) are sent to every replica of the model in your current session.</strong></p><p>By sending view-to-model events to each participant, Multisynq ensures that all replicas of the model stay in sync. All replicas of the model receive exactly the same stream of events in exactly the same order.</p><p><strong><em>Output events</em> (<a href="Model.html#publish">published</a> by a model and <a href="View.html#subscribe">handled</a> by a view) are generated by each replica simultaneously and do not require a network roundtrip. Typically they are queued and handled before each frame is rendered.</strong></p><p>This is to ensure a strict separation between model code execution and view code execution. The model code must be executed precisely the same for every user to stay in sync, no matter if there are views subscribed on that user's machine or not. All event handlers are executed before invoking <code>update()</code>.</p><p><strong><em>Model events</em> (<a href="Model.html#publish">published</a> by a model and <a href="Model.html#subscribe">handled</a> by a model) are generated and handled by each replica locally. They are not sent via the network. Event handlers are invoked synchronously during publish.</strong></p><p>This allows you to use pub/sub inside of your model, if that makes sense for your app. It is equivalent to calling another model's method directly.</p><p><strong><em>View events</em> (<a href="View.html#publish">published</a> by a view and <a href="View.html#subscribe">handled</a> by a view) are also generated and handled locally. They are not sent via the network. Typically they are queued and handled before each frame is rendered.</strong></p><p>Again, this allows you to use pub/sub inside your view. It is <em>not</em> a way to communicate between different clients, for that, both clients need to communicate with the shared model.</p><p>Both models and views can subscribe to the same event. This can be used to implement immediate user feedback: the local view can update itself by listening to the same input event it is sending via the reflector to the model, anticipating what will happen once the event comes back from the reflector. Care has to be taken to handle the case that another event arrives in the mean time.</p><p>There are also two special events that are generated by the system itself: <a href="global.html#event:view-join">"view-join"</a> and <a href="global.html#event:view-exit">"view-exit"</a>. These are broadcast whenever a user joins or leaves a session.</p><h1 id="time" class="has-anchor">Time<a href="#time" class="link-anchor">#</a></h1><p>Models have no concept of real-world time. All they know about is <strong>simulation time</strong>, which is governed by the reflector.</p><p>Every event that passes through the reflector is timestamped. The simulation time in the model is advanced up to the last event it received. This allows different replicas of the model to stay in sync even if their local real-world clocks diverge.</p><p>Calling <a href="Model.html#now">this.now()</a> will return the current simulation time.</p><p>In addition to normal events, the reflector also sends out a regular stream of <strong>heartbeat ticks</strong>. Heartbeat ticks advance the model's simulation time even if no view is sending any events. By default the reflector sends out heartbeat ticks 20 times a second, but you can change the frequency at session start.</p><p>The method <a href="Model.html#future">future()</a> can be used to schedule an event in the future. For example, if you wanted to create an animation routine in a model that executes every 100 milliseconds of simulation time, it would look like this:</p><div class="pre-div"><div class="pre-top-bar-container"><div class="code-lang-name-container"><div class="code-lang-name">CODE</div></div><button aria-label="copy code" class="icon-button copy-code" onclick="copyFunction('ScDloZOMdL10')"><svg class="sm-icon" alt="click to copy"><use xlink:href="#copy-icon"></use></svg><div class="tooltip" id="tooltip-ScDloZOMdL10">Copied!</div></button></div><pre class="prettyprint source language-js" tabindex="0" data-lang="code" id="ScDloZOMdL10" style="max-height: 366px;"><code class="language-js hljs language-javascript"><table class="hljs-ln"><tbody><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="1"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="1"><span class="hljs-title function_">step</span>(<span class="hljs-params"></span>) {</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="2"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="2">    <span class="hljs-comment">// ... do some stuff ...</span></td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="3"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="3">    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">future</span>(<span class="hljs-number">100</span>).<span class="hljs-title function_">step</span>();</td></tr><tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="4"></td><td class="hljs-ln-line hljs-ln-code" data-line-number="4">}</td></tr></tbody></table></code></pre></div><p>Note that the ticks-per-second rate of the reflector is independent of the future interval used by your models. Individual models may use different future times.</p><h2 id="random" class="has-anchor">Random<a href="#random" class="link-anchor">#</a></h2><p>Multisynq guarantees that the same sequence of random numbers is generated in every replica of your application. If you call <code>Math.random()</code> within a model it will return the same number for all replicas.</p><p>Calls to <code>Math.random()</code> within a view will behave normally. Different instances will receive different random numbers.</p></article></section></div>