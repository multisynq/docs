#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    sourceFiles: [
        '../../multisynq-client/client/teatime/src/model.js',
        '../../multisynq-client/client/teatime/src/view.js',
        '../../multisynq-client/client/teatime/src/data.js',
        '../../multisynq-client/client/teatime/src/session.js',
        '../../multisynq-client/client/teatime/src/controller.js',
        '../../multisynq-client/client/teatime/src/domain.js',
        '../../multisynq-client/client/teatime/src/html.js',
        '../../multisynq-client/client/teatime/src/vm.js'
    ],
    typesFile: '../../multisynq-client/client/types.d.ts',
    outputDir: path.join(__dirname, '../api-reference'),
    mainOutputFile: 'index.mdx',
    splitFiles: true // Generate separate files for each class
};

// JSDoc tag patterns
const JSDOC_PATTERNS = {
    classComment: /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?(?:class|function)\s+(\w+)/g,
    methodComment: /\/\*\*([\s\S]*?)\*\/\s*(?:static\s+)?(?:async\s+)?(\w+)\s*\(/g,
    propertyComment: /\/\*\*([\s\S]*?)\*\/\s*(?:get\s+)?(\w+)\s*(?:=|;|\{)/g,
    
    // Tag extraction patterns
    param: /@param\s+(?:\{([^}]+)\})?\s*(\S+)(?:\s*-\s*)?(.*)$/gm,
    returns: /@returns?\s+(?:\{([^}]+)\})?\s*(.*)$/m,
    example: /@example(?:\s*<caption>(.*?)<\/caption>)?\s*([\s\S]*?)(?=@\w+|$)/gm,
    tutorial: /@tutorial\s+(\S+)/g,
    link: /\{@link\s+([^}]+)\}/g,
    since: /@since\s+(.+)$/m,
    deprecated: /@deprecated\s+(.*)$/m,
    throws: /@throws\s+(?:\{([^}]+)\})?\s*(.*)$/gm,
    see: /@see\s+(.+)$/gm,
    fires: /@fires\s+(.+)$/gm,
    listens: /@listens\s+(.+)$/gm,
    todo: /@todo\s+(.+)$/gm,
    public: /@public/,
    private: /@private/,
    protected: /@protected/,
    hideconstructor: /@hideconstructor/,
    namespace: /@namespace\s+(\S+)/,
    memberof: /@memberof\s+(\S+)/,
    async: /@async/
};

// Mintlify component generators
const MintlifyComponents = {
    tabs: (items) => {
        if (!items || items.length === 0) return '';
        return `<Tabs>
${items.map(item => `  <Tab title="${item.title}">
${item.content.split('\n').map(line => '    ' + line).join('\n')}
  </Tab>`).join('\n')}
</Tabs>`;
    },

    codeGroup: (examples) => {
        if (!examples || examples.length === 0) return '';
        return `<CodeGroup>
${examples.map(ex => `\`\`\`${ex.language || 'javascript'} ${ex.title || ''}
${ex.code}
\`\`\``).join('\n\n')}
</CodeGroup>`;
    },

    warning: (content) => `<Warning>${content}</Warning>`,
    
    info: (content) => `<Info>${content}</Info>`,
    
    note: (content) => `<Note>${content}</Note>`,
    
    accordion: (items) => {
        if (!items || items.length === 0) return '';
        return `<Accordion>
${items.map(item => `  <AccordionItem title="${item.title}">
${item.content.split('\n').map(line => '    ' + line).join('\n')}
  </AccordionItem>`).join('\n')}
</Accordion>`;
    },

    steps: (items) => {
        if (!items || items.length === 0) return '';
        return `<Steps>
${items.map((item, i) => `  <Step title="${item.title || `Step ${i + 1}`}">
${item.content.split('\n').map(line => '    ' + line).join('\n')}
  </Step>`).join('\n')}
</Steps>`;
    },

    paramField: (param) => {
        const required = param.optional ? 'false' : 'true';
        const typeStr = param.type ? ` type="${param.type}"` : '';
        const defaultStr = param.default ? ` default="${param.default}"` : '';
        
        return `<ParamField path="${param.name}"${typeStr} required={${required}}${defaultStr}>
  ${param.description || ''}
</ParamField>`;
    },

    responseField: (field) => {
        const typeStr = field.type ? ` type="${field.type}"` : '';
        return `<ResponseField name="${field.name}"${typeStr}>
  ${field.description || ''}
