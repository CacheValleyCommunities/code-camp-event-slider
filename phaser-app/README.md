# Event Slider Application

A procedural graphics event slider built with Phaser.js and WebSocket communication.

## Local Development

1. Clone this repository
2. Copy `.env.example` to `.env` and adjust values if needed
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. In a separate terminal, start the WebSocket server: `npm run websocket-server`

## Environment Variables

The application uses the following environment variables:

- `WS_SERVER_HOST`: Host for the WebSocket server (default: `0.0.0.0`)
- `WS_SERVER_PORT`: Port for the WebSocket server (default: `8081`)
- `WS_SERVER_PROTOCOL`: Protocol for WebSocket connections (default: `ws`)
- `VITE_WS_SERVER_URL`: Full WebSocket server URL (default: `ws://localhost:8081`)

## Docker Deployment

### Using Docker Compose

1. Ensure Docker and Docker Compose are installed on your system
2. Navigate to the project directory
3. Run: `docker-compose up -d`

This will build and start the application with the WebSocket server.

Access the application at: http://localhost:4173
WebSocket server will be available at: ws://localhost:8081

### Deploying with Coolify

This project is set up for deployment with Coolify. To deploy:

1. Push this repository to your Git provider (GitHub, GitLab, etc.)
2. In Coolify dashboard, create a new service
3. Select Docker Compose as the deployment type
4. Connect to your repository
5. Configure the environment variables:
   - `EXTERNAL_HOST`: Set this to your server's public IP or hostname
6. Deploy the application

## Production Build

To create a production build:

```bash
npm run build
```

The build will be available in the `dist` directory.
