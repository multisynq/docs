# Multisynq Tutorial Repositories

This document lists external tutorial repositories that contain example applications and advanced tutorials for the Multisynq platform.

## Tutorial Repositories

### 1. Physics Fountain
- **Repository**: https://github.com/multisynq/physics-fountain
- **Description**: Interactive physics simulation with particle effects
- **Target Documentation**: `docs/examples/physics-fountain.mdx`
- **Content Type**: Real-time physics simulation example
- **Key Features**:
  - Particle physics simulation
  - Multi-user interaction
  - Real-time synchronization

### 2. Multiblaster Lobby
- **Repository**: https://github.com/multisynq/multiblaster-lobby
- **Description**: Multiplayer space game with lobby system
- **Target Documentation**: `docs/examples/multiblaster-lobby.mdx`
- **Content Type**: Complete multiplayer game with matchmaking
- **Key Features**:
  - Player lobbies and matchmaking
  - Real-time multiplayer gaming
  - Session management

### 3. Vibecoded Gallery
- **Repository**: https://github.com/multisynq/vibecoded-gallery
- **Description**: Collaborative art gallery and creation tool
- **Target Documentation**: `docs/examples/vibecoded-gallery.mdx`
- **Content Type**: Collaborative creative application
- **Key Features**:
  - Collaborative art creation
  - Real-time canvas synchronization
  - Gallery browsing and sharing

## Repository Structure

Each tutorial repository should contain:

- **README.md**: Comprehensive setup and usage instructions
- **src/**: Source code and examples
- **package.json**: Dependencies and build configuration
- **examples/**: Working example files
- **docs/**: Additional documentation (if applicable)

## Documentation Integration

These repositories are referenced in the automated syncing strategy for:

1. **Example extraction**: Pull working code examples
2. **Documentation generation**: Create MDX files from README content
3. **Asset syncing**: Include images, demos, and interactive content
4. **Tutorial validation**: Ensure examples work with current Multisynq versions

## Maintenance

- **Frequency**: Weekly checks for updates
- **Validation**: Automated testing of example applications
- **Documentation**: Sync with main docs repository as needed
- **Dependencies**: Monitor for outdated packages or breaking changes