</ResponseField>`;
    },

    requestExample: (title, content) => `<RequestExample title="${title}">
${content}
</RequestExample>`,

    responseExample: (title, content) => `<ResponseExample title="${title}">
${content}
</ResponseExample>`,

    card: (title, description, icon, href) => {
        const iconStr = icon ? ` icon="${icon}"` : '';
        const hrefStr = href ? ` href="${href}"` : '';
        return `<Card title="${title}"${iconStr}${hrefStr}>
  ${description}
</Card>`;
    },

    frame: (content, caption) => `<Frame${caption ? ` caption="${caption}"` : ''}>
${content}
</Frame>`
};

// Parse JSDoc comment block
function parseJSDocComment(comment) {
    const result = {
        description: '',
        params: [],
        returns: null,
        examples: [],
        tutorials: [],
        since: null,
        deprecated: null,
        throws: [],
        see: [],
        fires: [],
        listens: [],
        todos: [],
        visibility: 'public',
        isAsync: false,
        isStatic: false,
        hideConstructor: false,
        namespace: null,
        memberOf: null,
        tags: {}
    };

    // Clean comment
    const cleaned = comment
        .replace(/^\/\*\*\s*/, '')
        .replace(/\s*\*\/$/, '')
        .replace(/^\s*\*\s?/gm, '');

    // Extract description (everything before first @tag)
    const descMatch = cleaned.match(/^([\s\S]*?)(?=^\s*@|$)/m);
    if (descMatch) {
        result.description = descMatch[1].trim();
    }

    // Parse @param tags
    let paramMatch;
    while ((paramMatch = JSDOC_PATTERNS.param.exec(cleaned)) !== null) {
        const [, type, name, description] = paramMatch;
        const isOptional = name.includes('?') || name.includes('=');
        const cleanName = name.replace(/[?=]/g, '').replace(/^\[|\]$/g, '');
        
        result.params.push({
            name: cleanName,
            type: type || 'any',
            description: description.trim(),
            optional: isOptional,
            default: name.includes('=') ? name.split('=')[1]?.replace(']', '') : null
        });
    }

    // Parse @returns
    const returnsMatch = JSDOC_PATTERNS.returns.exec(cleaned);
    if (returnsMatch) {
        result.returns = {
            type: returnsMatch[1] || 'any',
            description: returnsMatch[2].trim()
        };
    }

    // Parse @example tags
    let exampleMatch;
    JSDOC_PATTERNS.example.lastIndex = 0;
    while ((exampleMatch = JSDOC_PATTERNS.example.exec(cleaned)) !== null) {
        result.examples.push({
            caption: exampleMatch[1] || '',
            code: exampleMatch[2].trim()
        });
    }

    // Parse other tags
    let match;
    
    // @tutorial
    while ((match = JSDOC_PATTERNS.tutorial.exec(cleaned)) !== null) {
        result.tutorials.push(match[1]);
    }

    // @since
    if ((match = JSDOC_PATTERNS.since.exec(cleaned))) {
        result.since = match[1].trim();
    }

    // @deprecated
    if ((match = JSDOC_PATTERNS.deprecated.exec(cleaned))) {
        result.deprecated = match[1].trim();
    }

    // @throws
    while ((match = JSDOC_PATTERNS.throws.exec(cleaned)) !== null) {
        result.throws.push({
            type: match[1] || 'Error',
            description: match[2].trim()
        });
    }

    // @see
    while ((match = JSDOC_PATTERNS.see.exec(cleaned)) !== null) {
        result.see.push(match[1].trim());
    }

    // @fires
    while ((match = JSDOC_PATTERNS.fires.exec(cleaned)) !== null) {
        result.fires.push(match[1].trim());
    }

    // @listens
    while ((match = JSDOC_PATTERNS.listens.exec(cleaned)) !== null) {
        result.listens.push(match[1].trim());
    }

    // @todo
    while ((match = JSDOC_PATTERNS.todo.exec(cleaned)) !== null) {
        result.todos.push(match[1].trim());
    }

    // Visibility
    if (JSDOC_PATTERNS.private.test(cleaned)) result.visibility = 'private';
    else if (JSDOC_PATTERNS.protected.test(cleaned)) result.visibility = 'protected';

    // Other flags
    result.isAsync = JSDOC_PATTERNS.async.test(cleaned);
    result.hideConstructor = JSDOC_PATTERNS.hideconstructor.test(cleaned);

    // @namespace
    if ((match = JSDOC_PATTERNS.namespace.exec(cleaned))) {
        result.namespace = match[1];
    }

    // @memberof
    if ((match = JSDOC_PATTERNS.memberof.exec(cleaned))) {
        result.memberOf = match[1];
    }

    return result;
}

// Extract all JSDoc comments from a file
function extractJSDocFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const results = {
        classes: [],
        functions: [],
        constants: []
    };

    // Extract class comments
    let match;
    JSDOC_PATTERNS.classComment.lastIndex = 0;
    while ((match = JSDOC_PATTERNS.classComment.exec(content)) !== null) {
        const [fullMatch, commentContent, className] = match;
        if (commentContent) {
            const parsed = parseJSDocComment('/**' + commentContent + '*/');
            const classObj = {
                name: className,
                ...parsed,
                methods: [],
                properties: [],
                constructor: null
            };

            // Find class body
            const classStart = match.index + fullMatch.length;
            const classBodyMatch = findClassBody(content, classStart);
            
            if (classBodyMatch) {
                // Extract methods and properties from class body
                extractClassMembers(classBodyMatch, classObj);
            }

            results.classes.push(classObj);
        }
    }

    return results;
}

// Find the body of a class
function findClassBody(content, startIndex) {
    let braceCount = 0;
    let inBody = false;
    let bodyStart = -1;
    let bodyEnd = -1;

    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') {
            if (!inBody) {
                inBody = true;
                bodyStart = i + 1;
            }
            braceCount++;
        } else if (content[i] === '}') {
            braceCount--;
            if (braceCount === 0 && inBody) {
                bodyEnd = i;
                break;
            }
        }
    }

    if (bodyStart !== -1 && bodyEnd !== -1) {
        return content.substring(bodyStart, bodyEnd);
    }
    return null;
}

// Extract methods and properties from class body
function extractClassMembers(classBody, classObj) {
    // Extract methods - improved regex to handle multi-line signatures
    const methodRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:(static)\s+)?(?:(async)\s+)?(\w+)\s*\([^)]*\)(?:\s*\{|[^{]*\{)/g;
    let match;
    
    while ((match = methodRegex.exec(classBody)) !== null) {
        const [, comment, isStatic, isAsync, methodName] = match;
        const parsed = parseJSDocComment('/**' + comment + '*/');
        
        const method = {
            name: methodName,
            ...parsed,
            isStatic: !!isStatic,
            isAsync: !!isAsync || parsed.isAsync
        };

        if (methodName === 'constructor' || methodName === 'init') {
            classObj.constructor = method;
        } else {
            classObj.methods.push(method);
        }
    }

    // Extract properties
    const propRegex = /\/\*\*([\s\S]*?)\*\/\s*(?:(static)\s+)?(?:(get)\s+)?(\w+)(?:\s*[:=]|\s*\{)/g;
    
    while ((match = propRegex.exec(classBody)) !== null) {
        const [, comment, isStatic, isGetter, propName] = match;
        const parsed = parseJSDocComment('/**' + comment + '*/');
        
        classObj.properties.push({
            name: propName,
            ...parsed,
            isStatic: !!isStatic,
            isGetter: !!isGetter
        });
    }
}

// Generate MDX for a class
function generateClassMDX(classData) {
    const sections = [];
    
    // Header
    sections.push(`## ${classData.name}`);
    
    // Deprecated warning
    if (classData.deprecated) {
        sections.push('', MintlifyComponents.warning(`**Deprecated:** ${classData.deprecated}`));
    }
    
    // Description
    if (classData.description) {
        sections.push('', formatDescription(classData.description));
    }
    
    // Since
    if (classData.since) {
        sections.push('', MintlifyComponents.info(`Available since version ${classData.since}`));
    }
    
    // Constructor
    if (classData.constructor && !classData.hideConstructor) {
        sections.push('', '### Constructor', '');
        sections.push(generateMethodMDX(classData.constructor, true));
    } else if (classData.hideConstructor) {
        sections.push('', MintlifyComponents.note('This class should not be instantiated directly using `new`.'));
    }
    
    // Properties
    if (classData.properties.length > 0) {
        sections.push('', '### Properties', '');
        
        const propAccordion = classData.properties.map(prop => ({
            title: `${prop.name}${prop.isStatic ? ' (static)' : ''}`,
            content: generatePropertyMDX(prop)
        }));
        
        sections.push(MintlifyComponents.accordion(propAccordion));
    }
    
    // Methods
    if (classData.methods.length > 0) {
        sections.push('', '### Methods', '');
        
        // Group methods by category
        const publicMethods = classData.methods.filter(m => m.visibility === 'public');
        const protectedMethods = classData.methods.filter(m => m.visibility === 'protected');
        const privateMethods = classData.methods.filter(m => m.visibility === 'private');
        
        if (publicMethods.length > 0) {
            const tabs = [];
            
            // Overview tab
            tabs.push({
                title: 'Overview',
                content: publicMethods.map(m => `- **${m.name}**: ${getFirstSentence(m.description)}`).join('\n')
            });
            
            // Individual method tabs
            publicMethods.forEach(method => {
                tabs.push({
                    title: method.name,
                    content: generateMethodMDX(method)
                });
            });
            
            sections.push(MintlifyComponents.tabs(tabs));
        }
        
        if (protectedMethods.length > 0) {
            sections.push('', '#### Protected Methods', '');
            protectedMethods.forEach(method => {
                sections.push(generateMethodMDX(method));
            });
        }
    }
    
    // Examples
    if (classData.examples.length > 0) {
        sections.push('', '### Examples', '');
        
        const codeExamples = classData.examples.map((ex, i) => ({
            title: ex.caption || `Example ${i + 1}`,
            code: ex.code,
            language: 'javascript'
        }));
        
        sections.push(MintlifyComponents.codeGroup(codeExamples));
    }
    
    // Tutorials
    if (classData.tutorials.length > 0) {
        sections.push('', '### Related Tutorials', '');
        
        const tutorialCards = classData.tutorials.map(tutorial => 
            MintlifyComponents.card(
                `Tutorial: ${tutorial}`,
                `Learn more about ${classData.name} in this tutorial.`,
                'book-open',
                `/tutorials/${tutorial}`
            )
        );
        
        sections.push(tutorialCards.join('\n\n'));
    }
    
    // Events
    if (classData.fires.length > 0 || classData.listens.length > 0) {
        sections.push('', '### Events', '');
        
        if (classData.fires.length > 0) {
            sections.push('', '#### Fires', '');
            sections.push(classData.fires.map(e => `- \`${e}\``).join('\n'));
        }
        
        if (classData.listens.length > 0) {
            sections.push('', '#### Listens', '');
            sections.push(classData.listens.map(e => `- \`${e}\``).join('\n'));
        }
    }
    
    // See Also
    if (classData.see.length > 0) {
        sections.push('', '### See Also', '');
        sections.push(classData.see.map(s => `- ${formatSeeAlso(s)}`).join('\n'));
    }
    
    // TODOs (only in development mode)
    if (classData.todos.length > 0 && process.env.NODE_ENV === 'development') {
        sections.push('', MintlifyComponents.warning('**Development TODOs:**\n' + classData.todos.map(t => `- ${t}`).join('\n')));
    }
    
    return sections.join('\n');
}

