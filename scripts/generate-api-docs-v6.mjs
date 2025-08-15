#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import ts from 'typescript';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('package', {
        type: 'string',
        description: 'Package to generate docs for (client, react, react-together)',
        demandOption: true
    })
    .argv;

// Configuration for different packages
const packageConfigs = {
    'client': {
        name: '@multisynq/client',
        displayName: 'Multisynq Client',
        sourcePaths: [
            '../../multisynq-client/client/teatime/src/**/*.js',
            '../../multisynq-client/client/teatime/src/**/*.ts'
        ],
        typeDefinitions: '../../multisynq-client/types/types.d.ts',
        outputPath: 'packages/client',
        navigation: {
            icon: 'code',
            groups: [
                {
                    name: 'Classes',
                    pages: ['Model', 'View', 'Session', 'Data', 'Controller']
                },
                {
                    name: 'Events',
                    pages: ['synced', 'view-exit', 'view-join']
                },
                {
                    name: 'Tutorials',
                    pages: [] // Will be linked from existing tutorials
                },
                {
                    name: 'Global',
                    pages: ['Constants']
                }
            ]
        }
    },
    'react': {
        name: '@multisynq/react',
        displayName: 'Multisynq React',
        sourcePaths: [
            '../../multisynq-react/src/**/*.ts',
            '../../multisynq-react/src/**/*.tsx',
            '../../multisynq-react/src/**/*.js',
            '../../multisynq-react/src/**/*.jsx'
        ],
        jsdocFile: '../../multisynq-react/bindings/react-doc.js',
        outputPath: 'packages/react',
        navigation: {
            icon: 'react'
        }
    },
    'react-together': {
        name: 'react-together',
        displayName: 'React Together',
        sourcePaths: [
            '../../react-together/src/**/*.ts',
            '../../react-together/src/**/*.tsx',
            '../../react-together/src/**/*.js',
            '../../react-together/src/**/*.jsx'
        ],
        outputPath: 'packages/react-together',
        navigation: {
            icon: 'component'
        }
    }
};

const config = packageConfigs[argv.package];
if (!config) {
    console.error(`Unknown package: ${argv.package}`);
    process.exit(1);
}

class EnhancedJSDocParser {
    constructor() {
        this.classes = [];
        this.interfaces = [];
        this.functions = [];
        this.hooks = [];
        this.components = [];
        this.types = [];
        this.enums = [];
        this.constants = [];
        this.events = [];
    }

