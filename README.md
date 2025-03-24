# Home Assistant Scenes

This application converts shell commands into Home Assistant scenes that can be controlled via MQTT.

## Features

- Automatically discovers and publishes scenes to Home Assistant
- Executes shell commands when scenes are activated
- TypeScript support with ES modules
- Maintainable and extensible architecture

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your MQTT settings in `src/index.ts`

## Usage

Start the application:
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Adding New Scenes

To add new scenes, edit the `src/scenes.ts` file. Each scene should have:
- `name`: Unique identifier (snake_case)
- `friendly_name`: Display name in Home Assistant
- `command`: Shell command to execute
- `icon`: (Optional) Material Design Icon name

## Home Assistant Integration

The scenes will be automatically discovered by Home Assistant when the application is running. They will appear in your Home Assistant instance under the Scenes section. 