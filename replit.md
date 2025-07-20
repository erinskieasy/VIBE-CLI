# vibe-cli

## Overview

vibe-cli is a Node.js command-line interface tool designed to connect local frontend projects to the Component Hub platform. It enables developers to easily download and integrate prebuilt component code snippets into their projects. The tool has been fully implemented as a proof-of-concept with mocked API responses and is ready for use. The architecture is structured to support future integration with live APIs.

## Recent Changes (July 20, 2025)

✅ **Complete CLI Implementation**
- Built fully functional vibe-cli with `init` and `pull <component-name>` commands
- Fixed CommonJS compatibility issues with chalk, commander, and inquirer dependencies
- Implemented interactive configuration setup with `.vibecode.json`
- Created mock API with 4 components: Button, Card, Modal, Input
- Added comprehensive error handling and user feedback
- Generated complete documentation in README.md
- Successfully tested all functionality including component downloads and error scenarios

✅ **Tested Features**
- Configuration file creation and validation
- Component downloading with metadata headers
- Directory structure creation (`src/components/`)
- Error handling for missing config and invalid components
- CLI help system and version management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### CLI Architecture
The tool follows a modular Node.js CLI architecture built on top of the Commander.js framework:

- **Entry Point**: `bin/vibe.js` serves as the main CLI executable with command routing
- **Command Handlers**: Separate modules in `lib/` directory handle specific commands
- **Utilities**: Shared functionality and API interactions are abstracted into `utils/`
- **Configuration**: JSON-based configuration file (`.vibecode.json`) for project settings

### Technology Stack
- **Runtime**: Node.js with CommonJS modules (require/exports)
- **CLI Framework**: Commander.js for command parsing and routing
- **User Interaction**: Inquirer.js for interactive prompts
- **Output Styling**: Chalk for colored terminal output
- **File System**: Native Node.js fs and path modules

## Key Components

### 1. Command Router (`bin/vibe.js`)
- Main entry point registered as executable
- Defines available commands: `init` and `pull <component-name>`
- Global error handling and version management
- Uses Commander.js for argument parsing

### 2. Initialization Module (`lib/init.js`)
- Creates `.vibecode.json` configuration file
- Interactive setup with user prompts for:
  - Platform URL (default: mock endpoint)
  - Project ID
  - Authentication token
  - Output format preferences
- Handles existing configuration overwrite scenarios

### 3. Component Pulling Module (`lib/pull.js`)
- Downloads component code from the platform
- Validates configuration file existence and structure
- Creates local directory structure (`src/components/`)
- Adds metadata comments to downloaded components
- File naming and organization logic

### 4. Mock API Layer (`utils/api.js`)
- Simulates platform API responses with realistic delays
- Hardcoded component library including:
  - Button component
  - Card component
  - Modal component
  - Input component (partial implementation)
- Structured for easy replacement with actual HTTP requests

## Data Flow

### Configuration Flow
1. User runs `vibe init`
2. System checks for existing `.vibecode.json`
3. Interactive prompts collect configuration
4. JSON configuration file written to project root

### Component Download Flow
1. User runs `vibe pull <component-name>`
2. System validates `.vibecode.json` exists and is valid
3. Mock API fetches component data
4. Local directory structure created if needed
5. Component file written with metadata headers
6. Success confirmation displayed

## External Dependencies

### Production Dependencies
- **commander**: CLI framework for command parsing and help generation
- **inquirer**: Interactive command-line prompts for user input
- **chalk**: Terminal string styling for colored output

### Core Node.js Modules
- **fs**: File system operations for reading/writing configuration and components
- **path**: Cross-platform path manipulation

### Mock Integrations
- Component Hub platform API (currently mocked)
- Authentication system (token-based, currently mocked)

## Deployment Strategy

### Distribution
- Published as npm package for global installation
- Executable binary (`vibe`) available system-wide after installation
- Version management through package.json

### Configuration Management
- Project-level configuration via `.vibecode.json`
- No global configuration required
- Portable configuration that can be version-controlled

### File Organization
- Components downloaded to standard `src/components/` structure
- Metadata preservation through code comments
- Support for multiple output formats (configured during init)

### Future Integration Points
- HTTP client integration ready for live API replacement
- Authentication token system prepared for real platform integration
- Error handling structured for network-related failures
- Configuration schema ready for additional platform features