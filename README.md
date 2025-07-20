# vibe-cli

A Node.js CLI tool that allows developers to connect their local frontend projects to the Component Hub platform and download prebuilt component code snippets.

## Installation

Install globally via npm:

```bash
npm install -g vibe-cli
```

## Quick Start

1. **Initialize your project configuration:**
```bash
vibe init
```

This creates a `.vibecode.json` file with your platform settings:
- Platform URL (default: https://mock.vibeplatform.dev)
- Project ID
- Authentication token
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
Creates a `.vibecode.json` configuration file in your current directory.

### `vibe pull <component-name>`
Downloads a component from the platform and saves it locally.

**Available components:**
- Button - Interactive button component
- Card - Content container with shadow
- Modal - Overlay dialog component  
- Input - Form input field with label

## Configuration

The `.vibecode.json` file contains:
```json
{
  "platformUrl": "https://mock.vibeplatform.dev",
  "projectId": "your-project-id",
  "token": "your-auth-token",
  "outputFormat": "react-tailwind"
}
```

## Generated Components

Components are saved with metadata headers:
```tsx
// vibe-source: https://mock.vibeplatform.dev/components/Button
// version: 1.0.0

export const Button = () => <button className="bg-blue-500 text-white py-2 px-4 rounded">Click Me</button>;
```

## Error Handling

- Missing configuration: Run `vibe init` first
- Invalid component: Available components are Button, Card, Modal, Input
- Network issues: Check your platform URL and authentication token

## Development

This is a proof-of-concept with mocked API responses. The structure is ready for integration with live APIs.

### Project Structure
```
vibe-cli/
├── bin/vibe.js          # Main CLI entry point
├── lib/
│   ├── init.js          # Handles vibe init
│   └── pull.js          # Handles vibe pull
├── utils/
│   └── api.js           # Mock API responses
└── package.json
```

## License

MIT
