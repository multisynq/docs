#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package configurations
const PACKAGE_CONFIGS = {
    'client': {
        name: '@multisynq/client',
        displayName: 'Multisynq Client',
        sourcePaths: ['../../multisynq-client/client/teatime/src'],
        outputPath: 'packages/client',
        navigation: {
            group: 'Core API',
            icon: 'code'
        },
        filePatterns: ['**/*.js'],
        includeTypes: true,
        typesFile: '../../multisynq-client/client/types.d.ts'
    },
    'react': {
        name: '@multisynq/react',
        displayName: 'Multisynq React',
        sourcePaths: ['../../multisynq-react/bindings/src'],
        outputPath: 'packages/react',
        navigation: {
            group: 'React API',
            icon: 'react'
        },
        filePatterns: ['**/*.ts', '**/*.tsx'],
        includeTypes: true,
        jsdocFile: '../../multisynq-react/docs/react-doc.js'
    }
    ,
    'react-together': {
        name: '@multisynq/react-together',
        displayName: 'React Together',
        sourcePaths: ['../../react-together/packages/react-together/src'],
        outputPath: 'packages/react-together',
        navigation: {
            group: 'React Together',
            icon: 'react'
        },
        filePatterns: ['**/*.ts', '**/*.tsx'],
        includeTypes: true
    }
};

// Enhanced JSDoc parser with TypeScript support
class EnhancedJSDocParser {
    constructor(config) {
        this.config = config;
        this.typeChecker = null;
        this.program = null;
    }

    async parseFiles(filePaths) {
        const results = {
            classes: [],
            interfaces: [],
            functions: [],
            hooks: [],
            components: [],
            types: [],
            enums: [],
            constants: []
        };

        // Setup TypeScript program if we have TS files
        const tsFiles = filePaths.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        if (tsFiles.length > 0) {
            this.setupTypeScript(tsFiles);
        }

        for (const filePath of filePaths) {
            const content = await fs.readFile(filePath, 'utf-8');
            const fileName = path.basename(filePath);
            
            console.log(`📄 Processing ${fileName}...`);
            
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                await this.parseTypeScriptFile(filePath, content, results);
            } else {
                await this.parseJavaScriptFile(filePath, content, results);
            }
        }

        // If we have a separate JSDoc file (like react-doc.js), parse it
        if (this.config.jsdocFile && await fs.pathExists(path.join(__dirname, this.config.jsdocFile))) {
            console.log(`📚 Processing JSDoc definitions from ${path.basename(this.config.jsdocFile)}...`);
            const jsdocContent = await fs.readFile(path.join(__dirname, this.config.jsdocFile), 'utf-8');
            this.parseJSDocDefinitions(jsdocContent, results);
        }

        // Merge TypeScript types if available
        if (this.config.typesFile && await fs.pathExists(path.join(__dirname, this.config.typesFile))) {
            console.log(`🔤 Processing TypeScript definitions from ${path.basename(this.config.typesFile)}...`);
            await this.mergeTypeScriptDefinitions(this.config.typesFile, results);
        }