// Generate MDX for a method
function generateMethodMDX(method, isConstructor = false) {
    const sections = [];
    
    // Method signature
    const signature = `${method.isStatic ? 'static ' : ''}${method.isAsync ? 'async ' : ''}${method.name}(${method.params.map(p => p.name).join(', ')})`;
    sections.push(`#### ${signature}`);
    
    // Deprecated
    if (method.deprecated) {
        sections.push('', MintlifyComponents.warning(`**Deprecated:** ${method.deprecated}`));
    }
    
    // Description
    if (method.description) {
        sections.push('', formatDescription(method.description));
    }
    
    // Parameters
    if (method.params.length > 0) {
        sections.push('', MintlifyComponents.requestExample(
            'Parameters',
            method.params.map(p => MintlifyComponents.paramField(p)).join('\n\n')
        ));
    }
    
    // Returns
    if (method.returns && !isConstructor) {
        sections.push('', MintlifyComponents.responseExample(
            'Returns',
            MintlifyComponents.responseField({
                name: 'return',
                type: method.returns.type,
                description: method.returns.description
            })
        ));
    }
    
    // Throws
    if (method.throws.length > 0) {
        const throwsContent = method.throws.map(t => 
            `**${t.type}**: ${t.description}`
        ).join('\n\n');
        
        sections.push('', MintlifyComponents.warning(`**Throws:**\n\n${throwsContent}`));
    }
    
    // Examples
    if (method.examples.length > 0) {
        const examples = method.examples.map((ex, i) => ({
            title: ex.caption || `Example ${i + 1}`,
            code: ex.code,
            language: 'javascript'
        }));
        
        sections.push('', MintlifyComponents.codeGroup(examples));
    }
    
    // Since
    if (method.since) {
        sections.push('', MintlifyComponents.info(`Available since version ${method.since}`));
    }
    
    return sections.join('\n');
}

