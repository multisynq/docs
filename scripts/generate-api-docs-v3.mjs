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
        '../../multisynq-client/client/teatime/src/domain.js'
    ],
    typesFile: '../../multisynq-client/client/types.d.ts',
    outputDir: path.join(__dirname, '../api-reference'),
    mainOutputFile: 'index.mdx',
    splitFiles: true
};

// Comprehensive JSDoc parser
class JSDocParser {
    constructor() {
        this.content = '';
        this.position = 0;
    }

    parse(content) {
        this.content = content;
        this.position = 0;
        
        const results = {
            classes: [],
            functions: [],
            constants: []
        };

        // Find all JSDoc comments followed by declarations
        const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
        let match;
        
        while ((match = jsDocPattern.exec(content)) !== null) {
            const commentStart = match.index;
            const commentEnd = match.index + match[0].length;
            const comment = match[1];
            
            // Look ahead to see what follows this comment
            const afterComment = content.slice(commentEnd, commentEnd + 200);
            
            // Check for class
            const classMatch = afterComment.match(/^\s*(?:export\s+)?class\s+(\w+)/);
            if (classMatch) {
                const className = classMatch[1];
                const classData = this.parseClass(className, comment, commentEnd);
                if (classData) {
                    results.classes.push(classData);
                }
                continue;
            }
            
            // Check for function
            const funcMatch = afterComment.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
            if (funcMatch) {
                const funcName = funcMatch[1];
                const funcData = this.parseFunction(funcName, comment);
                if (funcData) {
                    results.functions.push(funcData);
                }
            }
        }
        
        return results;
    }

    parseClass(name, comment, startPos) {
        const parsed = this.parseJSDocComment(comment);
        const classObj = {
            name,
            ...parsed,
            methods: [],
            properties: [],
            staticMethods: [],
            staticProperties: [],
            constructor: null
        };

        // Find class body
        const classBodyStart = this.content.indexOf('{', startPos);
        if (classBodyStart === -1) return classObj;

        const classBodyEnd = this.findMatchingBrace(classBodyStart);
        if (classBodyEnd === -1) return classObj;

        const classBody = this.content.slice(classBodyStart + 1, classBodyEnd);
        
        // Extract all members
        this.extractClassMembers(classBody, classObj);
        
        return classObj;
    }

    parseFunction(name, comment) {
        const parsed = this.parseJSDocComment(comment);
        return {
            name,
            ...parsed
        };
    }

    parseJSDocComment(comment) {
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
            hideConstructor: false,
            namespace: null,
            memberOf: null
        };

        // Clean the comment
        const lines = comment.split('\n').map(line => 
            line.replace(/^\s*\*\s?/, '').trim()
        );

        let currentTag = null;
        let currentContent = [];
        let descriptionLines = [];
        let inDescription = true;

        for (const line of lines) {
            // Check if this line starts a tag
            const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/);
            
