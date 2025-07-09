/**
 * WebSocket Server for Event Slider Remote Control
 * 
 * Enhanced CLI interface with proper input handling
 * Install dependencies: npm install ws readline chalk
 * Run with: node websocket-server.js
 */

import { WebSocketServer } from 'ws';
import readline from 'readline';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

// Get configuration from environment variables with fallbacks
const host = process.env.WS_SERVER_HOST || '0.0.0.0';
const port = process.env.WS_SERVER_PORT || 8081;

// Create WebSocket server with no CORS restrictions
const wss = new WebSocketServer({
    host: host,
    port: port,
    // No CORS restrictions - accept connections from anywhere
    // WebSocket has no built-in CORS mechanism, but we ensure no additional restrictions
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for performance.
        threshold: 1024 // Size (in bytes) below which messages should not be compressed.
    }
});

// Store connected clients
const clients = new Set();

// Create readline interfahttps://ghost-ysw4g8kksgwsocsgcwo000w4.cachevalley.co/ce with proper handling
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('> ')
});

// Utility function to log without interfering with input
function logMessage(message) {
    // Clear current line and move cursor to beginning
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    // Print the message
    console.log(message);

    // Restore the prompt
    rl.prompt();
}

logMessage(chalk.green(`🔌 WebSocket server started on ${host}:${port}`));
logMessage(chalk.blue('📡 Ready to accept connections from any origin...'));
logMessage(chalk.yellow('💡 Type "help" for available commands'));

wss.on('connection', (ws) => {
    clients.add(ws);
    logMessage(chalk.green('✅ Client connected') + chalk.gray(` (${clients.size} total)`));

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'alert',
        action: 'show',
        args: {
            message: 'Remote control connected!',
            type: 'success'
        }
    }));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            // Handle heartbeat silently (don't log)
            if (message.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            } else {
                logMessage(chalk.cyan('📨 Received:') + ' ' + JSON.stringify(message));
            }

        } catch (error) {
            logMessage(chalk.red('❌ Failed to parse message:') + ' ' + error.message);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        logMessage(chalk.yellow('🔌 Client disconnected') + chalk.gray(` (${clients.size} remaining)`));
    });
});

// Function to send commands to all connected clients
function sendToAllClients(command) {
    if (clients.size === 0) {
        logMessage(chalk.red('❌ No clients connected'));
        return;
    }

    clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN = 1
            client.send(JSON.stringify(command));
        }
    });

    logMessage(chalk.green('📤 Sent:') + ' ' + JSON.stringify(command));
}

// Command handlers
const commands = {
    help: () => {
        logMessage(chalk.magenta(`
📋 Available Commands:
${chalk.cyan('Time Controls:')}
  time dawn          - Set time to dawn
  time noon          - Set time to noon  
  time sunset        - Set time to sunset
  time night         - Set time to night

${chalk.cyan('Weather Controls:')}
  weather clear      - Clear weather
  weather rain       - Start rain
  weather snow       - Start snow
  weather fog        - Start fog
  weather leaves     - Falling leaves
  weather force rain 0.8  - Force rain with intensity
  weather status     - Check weather status

${chalk.cyan('Environment Controls:')}
  environment features on   - Enable environmental features
  environment features off  - Disable environmental features
  environment regenerate    - Regenerate ground chunks
  birds spawn 3            - Spawn 3 birds
  birds flock              - Create bird flock
  birds clear              - Clear all birds
  trees density 0.5        - Set tree density (0-2)
  trees regenerate         - Regenerate tree chunks

${chalk.cyan('Scrolling Controls:')}
  scroll pause       - Pause scrolling
  scroll resume      - Resume scrolling
  scroll speed 2.0   - Set scroll speed

${chalk.cyan('Sponsor Controls:')}
  sponsor next       - Next sponsor
  sponsor pause      - Pause sponsors
  sponsor resume     - Resume sponsors
  sponsor retro on   - Enable retro filter
  sponsor retro off  - Disable retro filter

${chalk.cyan('Alert Controls:')}
  alert lunch        - Show lunch alert
  alert emergency    - Show emergency alert
  alert registration - Show registration alert
  alert parking      - Show parking alert
  alert awards       - Show awards alert

${chalk.cyan('Custom Alerts:')}
  custom "Your message here"           - Custom info alert
  custom "Your message here" success   - Custom success alert
  custom "Your message here" warning   - Custom warning alert
  custom "Your message here" error     - Custom error alert

${chalk.cyan('Video Controls:')}
  video youtube VIDEO_ID       - Show YouTube video popup
  video url https://...        - Show video from URL
  video close                  - Close video popup

${chalk.cyan('Audio Controls:')}
  audio youtube VIDEO_ID       - Play YouTube audio only
  audio url https://...        - Play audio from URL
  audio volume 0.5             - Set volume (0-1)
  audio volume-up              - Increase volume
  audio volume-down            - Decrease volume
  audio close                  - Close audio player

${chalk.cyan('Livestream Controls:')}
  stream youtube CHANNEL_ID    - Show YouTube livestream
  stream twitch CHANNEL_NAME   - Show Twitch livestream  
  stream close                 - Close livestream

${chalk.cyan('System Commands:')}
  status             - Get current status
  clients            - Show connected clients
  quit               - Exit server

${chalk.yellow('Examples:')}
  weather force rain 0.8
  scroll speed 1.5
  environment features off
  birds spawn 5
  trees density 0.3
  custom "Break time in 5 minutes!" warning
  video youtube dQw4w9WgXcQ
  audio volume 0.7
        `));
    },

    status: () => {
        sendToAllClients({ type: 'status', action: 'get' });
    },

    clients: () => {
        logMessage(chalk.blue(`📊 Connected clients: ${clients.size}`));
    },

    quit: () => {
        logMessage(chalk.yellow('👋 Shutting down server...'));
        process.exit(0);
    }
};