    parseFiles(filePaths) {
        filePaths.forEach(filePath => {
            console.log(`📄 Processing ${path.basename(filePath)}...`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const ext = path.extname(filePath);
            
            if (ext === '.ts' || ext === '.tsx') {
                this.parseTypeScriptFile(filePath, content);
            } else {
                this.parseJavaScriptFile(filePath, content);
            }
        });
    }

    parseTypeScriptFile(filePath, content) {
        const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX
        );

        const visit = (node) => {
            // Extract JSDoc comments
            const jsDocComments = this.extractTSJSDoc(node, sourceFile);
            
            // Classes
            if (ts.isClassDeclaration(node) && node.name) {
                const className = node.name.text;
                const classInfo = {
                    name: className,
                    description: jsDocComments.description || '',
                    methods: [],
                    properties: [],
                    events: [],
                    examples: jsDocComments.examples || [],
                    params: jsDocComments.params || [],
                    returns: jsDocComments.returns,
                    extends: this.getExtends(node),
                    fileName: path.basename(filePath)
                };

                // Parse class members
                node.members.forEach(member => {
                    const memberDoc = this.extractTSJSDoc(member, sourceFile);
                    
                    if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
                        const methodInfo = {
                            name: member.name?.getText(sourceFile) || 'unknown',
                            description: memberDoc.description || '',
                            params: this.extractMethodParams(member, sourceFile),
                            returns: memberDoc.returns || this.getReturnType(member, sourceFile),
                            examples: memberDoc.examples || [],
                            isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                            visibility: this.getVisibility(member)
                        };
                        classInfo.methods.push(methodInfo);
                    } else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
                        const propInfo = {
                            name: member.name?.getText(sourceFile) || 'unknown',
                            description: memberDoc.description || '',
                            type: this.getTypeString(member.type, sourceFile),
                            isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                            visibility: this.getVisibility(member)
                        };
                        classInfo.properties.push(propInfo);
                    }
                });

                // Check if it has exported status
                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported || !node.modifiers) {
                    this.classes.push(classInfo);
                }
            }

            // Functions and Hooks
            if (ts.isFunctionDeclaration(node) && node.name) {
                const funcName = node.name.text;
                const funcInfo = {
                    name: funcName,
                    description: jsDocComments.description || '',
                    params: this.extractFunctionParams(node, sourceFile),
                    returns: jsDocComments.returns || this.getReturnType(node, sourceFile),
                    examples: jsDocComments.examples || [],
                    fileName: path.basename(filePath)
                };

                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    if (funcName.startsWith('use')) {
                        this.hooks.push(funcInfo);
                    } else {
                        this.functions.push(funcInfo);
                    }
                }
            }

            // Variable statements that might be hooks or components
            if (ts.isVariableStatement(node)) {
                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    node.declarationList.declarations.forEach(decl => {
                        if (ts.isIdentifier(decl.name)) {
                            const name = decl.name.text;
                            const info = {
                                name: name,
                                description: jsDocComments.description || '',
                                params: jsDocComments.params || [],
                                returns: jsDocComments.returns,
                                examples: jsDocComments.examples || [],
                                fileName: path.basename(filePath)
                            };

                            // Check if it's a React component
                            if (name[0] === name[0].toUpperCase() && !name.includes('_')) {
                                this.components.push(info);
                            }
                            // Check if it's a hook
                            else if (name.startsWith('use')) {
                                this.hooks.push(info);
                            }
                            // Check for alias exports like: const useIsTogether = useIsJoined
                            else if (decl.initializer && ts.isIdentifier(decl.initializer)) {
                                const originalName = decl.initializer.text;
                                // Find the original hook/function
                                const original = [...this.hooks, ...this.functions].find(item => item.name === originalName);
                                if (original) {
                                    const aliasInfo = {
                                        ...original,
                                        name: name,
                                        description: original.description || `Alias for ${originalName}. ${original.description || ''}`,
                                        isAlias: true,
                                        aliasOf: originalName
                                    };
                                    
                                    if (name.startsWith('use')) {
                                        this.hooks.push(aliasInfo);
                                    } else {
                                        this.functions.push(aliasInfo);
                                    }
                                }
                            }
                            else {
                                this.functions.push(info);
                            }
                        }
                    });
                }
            }

            // Interfaces
            if (ts.isInterfaceDeclaration(node) && node.name) {
                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    const interfaceInfo = {
                        name: node.name.text,
                        description: jsDocComments.description || '',
                        properties: [],
                        methods: [],
                        examples: jsDocComments.examples || [],
                        fileName: path.basename(filePath)
                    };

                    node.members.forEach(member => {
                        const memberDoc = this.extractTSJSDoc(member, sourceFile);
                        
                        if (ts.isPropertySignature(member)) {
                            interfaceInfo.properties.push({
                                name: member.name?.getText(sourceFile) || 'unknown',
                                description: memberDoc.description || '',
                                type: this.getTypeString(member.type, sourceFile),
                                optional: member.questionToken !== undefined
                            });
                        } else if (ts.isMethodSignature(member)) {
                            interfaceInfo.methods.push({
                                name: member.name?.getText(sourceFile) || 'unknown',
                                description: memberDoc.description || '',
                                params: this.extractMethodParams(member, sourceFile),
                                returns: memberDoc.returns || this.getReturnType(member, sourceFile)
                            });
                        }
                    });

                    this.interfaces.push(interfaceInfo);
                }
            }

            // Type aliases
            if (ts.isTypeAliasDeclaration(node) && node.name) {
                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    this.types.push({
                        name: node.name.text,
                        description: jsDocComments.description || '',
                        type: this.getTypeString(node.type, sourceFile),
                        examples: jsDocComments.examples || [],
                        fileName: path.basename(filePath)
                    });
                }
            }

            // Enums
            if (ts.isEnumDeclaration(node) && node.name) {
                const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                if (isExported) {
                    const enumInfo = {
                        name: node.name.text,
                        description: jsDocComments.description || '',
                        members: [],
                        fileName: path.basename(filePath)
                    };

                    node.members.forEach(member => {
                        const memberDoc = this.extractTSJSDoc(member, sourceFile);
                        enumInfo.members.push({
                            name: member.name?.getText(sourceFile) || 'unknown',
                            description: memberDoc.description || '',
                            value: member.initializer?.getText(sourceFile)
                        });
                    });

                    this.enums.push(enumInfo);
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
    }

    parseJavaScriptFile(filePath, content) {
        // Enhanced regex patterns
        const classRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{([\s\S]*?)(?=\n(?:export\s+)?class|\n\/\*\*|\nexport\s+default|\Z)/g;
        const functionRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*\{/g;
        const arrowFunctionRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\((.*?)\)\s*=>/g;
        const constRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?export\s+const\s+([A-Z_]+)\s*=\s*([^;]+);/g;
        const exportDefaultRegex = /export\s+default\s+(\w+);?/g;
        
        // Parse classes
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            const [fullMatch, jsDoc = '', className, extendsClass, classBody] = match;
            // Only use JSDoc comments that start with /** (not single-line comments)
            let description = jsDoc.startsWith('*') ? this.extractDescription(jsDoc) : '';
            
            // Special case: if this class extends another class and has no JSDoc,
            // look for the parent class's JSDoc in the same file
            if (!description && extendsClass) {
                const parentClassRegex = new RegExp(`\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*class\\s+${extendsClass}\\s*\\{`, 'g');
                const parentMatch = parentClassRegex.exec(content);
                if (parentMatch && parentMatch[1]) {
                    description = this.extractDescription(parentMatch[1]);
                }
            }
            
            const classInfo = {
                name: className,
                description: description,
                extends: extendsClass,
                methods: [],
                properties: [],
                events: this.extractEvents(jsDoc),
                examples: this.extractExamples(jsDoc),
                fileName: path.basename(filePath)
            };

            // Extract methods from class body
            const methodRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?(?:static\s+)?(?:async\s+)?(\w+)\s*\((.*?)\)\s*\{/g;
            let methodMatch;
            while ((methodMatch = methodRegex.exec(classBody)) !== null) {
                const [, methodJsDoc = '', methodName, params] = methodMatch;
                // Skip control flow keywords
                if (methodName !== 'constructor' && 
                    !['if', 'for', 'while', 'switch', 'catch', 'with', 'try'].includes(methodName)) {
                    classInfo.methods.push({
                        name: methodName,
                        description: this.extractDescription(methodJsDoc),
                        params: this.extractParams(methodJsDoc, params),
                        returns: this.extractReturns(methodJsDoc),
                        examples: this.extractExamples(methodJsDoc),
                        isStatic: fullMatch.includes(`static ${methodName}`),
                        visibility: 'public'
                    });
                }
            }

            // Extract properties from JSDoc
            const propRegex = /@property\s*(?:\{([^}]+)\})?\s*(\w+)(?:\s*-?\s*(.*))?/g;
            let propMatch;
            while ((propMatch = propRegex.exec(jsDoc)) !== null) {
                const [, type = 'any', propName, desc = ''] = propMatch;
                classInfo.properties.push({
                    name: propName,
                    type: type,
                    description: desc,
                    visibility: 'public'
                });
            }

            this.classes.push(classInfo);
        }

        // Check for export default statements
        const exportedClasses = new Set();
        exportDefaultRegex.lastIndex = 0;
        while ((match = exportDefaultRegex.exec(content)) !== null) {
            const [, exportedName] = match;
            exportedClasses.add(exportedName);
        }

        // Mark classes as exported if they have export default
        this.classes.forEach(cls => {
            if (exportedClasses.has(cls.name)) {
                cls.isExported = true;
            }
        });

        // Parse functions
        functionRegex.lastIndex = 0;
        while ((match = functionRegex.exec(content)) !== null) {
            const [, jsDoc = '', funcName, params] = match;
            const funcInfo = {
                name: funcName,
                description: this.extractDescription(jsDoc),
                params: this.extractParams(jsDoc, params),
                returns: this.extractReturns(jsDoc),
                examples: this.extractExamples(jsDoc),
                fileName: path.basename(filePath)
            };

            if (funcName.startsWith('use')) {
                this.hooks.push(funcInfo);
            } else {
                this.functions.push(funcInfo);
            }
        }

        // Parse arrow functions
        arrowFunctionRegex.lastIndex = 0;
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
            const [, jsDoc = '', funcName, params] = match;
            const funcInfo = {
                name: funcName,
                description: this.extractDescription(jsDoc),
                params: this.extractParams(jsDoc, params),
                returns: this.extractReturns(jsDoc),
                examples: this.extractExamples(jsDoc),
                fileName: path.basename(filePath)
            };

            if (funcName.startsWith('use')) {
                this.hooks.push(funcInfo);
            } else if (funcName[0] === funcName[0].toUpperCase()) {
                this.components.push(funcInfo);
            } else {
                this.functions.push(funcInfo);
            }
        }

        // Parse constants
        constRegex.lastIndex = 0;
        while ((match = constRegex.exec(content)) !== null) {
            const [, jsDoc = '', constName, value] = match;
            if (constName === constName.toUpperCase() && constName.includes('_')) {
                // Limit value to first line to avoid capturing entire code blocks
                let trimmedValue = value.trim();
                const firstNewline = trimmedValue.indexOf('\n');
                if (firstNewline > 0) {
                    trimmedValue = trimmedValue.substring(0, firstNewline).trim();
                }
                this.constants.push({
                    name: constName,
                    description: this.extractDescription(jsDoc),
                    value: trimmedValue,
                    fileName: path.basename(filePath)
                });
            }
        }

        // Parse events from JSDoc
        const eventRegex = /@fires\s+(\S+)(?:\s*-?\s*(.*))?/g;
        while ((match = eventRegex.exec(content)) !== null) {
            const [, eventName, desc = ''] = match;
            this.events.push({
                name: eventName,
                description: desc,
                fileName: path.basename(filePath)
            });
        }
    }

    extractTSJSDoc(node, sourceFile) {
        const result = {
            description: '',
            params: [],
            returns: null,
            examples: []
        };

        const jsDocComments = ts.getJSDocCommentsAndTags(node);
        
        jsDocComments.forEach(jsDoc => {
            if (ts.isJSDoc(jsDoc)) {
                if (jsDoc.comment) {
                    result.description = this.getTextFromJSDocComment(jsDoc.comment);
                }

                if (jsDoc.tags) {
                    jsDoc.tags.forEach(tag => {
                        if (ts.isJSDocParameterTag(tag)) {
                            result.params.push({
                                name: tag.name.getText(sourceFile),
                                type: tag.typeExpression ? tag.typeExpression.type.getText(sourceFile) : 'any',
                                description: tag.comment ? this.getTextFromJSDocComment(tag.comment) : ''
                            });
                        } else if (ts.isJSDocReturnTag(tag)) {
                            result.returns = {
                                type: tag.typeExpression ? tag.typeExpression.type.getText(sourceFile) : 'any',
                                description: tag.comment ? this.getTextFromJSDocComment(tag.comment) : ''
                            };
                        } else if (tag.tagName && tag.tagName.text === 'example') {
                            result.examples.push(tag.comment ? this.getTextFromJSDocComment(tag.comment) : '');
                        }
                    });
                }
            }
        });

        return result;
    }

    getTextFromJSDocComment(comment) {
        if (typeof comment === 'string') {
            return comment;
        }
        if (Array.isArray(comment)) {
            return comment.map(c => c.text || '').join('');
        }
        return '';
    }

    extractDescription(jsDoc) {
        const lines = jsDoc.split('\n');
        const description = [];
        
        for (const line of lines) {
            const trimmed = line.replace(/^\s*\*\s?/, '');
            if (trimmed && !trimmed.startsWith('@')) {
                description.push(trimmed);
            } else if (trimmed.startsWith('@')) {
                break;
            }
        }
        
        return description.join(' ').trim();
    }

    extractParams(jsDoc, paramString) {
        const params = [];
        const paramRegex = /@param\s*(?:\{([^}]+)\})?\s*(\w+)(?:\s*-?\s*(.*))?/g;
        
        let match;
        while ((match = paramRegex.exec(jsDoc)) !== null) {
            const [, type = 'any', name, desc = ''] = match;
            params.push({
                name: name,
                type: type,
                description: desc.trim()
            });
        }
        
        // If no JSDoc params, try to parse from function signature
        if (params.length === 0 && paramString) {
            const paramNames = paramString.split(',').map(p => p.trim()).filter(p => p);
            paramNames.forEach(param => {
                const name = param.split('=')[0].trim();
                if (name) {
                    params.push({
                        name: name,
                        type: 'any',
                        description: ''
                    });
                }
            });
        }
        
        return params;
    }

    extractReturns(jsDoc) {
        const returnMatch = jsDoc.match(/@returns?\s*(?:\{([^}]+)\})?\s*(.*)$/m);
        if (returnMatch) {
            const [, type = 'any', desc = ''] = returnMatch;
            return {
                type: type,
                description: desc.trim()
            };
        }
        return null;
    }

    extractExamples(jsDoc) {
        const examples = [];
        const exampleRegex = /@example\s*([\s\S]*?)(?=@\w+|$)/g;
        
        let match;
        while ((match = exampleRegex.exec(jsDoc)) !== null) {
            const example = match[1].split('\n')
                .map(line => line.replace(/^\s*\*\s?/, ''))
                .join('\n')
                .trim();
            
            if (example) {
                examples.push(example);
            }
        }
        
        return examples;
    }

    extractEvents(jsDoc) {
        const events = [];
        const eventRegex = /@fires\s+(\S+)(?:\s*-?\s*(.*))?/g;
        
        let match;
        while ((match = eventRegex.exec(jsDoc)) !== null) {
            const [, name, desc = ''] = match;
            events.push({
                name: name,
                description: desc.trim()
            });
        }
        
        return events;
    }

    extractMethodParams(method, sourceFile) {
        const params = [];
        
        if (method.parameters) {
            method.parameters.forEach(param => {
                const paramInfo = {
                    name: param.name?.getText(sourceFile) || 'unknown',
                    type: 'any',
                    description: '',
                    optional: param.questionToken !== undefined
                };

                if (param.type) {
                    paramInfo.type = this.getTypeString(param.type, sourceFile);
                }

                // Check for JSDoc on the parameter
                const jsDoc = ts.getJSDocCommentsAndTags(param);
                jsDoc.forEach(doc => {
                    if (ts.isJSDoc(doc) && doc.comment) {
                        paramInfo.description = this.getTextFromJSDocComment(doc.comment);
                    }
                });

                params.push(paramInfo);
            });
        }

        return params;
    }

    extractFunctionParams(func, sourceFile) {
        return this.extractMethodParams(func, sourceFile);
    }

    getTypeString(typeNode, sourceFile) {
        if (!typeNode) return 'any';
        
        // Handle basic types
        const typeText = typeNode.getText(sourceFile);
        
        // Clean up type text
        return typeText.replace(/\s+/g, ' ').trim();
    }

    getReturnType(node, sourceFile) {
        if (node.type) {
            return {
                type: this.getTypeString(node.type, sourceFile),
                description: ''
            };
        }
        return null;
    }

    getVisibility(member) {
        if (!member.modifiers) return 'public';
        
        if (member.modifiers.some(m => m.kind === ts.SyntaxKind.PrivateKeyword)) {
            return 'private';
        }
        if (member.modifiers.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword)) {
            return 'protected';
        }
        
        return 'public';
    }

    getExtends(node) {
        if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    return clause.types[0]?.expression?.getText() || null;
                }
            }
        }
        return null;
    }
}