// Generate MDX for a property
function generatePropertyMDX(prop) {
    const sections = [];
    
    // Type
    sections.push(`**Type:** \`${prop.type || 'any'}\``);
    
    // Description
    if (prop.description) {
        sections.push('', formatDescription(prop.description));
    }
    
    // Deprecated
    if (prop.deprecated) {
        sections.push('', MintlifyComponents.warning(`**Deprecated:** ${prop.deprecated}`));
    }
    
    // Default value
    if (prop.default) {
        sections.push('', `**Default:** \`${prop.default}\``);
    }
    
    // Since
    if (prop.since) {
        sections.push('', `**Since:** v${prop.since}`);
    }
    
    return sections.join('\n');
}

// Format description with proper link handling
function formatDescription(description) {
    let formatted = description;
    
    // Handle {@link} tags
    formatted = formatted.replace(JSDOC_PATTERNS.link, (match, target) => {
        const parts = target.split(/\s+/);
        const ref = parts[0];
        const text = parts.slice(1).join(' ') || ref;
        
        // External link
        if (ref.startsWith('http')) {
            return `[${text}](${ref})`;
        }
        
        // Internal link
        const anchor = ref.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        return `[${text}](#${anchor})`;
    });
    
    // Format code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return '```' + (lang || 'javascript') + '\n' + code.trim() + '\n```';
    });
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '`$1`');
    
    // Ensure proper paragraph spacing
    formatted = formatted.split('\n\n').map(p => p.trim()).filter(p => p).join('\n\n');
    
    return formatted;
}

