#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIRS = [
    path.join(__dirname, '../../multisynq-client/client/teatime/src'),
    path.join(__dirname, '../../multisynq-client/client')
];

const OUTPUT_FILE = path.join(__dirname, '../api-reference/index.mdx');

// JSDoc tag patterns
const JSDOC_PATTERNS = {
    class: /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)/g,
    method: /\/\*\*[\s\S]*?\*\/\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g,
    property: /\/\*\*[\s\S]*?\*\/\s*(?:static\s+)?(\w+)\s*(?:=|:)/g,
    function: /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/g,
    const: /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?const\s+(\w+)/g
};

// Parse JSDoc comment block
function parseJSDoc(comment) {
    const cleaned = comment
        .replace(/^\/\*\*\s*/, '')
        .replace(/\s*\*\/$/, '')
        .replace(/^\s*\*\s?/gm, '');
    
    const lines = cleaned.split('\n');
    const result = {
        summary: [],
        tags: {}
    };
    
    let currentTag = null;
    let inExample = false;
    let exampleCode = [];
    
    for (const line of lines) {
        const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/);
        
        if (tagMatch) {
            // Save any pending example
            if (inExample && currentTag === 'example') {
                if (!result.tags.example) result.tags.example = [];
                result.tags.example.push({
                    caption: result.tags.example[result.tags.example.length - 1]?.caption || '',
                    code: exampleCode.join('\n')
                });
                exampleCode = [];
                inExample = false;
            }
            
            const [, tag, content] = tagMatch;
            currentTag = tag;
            
            if (tag === 'param') {
                const paramMatch = content?.match(/^(?:\{([^}]+)\}\s*)?(\S+)(?:\s+-\s+(.*))?$/);
                if (paramMatch) {
                    const [, type, name, description] = paramMatch;
                    if (!result.tags.param) result.tags.param = [];
                    result.tags.param.push({ type, name, description: description || '' });
                }
            } else if (tag === 'returns' || tag === 'return') {
                const returnMatch = content?.match(/^(?:\{([^}]+)\}\s*)?(.*)$/);
                if (returnMatch) {
                    const [, type, description] = returnMatch;
                    result.tags.returns = { type, description };
                }
            } else if (tag === 'example') {
                const captionMatch = content?.match(/^<caption>(.*)<\/caption>$/);
                if (!result.tags.example) result.tags.example = [];
                result.tags.example.push({
                    caption: captionMatch ? captionMatch[1] : content || '',
                    code: ''
                });
                inExample = true;
                exampleCode = [];
            } else if (tag === 'tutorial') {
                if (!result.tags.tutorial) result.tags.tutorial = [];
                result.tags.tutorial.push(content || '');
            } else if (tag === 'link') {
                if (!result.tags.link) result.tags.link = [];
                result.tags.link.push(content || '');
            } else if (tag === 'see') {
                if (!result.tags.see) result.tags.see = [];
                result.tags.see.push(content || '');
            } else if (tag === 'fires') {
                if (!result.tags.fires) result.tags.fires = [];
                result.tags.fires.push(content || '');
            } else if (tag === 'listens') {
                if (!result.tags.listens) result.tags.listens = [];
                result.tags.listens.push(content || '');
            } else {
                // Single value tags
                result.tags[tag] = content || true;
            }
        } else if (inExample && currentTag === 'example') {
            exampleCode.push(line);
        } else if (!currentTag) {
            // Part of the summary
            result.summary.push(line);
        } else if (currentTag === 'param' && result.tags.param?.length > 0) {
            // Continuation of param description
            const lastParam = result.tags.param[result.tags.param.length - 1];
            lastParam.description += ' ' + line;
        } else if (currentTag === 'returns' && result.tags.returns) {
            // Continuation of returns description
            result.tags.returns.description += ' ' + line;
        }
    }
    
    // Save any final example
    if (inExample && currentTag === 'example') {
        if (!result.tags.example) result.tags.example = [];
        const lastExample = result.tags.example[result.tags.example.length - 1];
        if (lastExample) {
            lastExample.code = exampleCode.join('\n');
        }
    }
    
    result.summary = result.summary.join('\n').trim();
    return result;
}

