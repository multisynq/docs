import { Application } from 'typedoc';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(DOCS_DIR, 'api-reference-temp');
const FINAL_OUTPUT_FILE = path.join(DOCS_DIR, 'api-reference', 'index.mdx');

async function generateDocs() {
    const app = await Application.bootstrapWithPlugins({
        options: path.join(DOCS_DIR, 'typedoc.json'),
    });

    const project = await app.convert();

    if (project) {
        await app.generateJson(project, path.join(DOCS_DIR, 'api-reference-temp', 'output.json'));
        console.log(`✅ TypeDoc JSON generated at ${path.join(OUTPUT_DIR, 'output.json')}`);
    } else {
        console.error('❌ TypeDoc project generation failed.');
        return;
    }

    await processJsonToMdx();
}

function flattenDeclarations(project) {
    const declarations = [];

    function traverse(node) {
        if (node.kind === 128) { // Class
            declarations.push(node);
        }
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }

    traverse(project);
    return declarations;
}

function finalPass(content) {
    // Fix links
    content = content.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (match, text, target) => {
        const cleanTarget = target.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        return `[${text}](#${cleanTarget})`;
    });

    // Fix code blocks
    content = content.replace(/`\\`\\`\\`/g, '```');

    // Fix escaping
    content = content.replace(/\\`/g, '`');

    // Fix newlines
    content = content.replace(/\\n/g, '\n');

    return content;
}

async function processJsonToMdx() {
    const jsonPath = path.join(OUTPUT_DIR, 'output.json');
    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ JSON file not found at ${jsonPath}`);
        return;
    }

    const project = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    let finalContent = `---
title: 'Core API Reference'
description: 'Complete reference for the Multisynq client-side synchronized architecture, including Model, View, Session, and more.'
---

<Note>
This page is auto-generated from the source code. Do not edit it directly. The content is sourced from the TSDoc comments in <code>multisynq-client/client/</code>.
</Note>

`;

    const declarations = flattenDeclarations(project);

    for (const declaration of declarations) {
        finalContent += processClass(declaration);
    }

    finalContent = finalPass(finalContent);

    fs.writeFileSync(FINAL_OUTPUT_FILE, finalContent);
    console.log(`✅ Consolidated API Reference written to ${FINAL_OUTPUT_FILE}`);
}

function processModule(module) {
    let content = '';

    if (module.children) {
        for (const child of module.children) {
            if (child.kind === 128) { // Class
                content += processClass(child);
            } else {
                content += processModule(child);
            }
        }
    }

    return content;
}

function processClass(classItem) {
    let content = `## \`${classItem.name}\`\n\n`;

    if (classItem.comment && classItem.comment.summary) {
        content += getSummary(classItem.comment) + '\\n\\n';
    }

    if (classItem.comment && classItem.comment.blockTags) {
        const tutorialTags = classItem.comment.blockTags.filter(tag => tag.tag === '@tutorial');
        for (const tag of tutorialTags) {
            content += `<Card title="Tutorial" href="/docs/tutorials/${tag.content[0].text.trim()}">Explore the ${tag.content[0].text.trim()} tutorial to learn more.</Card>\\n\\n`;
        }
    }

    if (classItem.children) {
        const constructor = classItem.children.find(c => c.kind === 512); // Constructor
        if (constructor) {
            content += processConstructor(constructor);
        }

        const properties = classItem.children.filter(c => c.kind === 1024); // Property
        if (properties.length > 0) {
            content += '### Properties\\n\\n';
            for (const prop of properties) {
                content += processProperty(prop);
            }
        }

        const methods = classItem.children.filter(c => c.kind === 2048); // Method
        if (methods.length > 0) {
            content += '### Methods\\n\\n';
            for (const method of methods) {
                content += processMethod(method);
            }
        }
    }

    content += '\\n\\n---\\n\\n';

    return content;
}

function processConstructor(constructor) {
    let content = '#### `constructor`\\n\\n';
    const signature = constructor.signatures[0];
    content += getSummary(signature.comment) + '\\n\\n';

    if (signature.parameters) {
        content += '<RequestExample>\n';
        for (const param of signature.parameters) {
            content += processParameter(param);
        }
        content += '</RequestExample>\\n\\n';
    }

    return content;
}

function processMethod(method) {
    let content = `#### \`${method.name}()\`\\n\\n`;
    const signature = method.signatures[0];
    content += getSummary(signature.comment) + '\\n\\n';

    if (signature.parameters) {
        content += '<RequestExample>\\n';
        for (const param of signature.parameters) {
            content += processParameter(param);
        }
        content += '</RequestExample>\\n\\n';
    }

    if (signature.comment && signature.comment.blockTags) {
        const returnsTag = signature.comment.blockTags.find(tag => tag.tag === '@returns');
        if (returnsTag) {
            content += '<ResponseExample>\\n';
            content += getSummary({ summary: returnsTag.content });
            content += '</ResponseExample>\\n\\n';
        }

        const tutorialTags = signature.comment.blockTags.filter(tag => tag.tag === '@tutorial');
        for (const tag of tutorialTags) {
            content += `<Card title="Tutorial" href="/docs/tutorials/${tag.content[0].text.trim()}">Explore the ${tag.content[0].text.trim()} tutorial to learn more.</Card>\\n\\n`;
        }
    }

    return content;
}

function processProperty(prop) {
    let content = `##### \`${prop.name}\`\\n\\n`;
    content += getSummary(prop.comment) + '\\n\\n';
    return content;
}

function processParameter(param) {
    const typeName = param.type ? (param.type.name || 'object') : 'unknown';
    let content = `<ParamField path="${param.name}" type="${typeName}">\n`;
    content += getSummary(param.comment) + '\\n';
    content += `</ParamField>\\n`;
    return content;
}


function getSummary(comment) {
    if (!comment || !comment.summary) {
        return '';
    }

    let summary = comment.summary.map(part => {
        if (part.kind === 'code') {
            const code = part.text.replace(/`/g, '\\\\`');
            if (code.includes('\\n')) {
                return `\`\`\`\\n${code}\\n\`\`\``;
            }
            return `\`${code}\``;
        }
        if (part.kind === 'inline-tag' && part.tag === '@link') {
            if (part.target) {
                if (typeof part.target === 'string' && part.target.startsWith('http')) {
                    return `[${part.text}](${part.target})`;
                }
                
                let targetText = '';
                if (typeof part.target === 'string') {
                    targetText = part.target;
                } else if (part.target.name) {
                    targetText = part.target.name;
                } else {
                    targetText = part.text;
                }
                
                const cleanTarget = targetText.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
                return `[${part.text}](#${cleanTarget})`;
            }
            return part.text;
        }
        return part.text;
    }).join('');

    summary = summary.replace(/\\n+/g, '\\n');
    summary = summary.split('\\n').map(p => p.trim()).join('\\n\\n');

    return summary;
}

generateDocs().catch(console.error);
