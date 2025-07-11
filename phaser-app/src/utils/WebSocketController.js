/**
 * WebSocketController - Handles remote commands via WebSocket connection
 */
export default class WebSocketController {
    constructor(scene) {
        this.scene = scene;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.heartbeatInterval = null;

        // Get WebSocket server URL from environment variable or use default
        this.serverUrl = import.meta.env.VITE_WS_SERVER_URL || 'wss://websocket-server:8081';
        console.log(`📡 WebSocket server URL: ${this.serverUrl}`);

        this.connect();
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        try {
            console.log(`🔌 Attempting to connect to WebSocket server: ${this.serverUrl}`);
            this.socket = new WebSocket(this.serverUrl);

            this.socket.onopen = () => this.onOpen();
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onclose = (event) => this.onClose(event);
            this.socket.onerror = (error) => this.onError(error);

        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Handle connection open
     */
    onOpen() {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Send initial status
        this.sendStatus();

        // Start heartbeat
        this.startHeartbeat();

        // Show connection notification
        if (this.scene.uiGenerator) {
            this.scene.uiGenerator.updateAlert('WebSocket connected - Remote control active', 'success');
        }
    }

    /**
     * Handle incoming messages
     */
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📡 Received WebSocket command:', data);

            this.processCommand(data);

        } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
        }
    }

    /**
     * Handle connection close
     */
    onClose(event) {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();

        // Show disconnection notification
        if (this.scene.uiGenerator) {
            this.scene.uiGenerator.updateAlert('WebSocket disconnected', 'warning');
        }

        // Attempt to reconnect unless it was a clean close
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    }

    /**
     * Handle connection error
     */
    onError(error) {
        console.error('❌ WebSocket error:', error);
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);

        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);

        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping', timestamp: Date.now() });
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Process incoming command
     */
    processCommand(data) {
        const { type, action, args = {} } = data;

        try {
            switch (type) {
                case 'scroll':
                    this.handleScrollCommand(action, args);
                    break;

                case 'sponsor':
                    this.handleSponsorCommand(action, args);
                    break;

                case 'time':
                    this.handleTimeCommand(action, args);
                    break;

                case 'alert':
                    this.handleAlertCommand(action, args);
                    break;

                case 'video':
                    this.handleVideoCommand(action, args);
                    break;

                case 'audio':
                    this.handleAudioCommand(action, args);
                    break;

                case 'stream':
                    this.handleStreamCommand(action, args);
                    break;

                case 'debug':
                    this.handleDebugCommand(action, args);
                    break;

                case 'weather':
                    this.handleWeatherCommand(action, args);
                    break;

                case 'environment':
                    this.handleEnvironmentCommand(action, args);
                    break;

                case 'birds':
                    this.handleBirdsCommand(action, args);
                    break;

                case 'trees':
                    this.handleTreesCommand(action, args);
                    break;

                case 'status':
                    this.sendStatus();
                    break;

                case 'pong':
                    // Heartbeat response
                    break;

                default:
                    console.warn('❓ Unknown command type:', type);
                    this.sendResponse(data, { success: false, error: 'Unknown command type' });
            }

        } catch (error) {
            console.error('❌ Error processing command:', error);
            this.sendResponse(data, { success: false, error: error.message });
        }
    }

    /**
     * Handle scroll commands
     */
    handleScrollCommand(action, args) {
        switch (action) {
            case 'pause':
                this.scene.scrollSpeed = 0;
                this.sendResponse({ type: 'scroll', action }, { success: true, message: 'Scrolling paused' });
                break;

            case 'resume':
                this.scene.scrollSpeed = 1;
                this.sendResponse({ type: 'scroll', action }, { success: true, message: 'Scrolling resumed' });
                break;

            case 'speed':
                const speed = parseFloat(args.value || 1);
                this.scene.scrollSpeed = speed;
                this.sendResponse({ type: 'scroll', action }, { success: true, message: `Scroll speed set to ${speed}` });
                break;

            default:
                this.sendResponse({ type: 'scroll', action }, { success: false, error: 'Unknown scroll action' });
        }
    }

    /**
     * Handle sponsor commands
     */
    handleSponsorCommand(action, args) {
        const sponsor = this.scene.sponsorGenerator;
        if (!sponsor) {
            this.sendResponse({ type: 'sponsor', action }, { success: false, error: 'Sponsor system not available' });
            return;
        }

        switch (action) {
            case 'next':
                sponsor.hideSponsor();
                this.sendResponse({ type: 'sponsor', action }, { success: true, message: 'Skipping to next sponsor' });
                break;

            case 'pause':
                sponsor.pause();
                this.sendResponse({ type: 'sponsor', action }, { success: true, message: 'Sponsor rotation paused' });
                break;

            case 'resume':
                sponsor.resume();
                this.sendResponse({ type: 'sponsor', action }, { success: true, message: 'Sponsor rotation resumed' });
                break;

            case 'retro':
                const toggle = args.enabled;
                if (toggle === true) {
                    sponsor.enableRetroFilter();
                    this.sendResponse({ type: 'sponsor', action }, { success: true, message: 'Retro filter enabled' });
                } else if (toggle === false) {
                    sponsor.disableRetroFilter();
                    this.sendResponse({ type: 'sponsor', action }, { success: true, message: 'Retro filter disabled' });
                } else {
                    sponsor.toggleRetroFilter();
                    const status = sponsor.isRetroFilterEnabled() ? 'enabled' : 'disabled';
                    this.sendResponse({ type: 'sponsor', action }, { success: true, message: `Retro filter ${status}` });
                }
                break;

            case 'info':
                const currentSponsor = sponsor.getCurrentSponsor();
                const info = currentSponsor ?
                    { sponsor: currentSponsor.url, level: currentSponsor.level } :
                    { message: 'No active sponsor' };
                this.sendResponse({ type: 'sponsor', action }, { success: true, data: info });
                break;

            default:
                this.sendResponse({ type: 'sponsor', action }, { success: false, error: 'Unknown sponsor action' });
        }
    }

    /**
     * Handle time commands
     */
    handleTimeCommand(action, args) {
        const timeMap = {
            'night': 0.05,
            'dawn': 0.2,
            'morning': 0.4,
            'noon': 0.5,
            'afternoon': 0.7,
            'sunset': 0.82
        };

        if (action === 'set') {
            const timeName = args.time?.toLowerCase();
            const timeValue = args.value !== undefined ? args.value : timeMap[timeName];

            if (timeValue !== undefined) {
                this.scene.setTimeOfDay(timeValue);
                const displayName = timeName || `${(timeValue * 24).toFixed(1)} hours`;
                this.sendResponse({ type: 'time', action }, { success: true, message: `Time set to ${displayName}` });
            } else {
                this.sendResponse({ type: 'time', action }, {
                    success: false,
                    error: 'Invalid time. Available: ' + Object.keys(timeMap).join(', ') + ' or numeric value 0-1'
                });
            }
        } else {
            this.sendResponse({ type: 'time', action }, { success: false, error: 'Unknown time action' });
        }
    }

    /**
     * Handle alert commands
     */
    handleAlertCommand(action, args) {
        const ui = this.scene.uiGenerator;
        if (!ui) {
            this.sendResponse({ type: 'alert', action }, { success: false, error: 'UI system not available' });
            return;
        }

        switch (action) {
            case 'show':
                const message = args.message || 'Remote alert';
                const type = args.type || 'info';
                ui.updateAlert(message, type);
                this.sendResponse({ type: 'alert', action }, { success: true, message: `Alert sent: ${message}` });
                break;

            case 'custom':
                const customMessage = args.message || 'Remote alert';
                const customType = args.type || 'info';
                const blinking = customType === 'warning' || customType === 'error';
                ui.updateAlert(customMessage, customType, blinking);
                this.sendResponse({ type: 'alert', action }, { success: true, message: `Custom alert sent: ${customMessage}` });
                break;

            case 'preset':
                const presetName = args.preset;
                if (presetName) {
                    ui.showPresetAlert(presetName);
                    this.sendResponse({ type: 'alert', action }, { success: true, message: `Preset alert shown: ${presetName}` });
                } else {
                    this.sendResponse({ type: 'alert', action }, { success: false, error: 'Preset name required' });
                }
                break;

            default:
                this.sendResponse({ type: 'alert', action }, { success: false, error: 'Unknown alert action' });
        }
    }

    /**
     * Handle video commands
     */
    handleVideoCommand(action, args) {
        const ui = this.scene.uiGenerator;
        if (!ui) {
            this.sendResponse({ type: 'video', action }, { success: false, error: 'UI system not available' });
            return;
        }
        switch (action) {
            case 'youtube':
                if (args.videoId) {
                    ui.showVideoPopup({ type: 'youtube', videoId: args.videoId });
                    this.sendResponse({ type: 'video', action }, { success: true, message: `YouTube video popup: ${args.videoId}` });
                } else {
                    this.sendResponse({ type: 'video', action }, { success: false, error: 'Missing YouTube videoId' });
                }
                break;
            case 'url':
                if (args.url) {
                    ui.showVideoPopup({ type: 'url', url: args.url });
                    this.sendResponse({ type: 'video', action }, { success: true, message: `Video popup: ${args.url}` });
                } else {
                    this.sendResponse({ type: 'video', action }, { success: false, error: 'Missing video URL' });
                }
                break;
            case 'close':
                ui.closeVideoPopup && ui.closeVideoPopup();
                this.sendResponse({ type: 'video', action }, { success: true, message: 'Video popup closed' });
                break;
            default:
                this.sendResponse({ type: 'video', action }, { success: false, error: 'Unknown video action' });
        }
    }

    /**
     * Handle stream commands
     */
    handleStreamCommand(action, args) {
        const ui = this.scene.uiGenerator;
        if (!ui) {
            this.sendResponse({ type: 'stream', action }, { success: false, error: 'UI system not available' });
            return;
        }
        switch (action) {
            case 'youtube':
                if (args.channelId) {
                    ui.showLivestreamPopup({ type: 'youtube', channelId: args.channelId });
                    this.sendResponse({ type: 'stream', action }, { success: true, message: `YouTube livestream: ${args.channelId}` });
                } else {
                    this.sendResponse({ type: 'stream', action }, { success: false, error: 'Missing YouTube channelId' });
                }
                break;
            case 'twitch':
                if (args.channel) {
                    ui.showLivestreamPopup({ type: 'twitch', channel: args.channel });
                    this.sendResponse({ type: 'stream', action }, { success: true, message: `Twitch livestream: ${args.channel}` });
                } else {
                    this.sendResponse({ type: 'stream', action }, { success: false, error: 'Missing Twitch channel' });
                }
                break;
            case 'close':
                ui.closeLivestreamPopup && ui.closeLivestreamPopup();
                this.sendResponse({ type: 'stream', action }, { success: true, message: 'Livestream popup closed' });
                break;
            default:
                this.sendResponse({ type: 'stream', action }, { success: false, error: 'Unknown stream action' });
        }
    }

    /**
     * Handle audio commands
     */
    handleAudioCommand(action, args) {
        const ui = this.scene.uiGenerator;
        if (!ui) {
            this.sendResponse({ type: 'audio', action }, { success: false, error: 'UI system not available' });
            return;
        }

        switch (action) {
            case 'youtube-audio':
                if (args.videoId) {
                    ui.showAudioPopup({ type: 'youtube', videoId: args.videoId });
                    this.sendResponse({ type: 'audio', action }, { success: true, message: `YouTube audio: ${args.videoId}` });
                } else {
                    this.sendResponse({ type: 'audio', action }, { success: false, error: 'Missing YouTube videoId' });
                }
                break;

            case 'url-audio':
                if (args.url) {
                    ui.showAudioPopup({ type: 'url', url: args.url });
                    this.sendResponse({ type: 'audio', action }, { success: true, message: `Audio playing: ${args.url}` });
                } else {
                    this.sendResponse({ type: 'audio', action }, { success: false, error: 'Missing audio URL' });
                }
                break;

            case 'volume':
                const volume = parseFloat(args.level);
                if (!isNaN(volume) && volume >= 0 && volume <= 1) {
                    ui.setAudioVolume(volume);
                    this.sendResponse({ type: 'audio', action }, { success: true, message: `Volume set to: ${(volume * 100).toFixed(0)}%` });
                } else {
                    this.sendResponse({ type: 'audio', action }, { success: false, error: 'Invalid volume level (use 0-1)' });
                }
                break;

            case 'volume-up':
                console.log('WebSocket command: volume-up');
                ui.adjustAudioVolume(0.1); // Increase by 10%
                const newVolUp = ui.currentVolume || 0;
                this.sendResponse({ type: 'audio', action }, { success: true, message: `Volume increased to ${Math.round(newVolUp * 100)}%` });
                break;

            case 'volume-down':
                console.log('WebSocket command: volume-down');
                ui.adjustAudioVolume(-0.1); // Decrease by 10%
                const newVolDown = ui.currentVolume || 0;
                this.sendResponse({ type: 'audio', action }, { success: true, message: `Volume decreased to ${Math.round(newVolDown * 100)}%` });
                break;

            case 'close':
                ui.closeAudioPlayer && ui.closeAudioPlayer();
                this.sendResponse({ type: 'audio', action }, { success: true, message: 'Audio player closed' });
                break;

            default:
                this.sendResponse({ type: 'audio', action }, { success: false, error: 'Unknown audio action' });
        }
    }

    /**
     * Handle debug commands
     */
    handleDebugCommand(action, args) {
        switch (action) {
            case 'trees':
                this.scene.validateTreePositioning();
                this.sendResponse({ type: 'debug', action }, { success: true, message: 'Tree positioning validated (check console)' });
                break;

            case 'sponsors':
                const sponsor = this.scene.sponsorGenerator?.getCurrentSponsor();
                const sponsorInfo = sponsor ?
                    { sponsor: sponsor.url, level: sponsor.level } :
                    { message: 'No active sponsor' };
                this.sendResponse({ type: 'debug', action }, { success: true, data: sponsorInfo });
                break;

            case 'status':
                this.sendStatus();
                break;

            default:
                this.sendResponse({ type: 'debug', action }, { success: false, error: 'Unknown debug action' });
        }
    }

    /**
     * Handle weather commands
     */
    handleWeatherCommand(action, args) {
        const weather = this.scene.weatherGenerator;
        if (!weather) {
            this.sendResponse({ type: 'weather', action }, { success: false, error: 'Weather system not available' });
            return;
        }

        switch (action) {
            case 'set':
                const weatherType = args.type?.toLowerCase();
                if (!['clear', 'rain', 'snow', 'fog', 'leaves'].includes(weatherType)) {
                    this.sendResponse({ type: 'weather', action }, {
                        success: false,
                        error: 'Invalid weather type. Available: clear, rain, snow, fog, leaves'
                    });
                    return;
                }

                weather.setWeather(weatherType);
                this.sendResponse({ type: 'weather', action }, {
                    success: true,
                    message: `Weather set to ${weatherType}`
                });
                break;

            case 'force':
                const forceType = args.type?.toLowerCase();
                const intensity = args.intensity !== undefined ? parseFloat(args.intensity) : 0.5;

                if (!['clear', 'rain', 'snow', 'fog', 'leaves'].includes(forceType)) {
                    this.sendResponse({ type: 'weather', action }, {
                        success: false,
                        error: 'Invalid weather type. Available: clear, rain, snow, fog, leaves'
                    });
                    return;
                }

                if (intensity < 0 || intensity > 1) {
                    this.sendResponse({ type: 'weather', action }, {
                        success: false,
                        error: 'Intensity must be between 0 and 1'
                    });
                    return;
                }

                weather.forceWeather(forceType, intensity);
                this.sendResponse({ type: 'weather', action }, {
                    success: true,
                    message: `Weather forced to ${forceType} (intensity: ${intensity})`
                });
                break;

            case 'status':
                const status = weather.getWeatherStatus();
                this.sendResponse({ type: 'weather', action }, {
                    success: true,
                    data: status
                });
                break;

            default:
                this.sendResponse({ type: 'weather', action }, {
                    success: false,
                    error: 'Unknown weather action. Available: set, force, status'
                });
        }
    }

    /**
     * Handle environment commands
     */
    handleEnvironmentCommand(action, args) {
        switch (action) {
            case 'features':
                const enabled = args.enabled;
                this.scene.showEnvironmentalFeatures = enabled;
                this.sendResponse({ type: 'environment', action }, {
                    success: true,
                    message: `Environmental features ${enabled ? 'enabled' : 'disabled'}`
                });
                break;

            case 'regenerate':
                // Trigger ground regeneration
                if (this.scene.groundGenerator && this.scene.groundContainer) {
                    // Force regeneration by updating chunks
                    const result = this.scene.groundGenerator.updateGroundChunks(
                        this.scene.groundContainer,
                        this.scene.cameras.main.scrollX,
                        this.scene.cameras.main.width,
                        this.scene.cameras.main.height - 80,
                        60
                    );
                    this.sendResponse({ type: 'environment', action }, {
                        success: true,
                        message: `Environment regenerated (${result.chunksUpdated} chunks updated)`
                    });
                } else {
                    this.sendResponse({ type: 'environment', action }, {
                        success: false,
                        error: 'Ground system not available'
                    });
                }
                break;

            default:
                this.sendResponse({ type: 'environment', action }, {
                    success: false,
                    error: 'Unknown environment action. Available: features, regenerate'
                });
        }
    }

    /**
     * Handle birds commands
     */
    handleBirdsCommand(action, args) {
        const birdGenerator = this.scene.birdGenerator;
        if (!birdGenerator) {
            this.sendResponse({ type: 'birds', action }, { success: false, error: 'Bird system not available' });
            return;
        }

        switch (action) {
            case 'spawn':
                const count = args.count || 1;
                for (let i = 0; i < count; i++) {
                    this.scene.spawnRandomBird();
                }
                this.sendResponse({ type: 'birds', action }, {
                    success: true,
                    message: `Spawned ${count} bird(s)`
                });
                break;

            case 'flock':
                // Create a flock of birds
                for (let i = 0; i < 5; i++) {
                    this.scene.spawnRandomBird();
                }
                this.sendResponse({ type: 'birds', action }, {
                    success: true,
                    message: 'Bird flock created (5 birds)'
                });
                break;

            case 'clear':
                // Clear all birds
                if (this.scene.birds) {
                    this.scene.birds.clear(true, true);
                }
                this.sendResponse({ type: 'birds', action }, {
                    success: true,
                    message: 'All birds cleared'
                });
                break;

            default:
                this.sendResponse({ type: 'birds', action }, {
                    success: false,
                    error: 'Unknown birds action. Available: spawn, flock, clear'
                });
        }
    }

    /**
     * Handle trees commands
     */
    handleTreesCommand(action, args) {
        const treeGenerator = this.scene.treeGenerator;
        if (!treeGenerator) {
            this.sendResponse({ type: 'trees', action }, { success: false, error: 'Tree system not available' });
            return;
        }

        switch (action) {
            case 'density':
                const density = args.value || 1;
                // Set tree density (this would need to be implemented in TreeGenerator)
                if (treeGenerator.setDensity) {
                    treeGenerator.setDensity(density);
                    this.sendResponse({ type: 'trees', action }, {
                        success: true,
                        message: `Tree density set to ${density}`
                    });
                } else {
                    this.sendResponse({ type: 'trees', action }, {
                        success: false,
                        error: 'Tree density control not implemented'
                    });
                }
                break;

            case 'regenerate':
                // Regenerate tree chunks
                if (this.scene.updateTreeChunks) {
                    this.scene.updateTreeChunks();
                    this.sendResponse({ type: 'trees', action }, {
                        success: true,
                        message: 'Tree chunks regenerated'
                    });
                } else {
                    this.sendResponse({ type: 'trees', action }, {
                        success: false,
                        error: 'Tree regeneration not available'
                    });
                }
                break;

            default:
                this.sendResponse({ type: 'trees', action }, {
                    success: false,
                    error: 'Unknown trees action. Available: density, regenerate'
                });
        }
    }

    /**
     * Send response back to client
     */
    sendResponse(originalCommand, response) {
        this.send({
            type: 'response',
            command: originalCommand,
            ...response,
            timestamp: Date.now()
        });
    }

    /**
     * Send current status
     */
    sendStatus() {
        const status = {
            type: 'status',
            data: {
                connected: this.isConnected,
                scrollSpeed: this.scene.scrollSpeed,
                timeOfDay: this.scene.getTimeOfDay(),
                currentSponsor: this.scene.sponsorGenerator?.getCurrentSponsor(),
                retroFilter: this.scene.sponsorGenerator?.isRetroFilterEnabled(),
                timestamp: Date.now()
            }
        };

        this.send(status);
    }

    /**
     * Send message to server
     */
    send(data) {
        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
        }
    }

    /**
     * Set server URL
     */
    setServerUrl(url) {
        this.serverUrl = url;
        console.log('🔧 WebSocket server URL set to:', url);
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        this.stopHeartbeat();
        this.isConnected = false;
        console.log('🔌 WebSocket disconnected');
    }

    /**
     * Clean up
     */
    destroy() {
        this.disconnect();
    }
}