        return results;
    }

    setupTypeScript(files) {
        const options = {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.React,
            allowJs: true,
            checkJs: false,
            declaration: true,
            esModuleInterop: true,
            skipLibCheck: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs
        };

        this.program = ts.createProgram(files, options);
        this.typeChecker = this.program.getTypeChecker();
    }

    async parseTypeScriptFile(filePath, content, results) {
        const sourceFile = this.program.getSourceFile(filePath);
        if (!sourceFile) return;

        // Track local variable declarations and exported names to resolve aliases and non-exported consts that are re-exported later
        const localVarDecls = new Map(); // name -> { decl, jsdoc, isExport }
        const exportedLocalNames = new Set();

        const visit = (node) => {
            // Extract JSDoc comments
            const jsdoc = this.extractTSDocComment(node, sourceFile);

            if (ts.isClassDeclaration(node) && node.name) {
                const className = node.name.getText();
                const classData = this.parseTypeScriptClass(node, sourceFile, jsdoc);
                results.classes.push(classData);
            } else if (ts.isInterfaceDeclaration(node) && node.name) {
                const interfaceName = node.name.getText();
                const interfaceData = this.parseTypeScriptInterface(node, sourceFile, jsdoc);
                results.interfaces.push(interfaceData);
            } else if (ts.isFunctionDeclaration(node) && node.name) {
                const funcName = node.name.getText();
                const funcData = this.parseTypeScriptFunction(node, sourceFile, jsdoc);
                
                // Categorize hooks separately
                if (funcName.startsWith('use')) {
                    results.hooks.push(funcData);
                } else {
                    results.functions.push(funcData);
                }
            } else if (ts.isTypeAliasDeclaration(node)) {
                const typeData = this.parseTypeAlias(node, sourceFile, jsdoc);
                results.types.push(typeData);
            } else if (ts.isEnumDeclaration(node)) {
                const enumData = this.parseEnum(node, sourceFile, jsdoc);
                results.enums.push(enumData);
            } else if (ts.isVariableStatement(node)) {
                // Record local variable declarations, even if not exported here
                const isExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
                node.declarationList.declarations.forEach(decl => {
                    if (ts.isIdentifier(decl.name)) {
                        const name = decl.name.getText();
                        localVarDecls.set(name, { decl, jsdoc: jsdoc || '', isExport: !!isExport });
                    }
                });
            } else if (ts.isExportDeclaration(node)) {
                // export { name as alias }
                if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(el => {
                        const localName = el.propertyName ? el.propertyName.getText() : el.name.getText();
                        exportedLocalNames.add(localName);
                    });
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        // After traversal, materialize exported variables/components/hooks (handles aliasing and re-exports)
        for (const [name, info] of localVarDecls.entries()) {
            const isExported = info.isExport || exportedLocalNames.has(name);
            if (!isExported) continue;

            const initializer = info.decl.initializer;
            const parsed = this.parseJSDocComment(info.jsdoc || '');
            const isHookName = /^use[A-Z]/.test(name);
            const isComponentName = /^[A-Z]/.test(name);

            // Detect alias: const A = B
            if (initializer && ts.isIdentifier(initializer)) {
                const aliasOf = initializer.getText();
                const aliasEntry = { name, aliasOf, ...parsed };
                if (isHookName) {
                    results.hooks.push(aliasEntry);
                } else if (isComponentName) {
                    results.components.push({ ...aliasEntry, type: 'component' });
                } else {
                    results.functions.push(aliasEntry);
                }
                continue;
            }

            // Arrow/function expression detection
            const isFunctionLike = initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
            if (isHookName || (isFunctionLike && name.startsWith('use'))) {
                results.hooks.push({ name, ...parsed });
            } else if (isComponentName && initializer) {
                results.components.push({ name, ...parsed, type: 'component' });
            } else if (isFunctionLike) {
                results.functions.push({ name, ...parsed });
            } else {
                results.constants.push({ name, ...parsed, kind: 'constant' });
            }
        }
    }

    parseTypeScriptClass(node, sourceFile, classJsdoc) {
        const className = node.name.getText();
        const parsed = this.parseJSDocComment(classJsdoc || '');
        
        const classData = {
            name: className,
            ...parsed,
            extends: node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ExtendsKeyword)
                ?.types[0]?.expression?.getText() || null,
            implements: node.heritageClauses?.find(h => h.token === ts.SyntaxKind.ImplementsKeyword)
                ?.types.map(t => t.expression.getText()) || [],
            typeParameters: node.typeParameters?.map(tp => tp.name.getText()) || [],
            methods: [],
            properties: [],
            staticMethods: [],
            staticProperties: [],
            constructor: null
        };

        // Parse members
        node.members.forEach(member => {
            const memberJsdoc = this.extractTSDocComment(member, sourceFile);
            const parsed = this.parseJSDocComment(memberJsdoc || '');
            
            if (ts.isConstructorDeclaration(member)) {
                classData.constructor = {
                    name: 'constructor',
                    ...parsed,
                    parameters: this.parseParameters(member.parameters)
                };
            } else if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
                const method = {
                    name: member.name?.getText() || '',
                    ...parsed,
                    isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                    isAsync: member.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword),
                    isPrivate: member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword),
                    isProtected: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword),
                    parameters: this.parseParameters(member.parameters),
                    returnType: member.type?.getText() || 'any',
                    typeParameters: member.typeParameters?.map(tp => tp.name.getText()) || []
                };
                
                if (method.isStatic) {
                    classData.staticMethods.push(method);
                } else {
                    classData.methods.push(method);
                }
            } else if (ts.isGetAccessorDeclaration(member)) {
                const method = {
                    name: member.name?.getText() || '',
                    ...parsed,
                    isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                    isAsync: false,
                    isPrivate: member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword),
                    isProtected: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword),
                    parameters: [],
                    returnType: member.type?.getText() || 'any',
                    typeParameters: [],
                    isGetter: true
                };
                if (method.isStatic) {
                    classData.staticMethods.push(method);
                } else {
                    classData.methods.push(method);
                }
            } else if (ts.isSetAccessorDeclaration(member)) {
                const method = {
                    name: member.name?.getText() || '',
                    ...parsed,
                    isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                    isAsync: false,
                    isPrivate: member.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword),
                    isProtected: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword),
                    parameters: this.parseParameters(member.parameters),
                    returnType: 'void',
                    typeParameters: [],
                    isSetter: true
                };
                if (method.isStatic) {
                    classData.staticMethods.push(method);
                } else {
                    classData.methods.push(method);
                }
            } else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
                const prop = {
                    name: member.name?.getText() || '',
                    ...parsed,
                    isStatic: member.modifiers?.some(m => m.kind === ts.SyntaxKind.StaticKeyword),
                    isReadonly: member.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword),
                    isOptional: member.questionToken !== undefined,
                    type: member.type?.getText() || 'any',
                    initializer: member.initializer?.getText()
                };
                
                if (prop.isStatic) {
                    classData.staticProperties.push(prop);
                } else {
                    classData.properties.push(prop);
                }
            }
        });

        return classData;
    }

    parseTypeScriptInterface(node, sourceFile, jsdoc) {
        const parsed = this.parseJSDocComment(jsdoc || '');
        
        return {
            name: node.name.getText(),
            ...parsed,
            extends: node.heritageClauses?.flatMap(h => h.types.map(t => t.expression.getText())) || [],
            typeParameters: node.typeParameters?.map(tp => tp.name.getText()) || [],
            members: node.members.map(member => {
                const memberJsdoc = this.extractTSDocComment(member, sourceFile);
                const memberParsed = this.parseJSDocComment(memberJsdoc || '');
                
                return {
                    name: member.name?.getText() || '',
                    ...memberParsed,
                    type: member.type?.getText() || 'any',
                    isOptional: member.questionToken !== undefined,
                    kind: ts.isMethodSignature(member) ? 'method' : 'property'
                };
            })
        };
    }

    parseTypeScriptFunction(node, sourceFile, jsdoc) {
        const parsed = this.parseJSDocComment(jsdoc || '');
        
        return {
            name: node.name.getText(),
            ...parsed,
            isAsync: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword),
            isExport: node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword),
            parameters: this.parseParameters(node.parameters),
            returnType: node.type?.getText() || 'any',
            typeParameters: node.typeParameters?.map(tp => tp.name.getText()) || []
        };
    }

    parseParameters(parameters) {
        if (!parameters) return [];
        
        return parameters.map(param => {
            const name = param.name.getText();
            const type = param.type?.getText() || 'any';
            const isOptional = param.questionToken !== undefined;
            const defaultValue = param.initializer?.getText();
            
            return {
                name,
                type,
                optional: isOptional,
                default: defaultValue,
                isRest: param.dotDotDotToken !== undefined
            };
        });
    }

    parseTypeAlias(node, sourceFile, jsdoc) {
        const parsed = this.parseJSDocComment(jsdoc || '');
        
        return {
            name: node.name.getText(),
            ...parsed,
            type: node.type.getText(),
            typeParameters: node.typeParameters?.map(tp => tp.name.getText()) || []
        };
    }

    parseEnum(node, sourceFile, jsdoc) {
        const parsed = this.parseJSDocComment(jsdoc || '');
        
        return {
            name: node.name.getText(),
            ...parsed,
            members: node.members.map(member => ({
                name: member.name.getText(),
                value: member.initializer?.getText(),
                jsdoc: this.extractTSDocComment(member, sourceFile)
            }))
        };
    }

    extractTSDocComment(node, sourceFile) {
        const fullText = sourceFile.getFullText();
        const nodeStart = node.getFullStart();
        const nodeText = fullText.substring(nodeStart, node.getStart());
        
        // Look for JSDoc comment immediately before the node
        const match = nodeText.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
        return match ? match[0] : null;
    }

    async parseJavaScriptFile(filePath, content, results) {
        // Prefer AST walk for JS to capture all class members accurately (including static)
        try {
            const sourceFile = ts.createSourceFile(
                filePath,
                content,
                ts.ScriptTarget.ES2020,
                true,
                ts.ScriptKind.JS
            );
            const visit = (node) => {
                const jsdoc = this.extractTSDocComment(node, sourceFile);
                if (ts.isClassDeclaration(node) && node.name) {
                    const classData = this.parseTypeScriptClass(node, sourceFile, jsdoc);
                    results.classes.push(classData);
                } else if (ts.isFunctionDeclaration(node) && node.name) {
                    const funcData = this.parseTypeScriptFunction(node, sourceFile, jsdoc);
                    if (funcData.name.startsWith('use')) {
                        results.hooks.push(funcData);
                    } else {
                        results.functions.push(funcData);
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sourceFile);
            return;
        } catch (e) {
            // Fallback to legacy regex parser
            const parser = new JSDocParser();
            const parsed = parser.parse(content);
            results.classes.push(...parsed.classes);
            results.functions.push(...parsed.functions);
            const hooks = results.functions.filter(f => f.name.startsWith('use'));
            const regularFuncs = results.functions.filter(f => !f.name.startsWith('use'));
            results.hooks.push(...hooks);
            results.functions = regularFuncs;
        }
    }

    parseJSDocDefinitions(content, results) {
        // Parse JSDoc-only definitions (like in react-doc.js)
        const functionPattern = /\/\*\*([\s\S]*?)\*\/\s*(?:export\s+)?function\s+(\w+)/g;
        const classPattern = /\/\*\*([\s\S]*?)\*\/\s*class\s+(\w+)/g;
        
        let match;
        while ((match = functionPattern.exec(content)) !== null) {
            const [, jsdoc, funcName] = match;
            const parsed = this.parseJSDocComment('/**' + jsdoc + '*/');
            const funcData = {
                name: funcName,
                ...parsed,
                isPlaceholder: true // Mark as JSDoc-only definition
            };
            
            if (funcName.startsWith('use')) {
                results.hooks.push(funcData);
            } else if (/^[A-Z]/.test(funcName)) {
                results.components.push(funcData);
            } else {
                results.functions.push(funcData);
            }
        }
        
        while ((match = classPattern.exec(content)) !== null) {
            const [, jsdoc, className] = match;
            const parsed = this.parseJSDocComment('/**' + jsdoc + '*/');
            results.classes.push({
                name: className,
                ...parsed,
                isPlaceholder: true
            });
        }
    }

    async mergeTypeScriptDefinitions(typesFile, results) {
        // Merge type definitions with parsed results
        const typesPath = path.join(__dirname, typesFile);
        const content = await fs.readFile(typesPath, 'utf-8');
        
        // Parse the .d.ts file
        const sourceFile = ts.createSourceFile(
            typesPath,
            content,
            ts.ScriptTarget.Latest,
            true
        );
        
        // Extract and merge type information
        // This would enhance existing results with type information
        // Implementation depends on specific needs
    }

    parseJSDocComment(comment) {
        // Enhanced parser from v3
        const result = {
            description: '',
            summary: '',
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
            memberOf: null,
            template: null,
            extends: null,
            implements: [],
            mixes: []
        };

        if (!comment) return result;

        // Clean the comment
        const cleaned = comment
            .replace(/^\/\*\*\s*/, '')
            .replace(/\s*\*\/$/, '')
            .replace(/^\s*\*\s?/gm, '');

        const lines = cleaned.split('\n');
        let currentTag = null;
        let currentContent = [];
        let descriptionLines = [];
        let inDescription = true;

        for (const line of lines) {
            const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/);
            
            if (tagMatch) {
                if (currentTag) {
                    this.processTag(result, currentTag, currentContent.join('\n'));
                } else if (inDescription) {
                    result.description = descriptionLines.join('\n').trim();
                    result.summary = this.extractSummary(result.description);
                    inDescription = false;
                }
                
                currentTag = tagMatch[1];
                currentContent = tagMatch[2] ? [tagMatch[2]] : [];
            } else {
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
            result.summary = this.extractSummary(result.description);
        }

        return result;
    }

    extractSummary(description) {
        if (!description) return '';
        
        // Get first paragraph or sentence
        const paragraphs = description.split(/\n\n+/);
        const firstPara = paragraphs[0];
        
        // Try to get first sentence
        const sentenceMatch = firstPara.match(/^[^.!?]+[.!?]/);
        if (sentenceMatch) {
            return sentenceMatch[0].trim();
        }
        
        // Otherwise return first 150 chars
        return firstPara.length > 150 ? firstPara.substring(0, 147) + '...' : firstPara;
    }

    processTag(result, tag, content) {
        switch (tag) {
            case 'param':
            case 'parameter':
            case 'arg':
            case 'argument':
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
            case 'memberOf':
                result.memberOf = content.trim();
                break;
            case 'template':
                result.template = content.trim();
                break;
            case 'extends':
            case 'augments':
                result.extends = content.trim();
                break;
            case 'implements':
                result.implements.push(content.trim());
                break;
            case 'mixes':
                result.mixes.push(content.trim());
                break;
        }
    }

    parseParam(result, content) {
        // Enhanced parameter parsing with multiple formats support
        const patterns = [
            // {Type} name - description
            /^\{([^}]+)\}\s+(\S+)(?:\s*-\s*)?(.*)$/,
            // {Type} [name=default] - description
            /^\{([^}]+)\}\s+\[(\S+)(?:=([^\]]+))?\](?:\s*-\s*)?(.*)$/,
            // name {Type} description
            /^(\S+)\s+\{([^}]+)\}\s*(.*)$/,
            // name:Type description
            /^(\S+):(\S+)\s*(.*)$/,
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
                    // name:Type description
                    result.params.push({
                        name: match[1],
                        type: match[2],
                        description: match[3].trim(),
                        optional: false
                    });
                    return;
                } else if (pattern === patterns[4]) {
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
        // Enhanced example parsing with captions
        const captionMatch = content.match(/^<caption>(.*?)<\/caption>\s*([\s\S]*)$/);
        if (captionMatch) {
            result.examples.push({
                caption: captionMatch[1],
                code: captionMatch[2].trim()
            });
        } else {
            // Check if it starts with a title line
            const titleMatch = content.match(/^([^\n]+)\n([\s\S]+)$/);
            if (titleMatch && !titleMatch[1].includes('{') && !titleMatch[1].includes('(')) {
                result.examples.push({
                    caption: titleMatch[1].trim(),
                    code: titleMatch[2].trim()
                });
            } else {
                result.examples.push({
                    caption: '',
                    code: content.trim()
                });
            }
        }
    }

    cleanExample(code) {
        if (!code) return '';
        
        // Remove JSDoc comment wrapper if present
        code = code.replace(/^\/\*\*?\s*|\s*\*\/$/g, '');
        
        // Split into lines
        const lines = code.split('\n');
        
        // Remove leading/trailing empty lines
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        
        // Find minimum indentation (excluding empty lines)
        let minIndent = Infinity;
        lines.forEach(line => {
            if (line.trim()) {
                const match = line.match(/^(\s*)/);
                if (match) {
                    minIndent = Math.min(minIndent, match[1].length);
                }
            }
        });
        
        // If minIndent is Infinity (no non-empty lines), set it to 0
        if (minIndent === Infinity) {
            minIndent = 0;
        }
        
        // Remove common leading whitespace and asterisks
        const cleaned = lines.map(line => {
            if (line.trim()) {
                // Remove common indentation
                let cleanLine = line.substring(minIndent);
                // Remove leading asterisk from JSDoc comments
                cleanLine = cleanLine.replace(/^\s*\*\s?/, '');
                return cleanLine;
            }
            return '';
        });
        
        return cleaned.join('\n').trim();
    }
}