// Get first sentence of description
function getFirstSentence(description) {
    if (!description) return '';
    // Remove {@link} tags for summary
    const cleaned = description.replace(/\{@link\s+[^}]+\}/g, (match) => {
        const parts = match.match(/\{@link\s+([^}\s]+)(?:\s+([^}]+))?\}/);
        return parts && parts[2] ? parts[2] : parts[1];
    });
    const match = cleaned.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : cleaned.slice(0, 100) + '...';
}

// Format see also links
function formatSeeAlso(see) {
    if (see.startsWith('http')) {
        return `[${see}](${see})`;
    }
    if (see.includes('#')) {
        const [text, anchor] = see.split('#');
        return `[${text}](#${anchor})`;
    }
    return see;
}

// Main generation function
async function generateAPIDocs() {
    console.log('🚀 Starting comprehensive API documentation generation...');
    
    // Ensure output directory exists
    await fs.ensureDir(CONFIG.outputDir);
    
    // Process all source files
    const allDocs = {
        classes: [],
        functions: [],
        constants: []
    };
    
    for (const sourceFile of CONFIG.sourceFiles) {
        const filePath = path.join(__dirname, sourceFile);
        
        if (await fs.pathExists(filePath)) {
            console.log(`📄 Processing ${path.basename(filePath)}...`);
            const docs = extractJSDocFromFile(filePath);
            
            // Merge results
            allDocs.classes.push(...docs.classes);
            allDocs.functions.push(...docs.functions);
            allDocs.constants.push(...docs.constants);
        } else {
            console.warn(`⚠️  File not found: ${filePath}`);
        }
    }
    
    console.log(`📊 Extracted: ${allDocs.classes.length} classes`);
    
    // Generate MDX files
    if (CONFIG.splitFiles) {
        // Generate separate files for each class
        for (const classData of allDocs.classes) {
            const fileName = `${classData.name.toLowerCase()}.mdx`;
            const filePath = path.join(CONFIG.outputDir, fileName);
            
            const content = generateClassFileMDX(classData);
            await fs.writeFile(filePath, content);
            console.log(`✅ Generated ${fileName}`);
        }
    }
    
    // Generate main index file
    const indexContent = generateIndexMDX(allDocs);
    await fs.writeFile(path.join(CONFIG.outputDir, CONFIG.mainOutputFile), indexContent);
    
    console.log(`✅ Documentation generation complete!`);
    console.log(`📁 Output directory: ${CONFIG.outputDir}`);
}