            if (tagMatch) {
                // Process previous tag content
                if (currentTag) {
                    this.processTag(result, currentTag, currentContent.join('\n'));
                } else if (inDescription) {
                    result.description = descriptionLines.join('\n').trim();
                    inDescription = false;
                }
                
                currentTag = tagMatch[1];
                currentContent = tagMatch[2] ? [tagMatch[2]] : [];
            } else {
                // Continue current tag or description
                if (currentTag) {
                    currentContent.push(line);
                } else if (inDescription) {
                    descriptionLines.push(line);
                }
            }
        }

        // Process final tag
        if (currentTag) {
            this.processTag(result, currentTag, currentContent.join('\n'));
        } else if (inDescription) {
            result.description = descriptionLines.join('\n').trim();
        }

        return result;
    }

    processTag(result, tag, content) {
        switch (tag) {
            case 'param':
            case 'parameter':
                this.parseParam(result, content);
                break;
            case 'returns':
            case 'return':
                result.returns = this.parseReturns(content);
                break;
            case 'example':
                this.parseExample(result, content);
                break;
            case 'tutorial':
                result.tutorials.push(content.trim());
                break;
            case 'since':
                result.since = content.trim();
                break;
            case 'deprecated':
                result.deprecated = content.trim() || true;
                break;
            case 'throws':
            case 'exception':
                result.throws.push(this.parseThrows(content));
                break;
            case 'see':
                result.see.push(content.trim());
                break;
            case 'fires':
            case 'emits':
                result.fires.push(content.trim());
                break;
            case 'listens':
                result.listens.push(content.trim());
                break;
            case 'todo':
                result.todos.push(content.trim());
                break;
            case 'public':
                result.visibility = 'public';
                break;
            case 'private':
                result.visibility = 'private';
                break;
            case 'protected':
                result.visibility = 'protected';
                break;
            case 'async':
                result.isAsync = true;
                break;
            case 'hideconstructor':
                result.hideConstructor = true;
                break;
            case 'namespace':
                result.namespace = content.trim();
                break;
            case 'memberof':
                result.memberOf = content.trim();
                break;
        }
    }

    parseParam(result, content) {
        // Match various param formats
        const patterns = [
            // {Type} name - description
            /^\{([^}]+)\}\s+(\S+)(?:\s*-\s*)?(.*)$/,
            // {Type} [name=default] - description
            /^\{([^}]+)\}\s+\[(\S+)(?:=([^\]]+))?\](?:\s*-\s*)?(.*)$/,
            // name {Type} description
            /^(\S+)\s+\{([^}]+)\}\s*(.*)$/,
            // name - description
            /^(\S+)(?:\s*-\s*)?(.*)$/
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                if (pattern === patterns[0]) {
                    // {Type} name - description
                    result.params.push({
                        name: match[2],
                        type: match[1],
                        description: match[3].trim(),
                        optional: false
                    });
                    return;
                } else if (pattern === patterns[1]) {
                    // {Type} [name=default] - description
                    result.params.push({
                        name: match[2],
                        type: match[1],
                        description: match[4]?.trim() || '',
                        optional: true,
                        default: match[3]
                    });
                    return;
                } else if (pattern === patterns[2]) {
                    // name {Type} description
                    result.params.push({
                        name: match[1],
                        type: match[2],
                        description: match[3].trim(),
                        optional: false
                    });
                    return;
                } else if (pattern === patterns[3]) {
                    // name - description
                    result.params.push({
                        name: match[1],
                        type: 'any',
                        description: match[2]?.trim() || '',
                        optional: match[1].includes('?') || match[1].includes('=')
                    });
                    return;
                }
            }
        }

        // Fallback
        result.params.push({
            name: content.split(/\s+/)[0],
            type: 'any',
            description: content,
            optional: false
        });
    }

    parseReturns(content) {
        const match = content.match(/^\{([^}]+)\}\s*(.*)$/);
        if (match) {
            return {
                type: match[1],
                description: match[2].trim()
            };
        }
        return {
            type: 'any',
            description: content.trim()
        };
    }

    parseThrows(content) {
        const match = content.match(/^\{([^}]+)\}\s*(.*)$/);
        if (match) {
            return {
                type: match[1],
                description: match[2].trim()
            };
        }
        return {
            type: 'Error',
            description: content.trim()
        };
    }

    parseExample(result, content) {
        // Check for caption
        const captionMatch = content.match(/^<caption>(.*?)<\/caption>\s*([\s\S]*)$/);
        if (captionMatch) {
            result.examples.push({
                caption: captionMatch[1],
                code: captionMatch[2].trim()
            });
        } else {
            result.examples.push({
                caption: '',
                code: content.trim()
            });
        }
    }

    extractClassMembers(classBody, classObj) {
        // More comprehensive member extraction
        const memberPattern = /\/\*\*([\s\S]*?)\*\/\s*((?:static\s+)?(?:async\s+)?(?:get\s+)?(?:set\s+)?(?:#)?)([\w$]+)(?:\s*[=:]\s*(?:function\s*)?\([^)]*\)|[^;{]*)?[;{]/g;
        
        let match;
        while ((match = memberPattern.exec(classBody)) !== null) {
            const [fullMatch, comment, modifiers, memberName] = match;
            
            // Skip if it's a method call or assignment inside another method
            if (this.isInsideMethod(classBody, match.index)) continue;
            
            const parsed = this.parseJSDocComment(comment);
            const isStatic = modifiers.includes('static');
            const isAsync = modifiers.includes('async');
            const isGetter = modifiers.includes('get');
            const isSetter = modifiers.includes('set');
            const isPrivate = modifiers.includes('#') || memberName.startsWith('_');
            
            // Determine if it's a method or property
            const isMethod = fullMatch.includes('(') && !fullMatch.match(/=\s*function/);
            
            if (memberName === 'constructor' || memberName === 'init') {
                classObj.constructor = {
                    name: memberName,
                    ...parsed,
                    isAsync
                };
            } else if (isMethod) {
                const method = {
                    name: memberName,
                    ...parsed,
                    isStatic,
                    isAsync,
                    isGetter,
                    isSetter,
                    isPrivate
                };
                
                if (isStatic) {
                    classObj.staticMethods.push(method);
                } else {
                    classObj.methods.push(method);
                }
            } else {
                const property = {
                    name: memberName,
                    ...parsed,
                    isStatic,
                    isGetter,
                    isSetter,
                    isPrivate
                };
                
                if (isStatic) {
                    classObj.staticProperties.push(property);
                } else {
                    classObj.properties.push(property);
                }
            }
        }
    }

    findMatchingBrace(startPos) {
        let depth = 1;
        let inString = false;
        let stringChar = null;
        let escaped = false;
        
        for (let i = startPos + 1; i < this.content.length; i++) {
            const char = this.content[i];
            
            if (escaped) {
                escaped = false;
                continue;
            }
            
            if (char === '\\') {
                escaped = true;
                continue;
            }
            
            if (inString) {
                if (char === stringChar) {
                    inString = false;
                }
                continue;
            }
            
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
                continue;
            }
            
            if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        
        return -1;
    }

    isInsideMethod(classBody, position) {
        // Simple heuristic: check if we're inside a method body
        let depth = 0;
        for (let i = 0; i < position && i < classBody.length; i++) {
            if (classBody[i] === '{') depth++;
            if (classBody[i] === '}') depth--;
        }
        return depth > 0;
    }
}

// MDX generation with rich Mintlify components
class MDXGenerator {
    generateClassFile(classData) {
        const sections = [];
        
        // Frontmatter
        sections.push(`---
title: '${classData.name}'
description: '${this.getDescription(classData.description)}'
---`);
        
        // Auto-generated note
        sections.push('', `<Note>
This page is auto-generated from the source code. Do not edit it directly.
The content is sourced from the JSDoc comments in the Multisynq source files.
</Note>`);
        
        // Main content
        sections.push('', this.generateClassContent(classData));
        
        return sections.join('\n');
    }

    generateClassContent(classData) {
        const sections = [];
        
        // Class header
        sections.push(`## ${classData.name}`);
        
        // Deprecated warning
        if (classData.deprecated) {
            const message = typeof classData.deprecated === 'string' 
                ? classData.deprecated 
                : 'This class is deprecated.';
            sections.push('', `<Warning>
**Deprecated:** ${message}
</Warning>`);
        }
        
        // Description
        if (classData.description) {
            sections.push('', this.formatDescription(classData.description));
        }
        
        // Since
        if (classData.since) {
            sections.push('', `<Info>
Available since version ${classData.since}
</Info>`);
        }
        
        // Constructor
        if (!classData.hideConstructor) {
            if (classData.constructor) {
                sections.push('', '### Constructor', '');
                sections.push(this.generateMethodContent(classData.constructor, true));
            }
        } else {
            sections.push('', `<Note>
This class should not be instantiated directly using \`new\`.
</Note>`);
        }
        
        // Static Properties
        if (classData.staticProperties && classData.staticProperties.length > 0) {
            sections.push('', '### Static Properties', '');
            sections.push(this.generatePropertiesAccordion(classData.staticProperties));
        }
        
        // Instance Properties
        if (classData.properties && classData.properties.length > 0) {
            sections.push('', '### Properties', '');
            sections.push(this.generatePropertiesAccordion(classData.properties));
        }
        
        // Static Methods
        if (classData.staticMethods && classData.staticMethods.length > 0) {
            sections.push('', '### Static Methods', '');
            sections.push(this.generateMethodsTabs(classData.staticMethods, classData.name));
        }
        
        // Instance Methods
        if (classData.methods && classData.methods.length > 0) {
            sections.push('', '### Methods', '');
            sections.push(this.generateMethodsTabs(classData.methods, classData.name));
        }
        
        // Examples section
        if (classData.examples && classData.examples.length > 0) {
            sections.push('', '### Examples', '');
            sections.push(this.generateExamples(classData.examples));
        }
        
        // Events
        if ((classData.fires && classData.fires.length > 0) || 
            (classData.listens && classData.listens.length > 0)) {
            sections.push('', '### Events', '');
            
            if (classData.fires.length > 0) {
                sections.push('', '<Card title="Fires" icon="broadcast">');
                sections.push(classData.fires.map(e => `- \`${e}\``).join('\n'));
                sections.push('</Card>');
            }
            
            if (classData.listens.length > 0) {
                sections.push('', '<Card title="Listens" icon="ear-listen">');
                sections.push(classData.listens.map(e => `- \`${e}\``).join('\n'));
                sections.push('</Card>');
            }
        }
        
        // Related
        if (classData.see && classData.see.length > 0) {
            sections.push('', '### See Also', '');
            sections.push(classData.see.map(item => `- ${this.formatSeeAlso(item)}`).join('\n'));
        }
        
        // Tutorials
        if (classData.tutorials && classData.tutorials.length > 0) {
            sections.push('', '### Related Tutorials', '');
            classData.tutorials.forEach(tutorial => {
                sections.push(`<Card title="Tutorial: ${tutorial}" icon="book-open" href="/tutorials/${tutorial}">
Learn more about ${classData.name} in this comprehensive tutorial.
</Card>`);
            });
        }
        
        return sections.join('\n');
    }

    generateMethodsTabs(methods, className) {
        const tabs = [];
        
        // Overview tab
        tabs.push({
            title: 'Overview',
            content: methods.map(m => 
                `- **${m.name}**: ${this.getDescription(m.description)}`
            ).join('\n')
        });
        
        // Individual method tabs
        methods.forEach(method => {
            tabs.push({
                title: method.name,
                content: this.generateMethodContent(method)
            });
        });
        
        return `<Tabs>
${tabs.map(tab => `  <Tab title="${tab.title}">
${tab.content.split('\n').map(line => '    ' + line).join('\n')}
  </Tab>`).join('\n')}
</Tabs>`;
    }

    generatePropertiesAccordion(properties) {
        const items = properties.map(prop => ({
            title: `${prop.name}${prop.isStatic ? ' (static)' : ''}`,
            content: this.generatePropertyContent(prop)
        }));
        
        return `<Accordion>
${items.map(item => `  <AccordionItem title="${item.title}">
${item.content.split('\n').map(line => '    ' + line).join('\n')}
  </AccordionItem>`).join('\n')}
</Accordion>`;
    }

    generateMethodContent(method, isConstructor = false) {
        const sections = [];
        
        // Method signature
        const modifiers = [];
        if (method.isStatic) modifiers.push('static');
        if (method.isAsync) modifiers.push('async');
        const signature = `${modifiers.join(' ')} ${method.name}(${this.getParamSignature(method.params)})`;
        
        sections.push(`#### ${signature.trim()}`);
        
        // Deprecated
        if (method.deprecated) {
            sections.push('', `<Warning>
**Deprecated:** ${method.deprecated}
</Warning>`);
        }
        
        // Description
        if (method.description) {
            sections.push('', this.formatDescription(method.description));
        }
        
        // Parameters
        if (method.params && method.params.length > 0) {
            sections.push('', '<RequestExample title="Parameters">');
            method.params.forEach(param => {
                sections.push(this.generateParamField(param));
                sections.push('');
            });
            sections.push('</RequestExample>');
        }
        
        // Returns
        if (method.returns && !isConstructor) {
            sections.push('', '<ResponseExample title="Returns">');
            sections.push(`<ResponseField name="return" type="${method.returns.type || 'any'}">
  ${method.returns.description || ''}
</ResponseField>`);
            sections.push('</ResponseExample>');
        }
        
        // Throws
        if (method.throws && method.throws.length > 0) {
            sections.push('', `<Warning>
**Throws:**

${method.throws.map(t => `**${t.type}**: ${t.description}`).join('\n\n')}
</Warning>`);
        }
        
        // Examples
        if (method.examples && method.examples.length > 0) {
            sections.push('', this.generateExamples(method.examples));
        }
        
        // Since
        if (method.since) {
            sections.push('', `<Info>
Available since version ${method.since}
</Info>`);
        }
        
        return sections.join('\n');
    }

    generatePropertyContent(prop) {
        const sections = [];
        
        sections.push(`**Type:** \`${prop.type || 'any'}\``);
        
        if (prop.description) {
            sections.push('', this.formatDescription(prop.description));
        }
        
        if (prop.deprecated) {
            sections.push('', `<Warning>
**Deprecated:** ${prop.deprecated}
</Warning>`);
        }
        
        if (prop.default) {
            sections.push('', `**Default:** \`${prop.default}\``);
        }
        
        if (prop.since) {
            sections.push('', `**Since:** v${prop.since}`);
        }
        
        return sections.join('\n');
    }

    generateParamField(param) {
        const required = param.optional ? 'false' : 'true';
        const typeStr = param.type ? ` type="${this.escapeHtml(param.type)}"` : '';
        const defaultStr = param.default ? ` default="${this.escapeHtml(param.default)}"` : '';
        
        return `<ParamField path="${param.name}"${typeStr} required={${required}}${defaultStr}>
  ${param.description || ''}
</ParamField>`;
    }

    generateExamples(examples) {
        if (examples.length === 1 && !examples[0].caption) {
            return `\`\`\`javascript
${examples[0].code}
\`\`\``;
        }
        
        return `<CodeGroup>
${examples.map((ex, i) => {
    const title = ex.caption || `Example ${i + 1}`;
    return `\`\`\`javascript ${title}
${ex.code}
\`\`\``;
}).join('\n\n')}
</CodeGroup>`;
    }

    generateIndexFile(allDocs) {
        const sections = [];
        
        // Frontmatter
        sections.push(`---