// Copy JSDocParser from v3
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
        const parser = new EnhancedJSDocParser({});
        const parsed = parser.parseJSDocComment('/**' + comment + '*/');
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
        const parser = new EnhancedJSDocParser({});
        const parsed = parser.parseJSDocComment('/**' + comment + '*/');
        return {
            name,
            ...parsed
        };
    }

    extractClassMembers(classBody, classObj) {
        const parser = new EnhancedJSDocParser({});
        
        // Enhanced member extraction
        const memberPattern = /\/\*\*([\s\S]*?)\*\/\s*((?:static\s+)?(?:async\s+)?(?:get\s+)?(?:set\s+)?(?:#)?)([\w$]+)(?:\s*[=:]\s*(?:function\s*)?\([^)]*\)|[^;{]*)?[;{]/g;
        
        let match;
        while ((match = memberPattern.exec(classBody)) !== null) {
            const [fullMatch, comment, modifiers, memberName] = match;
            
            // Skip if it's a method call or assignment inside another method
            if (this.isInsideMethod(classBody, match.index)) continue;
            
            const parsed = parser.parseJSDocComment('/**' + comment + '*/');
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

// Enhanced MDX generator with import-based structure
class EnhancedMDXGenerator {
    constructor(config) {
        this.config = config;
        this.packagePath = config.outputPath;
        this.packageName = config.name;
        this.outputPath = path.join(process.cwd(), config.outputPath, 'components');
        this.indexPath = path.join(process.cwd(), config.outputPath, 'index.mdx');
        this.generatedFiles = [];
    }

    generatePackageStructure(docs) {
        const componentDir = path.join(__dirname, '..', this.config.outputPath, 'components');
        fs.ensureDirSync(componentDir);
        
        // Generate individual component files
        this.generateComponentFiles(docs, componentDir);
        
        // Generate the main index that imports everything
        const indexContent = this.generateImportBasedIndex(docs);
        const indexPath = path.join(__dirname, '..', this.config.outputPath, 'index.mdx');
        fs.writeFileSync(indexPath, indexContent);
        
        console.log(`✅ Generated import-based index.mdx`);
        
        return this.generatedFiles;
    }

    generateComponentFiles(docs, componentDir) {
        // Generate files for each category
        const categories = [
            { name: 'classes', items: docs.classes, generator: 'generateClassComponent' },
            { name: 'interfaces', items: docs.interfaces, generator: 'generateInterfaceComponent' },
            { name: 'hooks', items: docs.hooks, generator: 'generateHookComponent' },
            { name: 'components', items: docs.components, generator: 'generateReactComponent' },
            // functions handled specially below
            { name: 'types', items: docs.types, generator: 'generateTypeComponent' },
            { name: 'enums', items: docs.enums, generator: 'generateEnumComponent' }
        ];
        
        categories.forEach(category => {
            if (category.items && category.items.length > 0) {
                const categoryDir = path.join(componentDir, category.name);
                fs.ensureDirSync(categoryDir);
                
                // Track names to handle duplicates
                const nameCount = {};
                
                category.items.forEach(item => {
                    // Handle duplicate names
                    let uniqueName = item.name;
                    if (nameCount[item.name]) {
                        nameCount[item.name]++;
                        uniqueName = `${item.name}${nameCount[item.name]}`;
                    } else {
                        nameCount[item.name] = 1;
                    }
                    
                    const fileName = `${uniqueName}.mdx`;
                    const filePath = path.join(categoryDir, fileName);
                    const content = this[category.generator](item);
                    
                    fs.writeFileSync(filePath, content);
                    this.generatedFiles.push({
                        category: category.name,
                        name: item.name,
                        uniqueName: uniqueName,
                        path: `components/${category.name}/${fileName}`
                    });
                    
                    console.log(`✅ Generated ${category.name}/${fileName}`);
                });
            }
        });

        // Functions: aggregate into a single component file instead of per-function files
        if (docs.functions && docs.functions.length > 0) {
            const fnDir = path.join(componentDir, 'functions');
            fs.ensureDirSync(fnDir);
            const fileName = 'Functions.mdx';
            const filePath = path.join(fnDir, fileName);
            const content = this.generateFunctionsAggregateComponent(docs.functions);
            fs.writeFileSync(filePath, content);
            this.generatedFiles.push({ category: 'functions', name: 'Functions', path: `components/functions/${fileName}` });
        }
    }

    generateImportBasedIndex(docs) {
        const sections = [];
        
        // Frontmatter
        sections.push(`---
title: '${this.config.displayName}'
description: 'Complete API reference for ${this.config.name}'
icon: '${this.config.navigation.icon}'
---`);
        
        // Import statements (real ESM imports so components can be rendered)
        const imports = [];
        const importNames = new Set();
        this.generatedFiles.forEach(file => {
            const baseName = `${file.category}_${file.uniqueName || file.name}`.replace(/[^a-zA-Z0-9_]/g, '_');
            let importName = baseName;
            let counter = 1;
            while (importNames.has(importName)) {
                importName = `${baseName}_${counter}`;
                counter++;
            }
            importNames.add(importName);
            imports.push(`import ${importName} from './${file.path}';`);
            file.importName = importName; // Store for later use
        });
        sections.push('');
        sections.push(...imports);
        sections.push('');
        
        // Note about auto-generation
        sections.push('', `<Note>
This documentation is auto-generated from the source code.
Last updated: ${new Date().toISOString()}
</Note>`);
        
        // Introduction
        sections.push('', `# ${this.config.displayName}`, '');
        
        if (this.config.name === '@multisynq/react') {
            sections.push(`Welcome to the ${this.config.displayName} reference. This documentation covers all hooks, components, and utilities available in the ${this.config.name} package.`);
        } else {
            sections.push(`Welcome to the comprehensive API reference for ${this.config.name}. This documentation covers all core classes, methods, properties, and events available in the ${this.config.displayName}.`);
        }
        
        // Navigation with client-side tabs
        sections.push('', '## API Reference', '');
        sections.push('<Tabs>');
        
        // Group by category
        const categories = {};
        this.generatedFiles.forEach(file => {
            if (!categories[file.category]) {
                categories[file.category] = [];
            }
            categories[file.category].push(file);
        });
        
        // Create tabs for each category
        Object.entries(categories).forEach(([category, files]) => {
            const categoryTitle = this.getCategoryTitle(category);
            sections.push(`  <Tab title="${categoryTitle}">`);
            
            // Quick navigation within category
            sections.push(`    ### ${categoryTitle}`, '');
            sections.push('    <CardGroup cols={2}>');
            
            if (category === 'functions' && docs.functions && docs.functions.length > 0) {
                docs.functions.forEach(fn => {
                    sections.push(`      <Card title="${fn.name}" icon="${this.getCategoryIcon(category)}" href="#func-${fn.name}">
        Jump to ${fn.name} documentation
      </Card>`);
                });
            } else {
                files.forEach(file => {
                    sections.push(`      <Card title="${file.name}" icon="${this.getCategoryIcon(category)}" href="#${file.name.toLowerCase()}">
        Jump to ${file.name} documentation
      </Card>`);
                });
            }
            
            sections.push('    </CardGroup>', '');
            
            // Render each component
            if (category === 'functions' && files.length > 0) {
                const file = files[0];
                sections.push(`    <div id="functions">`);
                sections.push(`      <${file.importName} />`);
                sections.push('    </div>');
                sections.push('');
            } else {
                files.forEach(file => {
                    sections.push(`    <div id="${file.name.toLowerCase()}">`);
                    sections.push(`      <${file.importName} />`);
                    sections.push('    </div>');
                    sections.push('');
                });
            }
            
            sections.push('  </Tab>');
        });
        
        sections.push('</Tabs>');
        
        // Architecture Overview (for core package)
        if (this.config.name === '@multisynq/client') {
            sections.push('', '## Architecture Overview', '');
            sections.push(this.generateArchitectureSteps());
        }
        
        // Common Patterns
        sections.push('', '## Common Patterns', '');
        if (this.config.name === '@multisynq/client') {
            sections.push(this.generateCorePatternsTabs());
        } else if (this.config.name === '@multisynq/react') {
            sections.push(this.generateReactPatternsTabs());
        }
        
        return sections.join('\n');
    }

    getCategoryTitle(category) {
        const titles = {
            'classes': 'Classes',
            'interfaces': 'Interfaces',
            'hooks': 'Hooks',
            'components': 'Components',
            'functions': 'Functions',
            'types': 'Type Definitions',
            'enums': 'Enumerations'
        };
        return titles[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'classes': 'cube',
            'interfaces': 'layer-group',
            'hooks': 'hook',
            'components': 'component',
            'functions': 'function',
            'types': 'code',
            'enums': 'list'
        };
        return icons[category] || 'code';
    }

    generateFunctionsAggregateComponent(functions) {
        const sections = [];
        sections.push(`## Functions`);
        sections.push('<a id="functions"></a>');
        sections.push('<AccordionGroup>');
        functions.forEach(fn => {
            sections.push(`<Accordion title="${fn.name}" id="func-${fn.name}">`);
            // signature
            const params = fn.params ? fn.params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type || 'any'}`).join(', ') : '';
            const returnType = fn.returns ? fn.returns.type : 'void';
            sections.push('<CodeGroup>');
            sections.push('```typescript');
            sections.push(`${fn.name}(${params}): ${returnType}`);
            sections.push('```');
            sections.push('</CodeGroup>');
            // description
            if (fn.description) sections.push(this.formatDescriptionForComponent(fn.description));
            // params
            if (fn.params && fn.params.length) {
                sections.push('##### Parameters');
                fn.params.forEach(p => {
                    sections.push(this.generateParamFieldComponent(p));
                });
            }
            // returns
            if (fn.returns) {
                sections.push('##### Returns');
                sections.push(`<ResponseField type="${this.escapeHtml(fn.returns.type || 'any')}">`);
                sections.push(this.formatDescriptionForComponent(fn.returns.description || ''));
                sections.push('</ResponseField>');
            }
            // examples
            if (fn.examples && fn.examples.length) {
                sections.push('##### Examples');
                sections.push(this.generateExamplesComponent(fn.examples, ''));
            }
            sections.push('</Accordion>');
        });
        sections.push('</AccordionGroup>');
        return sections.join('\n');
    }

    generateClassComponent(classData) {
        const sections = [];
        
        // Heading
        sections.push(`## ${classData.name}`);
        sections.push("");
        sections.push(`<a id="${classData.name.toLowerCase()}"></a>`);
        
        // Extends
        if (classData.extends) {
            sections.push(`<p><strong>Extends:</strong> <code>${classData.extends}</code></p>`);
        }
        
        // Implements
        if (classData.implements && classData.implements.length > 0) {
            sections.push(`<p><strong>Implements:</strong> ${classData.implements.map(i => `<code>${i}</code>`).join(', ')}</p>`);
        }
        
        // Type parameters
        if (classData.typeParameters && classData.typeParameters.length > 0) {
            sections.push(`<Info>
Generic type parameters: ${classData.typeParameters.map(t => `<code>${t}</code>`).join(', ')}
</Info>`);
        }
        
        // Deprecated warning
        if (classData.deprecated) {
            const message = typeof classData.deprecated === 'string' 
                ? classData.deprecated 
                : 'This class is deprecated.';
            sections.push(`<Warning>
<strong>Deprecated:</strong> ${message}
</Warning>`);
        }
        
        // Description
        if (classData.description) {
            sections.push(`${this.formatDescriptionForComponent(classData.description)}`);
        }
        
        // Since
        if (classData.since) {
            sections.push(`<Info>
Available since version ${classData.since}
</Info>`);
        }
        
        // Constructor
        if (!classData.hideConstructor && classData.constructor) {
            sections.push(`### Constructor`);
            sections.push(this.generateMethodComponentContent(classData.constructor, true));
        } else if (classData.hideConstructor) {
            sections.push(`<Note>
This class should not be instantiated directly using <code>new</code>.
</Note>`);
        }
        
        // Properties and Methods in Tabs
        sections.push(`<Tabs>`);
        
        // Properties tab
        if ((classData.properties && classData.properties.length > 0) ||
            (classData.staticProperties && classData.staticProperties.length > 0)) {
            sections.push(`<Tab title="Properties">`);
            
            if (classData.staticProperties && classData.staticProperties.length > 0) {
                sections.push(`#### Static Properties`);
                sections.push(this.generatePropertiesComponent(classData.staticProperties));
            }
            
            if (classData.properties && classData.properties.length > 0) {
                sections.push(`#### Instance Properties`);
                sections.push(this.generatePropertiesComponent(classData.properties));
            }
            
            sections.push(`</Tab>`);
        }
        
        // Methods tab
        if ((classData.methods && classData.methods.length > 0) ||
            (classData.staticMethods && classData.staticMethods.length > 0)) {
            sections.push(`<Tab title="Methods">`);
            
            if (classData.staticMethods && classData.staticMethods.length > 0) {
                sections.push(`#### Static Methods`);
                sections.push(this.generateMethodsComponent(classData.staticMethods));
            }
            
            if (classData.methods && classData.methods.length > 0) {
                sections.push(`#### Instance Methods`);
                sections.push(this.generateMethodsComponent(classData.methods));
            }
            
            sections.push(`</Tab>`);
        }
        
        // Events tab
        if ((classData.fires && classData.fires.length > 0) ||
            (classData.listens && classData.listens.length > 0)) {
            sections.push(`<Tab title="Events">`);
            
            if (classData.fires && classData.fires.length > 0) {
                sections.push(`#### Events This Class Fires`);
                sections.push(`<Card title="Fires" icon="broadcast">`);
                classData.fires.forEach(event => {
                    sections.push(`${this.formatEventDetails(event)}`);
                });
                sections.push(`</Card>`);
            }
            
            if (classData.listens && classData.listens.length > 0) {
                sections.push(`#### Events This Class Listens To`);
                sections.push(`<Card title="Listens" icon="ear-listen">`);
                classData.listens.forEach(event => {
                    sections.push(`${this.formatEventDetails(event)}`);
                });
                sections.push(`</Card>`);
            }
            
            sections.push(`</Tab>`);
        }

        // Known Events for Session (from legacy docs)
        if (classData.name === 'Session') {
            sections.push(`<Tab title="Events">`);
            // synced (view event)
            sections.push(`#### synced`);
            sections.push(`<Info>Published when the session backlog crosses a threshold. (see <a href="#viewexternalnow">View#externalNow</a> for backlog)</Info>`);
            sections.push(`<p>This is a non-synchronized view-only event. If this is the main session, it also indicates that the scene was revealed (if <code>data</code> is true) or hidden behind the overlay (if <code>data</code> is false).</p>`);
            sections.push(`<h5>Properties</h5>`);
            sections.push(`<ResponseField>`);
            sections.push(`<ResponseField name="scope" type="String">this.viewId</ResponseField>`);
            sections.push(`<ResponseField name="event" type="String">"synced"</ResponseField>`);
            sections.push(`<ResponseField name="data" type="Boolean">true if in sync, false if backlogged</ResponseField>`);
            sections.push(`</ResponseField>`);
            sections.push(`<h5>Example</h5>`);
            sections.push(`<CodeGroup>\n\`\`\`javascript\nthis.subscribe(this.viewId, "synced", this.handleSynced);\n\`\`\`\n</CodeGroup>`);

            // view-join (model-only)
            sections.push(`#### view-join`);
            sections.push(`<Info>Published when a new user enters the session, or re-enters after being temporarily disconnected.</Info>`);
            sections.push(`<p>This is a model-only event, meaning views can not handle it directly. The event's payload will be the joining view's <code>viewId</code>. However, if <code>viewData</code> was passed to <a href="#sessionjoin">Session.join</a>, the event payload will be an object <code>{viewId, viewData}</code>.</p>`);
            sections.push(`<h5>Properties</h5>`);
            sections.push(`<ResponseField>`);
            sections.push(`<ResponseField name="scope" type="String">this.sessionId</ResponseField>`);
            sections.push(`<ResponseField name="event" type="String">"view-join"</ResponseField>`);
            sections.push(`<ResponseField name="viewId" type="String | Object">the joining user's local viewId, or an object {viewId, viewData}</ResponseField>`);
            sections.push(`</ResponseField>`);

            // view-exit (model-only)
            sections.push(`#### view-exit`);
            sections.push(`<Info>Published when a user leaves the session, or is disconnected.</Info>`);
            sections.push(`<p>This is a model-only event, meaning views can not handle it directly. This event will be published when a view tab is closed, or disconnected due to network interruption or inactivity. If <code>viewData</code> was passed to <a href="#sessionjoin">Session.join</a>, the event payload will be an object <code>{viewId, viewData}</code>.</p>`);
            sections.push(`<h5>Properties</h5>`);
            sections.push(`<ResponseField>`);
            sections.push(`<ResponseField name="scope" type="String">this.sessionId</ResponseField>`);
            sections.push(`<ResponseField name="event" type="String">"view-exit"</ResponseField>`);
            sections.push(`<ResponseField name="viewId" type="String | Object">the user's viewId, or an object {viewId, viewData}</ResponseField>`);
            sections.push(`</ResponseField>`);

            sections.push(`</Tab>`);
        }
        
        // Examples tab
        if (classData.examples && classData.examples.length > 0) {
            sections.push(`<Tab title="Examples">`);
            sections.push(this.generateExamplesComponent(classData.examples, ''));
            sections.push(`</Tab>`);
        }
        
        sections.push(`</Tabs>`);
        
        // Related
        if (classData.see && classData.see.length > 0) {
            sections.push(`### See Also`);
            sections.push(`<ul>`);
            classData.see.forEach(item => {
                sections.push(`<li>${this.formatSeeAlso(item)}</li>`);
            });
            sections.push(`</ul>`);
        }
        
        // Tutorials
        if (classData.tutorials && classData.tutorials.length > 0) {
            sections.push(`### Related Tutorials`);
            sections.push(`<CardGroup>`);
            classData.tutorials.forEach(tutorial => {
                sections.push(`<Card title="Tutorial: ${tutorial}" icon="book-open" href="/tutorials/${tutorial}">
Learn more about ${classData.name} in this comprehensive tutorial.
</Card>`);
            });
            sections.push(`</CardGroup>`);
        }
        
        return sections.join('\n');
    }

    generateInterfaceComponent(interfaceData) {
        const sections = [];
        
        sections.push(`## ${interfaceData.name} Interface`);
        sections.push("");
        sections.push(`<a id="${interfaceData.name.toLowerCase()}"></a>`);
        
        if (interfaceData.description) {
            sections.push(`${this.formatDescriptionForComponent(interfaceData.description)}`);
        }
        
        // Type parameters
        if (interfaceData.typeParameters && interfaceData.typeParameters.length > 0) {
            sections.push(`<Info>
Generic type parameters: ${interfaceData.typeParameters.map(t => `<code>${t}</code>`).join(', ')}
</Info>`);
        }
        
        // Extends
        if (interfaceData.extends && interfaceData.extends.length > 0) {
            sections.push(`<p><strong>Extends:</strong> ${interfaceData.extends.map(e => `<code>${e}</code>`).join(', ')}</p>`);
        }
        
        // Members
        if (interfaceData.members && interfaceData.members.length > 0) {
            sections.push(`### Members`);
            
            const properties = interfaceData.members.filter(m => m.kind !== 'method');
            const methods = interfaceData.members.filter(m => m.kind === 'method');
            
            if (properties.length > 0) {
                sections.push(`#### Properties`);
                sections.push(`<ResponseField>`);
                properties.forEach(prop => {
                    sections.push(`<ResponseField name="${prop.name}" type="${prop.type}"${prop.isOptional ? ' required={false}' : ''}>
${this.formatDescriptionForComponent(prop.description || '')}
</ResponseField>`);
                });
                sections.push(`</ResponseField>`);
            }
            
            if (methods.length > 0) {
                sections.push(`#### Methods`);
                sections.push(`<Accordion>`);
                methods.forEach(method => {
                    sections.push(`<AccordionItem title="${method.name}">
${this.formatDescriptionForComponent(method.description || '')}

<strong>Type:</strong> <code>${this.escapeHtml(method.type)}</code>
</AccordionItem>`);
                });
                sections.push(`</Accordion>`);
            }
        }
        
        return sections.join('\n');
    }

    generateHookComponent(hookData) {
        const sections = [];
        
        sections.push(`## ${hookData.name}`);
        sections.push("");
        sections.push(`<a id="${hookData.name.toLowerCase()}"></a>`);
        
        if (hookData.description) {
            sections.push(`${this.formatDescriptionForComponent(hookData.description)}`);
        }
        
        // Since
        if (hookData.since) {
            sections.push(`<Info>
Available since version ${hookData.since}
</Info>`);
        }
        
        // Deprecated
        if (hookData.deprecated) {
            const message = typeof hookData.deprecated === 'string' 
                ? hookData.deprecated 
                : 'This hook is deprecated.';
            sections.push(`<Warning>
<strong>Deprecated:</strong> ${message}
</Warning>`);
        }
        
        // Syntax
        sections.push(`### Syntax`);
        sections.push('```typescript');
        sections.push(this.generateHookSignature(hookData));
        sections.push('```');
        
        // Parameters
        if (hookData.params && hookData.params.length > 0) {
            sections.push(`### Parameters`);
            sections.push(`<ParamField>`);
            hookData.params.forEach(param => {
                sections.push(this.generateParamFieldComponent(param));
            });
            sections.push(`</ParamField>`);
        }
        
        // Returns
        if (hookData.returns) {
            sections.push(`### Returns`);
            sections.push(`<ResponseField type="${hookData.returns.type || 'any'}">`);
            sections.push(`${this.formatDescriptionForComponent(hookData.returns.description || '')}`);
            sections.push(`</ResponseField>`);
        }
        
        // Examples
        if (hookData.examples && hookData.examples.length > 0) {
            sections.push(`### Examples`);
            sections.push(this.generateExamplesComponent(hookData.examples, ''));
        }
        
        // See Also
        if (hookData.see && hookData.see.length > 0) {
            sections.push(`### See Also`);
            sections.push(`<ul>`);
            hookData.see.forEach(item => {
                sections.push(`<li>${this.formatSeeAlso(item)}</li>`);
            });
            sections.push(`</ul>`);
        }
        
        return sections.join('\n');
    }

    generateReactComponent(componentData) {
        const sections = [];
        
        sections.push(`## ${componentData.name} Component`);
        sections.push("");
        sections.push(`<a id="${componentData.name.toLowerCase()}"></a>`);
        
        if (componentData.description) {
            sections.push(`${this.formatDescriptionForComponent(componentData.description)}`);
        }
        
        // Props
        if (componentData.params && componentData.params.length > 0) {
            sections.push(`### Props`);
            sections.push(`<ResponseField>`);
            componentData.params.forEach(param => {
                sections.push(`<ResponseField name="${param.name}" type="${param.type || 'any'}"${param.optional ? ' required={false}' : ''}>
${this.formatDescriptionForComponent(param.description || '')}
</ResponseField>`);
            });
            sections.push(`</ResponseField>`);
        }
        
        // Examples
        if (componentData.examples && componentData.examples.length > 0) {
            sections.push(`### Usage`);
            sections.push(this.generateExamplesComponent(componentData.examples, ''));
        }
        
        return sections.join('\n');
    }

    generateFunctionComponent(funcData) {
        const sections = [];
        
        sections.push(`## ${funcData.name}`);
        sections.push("");
        sections.push(`<a id="${funcData.name.toLowerCase()}"></a>`);
        
        if (funcData.description) {
            sections.push(`${this.formatDescriptionForComponent(funcData.description)}`);
        }
        
        // Similar to hook but simpler
        // ... implementation similar to generateHookComponent
        
        
        return sections.join('\n');
    }

    generateTypeComponent(typeData) {
        const sections = [];
        
        sections.push(`## ${typeData.name}`);
        sections.push("");
        sections.push(`<a id="${typeData.name.toLowerCase()}"></a>`);
        
        if (typeData.description) {
            sections.push(`${this.formatDescriptionForComponent(typeData.description)}`);
        }
        
        sections.push('<CodeGroup>');
        sections.push('```typescript');
        sections.push(`type ${typeData.name}${typeData.typeParameters && typeData.typeParameters.length > 0 ? `<${typeData.typeParameters.join(', ')}>` : ''} = ${typeData.type}`);
        sections.push('```');
        sections.push('</CodeGroup>');
        
        
        return sections.join('\n');
    }

    generateEnumComponent(enumData) {
        const sections = [];
        
        sections.push(`## ${enumData.name}`);
        sections.push("");
        sections.push(`<a id="${enumData.name.toLowerCase()}"></a>`);
        
        if (enumData.description) {
            sections.push(`${this.formatDescriptionForComponent(enumData.description)}`);
        }
        
        sections.push(`### Members`);
        sections.push(`<ul>`);
        enumData.members.forEach(member => {
            sections.push(`<li><strong>${member.name}</strong>${member.value ? ` = ${member.value}` : ''}</li>`);
        });
        sections.push(`</ul>`);
        
        return sections.join('\n');
    }

    // Helper methods for component generation
    generateMethodsComponent(methods) {
        const sections = [];
        sections.push(`<AccordionGroup>`);
        
        methods.forEach(method => {
            sections.push(`<Accordion title="${method.name}">`);
            sections.push(this.generateMethodComponentContent(method));
            sections.push(`</Accordion>`);
        });
        
        sections.push(`</AccordionGroup>`);
        return sections.join('\n');
    }

    generatePropertiesComponent(properties) {
        const sections = [];
        sections.push(`<Accordion>`);
        
        properties.forEach(prop => {
            const title = `${prop.name}${prop.isStatic ? ' (static)' : ''}${prop.isReadonly ? ' (readonly)' : ''}`;
            sections.push(`<AccordionItem title="${title}">`);
            sections.push(this.generatePropertyComponentContent(prop));
            sections.push(`</AccordionItem>`);
        });
        
        sections.push(`</Accordion>`);
        return sections.join('\n');
    }

    generateMethodComponentContent(method, isConstructor = false) {
        const sections = [];
        
        // Method signature
        const modifiers = [];
        if (method.isStatic) modifiers.push('static');
        if (method.isAsync) modifiers.push('async');
        if (method.isPrivate) modifiers.push('private');
        if (method.isProtected) modifiers.push('protected');
        
        let params = '';
        if (method.parameters && method.parameters.length) {
            params = method.parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ');
        } else if (method.params && method.params.length) {
            // Collapse nested param names like eventSpec.event into a single param, with approximate type
            params = this.getSignatureParamsFromParams(method.params);
        }
        
        const returnType = method.returnType || (method.returns ? method.returns.type : 'void');
        const signature = `${modifiers.join(' ')} ${method.name}(${params})${!isConstructor ? `: ${returnType}` : ''}`;
        
        sections.push('<CodeGroup>');
        sections.push('```typescript');
        sections.push(signature.trim());
        sections.push('```');
        sections.push('</CodeGroup>');
        
        // Deprecated
        if (method.deprecated) {
            sections.push(`<Warning>
<strong>Deprecated:</strong> ${this.escapeHtml(method.deprecated)}
</Warning>`);
        }
        
        // Description
        if (method.description) {
            sections.push(`${this.formatDescriptionForComponent(method.description)}`);
        }
        
        // Parameters
        const parameters = method.parameters || method.params;
        if (parameters && parameters.length > 0) {
            sections.push(`##### Parameters`);
            parameters.forEach(param => {
                sections.push(this.generateParamFieldComponent(param));
            });
        }
        
        // Returns
        if (method.returns && !isConstructor) {
            sections.push(`##### Returns`);
            sections.push(`<ResponseField type="${this.escapeHtml(method.returns.type || returnType || 'any')}">`);
            sections.push(`${this.formatDescriptionForComponent(method.returns.description || '')}`);
            sections.push(`</ResponseField>`);
        }
        
        // Throws
        if (method.throws && method.throws.length > 0) {
            sections.push(`<Warning>
<strong>Throws:</strong>`);
            method.throws.forEach(t => {
                sections.push(`<br/>• <strong>${this.escapeHtml(t.type)}</strong>: ${this.escapeHtml(t.description)}`);
            });
            sections.push(`</Warning>`);
        }
        
        // Examples
        if (method.examples && method.examples.length > 0) {
            sections.push(`##### Examples`);
            sections.push(this.generateExamplesComponent(method.examples, ''));
        }
        
        return sections.join('\n');
    }

    generatePropertyComponentContent(prop) {
        const sections = [];
        
        const type = prop.type || 'any';
        sections.push(`<strong>Type:</strong> <code>${this.escapeHtml(type)}</code>`);
        
        if (prop.description) {
            sections.push(`${this.formatDescriptionForComponent(prop.description)}`);
        }
        
        if (prop.deprecated) {
            sections.push(`<Warning>
<strong>Deprecated:</strong> ${prop.deprecated}
</Warning>`);
        }
        
        if (prop.default !== undefined || prop.initializer) {
            sections.push(`<p><strong>Default:</strong> <code>${prop.default || prop.initializer}</code></p>`);
        }
        
        if (prop.since) {
            sections.push(`<p><strong>Since:</strong> v${prop.since}</p>`);
        }
        
        return sections.join('\n');
    }

    generateParamFieldComponent(param) {
        const required = param.optional ? 'false' : 'true';
        const typeStr = param.type ? ` type="${this.escapeHtml(param.type)}"` : '';
        const defaultStr = param.default ? ` default="${this.escapeHtml(param.default)}"` : '';
        
        return `<ParamField path="${this.escapeHtml(param.name)}"${typeStr} required={${required}}${defaultStr}>
${this.formatDescriptionForComponent(param.description || '')}
</ParamField>`;
    }

    generateExamplesComponent(examples, indent = '      ') {
        if (!examples || examples.length === 0) return '';
        
        const sections = [];
        
        // For single example without explicit caption, use simple format
        if (examples.length === 1 && !examples[0].caption) {
            const lang = this.detectLanguage(examples[0].code);
            const cleanedCode = this.cleanExample(examples[0].code);
            
            sections.push(`${indent}<CodeGroup>`);
            sections.push(`${indent}\`\`\`${lang}`);
            cleanedCode.split('\n').forEach(line => {
                sections.push(`${indent}${line}`);
            });
            sections.push(`${indent}\`\`\``);
            sections.push(`${indent}</CodeGroup>`);
            return sections.join('\n');
        }
        
        // For multiple examples or examples with captions, use tabs
        sections.push(`${indent}<Tabs>`);
        
        examples.forEach((ex, i) => {
            const title = ex.caption || `Example ${i + 1}`;
            const lang = this.detectLanguage(ex.code);
            const cleanedCode = this.cleanExample(ex.code);
            
            sections.push(`${indent}  <Tab title="${this.escapeHtml(title)}">`);
            sections.push(`${indent}  \`\`\`${lang}`);
            cleanedCode.split('\n').forEach(line => {
                sections.push(`${indent}  ${line}`);
            });
            sections.push(`${indent}  \`\`\``);
            sections.push(`${indent}  </Tab>`);
        });
        
        sections.push(`${indent}</Tabs>`);
        return sections.join('\n');
    }

    generateHookSignature(hookData) {
        const params = hookData.params ? 
            hookData.params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type || 'any'}`).join(', ') : '';
        const returnType = hookData.returns ? hookData.returns.type : 'void';
        
        return `function ${hookData.name}(${params}): ${returnType}`;
    }

    generateArchitectureSteps() {
        return `<Steps>
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
</Steps>`;
    }

    generateCorePatternsTabs() {
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

    generateReactPatternsTabs() {
        return `<Tabs>
  <Tab title="Basic Setup">
    Wrap your app with MultisynqRoot to enable Multisynq features:
    
    \`\`\`jsx
    import { MultisynqRoot } from '@multisynq/react';
    
    function App() {
      return (
        <MultisynqRoot
          sessionParams={{
            apiKey: process.env.REACT_APP_MULTISYNQ_API_KEY,
            appId: process.env.REACT_APP_MULTISYNQ_APP_ID,
            name: 'my-session',
            password: 'secret',
            model: MyRootModel
          }}
        >
          <MyComponent />
        </MultisynqRoot>
      );
    }
    \`\`\`
  </Tab>
  <Tab title="Using Hooks">
    Access Multisynq features through React hooks:
    
    \`\`\`jsx
    import { useReactModelRoot, usePublish, useSubscribe } from '@multisynq/react';
    
    function Counter() {
      const model = useReactModelRoot();
      const increment = usePublish(() => [model.id, 'increment']);
      
      useSubscribe(model.id, 'count-changed', (count) => {
        console.log('Count is now:', count);
      });
      
      return (
        <div>
          <p>Count: {model.count}</p>
          <button onClick={increment}>Increment</button>
        </div>
      );
    }
    \`\`\`
  </Tab>
  <Tab title="Managing Sessions">
    Dynamically change sessions using hooks:
    
    \`\`\`jsx
    import { useSetSession, useSessionParams } from '@multisynq/react';
    
    function SessionManager() {
      const setSession = useSetSession();
      const params = useSessionParams();
      
      const switchSession = (name) => {
        setSession({ name, password: 'new-password' });
      };
      
      return (
        <div>
          <p>Current session: {params.name}</p>
          <button onClick={() => switchSession('new-session')}>
            Switch Session
          </button>
        </div>
      );
    }
    \`\`\`
  </Tab>
  <Tab title="Tracking Connected Users">
    Display information about connected users:
    
    \`\`\`jsx
    import { useJoinedViews, useViewId } from '@multisynq/react';
    
    function UserList() {
      const { viewIds, viewCount } = useJoinedViews();
      const myViewId = useViewId();
      
      return (
        <div>
          <p>Connected users: {viewCount}</p>
          <ul>
            {viewIds.map(id => (
              <li key={id}>
                {id === myViewId ? 'You' : 'User'} ({id})
              </li>
            ))}
          </ul>
        </div>
      );
    }
    \`\`\`
  </Tab>
</Tabs>`;
    }

    formatDescriptionForComponent(description) {
        if (!description) return '';
        
        let formatted = description;
        
        // First, handle code blocks (triple backticks or indented blocks)
        // Protect code blocks from further processing
        const codeBlocks = [];
        let codeBlockIndex = 0;
        
        // Handle triple backtick code blocks
        formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
            const placeholder = `§§CODEBLOCK${codeBlockIndex++}§§`;
            codeBlocks.push(`<pre><code>${this.escapeHtml(code.trim())}</code></pre>`);
            return placeholder;
        });
        
        // Handle indented code blocks (4 spaces or tab)
        formatted = formatted.replace(/(?:^|\n)((?:    |\t)[^\n]*(?:\n(?:    |\t)[^\n]*)*)/g, (match, code) => {
            const placeholder = `§§CODEBLOCK${codeBlockIndex++}§§`;
            const cleanCode = code.split('\n').map(line => line.replace(/^(    |\t)/, '')).join('\n');
            codeBlocks.push(`<pre><code>${this.escapeHtml(cleanCode.trim())}</code></pre>`);
            return placeholder;
        });
        
        // Handle tutorial links BEFORE any other formatting to preserve underscores
        // Handle [text]{@tutorial name} format
        formatted = formatted.replace(/\[([^\]]+)\]\{@tutorial\s+([^}]+)\}/g, (match, text, tutorialName) => {
            // Keep underscores in tutorial names, just escape HTML
            return `<a href="/tutorials/${this.escapeHtml(tutorialName)}">${this.escapeHtml(text)}</a>`;
        });
        
        // Handle standalone {@tutorial} tags
        formatted = formatted.replace(/\{@tutorial\s+([^}]+)\}/g, (match, tutorialName) => {
            return `<em>tutorial: ${this.escapeHtml(tutorialName)}</em>`;
        });
        
        // Handle [text]{@link target} format FIRST to prevent double processing
        formatted = formatted.replace(/\[([^\]]+)\]\{@link\s+([^}]+)\}/g, (match, text, target) => {
            if (target.startsWith('http')) {
                return `§§LINK§§${target}§§TEXT§§${text}§§LINK§§`;
            }
            const cleanTarget = target.replace(/[#.]/g, '').toLowerCase();
            return `§§LINK§§#${cleanTarget}§§TEXT§§${text}§§LINK§§`;
        });
        
        // Handle {@link} tags
        formatted = formatted.replace(/\{@link\s+([^}]+)\}/g, (match, content) => {
            const parts = content.split(/\s+/);
            const target = parts[0];
            const text = parts.slice(1).join(' ') || target;
            
            if (target.startsWith('http')) {
                return `<a href="${target}">${this.escapeHtml(text)}</a>`;
            }
            
            // Handle internal links
            const cleanTarget = target.replace(/[#.]/g, '').toLowerCase();
            return `<a href="#${cleanTarget}">${this.escapeHtml(text)}</a>`;
        });
        
        // Handle bold before italic to avoid conflicts (avoid touching our placeholders)
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        // Handle italic - be careful with underscores in words
        formatted = formatted.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        // Only match underscores that are word boundaries and not part of URLs or code
        formatted = formatted.replace(/(?<![\/\w])_([^_\n]+?)_(?![\/\w])/g, '<em>$1</em>');
        
        // Handle inline code (but not inside code blocks)
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle line breaks
        formatted = formatted.replace(/<br\s*\/?>/g, '<br />');
        
        // Handle headers
        formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            formatted = formatted.replace(`§§CODEBLOCK${index}§§`, block);
        });
        
        // Restore links after all other processing
        formatted = formatted.replace(/§§LINK§§([^§]+)§§TEXT§§([^§]+)§§LINK§§/g, (match, href, text) => {
            return `<a href="${href}">${this.escapeHtml(text)}</a>`;
        });
        
        // Handle multi-line formatting - split into paragraphs
        const lines = formatted.split('\n');
        const paragraphs = [];
        let currentParagraph = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Check if this is a block element
            if (trimmedLine.startsWith('<pre>') || 
                trimmedLine.startsWith('<h1>') || 
                trimmedLine.startsWith('<h2>') || 
                trimmedLine.startsWith('<h3>') ||
                trimmedLine.startsWith('<ul>') ||
                trimmedLine.startsWith('<ol>')) {
                // Flush current paragraph
                if (currentParagraph.length > 0) {
                    paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`);
                    currentParagraph = [];
                }
                paragraphs.push(trimmedLine);
            } else if (trimmedLine === '') {
                // Empty line signals end of paragraph
                if (currentParagraph.length > 0) {
                    paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`);
                    currentParagraph = [];
                }
            } else {
                // Add to current paragraph
                currentParagraph.push(trimmedLine);
            }
        }
        
        // Don't forget the last paragraph
        if (currentParagraph.length > 0) {
            paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`);
        }
        
        return paragraphs.filter(p => p !== '<p></p>').join('\n        ');
    }

    formatEventDetails(event) {
        // Parse event format: "scope:event-name" or just "event-name"
        const parts = event.split(':');
        if (parts.length === 2) {
            return `<li><strong>${parts[1]}</strong> (scope: <code>${parts[0]}</code>)</li>`;
        }
        return `<li><strong>${event}</strong></li>`;
    }

    formatSeeAlso(see) {
        if (see.startsWith('http')) {
            return `<a href="${see}">${see}</a>`;
        }
        
        // Check if it's a link to another item
        const linkMatch = see.match(/^(\w+)(?:[#.](\w+))?$/);
        if (linkMatch) {
            const [, className, memberName] = linkMatch;
            const href = `#${className.toLowerCase()}${memberName ? '-' + memberName.toLowerCase() : ''}`;
            return `<a href="${href}">${see}</a>`;
        }
        
        return see;
    }

    detectLanguage(code) {
        // Simple language detection
        if (code.includes('import React') || code.includes('jsx') || code.includes('useState')) {
            return 'jsx';
        } else if (code.includes(': ') && (code.includes('interface') || code.includes('type '))) {
            return 'typescript';
        }
        return 'javascript';
    }

    getSignatureParamsFromParams(jsdocParams = []) {
        const seen = new Set();
        const parts = [];
        for (const p of jsdocParams) {
            const root = String(p.name || '').split('.')[0];
            if (!root) continue;
            if (seen.has(root)) continue;
            seen.add(root);
            const typePart = p.type ? `: ${p.type}` : '';
            parts.push(`${root}${p.optional ? '?' : ''}${typePart}`);
        }
        return parts.join(', ');
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

    cleanExample(code) {
        if (!code) return '';
        
        // Remove JSDoc comment wrapper if present
        code = code.replace(/^\/\*\*?\s*|\s*\*\/$/g, '');
        
        // Split into lines
        const lines = code.split('\n');
        
        // Remove leading/trailing empty lines
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        
        // Find minimum indentation (excluding empty lines)
        let minIndent = Infinity;
        lines.forEach(line => {
            if (line.trim()) {
                const match = line.match(/^(\s*)/);
                if (match) {
                    minIndent = Math.min(minIndent, match[1].length);
                }
            }
        });
        
        // If minIndent is Infinity (no non-empty lines), set it to 0
        if (minIndent === Infinity) {
            minIndent = 0;
        }
        
        // Remove common leading whitespace and asterisks
        const cleaned = lines.map(line => {
            if (line.trim()) {
                // Remove common indentation
                let cleanLine = line.substring(minIndent);
                // Remove leading asterisk from JSDoc comments
                cleanLine = cleanLine.replace(/^\s*\*\s?/, '');
                return cleanLine;
            }
            return '';
        });
        
        return cleaned.join('\n').trim();
    }
}

