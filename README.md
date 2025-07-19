# Multisynq Documentation

Welcome to the official docs for Multisynq - the platform for building real-time collaborative applications.

## 🚀 Quick Start

Get started building collaborative applications in minutes:

1. **Get API Key**: Visit [multisynq.io/coder](https://multisynq.io/coder) for your free API key
2. **Choose Framework**: JavaScript/HTML or React
3. **Follow Guide**: Check our [Quickstart Guide](./quickstart.mdx)

## 📚 Documentation Structure

### Core Guides
- **[Getting Started](./index.mdx)** - Introduction to Multisynq
- **[Quickstart](./quickstart.mdx)** - Build your first app in 5 minutes
- **[Development Guide](./development.mdx)** - Local development setup

### Tutorials
Interactive tutorials with live examples:

#### Practical Tutorials
- **[Hello World](./tutorials/hello-world.mdx)** - Synchronized counter app
- **[Simple Animation](./tutorials/simple-animation.mdx)** - Real-time animations
- **[Multi-user Chat](./tutorials/multiuser-chat.mdx)** - Live chat application
- **[View Smoothing](./tutorials/view-smoothing.mdx)** - Smooth interpolation
- **[3D Animation](./tutorials/3d-animation.mdx)** - Three.js integration
- **[Multiblaster Game](./tutorials/multiblaster-game.mdx)** - Complete multiplayer game

#### Conceptual Tutorials
- **[Model-View-Synchronizer](./tutorials/model-view-synchronizer.mdx)** - Core architecture
- **[Events & Pub/Sub](./tutorials/events-pub-sub.mdx)** - Event system
- **[Snapshots](./tutorials/snapshots.mdx)** - State persistence
- **[Persistence](./tutorials/persistence.mdx)** - Data storage
- **[Simulation Time](./tutorials/sim-time-future.mdx)** - Time management
- **[Writing Models](./tutorials/writing-multisynq-model.mdx)** - Model patterns
- **[Writing Views](./tutorials/writing-multisynq-view.mdx)** - View patterns
- **[Writing Apps](./tutorials/writing-multisynq-app.mdx)** - Application structure
- **[Random Numbers](./tutorials/random.mdx)** - Deterministic randomness
- **[Data API](./tutorials/data-api.mdx)** - Large data handling

### Essential Concepts
- **[Synchronization](./essentials/sync.mdx)** - How real-time sync works
- **[Collaboration](./essentials/collaboration.mdx)** - Multi-user patterns
- **[Chat Systems](./essentials/chat.mdx)** - Real-time messaging
- **[Whiteboard Apps](./essentials/whiteboard.mdx)** - Collaborative drawing
- **[Conflict Resolution](./essentials/conflicts.mdx)** - Handling conflicts
- **[Scaling](./essentials/scaling.mdx)** - Performance optimization

### AI Development
- **[Vibe Coding](./essentials/vibe-coding.mdx)** - Train AI assistants with Multisynq

### React Together
Complete documentation for React-specific development:
- **[Getting Started](./react-together/getting-started.mdx)** - React setup
- **[Core Hooks](./react-together/hooks/)** - useStateTogether, useFunctionTogether
- **[Communication](./react-together/hooks/)** - useChat, useCursors
- **[Components](./react-together/components/)** - Pre-built React components
- **[Utilities](./react-together/utilities/)** - Helper functions

### API Reference
- **[Session API](./api-reference/session.mdx)** - Session management
- **[Model API](./api-reference/model.mdx)** - Model lifecycle and methods
- **[View API](./api-reference/view.mdx)** - View patterns and rendering

## 🛠️ Development

### Local Development
```bash
# Install Mintlify CLI
npm install -g mintlify

# Start dev server
mintlify dev

# Preview at http://localhost:3000
```

### Project Structure
```
docs/
├── index.mdx              # Homepage
├── quickstart.mdx         # Quick start guide
├── docs.json             # Navigation config
├── essentials/           # Core concepts
├── tutorials/            # Interactive tutorials
├── react-together/       # React-specific docs
├── api-reference/        # API documentation
├── images/              # Static assets
└── logo/                # Brand assets
```

### Writing Documentation

#### MDX Components
Use Mintlify's built-in components:

```mdx
<Card title="Feature" icon="rocket">
  Description of the feature
</Card>

<CodeGroup>
```bash npm
npm install react-together
```

```bash yarn
yarn add react-together
```
</CodeGroup>

<Tabs>
  <Tab title="JavaScript">
    Content for JS tab
  </Tab>
  <Tab title="React">
    Content for React tab
  </Tab>
</Tabs>

<Warning>
Important warning message
</Warning>

<Note>
Helpful note or tip
</Note>

#### Code Examples
- Always include working, complete examples
- Use CDN imports for standalone examples
- Include API key placeholders: `"your-api-key-here"`
- Test all code examples before publishing

#### Navigation
Update `docs.json` to add new pages:

```json
{
  "group": "New Section",
  "pages": [
    "path/to/new-page"
  ]
}
```

## 🎯 Best Practices

### Content Guidelines
1. **Accuracy**: All code examples must work with current Multisynq APIs
2. **Completeness**: Include all necessary imports and setup
3. **Clarity**: Explain concepts clearly with examples
4. **Consistency**: Follow established patterns and terminology

### Code Examples
1. Use realistic app IDs: `"com.example.myapp"`
2. Include error handling where appropriate
3. Show both minimal and complete examples
4. Test all examples in isolation

### API Documentation
1. Document all parameters and return values
2. Include practical usage examples
3. Note version compatibility
4. Cross-reference related methods

## 🤝 Contributing

### Making Changes
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `mintlify dev`
5. Submit a pull request

### Content Reviews
All content changes should be reviewed for:
- Technical accuracy
- Code example functionality
- Clarity and readability
- Consistency with existing docs

## 📞 Support

- **Community**: [Discord](https://discord.gg/multisynq)
- **GitHub**: [multisynq](https://github.com/multisynq)
- **Website**: [multisynq.io](https://multisynq.io)
- **API Keys**: [multisynq.io/coder](https://multisynq.io/coder)

## 📄 License

This documentation is part of the Multisynq platform. See individual repositories for license information.

---

**Built with ❤️ using [Mintlify](https://mintlify.com)**