title: 'Core API Reference'
description: 'Complete reference for the Multisynq client-side synchronized architecture'
---`);
        
        // Note
        sections.push('', `<Note>
This documentation is auto-generated from the source code.
The content is sourced from JSDoc comments in the Multisynq source files.
</Note>`);
        
        // Introduction
        sections.push('', `# Multisynq Core API

Welcome to the comprehensive API reference for Multisynq. This documentation covers all core classes, methods, properties, and events available in the Multisynq client library.`);
        
        // Quick Navigation
        sections.push('', '## Quick Navigation', '');
        
        const cards = allDocs.classes.map(c => 
            `<Card title="${c.name}" icon="code" href="/api-reference/${c.name.toLowerCase()}">
  ${this.getDescription(c.description)}
</Card>`
        );
        
        sections.push(cards.join('\n\n'));
        
        // Architecture
        sections.push('', '## Architecture Overview', '');
        sections.push(`<Steps>
  <Step title="Model Layer">
    Synchronized objects that maintain state across all connected clients. Models handle the core business logic and state management.
  </Step>
  <Step title="View Layer">
    Local, non-synchronized components that handle UI rendering and user interactions. Views subscribe to model events and publish user actions.
  </Step>
  <Step title="Session Management">
    Handles connection, synchronization, and encryption. Sessions manage the lifecycle of a Multisynq application instance.
  </Step>
  <Step title="Data Storage">
    Secure bulk data storage with encryption. The Data API handles file uploads, downloads, and caching.
  </Step>