// Navigation updater
class NavigationUpdater {
    constructor(docsJsonPath) {
        this.docsJsonPath = docsJsonPath;
    }

    async updateNavigation(packageConfig, generatedFiles) {
        const docsJson = await fs.readJson(this.docsJsonPath);
        
        // Find or create Packages tab
        let packagesTab = docsJson.navigation.tabs.find(tab => tab.tab === 'Packages');
        if (!packagesTab) {
            packagesTab = {
                tab: 'Packages',
                groups: []
            };
            docsJson.navigation.tabs.push(packagesTab);
        }
        
        // Find or create package group
        let packageGroup = packagesTab.groups.find(g => g.group === packageConfig.displayName);
        if (!packageGroup) {
            packageGroup = {
                group: packageConfig.displayName,
                pages: []
            };
            packagesTab.groups.push(packageGroup);
        }
        
        // Update with single index page
        packageGroup.pages = [packageConfig.outputPath + '/index'];
        
        // Update redirects
        this.updateRedirects(docsJson, packageConfig);
        
        // Write back
        await fs.writeJson(this.docsJsonPath, docsJson, { spaces: 2 });
        
        console.log('✅ Updated navigation in docs.json');
    }

    updateRedirects(docsJson, packageConfig) {
        if (!docsJson.redirects) {
            docsJson.redirects = [];
        }
        
        // Create a set of existing sources for deduplication
        const existingSources = new Set(docsJson.redirects.map(r => r.source));
        
        // Remove old redirects for this package
        docsJson.redirects = docsJson.redirects.filter(r => 
            !r.destination.startsWith(`/${packageConfig.outputPath}`)
        );
        
        // Add new redirects based on package
        const newRedirects = [];
        
        if (packageConfig.name === '@multisynq/client') {
            // Legacy redirects for core API with anchors
            const coreClasses = ['Model', 'View', 'Session', 'Data'];
            coreClasses.forEach(cls => {
                // Base HTML page
                const htmlSource = `/client/${cls}.html`;
                if (!existingSources.has(htmlSource)) {
                    newRedirects.push({ source: htmlSource, destination: `/${packageConfig.outputPath}/index#${cls.toLowerCase()}` });
                }
                // Common anchors
                const anchors = ['members', 'methods', 'events', 'props', 'properties'];
                anchors.forEach(a => {
                    const src = `/client/${cls}.html#${a}`;
                    if (!existingSources.has(src)) {
                        // map to an approximate section within our single page
                        const destAnchor = a === 'members' ? `${cls.toLowerCase()}` : `${cls.toLowerCase()}`;
                        newRedirects.push({ source: src, destination: `/${packageConfig.outputPath}/index#${destAnchor}` });
                    }
                });
                // Specific anchors we know
                if (cls === 'View') {
                    const src = `/client/View.html#viewId`;
                    if (!existingSources.has(src)) {
                        newRedirects.push({ source: src, destination: `/${packageConfig.outputPath}/index#view` });
                    }
                }
            });
        }
        
        // Add general redirect for the package
        const packageSource = `/api-reference/${packageConfig.name.split('/')[1]}`;
        if (!existingSources.has(packageSource)) {
            newRedirects.push({
                source: packageSource,
                destination: `/${packageConfig.outputPath}/index`
            });
        }
        
        // Add all new redirects
        docsJson.redirects.push(...newRedirects);
        
        // Final deduplication based on source
        const uniqueRedirects = new Map();
        docsJson.redirects.forEach(redirect => {
            uniqueRedirects.set(redirect.source, redirect);
        });
        docsJson.redirects = Array.from(uniqueRedirects.values());
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    // Parse arguments
    let packageName = 'client'; // default
    let updateNav = true;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--package' || args[i] === '-p') {
            packageName = args[++i];
        } else if (args[i] === '--no-nav') {
            updateNav = false;
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
Usage: generate-api-docs-v5.mjs [options]

Options:
  --package, -p <name>  Package to generate docs for (client, react)
  --no-nav              Skip navigation update
  --help, -h            Show this help message

Examples:
  # Generate client API docs
  node generate-api-docs-v5.mjs --package client
  
  # Generate React API docs without updating navigation
  node generate-api-docs-v5.mjs --package react --no-nav
`);
            process.exit(0);
        }
    }
    
    // Get package config
    const config = PACKAGE_CONFIGS[packageName];
    if (!config) {
        console.error(`❌ Unknown package: ${packageName}`);
        console.error(`Available packages: ${Object.keys(PACKAGE_CONFIGS).join(', ')}`);
        process.exit(1);
    }
    
    console.log(`🚀 Starting documentation generation for ${config.name}...`);
    
    // Collect source files
    const sourceFiles = [];
    for (const sourcePath of config.sourcePaths) {
        const fullPath = path.join(__dirname, sourcePath);
        if (await fs.pathExists(fullPath)) {
            for (const pattern of config.filePatterns) {
                const files = globSync(pattern, { 
                    cwd: fullPath,
                    absolute: true
                });
                sourceFiles.push(...files);
            }
        }
    }
    
    console.log(`📊 Found ${sourceFiles.length} source files`);
    
    // Parse files
    const parser = new EnhancedJSDocParser(config);
    const docs = await parser.parseFiles(sourceFiles);

    // Resolve simple alias entries (e.g., const useIsTogether = useIsJoined)
    (function resolveAliases(d) {
        const indexByName = new Map();
        d.hooks.forEach(h => indexByName.set(h.name, { ...h, __kind: 'hook' }));
        d.functions.forEach(f => indexByName.set(f.name, { ...f, __kind: 'function' }));
        function materialize(list) {
            return list.map(item => {
                if (item.aliasOf && indexByName.has(item.aliasOf)) {
                    const target = indexByName.get(item.aliasOf);
                    const merged = { ...target, name: item.name, isAlias: true, aliasOf: item.aliasOf };
                    delete merged.__kind;
                    return merged;
                }
                return item;
            });
        }
        d.hooks = materialize(d.hooks);
        d.functions = materialize(d.functions);
    })(docs);
    
    console.log(`📊 Extracted:
  - ${docs.classes.length} classes
  - ${docs.interfaces.length} interfaces  
  - ${docs.functions.length} functions
  - ${docs.hooks.length} hooks
  - ${docs.components.length} components
  - ${docs.types.length} type aliases
  - ${docs.enums.length} enums`);
    
    // Generate MDX files with import structure
    const generator = new EnhancedMDXGenerator(config);
    const generatedFiles = generator.generatePackageStructure(docs);
    
    // Update navigation
    if (updateNav) {
        const docsJsonPath = path.join(__dirname, '../docs.json');
        if (await fs.pathExists(docsJsonPath)) {
            const navUpdater = new NavigationUpdater(docsJsonPath);
            await navUpdater.updateNavigation(config, generatedFiles);
        }
    }
    
    console.log(`
✨ Documentation generation complete!
📁 Output: ${config.outputPath}
📄 Generated ${generatedFiles.length + 1} files (${generatedFiles.length} components + index.mdx)
`);
}

// Run
main().catch(console.error); 