// Format inline tags in text
function formatInlineTags(text) {
    if (!text) return '';
    
    // Handle {@link} tags
    text = text.replace(/\{@link\s+([^}]+)\}/g, (match, link) => {
        const parts = link.split(/\s+/);
        const target = parts[0];
        const displayText = parts.slice(1).join(' ') || target;
        
        // Check if it's an external link
        if (target.startsWith('http')) {
            return `[${displayText}](${target})`;
        }
        
        // Internal link - create anchor
        const anchorId = target.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        return `[${displayText}](#${anchorId})`;
    });
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle code blocks
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `\n\n<CodeGroup>\n\`\`\`${lang || 'javascript'}\n${code.trim()}\n\`\`\`\n</CodeGroup>\n\n`;
    });
    
    return text;
}

// Generate MDX for a class
function generateClassMDX(className, jsdoc, classContent) {
    const doc = parseJSDoc(jsdoc);
    let mdx = [];
    
    // Add tabs for class organization
    mdx.push(`## ${className}\n`);
    
    if (doc.tags.deprecated) {
        mdx.push(`<Warning>\nThis class is deprecated. ${doc.tags.deprecated}\n</Warning>\n`);
    }
    
    if (doc.summary) {
        mdx.push(formatInlineTags(doc.summary) + '\n');
    }
    
    if (doc.tags.since) {
        mdx.push(`<Note>\nAvailable since version ${doc.tags.since}\n</Note>\n`);
    }
    
    // Start tabs for class content
    mdx.push('<Tabs>');
    mdx.push('<Tab title="Overview">');
    
    // Add tutorials
    if (doc.tags.tutorial) {
        mdx.push('\n### Tutorials\n');
        doc.tags.tutorial.forEach(tutorial => {
            mdx.push(`<Card title="${tutorial}" href="/tutorials/${tutorial}">\nLearn how to use ${className} with practical examples.\n</Card>\n`);
        });
    }
    
    // Add see also
    if (doc.tags.see) {
        mdx.push('\n### See Also\n');
        doc.tags.see.forEach(see => {
            mdx.push(`- ${formatInlineTags(see)}`);
        });
        mdx.push('');
    }
    
    mdx.push('</Tab>');
    
    // Parse methods and properties from class content
    const methods = [];
    const properties = [];
    
    // Extract methods
    const methodRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;
    let match;
    while ((match = methodRegex.exec(classContent)) !== null) {
        methods.push({
            name: match[2],
            jsdoc: match[1],
            params: match[3]
        });
    }
    
    // Extract properties
    const propRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:static\s+)?(\w+)\s*(?:=|:)/g;
    while ((match = propRegex.exec(classContent)) !== null) {
        properties.push({
            name: match[2],
            jsdoc: match[1]
        });
    }
    
    // Properties tab
    if (properties.length > 0) {
        mdx.push('<Tab title="Properties">');
        mdx.push('\n### Properties\n');
        
        properties.forEach(prop => {
            const propDoc = parseJSDoc('/**' + prop.jsdoc + '*/');
            mdx.push(`#### \`${prop.name}\`\n`);
            
            if (propDoc.tags.type) {
                mdx.push(`<ResponseField name="${prop.name}" type="${propDoc.tags.type}">`);
            } else {
                mdx.push(`<ResponseField name="${prop.name}">`);
            }
            
            if (propDoc.summary) {
                mdx.push(formatInlineTags(propDoc.summary));
            }
            
            if (propDoc.tags.deprecated) {
                mdx.push(`\n<Warning>Deprecated: ${propDoc.tags.deprecated}</Warning>`);
            }
            
            mdx.push('</ResponseField>\n');
        });
        
        mdx.push('</Tab>');
    }
    
    // Methods tab
    if (methods.length > 0) {
        mdx.push('<Tab title="Methods">');
        mdx.push('\n### Methods\n');
        
        methods.forEach(method => {
            const methodDoc = parseJSDoc('/**' + method.jsdoc + '*/');
            mdx.push(`#### \`${method.name}(${method.params})\`\n`);
            
            if (methodDoc.tags.deprecated) {
                mdx.push(`<Warning>This method is deprecated. ${methodDoc.tags.deprecated}</Warning>\n`);
            }
            
            if (methodDoc.summary) {
                mdx.push(formatInlineTags(methodDoc.summary) + '\n');
            }
            
            // Parameters
            if (methodDoc.tags.param && methodDoc.tags.param.length > 0) {
                mdx.push('<Accordion title="Parameters">\n');
                methodDoc.tags.param.forEach(param => {
                    mdx.push(`<ParamField path="${param.name}" type="${param.type || 'any'}" ${param.required === false ? '' : 'required'}>`);
                    mdx.push(formatInlineTags(param.description));
                    mdx.push('</ParamField>\n');
                });
                mdx.push('</Accordion>\n');
            }
            
            // Returns
            if (methodDoc.tags.returns) {
                mdx.push('<Accordion title="Returns">\n');
                mdx.push(`<ResponseField type="${methodDoc.tags.returns.type || 'any'}">`);
                mdx.push(formatInlineTags(methodDoc.tags.returns.description));
                mdx.push('</ResponseField>');
                mdx.push('</Accordion>\n');
            }
            
            // Examples
            if (methodDoc.tags.example && methodDoc.tags.example.length > 0) {
                mdx.push('<Accordion title="Examples">\n');
                methodDoc.tags.example.forEach((example, idx) => {
                    if (example.caption) {
                        mdx.push(`**${example.caption}**\n`);
                    }
                    mdx.push('<CodeGroup>');
                    mdx.push('```javascript');
                    mdx.push(example.code.trim());
                    mdx.push('```');
                    mdx.push('</CodeGroup>\n');
                });
                mdx.push('</Accordion>\n');
            }
            
            // Events
            if (methodDoc.tags.fires || methodDoc.tags.listens) {
                mdx.push('<Accordion title="Events">\n');
                if (methodDoc.tags.fires) {
                    mdx.push('**Fires:**\n');
                    methodDoc.tags.fires.forEach(event => {
                        mdx.push(`- \`${event}\``);
                    });
                    mdx.push('');
                }
                if (methodDoc.tags.listens) {
                    mdx.push('**Listens to:**\n');
                    methodDoc.tags.listens.forEach(event => {
                        mdx.push(`- \`${event}\``);
                    });
                    mdx.push('');
                }
                mdx.push('</Accordion>\n');
            }
            
            // Throws
            if (methodDoc.tags.throws) {
                mdx.push(`<Warning>\n**Throws:** ${formatInlineTags(methodDoc.tags.throws)}\n</Warning>\n`);
            }
        });
        
        mdx.push('</Tab>');
    }
    
    // Examples tab if class has examples
    if (doc.tags.example && doc.tags.example.length > 0) {
        mdx.push('<Tab title="Examples">');
        mdx.push('\n### Class Examples\n');
        
        doc.tags.example.forEach((example, idx) => {
            if (example.caption) {
                mdx.push(`#### ${example.caption}\n`);
            }
            mdx.push('<CodeGroup>');
            mdx.push('```javascript');
            mdx.push(example.code.trim());
            mdx.push('```');
            mdx.push('</CodeGroup>\n');
        });
        
        mdx.push('</Tab>');
    }
    
    mdx.push('</Tabs>\n');
    
    return mdx.join('\n');
}