// Generate MDX for individual class file
function generateClassFileMDX(classData) {
    const sections = [];
    
    // Frontmatter
    sections.push(`---
title: '${classData.name}'
description: '${getFirstSentence(classData.description)}'
---`);
    
    // Auto-generated note
    sections.push('', MintlifyComponents.note(
        'This page is auto-generated from the source code. Do not edit it directly. ' +
        `The content is sourced from the JSDoc comments in the Multisynq source files.`
    ));
    
    // Class content
    sections.push('', generateClassMDX(classData));
    
    return sections.join('\n');
}

// Generate main index MDX
function generateIndexMDX(allDocs) {
    const sections = [];
    
    // Frontmatter
    sections.push(`---
title: 'Core API Reference'
description: 'Complete reference for the Multisynq client-side synchronized architecture, including Model, View, Session, Data, and more.'
---`);
    
    // Auto-generated note
    sections.push('', MintlifyComponents.note(
        'This page is auto-generated from the source code. Do not edit it directly. ' +
        'The content is sourced from the JSDoc comments in the Multisynq source files.'
    ));
    
    // Introduction
    sections.push('', `# Multisynq Core API

Welcome to the comprehensive API reference for Multisynq. This documentation covers all core classes, methods, properties, and events available in the Multisynq client library.`);
    
    // Quick navigation
    const navCards = allDocs.classes.map(c => 
        MintlifyComponents.card(
            c.name,
            getFirstSentence(c.description),
            'code',
            CONFIG.splitFiles ? `/api-reference/${c.name.toLowerCase()}` : `#${c.name.toLowerCase()}`
        )
    );
    
    sections.push('', '## Quick Navigation', '');
    sections.push(navCards.join('\n\n'));
    
    // If not splitting files, include all content
    if (!CONFIG.splitFiles) {
        sections.push('', '---', '');
        
        // Add all classes
        for (const classData of allDocs.classes) {
            sections.push(generateClassMDX(classData));
            sections.push('', '---', '');
        }
    }
    
    // Architecture overview
    sections.push('', '## Architecture Overview', '');
    
    const architectureSteps = [
        {
            title: 'Model Layer',
            content: 'Synchronized objects that maintain state across all connected clients. Models handle the core business logic and state management.'
        },
        {
            title: 'View Layer',
            content: 'Local, non-synchronized components that handle UI rendering and user interactions. Views subscribe to model events and publish user actions.'
        },
        {
            title: 'Session Management',
            content: 'Handles connection, synchronization, and encryption. Sessions manage the lifecycle of a Multisynq application instance.'
        },
        {
            title: 'Data Storage',
            content: 'Secure bulk data storage with encryption. The Data API handles file uploads, downloads, and caching.'
        }
    ];
    
    sections.push(MintlifyComponents.steps(architectureSteps));
    
    // Common patterns
    sections.push('', '## Common Patterns', '');
    
    const patternTabs = [
        {
            title: 'Creating Models',
            content: `Never use \`new\` to create models. Always use the static \`create()\` method:

\`\`\`javascript
// ❌ Wrong
const model = new MyModel();

// ✅ Correct
const model = MyModel.create({ 
    property: 'value' 
});
\`\`\``
        },
        {
            title: 'Event Handling',
            content: `Subscribe to events in views and publish from user interactions:

\`\`\`javascript
// In View
this.subscribe('model-event', this.handleEvent);

// Publish from View
this.publish('user-action', data);

// In Model
this.subscribe('user-action', this.handleAction);
this.publish('model-event', result);
\`\`\``
        },
        {
            title: 'Session Lifecycle',
            content: `Join sessions with proper configuration:

\`\`\`javascript
const session = await Multisynq.Session.join({
    apiKey: 'your-api-key',
    appId: 'com.example.app',
    name: Multisynq.App.autoSession(),
    password: Multisynq.App.autoPassword(),
    model: RootModel,
    view: RootView
});
\`\`\``
        }
    ];
    
    sections.push(MintlifyComponents.tabs(patternTabs));
    
    return sections.join('\n');
}

// Run the generator
generateAPIDocs().catch(console.error); 