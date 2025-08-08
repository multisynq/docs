#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration mapping repositories to their main HTML files and display names
const EXAMPLE_REPOS = {
    'physics-fountain': {
        repo: 'https://github.com/multisynq/physics-fountain',
        htmlFile: 'index.html',  // Changed from fountain.html
        displayName: 'Physics Fountain',
        description: 'Interactive physics-based fountain demo showcasing real-time collaboration',
        category: 'Physics & Animation'
    },
    'multiblaster-lobby': {
        repo: 'https://github.com/multisynq/multiblaster-lobby',
        htmlFile: 'index.html',
        displayName: 'Multiblaster Lobby',
        description: 'Multiplayer game lobby system with room management',
        category: 'Games & Multiplayer'
    },
    'vibecoded-gallery': {
        repo: 'https://github.com/multisynq/vibecoded-gallery',
        htmlFile: 'index.html',
        displayName: 'VibeCoded Gallery',
        description: 'Collaborative art gallery application built with AI assistance',
        category: 'Creative & Collaboration'
    }
};

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');
const TEMP_DIR = path.join(__dirname, '..', '.temp-examples');

async function cloneAndCopyExample(key, config) {
    console.log(`\n📦 Processing ${config.displayName}...`);
    
    const tempRepoDir = path.join(TEMP_DIR, key);
    
    try {
        // Clone the repository
        console.log(`  📥 Cloning ${config.repo}...`);
        execSync(`git clone ${config.repo} ${tempRepoDir}`, { stdio: 'pipe' });
        
        // Find the HTML file
        const htmlPath = path.join(tempRepoDir, config.htmlFile);
        if (!await fs.pathExists(htmlPath)) {
            // Try to find it in common locations
            const alternativePaths = [
                path.join(tempRepoDir, 'dist', config.htmlFile),
                path.join(tempRepoDir, 'build', config.htmlFile),
                path.join(tempRepoDir, 'public', config.htmlFile),
                path.join(tempRepoDir, 'src', config.htmlFile)
            ];
            
            let found = false;
            for (const altPath of alternativePaths) {
                if (await fs.pathExists(altPath)) {
                    console.log(`  📄 Found HTML at ${altPath}`);
                    await fs.copy(altPath, path.join(EXAMPLES_DIR, 'demos', `${key}.html`));
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.warn(`  ⚠️  Could not find ${config.htmlFile} in ${config.displayName}`);
                return false;
            }
        } else {
            // Copy the HTML file
            console.log(`  📄 Copying ${config.htmlFile}...`);
            await fs.copy(htmlPath, path.join(EXAMPLES_DIR, 'demos', `${key}.html`));
        }
        
        // Also copy any associated assets if they exist
        const assetsDir = path.join(tempRepoDir, 'assets');
        if (await fs.pathExists(assetsDir)) {
            console.log(`  📁 Copying assets...`);
            await fs.copy(assetsDir, path.join(EXAMPLES_DIR, 'demos', 'assets', key));
        }
        
        return true;
    } catch (error) {
        console.error(`  ❌ Error processing ${config.displayName}:`, error.message);
        return false;
    }
}

async function generateExamplesIndex() {
    console.log('\n📝 Generating examples index...');
    
    const categories = {};
    
    // Group examples by category
    for (const [key, config] of Object.entries(EXAMPLE_REPOS)) {
        if (!categories[config.category]) {
            categories[config.category] = [];
        }
        categories[config.category].push({ key, ...config });
    }
    
    // Generate MDX content
    let mdxContent = `---
title: Examples
description: Interactive examples and demos showcasing Multisynq capabilities
icon: 'play'
---

import { Card, CardGroup } from '/snippets/card-components.mdx';

# Interactive Examples

Explore these live examples to see Multisynq in action. Each example demonstrates different aspects of the framework's capabilities.

<Note>
These examples are best experienced with multiple browser windows or devices to see the real-time collaboration features.
</Note>
`;
    
    // Add each category
    for (const [category, examples] of Object.entries(categories)) {
        mdxContent += `\n## ${category}\n\n<CardGroup cols={2}>\n`;
        
        for (const example of examples) {
            const demoPath = `/examples/demos/${example.key}.html`;
            mdxContent += `  <Card
    title="${example.displayName}"
    icon="window"
    href="${demoPath}"
  >
    ${example.description}
    
    [View Source](${example.repo})
  </Card>\n`;
        }
        
        mdxContent += `</CardGroup>\n`;
    }
    
    // Add usage instructions
    mdxContent += `
## Running Examples Locally

Each example can be run locally by cloning its repository:

\`\`\`bash
# Clone an example repository
git clone https://github.com/multisynq/physics-fountain
cd physics-fountain

# Install dependencies
npm install

# Start the development server
npm start
\`\`\`

## Creating Your Own Examples

To create your own Multisynq example:

1. Start with one of the example repositories as a template
2. Modify the code to suit your needs
3. Deploy to any static hosting service

Check out our [Getting Started](/getting-started) guide for more details on building with Multisynq.
`;
    
    // Write the index file
    await fs.writeFile(path.join(EXAMPLES_DIR, 'index.mdx'), mdxContent);
    console.log('  ✅ Generated examples/index.mdx');
}

async function updateNavigation() {
    console.log('\n🔧 Updating navigation...');
    
    const docsJsonPath = path.join(__dirname, '..', 'docs.json');
    const docsJson = await fs.readJson(docsJsonPath);
    
    // Find the Guides tab
    const guidesTab = docsJson.navigation.tabs.find(tab => tab.tab === 'Guides');
    if (!guidesTab) {
        console.error('  ❌ Could not find Guides tab in navigation');
        return;
    }
    
    // Find or create examples section in navigation
    let examplesSection = guidesTab.groups.find(group => group.group === 'Examples');
    
    if (!examplesSection) {
        examplesSection = {
            group: 'Examples',
            pages: []
        };
        // Add after Tutorials but before other sections
        const tutorialsIndex = guidesTab.groups.findIndex(group => group.group === 'Tutorials');
        if (tutorialsIndex >= 0) {
            guidesTab.groups.splice(tutorialsIndex + 1, 0, examplesSection);
        } else {
            // Add at the beginning if no tutorials section
            guidesTab.groups.unshift(examplesSection);
        }
    }
    
    // Update pages
    examplesSection.pages = ['examples/index'];
    
    // Write back
    await fs.writeJson(docsJsonPath, docsJson, { spaces: 2 });
    console.log('  ✅ Updated docs.json navigation');
}

async function main() {
    console.log('🚀 Starting examples synchronization...\n');
    
    try {
        // Create directories
        await fs.ensureDir(EXAMPLES_DIR);
        await fs.ensureDir(path.join(EXAMPLES_DIR, 'demos'));
        await fs.ensureDir(path.join(EXAMPLES_DIR, 'demos', 'assets'));
        await fs.ensureDir(TEMP_DIR);
        
        // Process each example
        const results = [];
        for (const [key, config] of Object.entries(EXAMPLE_REPOS)) {
            const success = await cloneAndCopyExample(key, config);
            results.push({ key, config, success });
        }
        
        // Generate index page
        await generateExamplesIndex();
        
        // Update navigation
        await updateNavigation();
        
        // Clean up temp directory
        console.log('\n🧹 Cleaning up...');
        await fs.remove(TEMP_DIR);
        
        // Summary
        console.log('\n✨ Synchronization complete!');
        console.log(`  ✅ Processed ${results.filter(r => r.success).length}/${results.length} examples`);
        
        if (results.some(r => !r.success)) {
            console.log('\n⚠️  Some examples could not be processed:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  - ${r.config.displayName}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { EXAMPLE_REPOS, generateExamplesIndex }; 