class EnhancedMDXGenerator {
    constructor(config) {
        this.config = config;
        this.generatedFiles = [];
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

    formatDescription(desc) {
        if (!desc) return '';
        
        // Handle [text]{@link target} format first
        desc = desc.replace(/\[([^\]]+)\]\{@link\s+([^}]+)\}/g, (match, text, target) => {
            // Handle external URLs
            if (target.startsWith('http')) {
                return `[${text}](${target})`;
            }
            const cleanTarget = target.replace('#', '').toLowerCase();
            return `[${text}](#${cleanTarget})`;
        });
        
        // Then handle regular {@link target} format
        desc = desc.replace(/\{@link\s+([^}]+)\}/g, (match, target) => {
            // Handle external URLs
            if (target.startsWith('http')) {
                return `[${target}](${target})`;
            }
            const parts = target.split(/\s+/);
            const ref = parts[0];
            const text = parts.slice(1).join(' ') || ref;
            const cleanRef = ref.replace('#', '').toLowerCase();
            return `[${text}](#${cleanRef})`;
        });
        
        // Handle {@tutorial} tags
        desc = desc.replace(/\[([^\]]+)\]\{@tutorial\s+([^}]+)\}/g, (match, text, tutorial) => {
            return `[${text}](/tutorials/${tutorial})`;
        });
        desc = desc.replace(/\{@tutorial\s+([^}]+)\}/g, (match, tutorial) => {
            return `[tutorial](/tutorials/${tutorial})`;
        });
        
        // Handle <br> tags - convert to newlines
        desc = desc.replace(/<br\s*\/?>/g, '\n\n');
        
        // Handle inline code
        desc = desc.replace(/`([^`]+)`/g, '`$1`');
        
        // Handle code blocks
        desc = desc.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `\n\`\`\`${lang || ''}\n${code.trim()}\n\`\`\`\n`;
        });
        
        return desc.trim();
    }

    formatDescriptionForComponent(desc) {
        if (!desc) return '';
        
        // Step 1: Protect {@link} tags with placeholders
        const linkPlaceholders = [];
        let placeholderIndex = 0;
        
        // Handle [text]{@link target} format first
        desc = desc.replace(/\[([^\]]+)\]\{@link\s+([^}]+)\}/g, (match, text, target) => {
            const placeholder = `§§LINK§§${placeholderIndex}§§TEXT§§${text}§§TARGET§§${target}§§LINK§§`;
            linkPlaceholders.push({ placeholder, text, target });
            placeholderIndex++;
            return placeholder;
        });
        
        // Then handle regular {@link target} format
        desc = desc.replace(/\{@link\s+([^}]+)\}/g, (match, target) => {
            const parts = target.split(/\s+/);
            const ref = parts[0];
            const text = parts.slice(1).join(' ') || ref;
            const placeholder = `§§LINK§§${placeholderIndex}§§TEXT§§${text}§§TARGET§§${ref}§§LINK§§`;
            linkPlaceholders.push({ placeholder, text, target: ref });
            placeholderIndex++;
            return placeholder;
        });
        
        // Step 2: Apply other markdown transformations
        
        // Handle line breaks
        desc = desc.replace(/\n/g, ' ');
        
        // Handle inline code (but not within our placeholders)
        desc = desc.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold
        desc = desc.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic
        desc = desc.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Step 3: Restore {@link} tags as proper HTML links
        linkPlaceholders.forEach(({ placeholder, text, target }) => {
            const href = `#${target.toLowerCase().replace('#', '').replace(/[^a-z0-9-]/g, '')}`;
            const linkHtml = `<a href="${href}">${this.escapeHtml(text)}</a>`;
            desc = desc.replace(placeholder, linkHtml);
        });
        
        return desc.trim();
    }

    generate(docs) {
        console.log(`\n🚀 Generating documentation structure for ${this.config.displayName}...`);
        
        const outputDir = path.join(__dirname, '..', this.config.outputPath);
        fs.ensureDirSync(outputDir);

        // Generate index page
        this.generateIndexPage(docs, outputDir);

        // Generate Classes section
        if (docs.classes && docs.classes.length > 0) {
            this.generateClassesSection(docs.classes, outputDir);
        }

        // Generate Events section for client package
        if (this.config.name === '@multisynq/client') {
            this.generateEventsSection(outputDir);
        }

        // Generate Global section
        if (docs.constants && docs.constants.length > 0) {
            this.generateGlobalSection(docs.constants, outputDir);
        }

        return this.generatedFiles;
    }

    generateIndexPage(docs, outputDir) {
        const indexPath = path.join(outputDir, 'index.mdx');
        const content = [`---
title: '${this.config.displayName}'
description: 'API reference documentation for ${this.config.name}'
icon: '${this.config.navigation.icon}'
---

# ${this.config.displayName}

Welcome to the ${this.config.displayName} API reference documentation.

## Classes

The main classes that power ${this.config.name}:

<CardGroup cols={2}>
`];

        // Add main classes
        const mainClasses = ['Model', 'View', 'Session', 'Data', 'Controller'];
        docs.classes.filter(c => mainClasses.includes(c.name)).forEach(cls => {
            content.push(`  <Card title="${cls.name}" icon="cube" href="/packages/client/classes/${cls.name}">
    ${this.formatDescription(cls.description).split('.')[0] || `The ${cls.name} class`}.
  </Card>`);
        });

        content.push(`</CardGroup>

## Quick Links

- [Events](/packages/client/events) - Event system and pub/sub
- [Global Constants](/packages/client/global) - Global constants and configuration
- [Tutorials](#) - Step-by-step guides and examples
`);

        fs.writeFileSync(indexPath, content.join('\n'));
        this.generatedFiles.push({ path: 'index', title: this.config.displayName });
    }

    generateClassesSection(classes, outputDir) {
        const classesDir = path.join(outputDir, 'classes');
        fs.ensureDirSync(classesDir);

        // Generate individual class pages
        classes.forEach(cls => {
            this.generateClassPage(cls, classesDir);
        });
    }

    generateClassPage(cls, classesDir) {
        const filePath = path.join(classesDir, `${cls.name}.mdx`);
        const sections = [];

        // Frontmatter
        sections.push(`---
title: '${cls.name}'
description: '${this.formatDescription(cls.description).split('.')[0] || `API reference for ${cls.name} class`}'
---`);

        // Title and description
        sections.push(`\n# ${cls.name}\n`);
        
        if (cls.extends) {
            sections.push(`**Extends:** [${cls.extends}](#)\n`);
        }

        if (cls.description) {
            sections.push(`${this.formatDescription(cls.description)}\n`);
        }

        // Examples
        if (cls.examples && cls.examples.length > 0) {
            sections.push('## Examples\n');
            cls.examples.forEach(example => {
                sections.push('```javascript');
                sections.push(example.trim());
                sections.push('```\n');
            });
        }

        // Constructor
        const constructor = cls.methods.find(m => m.name === 'constructor');
        if (constructor) {
            sections.push('## Constructor\n');
            sections.push(this.generateMethodSection(constructor));
        }

        // Properties
        const publicProps = cls.properties.filter(p => p.visibility === 'public');
        if (publicProps.length > 0) {
            sections.push('## Properties\n');
            publicProps.forEach(prop => {
                sections.push(`### \`${prop.name}\`\n`);
                const escapedType = prop.type.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                sections.push(`**Type:** \`${escapedType}\`\n`);
                if (prop.description) {
                    sections.push(`${this.formatDescription(prop.description)}\n`);
                }
            });
        }

        // Methods
        const publicMethods = cls.methods.filter(m => 
            m.visibility === 'public' && m.name !== 'constructor'
        );
        
        if (publicMethods.length > 0) {
            sections.push('## Methods\n');
            
            // Group by static/instance
            const staticMethods = publicMethods.filter(m => m.isStatic);
            const instanceMethods = publicMethods.filter(m => !m.isStatic);

            if (staticMethods.length > 0) {
                sections.push('### Static Methods\n');
                staticMethods.forEach(method => {
                    sections.push(this.generateMethodSection(method, true));
                });
            }

            if (instanceMethods.length > 0) {
                sections.push('### Instance Methods\n');
                instanceMethods.forEach(method => {
                    sections.push(this.generateMethodSection(method));
                });
            }
        }

        // Events
        if (cls.events && cls.events.length > 0) {
            sections.push('## Events\n');
            cls.events.forEach(event => {
                sections.push(`### \`${event.name}\`\n`);
                if (event.description) {
                    sections.push(`${this.formatDescription(event.description)}\n`);
                }
            });
        }

        fs.writeFileSync(filePath, sections.join('\n'));
        this.generatedFiles.push({ 
            path: `classes/${cls.name}`, 
            title: cls.name,
            group: 'Classes'
        });
    }

    generateMethodSection(method, isStatic = false) {
        const sections = [];
        const prefix = isStatic ? 'static ' : '';
        
        sections.push(`#### \`${prefix}${method.name}(${this.generateMethodSignature(method.params)})\`\n`);
        
        if (method.description) {
            sections.push(`${this.formatDescription(method.description)}\n`);
        }

        if (method.params && method.params.length > 0) {
            sections.push('**Parameters:**\n');
            method.params.forEach(param => {
                // Escape the type for MDX
                const escapedType = param.type.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const formattedDesc = param.description ? this.formatDescription(param.description) : '';
                sections.push(`- \`${param.name}\` (\`${escapedType}\`)${param.optional ? ' _(optional)_' : ''} - ${formattedDesc}`);
            });
            sections.push('');
        }

        if (method.returns) {
            const escapedReturnType = method.returns.type.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            sections.push(`**Returns:** \`${escapedReturnType}\`${method.returns.description ? ` - ${method.returns.description}` : ''}\n`);
        }

        if (method.examples && method.examples.length > 0) {
            sections.push('**Example:**\n');
            method.examples.forEach(example => {
                sections.push('```javascript');
                sections.push(example.trim());
                sections.push('```\n');
            });
        }

        return sections.join('\n');
    }

    generateMethodSignature(params) {
        if (!params || params.length === 0) return '';
        return params.map(p => {
            const optional = p.optional ? '?' : '';
            return `${p.name}${optional}`;
        }).join(', ');
    }

    generateEventsSection(outputDir) {
        const eventsPath = path.join(outputDir, 'events.mdx');
        const content = [`---
title: 'Events'
description: 'Event system and publish/subscribe patterns in Multisynq'
icon: 'bolt'
---

# Events

Multisynq uses an event-driven architecture to communicate between models and views.

## Core Events

### \`synced\`

Fired when the view has synchronized with the model state.

**Usage:**
\`\`\`javascript
view.subscribe("synced", () => {
    console.log("View is synchronized");
});
\`\`\`

### \`view-join\`

Fired when a new view joins the session.

**Parameters:**
- \`viewId\` (string) - The ID of the joining view

**Usage:**
\`\`\`javascript
model.subscribe("view-join", viewId => {
    console.log(\`View \${viewId} joined\`);
});
\`\`\`

### \`view-exit\`

Fired when a view leaves the session.

**Parameters:**
- \`viewId\` (string) - The ID of the exiting view

**Usage:**
\`\`\`javascript
model.subscribe("view-exit", viewId => {
    console.log(\`View \${viewId} left\`);
});
\`\`\`

## Custom Events

You can create and use custom events:

\`\`\`javascript
// In the model
this.publish("my-custom-event", { data: "value" });

// In the view
this.subscribe("my-custom-event", data => {
    console.log("Received:", data);
});
\`\`\`

## Event Handling Options

### Queued (Default)
\`\`\`javascript
view.subscribe("event-name", handler);
// or explicitly:
view.subscribe({ event: "event-name", handling: "queued" }, handler);
\`\`\`

### Once Per Frame
\`\`\`javascript
view.subscribe({ event: "event-name", handling: "oncePerFrame" }, handler);
\`\`\`

### Immediate
\`\`\`javascript
view.subscribe({ event: "event-name", handling: "immediate" }, handler);
\`\`\`
`];

        fs.writeFileSync(eventsPath, content.join('\n'));
        this.generatedFiles.push({ 
            path: 'events', 
            title: 'Events',
            group: 'Events'
        });
    }

    generateGlobalSection(constants, outputDir) {
        const globalPath = path.join(outputDir, 'global.mdx');
        const content = [`---
title: 'Global Constants'
description: 'Global constants and configuration values'
icon: 'globe'
---

# Global Constants

Configuration constants used throughout the Multisynq client library.

## Constants
`];

        constants.forEach(constant => {
            content.push(`\n### \`${constant.name}\`\n`);
            content.push(`**Value:** \`${constant.value}\`\n`);
            if (constant.description) {
                content.push(`${this.formatDescription(constant.description)}\n`);
            }
        });

        fs.writeFileSync(globalPath, content.join('\n'));
        this.generatedFiles.push({ 
            path: 'global', 
            title: 'Constants',
            group: 'Global'
        });
    }
}