// Handle user input
rl.on('line', (input) => {
    const line = input.trim();

    if (!line) return;

    // Handle single-word commands
    if (commands[line]) {
        commands[line]();
        return;
    }

    const parts = line.split(' ');
    const type = parts[0];
    const action = parts[1];
    const value = parts[2];

    let command = {};

    switch (type) {
        case 'time':
            command = { type: 'time', action: 'set', args: { time: action } };
            break;
        case 'weather':
            if (action === 'status') {
                command = { type: 'weather', action: 'status' };
            } else if (action === 'force') {
                // weather force rain 0.8
                const weatherType = value;
                const intensity = parseFloat(parts[3]) || 0.5;
                command = {
                    type: 'weather',
                    action: 'force',
                    args: { type: weatherType, intensity: intensity }
                };
            } else {
                // weather rain, weather clear, etc.
                command = { type: 'weather', action: 'set', args: { type: action } };
            }
            break;
        case 'sponsor':
            if (action === 'retro') {
                command = { type: 'sponsor', action: 'retro', args: { enabled: value === 'on' } };
            } else {
                command = { type: 'sponsor', action: action };
            }
            break;
        case 'scroll':
            command = { type: 'scroll', action: action };
            if (action === 'speed') {
                const speed = parseFloat(value) || 1;
                command.args = { value: speed };
            }
            break;
        case 'environment':
            // Environment controls: environment features on/off, environment regenerate
            if (action === 'features') {
                const enabled = value === 'on';
                command = {
                    type: 'environment',
                    action: 'features',
                    args: { enabled: enabled }
                };
            } else if (action === 'regenerate') {
                command = { type: 'environment', action: 'regenerate' };
            } else {
                command = { type: 'environment', action: action };
            }
            break;
        case 'birds':
            // Bird controls: birds spawn, birds flock, birds clear
            if (action === 'spawn') {
                const count = parseInt(value) || 1;
                command = {
                    type: 'birds',
                    action: 'spawn',
                    args: { count: count }
                };
            } else {
                command = { type: 'birds', action: action };
            }
            break;
        case 'trees':
            // Tree controls: trees density 0.5, trees regenerate
            if (action === 'density') {
                const density = parseFloat(value) || 1;
                command = {
                    type: 'trees',
                    action: 'density',
                    args: { value: density }
                };
            } else {
                command = { type: 'trees', action: action };
            }
            break;
        case 'alert':
            command = { type: 'alert', action: 'preset', args: { preset: action } };
            break;
        case 'custom':
            // Handle custom alerts: custom "Your message here" [type]
            const message = parts.slice(1).join(' ').replace(/^"(.*)"$/, '$1'); // Remove quotes if present
            const alertType = parts[parts.length - 1];
            const validTypes = ['info', 'success', 'warning', 'error'];

            command = {
                type: 'alert',
                action: 'custom',
                args: {
                    message: message.replace(` ${alertType}`, '').trim(),
                    type: validTypes.includes(alertType) ? alertType : 'info'
                }
            };
            break;
        case 'video':
            // Handle video popups: video youtube VIDEO_ID or video url FULL_URL
            if (action === 'youtube') {
                const videoId = value;
                command = {
                    type: 'video',
                    action: 'youtube',
                    args: { videoId: videoId }
                };
            } else if (action === 'url') {
                const videoUrl = parts.slice(2).join(' ');
                command = {
                    type: 'video',
                    action: 'url',
                    args: { url: videoUrl }
                };
            } else if (action === 'close') {
                command = { type: 'video', action: 'close' };
            }
            break;
        case 'stream':
            // Handle livestream: stream youtube CHANNEL_ID or stream twitch CHANNEL_NAME
            if (action === 'youtube') {
                const channelId = value;
                command = {
                    type: 'stream',
                    action: 'youtube',
                    args: { channelId: channelId }
                };
            } else if (action === 'twitch') {
                const channelName = value;
                command = {
                    type: 'stream',
                    action: 'twitch',
                    args: { channel: channelName }
                };
            } else if (action === 'close') {
                command = { type: 'stream', action: 'close' };
            }
            break;
        case 'audio':
            // Handle audio commands: audio youtube VIDEO_ID, audio url URL, audio volume LEVEL
            if (action === 'youtube') {
                const videoId = value;
                command = {
                    type: 'audio',
                    action: 'youtube-audio',
                    args: { videoId: videoId }
                };
            } else if (action === 'url') {
                const audioUrl = parts.slice(2).join(' ');
                command = {
                    type: 'audio',
                    action: 'url-audio',
                    args: { url: audioUrl }
                };
            } else if (action === 'volume') {
                const volumeLevel = parseFloat(value);
                if (!isNaN(volumeLevel)) {
                    command = {
                        type: 'audio',
                        action: 'volume',
                        args: { level: volumeLevel }
                    };
                }
            } else if (action === 'volume-up') {
                command = { type: 'audio', action: 'volume-up' };
            } else if (action === 'volume-down') {
                command = { type: 'audio', action: 'volume-down' };
            } else if (action === 'close') {
                command = { type: 'audio', action: 'close' };
            }
            break;
        default:
            logMessage(chalk.red('❌ Unknown command. Type "help" for available commands.'));
            return;
    }

    sendToAllClients(command);
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
    logMessage(chalk.yellow('\n👋 Shutting down server...'));
    process.exit(0);
});

// Handle errors
wss.on('error', (error) => {
    logMessage(chalk.red('❌ WebSocket server error:') + ' ' + error.message);
});

// Start the CLI
rl.prompt();
