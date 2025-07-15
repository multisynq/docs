#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class LLMSGenerator {
    constructor() {
        this.docsConfig = this.loadDocsConfig();
        this.projectRoot = process.cwd();
        this.content = [];
    }

    loadDocsConfig() {
        try {
            const configPath = path.join(process.cwd(), 'docs.json');
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('Error loading docs.json:', error.message);
            process.exit(1);
        }
    }

    async generateLLMSFile() {
        console.log('🚀 Generating llms.txt for Multisynq Documentation...');
        
        this.addHeader();
        await this.addDocumentationSections();
        this.addResourcesSection();
        this.addFooter();
        
        const llmsContent = this.content.join('\n');
        
        fs.writeFileSync('llms.txt', llmsContent, 'utf8');
        console.log('✅ llms.txt generated successfully!');
        
        // Also generate llms-full.txt with complete content
        await this.generateFullLLMSFile(llmsContent);
    }

    addHeader() {
        const { name, colors } = this.docsConfig;
        
        this.content.push(`# ${name || 'Multisynq Documentation'}`);
        this.content.push('');
        this.content.push('> Complete documentation for Multisynq - the platform for building real-time collaborative applications. Build multiplayer experiences with ease using our JavaScript SDK and React components.');
        this.content.push('');
    }

    async addDocumentationSections() {
        if (!this.docsConfig.navigation?.tabs) {
            console.warn('No navigation tabs found in docs.json');
            return;
        }

        for (const tab of this.docsConfig.navigation.tabs) {
            if (tab.groups) {
                this.content.push(`## ${tab.tab || 'Documentation'}`);
                this.content.push('');
                
                for (const group of tab.groups) {
                    if (group.pages && group.pages.length > 0) {
                        this.content.push(`### ${group.group}`);
                        
                        for (const page of group.pages) {
                            await this.addPageEntry(page, group.group);
                        }
                        this.content.push('');
                    }
                }
            }
        }
    }

    async addPageEntry(pageId, groupName) {
        try {
            // Handle different file extensions
            const possibleExtensions = ['.mdx', '.md'];
            let pageContent = null;
            let filePath = null;

            for (const ext of possibleExtensions) {
                const testPath = path.join(this.projectRoot, `${pageId}${ext}`);
                if (fs.existsSync(testPath)) {
                    filePath = testPath;
                    pageContent = fs.readFileSync(testPath, 'utf8');
                    break;
                }
            }

            if (!pageContent) {
                console.warn(`Page not found: ${pageId}`);
                this.content.push(`- [${pageId}](/${pageId}) - ${groupName} documentation`);
                return;
            }

            // Parse frontmatter to get title and description
            const parsed = matter(pageContent);
            const title = parsed.data.title || this.formatTitle(pageId);
            const description = parsed.data.description || 
                              this.extractFirstParagraph(parsed.content) ||
                              `${groupName} documentation`;

            this.content.push(`- [${title}](/${pageId}) - ${description}`);
            
        } catch (error) {
            console.warn(`Error processing page ${pageId}:`, error.message);
            this.content.push(`- [${pageId}](/${pageId}) - ${groupName} documentation`);
        }
    }

    formatTitle(pageId) {
        return pageId
            .split('/')
            .pop()
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    extractFirstParagraph(content) {
        // Remove MDX/JSX components and extract first meaningful paragraph
        const cleaned = content
            .replace(/<[^>]+>/g, '') // Remove HTML/JSX tags
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, '') // Remove inline code
            .replace(/^\s*#+\s.*$/gm, '') // Remove headers
            .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
            .split('\n')
            .filter(line => line.trim().length > 20) // Get meaningful lines
            .find(line => !line.includes('import ') && !line.startsWith('##'));

        return cleaned ? cleaned.trim().substring(0, 120) + (cleaned.length > 120 ? '...' : '') : null;
    }

    addResourcesSection() {
        this.content.push('## Resources');
        this.content.push('');
        
        // Add global navigation anchors if they exist
        if (this.docsConfig.navigation?.global?.anchors) {
            for (const anchor of this.docsConfig.navigation.global.anchors) {
                this.content.push(`- [${anchor.anchor}](${anchor.href}) - ${anchor.anchor} access`);
            }
        }
        
        // Add standard resources
        this.content.push('- [Repository](https://github.com/multisynq/multisynq) - Source code and examples');
        this.content.push('- [Package](https://www.npmjs.com/package/@multisynq/client) - NPM package');
        this.content.push('- [Support](https://discord.gg/multisynq) - Community support');
        this.content.push('');
    }

    addFooter() {
        this.content.push('## Additional Information');
        this.content.push('');
        this.content.push('This documentation is automatically updated and maintained. For the most current information, visit [docs.multisynq.io](https://docs.multisynq.io)');
        this.content.push('');
        this.content.push('Generated by automated llms.txt generator on ' + new Date().toISOString());
    }

    async generateFullLLMSFile(baseContent) {
        console.log('📝 Generating llms-full.txt with complete documentation content...');
        
        const fullContent = [baseContent];
        fullContent.push('\n---\n# COMPLETE DOCUMENTATION CONTENT\n');
        
        // Add full content of key documentation files
        const keyFiles = [
            'index.mdx',
            'quickstart.mdx',
            'api-reference/introduction.mdx',
            'api-reference/session.mdx',
            'api-reference/model.mdx',
            'api-reference/view.mdx'
        ];

        for (const file of keyFiles) {
            try {
                const filePath = path.join(this.projectRoot, file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const parsed = matter(content);
                    
                    fullContent.push(`\n## ${parsed.data.title || file}\n`);
                    fullContent.push(parsed.content);
                }
            } catch (error) {
                console.warn(`Error adding full content for ${file}:`, error.message);
            }
        }

        fs.writeFileSync('llms-full.txt', fullContent.join('\n'), 'utf8');
        console.log('✅ llms-full.txt generated successfully!');
    }
}

// Install gray-matter if not available
async function ensureDependencies() {
    try {
        require('gray-matter');
    } catch (error) {
        console.log('Installing gray-matter dependency...');
        const { execSync } = require('child_process');
        execSync('npm install gray-matter', { stdio: 'inherit' });
    }
}

async function main() {
    try {
        await ensureDependencies();
        const generator = new LLMSGenerator();
        await generator.generateLLMSFile();
        console.log('🎉 LLMS.txt generation complete!');
    } catch (error) {
        console.error('❌ Error generating llms.txt:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = LLMSGenerator;