class NavigationUpdater {
    constructor(docsJsonPath) {
        this.docsJsonPath = docsJsonPath;
        this.docsConfig = JSON.parse(fs.readFileSync(docsJsonPath, 'utf-8'));
    }

    updateNavigation(packageName, generatedFiles) {
        // Find the Packages tab
        const packagesTab = this.docsConfig.navigation.tabs.find(tab => tab.tab === 'Packages');
        if (!packagesTab) {
            console.error('❌ Could not find Packages tab in navigation');
            return;
        }

        // Find the appropriate package group
        let packageGroup;
        let basePath;
        
        switch(packageName) {
            case '@multisynq/client':
                packageGroup = packagesTab.groups.find(g => g.group === 'Multisynq Client');
                basePath = 'packages/client';
                break;
            case '@multisynq/react':
                packageGroup = packagesTab.groups.find(g => g.group === 'Multisynq React');
                basePath = 'packages/react';
                break;
            case 'react-together':
                packageGroup = packagesTab.groups.find(g => g.group === 'React Together');
                basePath = 'packages/react-together';
                break;
        }

        if (!packageGroup) {
            console.error(`❌ Could not find package group for ${packageName}`);
            return;
        }

        // Update pages for client package with proper structure
        if (packageName === '@multisynq/client') {
            packageGroup.pages = [
                `${basePath}/index`,
                {
                    group: "Classes",
                    pages: [
                        `${basePath}/classes/Model`,
                        `${basePath}/classes/View`,
                        `${basePath}/classes/Session`,
                        `${basePath}/classes/Data`,
                        `${basePath}/classes/Controller`
                    ]
                },
                `${basePath}/events`,
                {
                    group: "Tutorials",
                    pages: [
                        "tutorials/hello-world",
                        "tutorials/simple-animation",
                        "tutorials/multiuser-chat",
                        "tutorials/view-smoothing",
                        "tutorials/3d-animation",
                        "tutorials/multiblaster-game"
                    ]
                },
                `${basePath}/global`
            ];
        } else {
            // For other packages, keep the existing single index structure for now
            packageGroup.pages = [`${basePath}/index`];
        }

        // Save the updated configuration
        fs.writeFileSync(
            this.docsJsonPath,
            JSON.stringify(this.docsConfig, null, 2)
        );

        console.log(`✅ Updated navigation in docs.json`);
    }
}

