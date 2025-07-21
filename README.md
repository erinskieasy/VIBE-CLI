
# EsayVibeCli

A Node.js CLI tool that allows developers to connect their local frontend projects to the Component Hub platform and download prebuilt component code snippets.

## Installation

Install globally via npm:

```bash
npm install -g easyvibecli
```

## Quick Start

1. **Initialize your project configuration:**
```bash
vibe init
```

This creates a `.vibecode.json` file with your platform settings:
- Platform URL (default: https://app--component-hub-01919f93.base44.app)
- Project ID
- Access Key
- Output format (react-tailwind, react-css, vue-tailwind, angular-css)

2. **Download components:**
```bash
vibe pull Button
vibe pull Card
vibe pull Modal
vibe pull Input
```

Components are saved to `src/components/` with metadata comments.

## Commands

### `vibe init`
Creates a `.vibecode.json` configuration file in your current directory through an interactive setup process.

### `vibe connect --key <accessKey>`
Quick connect using an access key with default settings. This bypasses the interactive setup and creates a configuration file automatically.

**Example:**
```bash
vibe connect --key vibe_key_EqakZClOGwimmA382s25qayxAJ5XfxC8
```

### `vibe pull <component-name>`
Downloads a specific component from the platform and saves it locally.

**Examples:**
```bash
vibe pull Button
vibe pull NavBar
vibe pull LoginForm
```

### `vibe pull-all`
Downloads all available components from the platform in one command.

### `vibe debug-project [project-id]`
Debug utility to inspect project component links and show available projects. If no project ID is provided, lists all available projects.

**Examples:**
```bash
vibe debug-project                    # List all projects
vibe debug-project second-qksmk5      # Debug specific project
```

## Configuration

The `.vibecode.json` file contains:
```json
{
  "platform": "https://app--component-hub-01919f93.base44.app",
  "projectId": "your-project-id",
  "accessKey": "your-access-key",
  "output": "react-tailwind"
}
```

## Generated Components

Components are saved with metadata headers:
```tsx
// vibe-source: https://app--component-hub-01919f93.base44.app/components/Button
// version: 1.0.0

export const Button = () => <button className="bg-blue-500 text-white py-2 px-4 rounded">Click Me</button>;
```

## Error Handling

- Missing configuration: Run `vibe init` first
- Invalid component: Check available components with debug commands
- Network issues: Check your platform URL and access key
- Project linking issues: Use `vibe debug-project` to troubleshoot

## Development

This CLI tool connects to the Base44-powered Component Hub platform. The structure is designed for scalability and easy integration with live APIs.

### Project Structure
```
vibe-cli/
├── bin/vibe.js          # Main CLI entry point
├── lib/
│   ├── init.js          # Handles vibe init
│   └── pull.js          # Handles vibe pull
├── utils/
│   └── api.js           # API communication layer
└── package.json
```

## License

MIT