// Process a source file
async function processSourceFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const results = [];
    
    console.log(`Processing ${fileName}...`);
    
    // Extract all class definitions with their full content
    const classRegex = /(\/\*\*[\s\S]*?\*\/)\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)[\s\S]*?(?=\/\*\*|class\s+\w+|$)/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
        const [fullMatch, jsdoc, className] = match;
        console.log(`  Found class: ${className}`);
        results.push({
            type: 'class',
            name: className,
            mdx: generateClassMDX(className, jsdoc, fullMatch)
        });
    }
    
    // Extract standalone functions
    const functionRegex = /(\/\*\*[\s\S]*?\*\/)\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/g;
    while ((match = functionRegex.exec(content)) !== null) {
        const [, jsdoc, funcName] = match;
        const doc = parseJSDoc(jsdoc);
        
        let mdx = [`### \`${funcName}()\`\n`];
        
        if (doc.summary) {
            mdx.push(formatInlineTags(doc.summary) + '\n');
        }
        
        if (doc.tags.deprecated) {
            mdx.push(`<Warning>This function is deprecated. ${doc.tags.deprecated}</Warning>\n`);
        }
        
        // Add parameter documentation
        if (doc.tags.param && doc.tags.param.length > 0) {
            mdx.push('<Steps>');
            mdx.push('<Step title="Parameters">');
            doc.tags.param.forEach(param => {
                mdx.push(`<ParamField path="${param.name}" type="${param.type || 'any'}">`);
                mdx.push(formatInlineTags(param.description));
                mdx.push('</ParamField>');
            });
            mdx.push('</Step>');
            
            if (doc.tags.returns) {
                mdx.push('<Step title="Returns">');
                mdx.push(`<ResponseField type="${doc.tags.returns.type || 'any'}">`);
                mdx.push(formatInlineTags(doc.tags.returns.description));
                mdx.push('</ResponseField>');
                mdx.push('</Step>');
            }
            
            mdx.push('</Steps>\n');
        }
        
        results.push({
            type: 'function',
            name: funcName,
            mdx: mdx.join('\n')
        });
    }
    
    return results;
}