</Steps>`);
        
        // Common Patterns
        sections.push('', '## Common Patterns', '');
        sections.push(this.generatePatternsTabs());
        
        return sections.join('\n');
    }

    generatePatternsTabs() {
        return `<Tabs>
  <Tab title="Creating Models">
    Never use \`new\` to create models. Always use the static \`create()\` method:
    
    \`\`\`javascript
    // ❌ Wrong
    const model = new MyModel();
    
    // ✅ Correct
    const model = MyModel.create({ 
        property: 'value' 
    });
    \`\`\`
  </Tab>
  <Tab title="Event System">
    Multisynq uses a powerful publish/subscribe system for communication:
    
    \`\`\`javascript
    // In View - publish user actions
    this.publish('user', 'click', { x: 100, y: 200 });
    
    // In Model - subscribe to user actions
    this.subscribe('user', 'click', (data) => {
        this.handleClick(data.x, data.y);
    });
    
    // Model publishes state changes
    this.publish(this.id, 'position-changed', this.position);
    
    // View subscribes to model changes
    this.subscribe(model.id, 'position-changed', (pos) => {
        this.updateDisplay(pos);
    });
    \`\`\`
  </Tab>
  <Tab title="Session Lifecycle">
    Join and manage sessions with proper configuration:
    
    \`\`\`javascript
    const session = await Multisynq.Session.join({
        apiKey: 'your-api-key',
        appId: 'com.example.app',
        name: Multisynq.App.autoSession(),
        password: Multisynq.App.autoPassword(),
        model: RootModel,
        view: RootView,
        tps: 20,
        options: { /* model options */ },
        debug: ['session', 'messages']
    });
    
    // Manual stepping (e.g., for WebXR)
    function animate(time) {
        session.step(time);
        // ... render ...
        requestAnimationFrame(animate);
    }
    \`\`\`
  </Tab>
  <Tab title="Data Storage">
    Store and retrieve encrypted bulk data:
    
    \`\`\`javascript
    // In View - store data
    const file = await fetch('asset.glb');
    const buffer = await file.arrayBuffer();
    const handle = await this.session.data.store(buffer, {
        shareable: true // allows sharing outside session
    });
    
    // Publish handle to model
    this.publish('assets', 'uploaded', handle);
    
    // In another View - fetch data
    this.subscribe('assets', 'uploaded', async (handle) => {
        const data = await this.session.data.fetch(handle);
        // Use the data...
    });
    \`\`\`
  </Tab>
</Tabs>`;
    }

    formatDescription(description) {
        if (!description) return '';
        
        let formatted = description;
        
        // Handle {@link} tags
        formatted = formatted.replace(/\{@link\s+([^}]+)\}/g, (match, content) => {
            const parts = content.split(/\s+/);
            const target = parts[0];
            const text = parts.slice(1).join(' ') || target;
            
            if (target.startsWith('http')) {
                return `[${text}](${target})`;
            }
            
            // Handle internal links
            const anchor = target.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
            return `[${text}](#${anchor})`;
        });
        
        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '`$1`');
        
        // Handle multi-line formatting
        const paragraphs = formatted.split(/\n\n+/);
        return paragraphs.map(p => p.trim()).filter(p => p).join('\n\n');
    }

    getDescription(description) {
        if (!description) return '';
        
        // Clean up for summaries
        let cleaned = description.replace(/\{@link\s+([^}]+)\}/g, (match, content) => {
            const parts = content.split(/\s+/);
            return parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
        });
        
        // Get first sentence
        const match = cleaned.match(/^[^.!?]+[.!?]/);
        if (match) return match[0];
        
        // Or first 100 chars
        return cleaned.length > 100 ? cleaned.substring(0, 97) + '...' : cleaned;
    }

    getParamSignature(params) {
        if (!params || params.length === 0) return '';
        return params.map(p => p.name).join(', ');
    }

    formatSeeAlso(see) {
        if (see.startsWith('http')) {
            return `[${see}](${see})`;
        }
        return see;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// Main execution
async function generateDocs() {
    console.log('🚀 Starting comprehensive documentation generation v3...');
    
    const parser = new JSDocParser();
    const generator = new MDXGenerator();
    
    // Ensure output directory
    await fs.ensureDir(CONFIG.outputDir);
    
    // Collect all documentation
    const allDocs = {
        classes: [],
        functions: [],
        constants: []
    };
    
    // Process source files
    for (const sourceFile of CONFIG.sourceFiles) {
        const filePath = path.join(__dirname, sourceFile);
        
        if (await fs.pathExists(filePath)) {
            console.log(`📄 Processing ${path.basename(filePath)}...`);
            
            const content = await fs.readFile(filePath, 'utf-8');
            const docs = parser.parse(content);
            
            allDocs.classes.push(...docs.classes);
            allDocs.functions.push(...docs.functions);
            allDocs.constants.push(...docs.constants);
        } else {
            console.warn(`⚠️  File not found: ${filePath}`);
        }
    }
    
    console.log(`📊 Extracted: ${allDocs.classes.length} classes`);
    
    // Generate files
    if (CONFIG.splitFiles) {
        // Individual class files
        for (const classData of allDocs.classes) {
            const fileName = `${classData.name.toLowerCase()}.mdx`;
            const content = generator.generateClassFile(classData);
            
            await fs.writeFile(
                path.join(CONFIG.outputDir, fileName),
                content
            );
            
            console.log(`✅ Generated ${fileName}`);
        }
    }
    
    // Generate index
    const indexContent = generator.generateIndexFile(allDocs);
    await fs.writeFile(
        path.join(CONFIG.outputDir, CONFIG.mainOutputFile),
        indexContent
    );
    
    console.log('✅ Documentation generation complete!');
    console.log(`📁 Output: ${CONFIG.outputDir}`);
}

// Run
generateDocs().catch(console.error); 