// Main execution
async function main() {
    console.log(`🚀 Starting documentation generation for ${config.displayName}...`);

    // Resolve source paths
    const sourcePaths = config.sourcePaths.map(pattern => 
        path.resolve(__dirname, pattern)
    );
    
    // Find all source files
    const sourceFiles = [];
    sourcePaths.forEach(pattern => {
        const files = globSync(pattern);
        sourceFiles.push(...files);
    });

    console.log(`📊 Found ${sourceFiles.length} source files`);

    // Parse files
    const parser = new EnhancedJSDocParser();
    parser.parseFiles(sourceFiles);

    // Parse type definitions if available
    if (config.typeDefinitions) {
        const typeDefPath = path.resolve(__dirname, config.typeDefinitions);
        if (fs.existsSync(typeDefPath)) {
            console.log(`🔤 Processing TypeScript definitions from ${path.basename(typeDefPath)}...`);
            const typeDefContent = fs.readFileSync(typeDefPath, 'utf-8');
            parser.parseTypeScriptFile(typeDefPath, typeDefContent);
        }
    }

    // Parse JSDoc file if available
    if (config.jsdocFile) {
        const jsdocPath = path.resolve(__dirname, config.jsdocFile);
        if (fs.existsSync(jsdocPath)) {
            console.log(`📚 Processing JSDoc definitions from ${path.basename(jsdocPath)}...`);
            const jsdocContent = fs.readFileSync(jsdocPath, 'utf-8');
            parser.parseJavaScriptFile(jsdocPath, jsdocContent);
        }
    }

    // Extract results
    const docs = {
        classes: parser.classes,
        interfaces: parser.interfaces,
        functions: parser.functions,
        hooks: parser.hooks,
        components: parser.components,
        types: parser.types,
        enums: parser.enums,
        constants: parser.constants,
        events: parser.events
    };

    // Log extraction summary
    console.log(`\n📊 Extracted:`);
    console.log(`  - ${docs.classes.length} classes`);
    console.log(`  - ${docs.interfaces.length} interfaces`);
    console.log(`  - ${docs.functions.length} functions`);
    console.log(`  - ${docs.hooks.length} hooks`);
    console.log(`  - ${docs.components.length} components`);
    console.log(`  - ${docs.types.length} type aliases`);
    console.log(`  - ${docs.enums.length} enums`);
    console.log(`  - ${docs.constants.length} constants`);
    console.log(`  - ${docs.events.length} events`);

    // Generate MDX files
    const generator = new EnhancedMDXGenerator(config);
    const generatedFiles = generator.generate(docs);

    // Update navigation
    const docsJsonPath = path.resolve(__dirname, '../docs.json');
    const navUpdater = new NavigationUpdater(docsJsonPath);
    navUpdater.updateNavigation(config.name, generatedFiles);

    console.log(`\n✨ Documentation generation complete!`);
    console.log(`📁 Output: ${config.outputPath}`);
    console.log(`📄 Generated ${generatedFiles.length} files`);
}

main().catch(console.error);