// Main function
async function generateDocs() {
    console.log('Starting documentation generation...\n');
    
    const allResults = [];
    
    // Process all source files
    for (const sourceDir of SOURCE_DIRS) {
        if (await fs.pathExists(sourceDir)) {
            const files = await fs.readdir(sourceDir);
            
            for (const file of files) {
                if (file.endsWith('.js') && !file.includes('.test.') && !file.includes('.spec.')) {
                    const filePath = path.join(sourceDir, file);
                    const results = await processSourceFile(filePath);
                    allResults.push(...results);
                }
            }
        }
    }
    
    // Group results by type
    const classes = allResults.filter(r => r.type === 'class');
    const functions = allResults.filter(r => r.type === 'function');
    
    // Generate final MDX
    let mdx = [];
    
    // Frontmatter
    mdx.push('---');
    mdx.push("title: 'Core API Reference'");
    mdx.push("description: 'Complete reference for the Multisynq client-side synchronized architecture, including Model, View, Session, Data, and more.'");
    mdx.push("icon: 'code'");
    mdx.push('---\n');
    
    // Header
    mdx.push('<Info>');
    mdx.push('This page is auto-generated from the source code JSDoc comments. It provides comprehensive documentation for all classes, methods, properties, and functions in the Multisynq client library.');
    mdx.push('</Info>\n');
    
    // Navigation
    mdx.push('<Card title="Quick Navigation" icon="compass">');
    mdx.push('Jump to a specific class or section:\n');
    classes.forEach(cls => {
        mdx.push(`- [${cls.name}](#${cls.name.toLowerCase()})`);
    });
    mdx.push('</Card>\n');
    
    // Main content with proper sections
    mdx.push('# Core Classes\n');
    mdx.push('<Steps>\n');
    
    // Add classes in logical order
    const classOrder = ['Model', 'View', 'Session', 'Data'];
    const orderedClasses = [];
    
    for (const name of classOrder) {
        const cls = classes.find(c => c.name === name);
        if (cls) {
            orderedClasses.push(cls);
        }
    }
    
    // Add any remaining classes
    classes.forEach(cls => {
        if (!orderedClasses.includes(cls)) {
            orderedClasses.push(cls);
        }
    });
    
    orderedClasses.forEach((cls, idx) => {
        mdx.push(`<Step title="${cls.name} Class">\n`);
        mdx.push(cls.mdx);
        mdx.push('\n</Step>\n');
    });
    
    mdx.push('</Steps>\n');
    
    // Add functions if any
    if (functions.length > 0) {
        mdx.push('# Utility Functions\n');
        functions.forEach(func => {
            mdx.push(func.mdx);
        });
    }
    
    // Footer
    mdx.push('\n---\n');
    mdx.push('<Note>');
    mdx.push(`Generated on ${new Date().toISOString()}`);
    mdx.push('</Note>');
    
    // Write the file
    await fs.ensureDir(path.dirname(OUTPUT_FILE));
    await fs.writeFile(OUTPUT_FILE, mdx.join('\n'));
    
    console.log(`\n✅ Documentation generated successfully at ${OUTPUT_FILE}`);
    
    // Summary
    console.log('\nSummary:');
    console.log(`  - Classes documented: ${classes.length}`);
    console.log(`  - Functions documented: ${functions.length}`);
    classes.forEach(cls => {
        console.log(`    • ${cls.name}`);
    });
}

// Run the generator
generateDocs().catch(console.error);
