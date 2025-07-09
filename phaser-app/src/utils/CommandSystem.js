/**
 * CommandSystem - Handles chat-like commands for controlling the event slider
 */
export default class CommandSystem {
    constructor(scene) {
        this.scene = scene;
        this.commands = new Map();
        this.helpVisible = false;
        this.helpOverlay = null;
        this.commandInput = null;
        this.commandText = '';
        this.isInputActive = false;

        this.registerDefaultCommands();
        this.setupKeyboardInput();
    }

    /**
     * Register default commands
     */
    registerDefaultCommands() {
        // Scroll controls
        this.registerCommand('scroll', {
            description: 'Control scrolling: pause, resume, speed [number]',
            execute: (args) => {
                const action = args[0]?.toLowerCase();
                switch (action) {
                    case 'pause':
                        this.scene.scrollSpeed = 0;
                        return '⏸️ Scrolling paused';
                    case 'resume':
                        this.scene.scrollSpeed = 1;
                        return '▶️ Scrolling resumed';
                    case 'speed':
                        const speed = parseFloat(args[1]);
                        if (!isNaN(speed)) {
                            this.scene.scrollSpeed = speed;
                            return `🏃 Scroll speed set to ${speed}`;
                        }
                        return '❌ Invalid speed value';
                    default:
                        return '❌ Usage: /scroll pause|resume|speed [number]';
                }
            }
        });

        // Sponsor controls
        this.registerCommand('sponsor', {
            description: 'Control sponsors: next, pause, resume, retro [on|off]',
            execute: (args) => {
                const action = args[0]?.toLowerCase();
                const sponsor = this.scene.sponsorGenerator;
                if (!sponsor) return '❌ Sponsor system not available';

                switch (action) {
                    case 'next':
                        sponsor.hideSponsor();
                        return '⏭️ Skipping to next sponsor';
                    case 'pause':
                        sponsor.pause();
                        return '⏸️ Sponsor rotation paused';
                    case 'resume':
                        sponsor.resume();
                        return '▶️ Sponsor rotation resumed';
                    case 'retro':
                        const toggle = args[1]?.toLowerCase();
                        if (toggle === 'on') {
                            sponsor.enableRetroFilter();
                            return '📺 Retro filter enabled';
                        } else if (toggle === 'off') {
                            sponsor.disableRetroFilter();
                            return '📺 Retro filter disabled';
                        } else {
                            sponsor.toggleRetroFilter();
                            return `📺 Retro filter ${sponsor.isRetroFilterEnabled() ? 'enabled' : 'disabled'}`;
                        }
                    default:
                        return '❌ Usage: /sponsor next|pause|resume|retro [on|off]';
                }
            }
        });

        // Alert controls
        this.registerCommand('alert', {
            description: 'Send alerts: [type] [message] or preset [name]',
            execute: (args) => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                // Handle both array args from CLI and object args from API
                if (Array.isArray(args)) {
                    if (args[0] === 'preset') {
                        const presetName = args[1];
                        ui.showPresetAlert(presetName);
                        return `🚨 Showing preset alert: ${presetName}`;
                    } else {
                        const type = args[0] || 'info';
                        const message = args.slice(1).join(' ') || 'Test alert';
                        ui.updateAlert(message, type);
                        return `🚨 Alert sent: ${message}`;
                    }
                } else if (args && typeof args === 'object') {
                    // Called from API with object
                    if (args.preset) {
                        ui.showPresetAlert(args.preset);
                        return `🚨 Showing preset alert: ${args.preset}`;
                    } else {
                        const message = args.message || 'Test alert';
                        const type = args.type || 'info';
                        ui.updateAlert(message, type);
                        return `🚨 Alert sent: ${message}`;
                    }
                } else {
                    return '❌ Invalid alert arguments';
                }
            }
        });

        // Time controls
        this.registerCommand('time', {
            description: 'Set time of day: night, dawn, morning, noon, afternoon, sunset',
            execute: (args) => {
                const timeMap = {
                    'night': 0.05,
                    'dawn': 0.2,
                    'morning': 0.4,
                    'noon': 0.5,
                    'afternoon': 0.7,
                    'sunset': 0.82
                };

                const timeName = args[0]?.toLowerCase();
                const timeValue = timeMap[timeName];

                if (timeValue !== undefined) {
                    this.scene.setTimeOfDay(timeValue);
                    return `🌅 Time set to ${timeName}`;
                } else {
                    return `❌ Available times: ${Object.keys(timeMap).join(', ')}`;
                }
            }
        });

        // Debug commands
        this.registerCommand('debug', {
            description: 'Debug commands: trees, sponsors, ui',
            execute: (args) => {
                const target = args[0]?.toLowerCase();
                switch (target) {
                    case 'trees':
                        this.scene.validateTreePositioning();
                        return '🌲 Tree positioning validated (check console)';
                    case 'sponsors':
                        const sponsor = this.scene.sponsorGenerator?.getCurrentSponsor();
                        if (sponsor) {
                            return `🏢 Current sponsor: ${sponsor.url} (Level ${sponsor.level})`;
                        }
                        return '🏢 No active sponsor';
                    case 'ui':
                        return '🎨 UI elements active';
                    default:
                        return '❌ Usage: /debug trees|sponsors|ui';
                }
            }
        });

        // Clear command
        this.registerCommand('clear', {
            description: 'Clear the console',
            execute: () => {
                console.clear();
                return '🧹 Console cleared';
            }
        });

        // Help command
        this.registerCommand('help', {
            description: 'Show this help screen',
            execute: () => {
                this.showHelp();
                return '📚 Help screen shown';
            }
        });

        // YouTube audio command
        this.registerCommand('youtube-audio', {
            description: 'Play audio from YouTube video: [videoId]',
            execute: (args) => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                // Handle both array args from CLI and object args from API
                let videoId;
                if (Array.isArray(args)) {
                    videoId = args[0];
                } else if (args && typeof args === 'object') {
                    videoId = args.videoId;
                }

                if (!videoId) return '❌ Usage: /youtube-audio [videoId]';

                ui.showAudioPopup({ type: 'youtube', videoId });
                return `🎵 Playing YouTube audio: ${videoId}`;
            }
        });

        // URL audio command
        this.registerCommand('url-audio', {
            description: 'Play audio from URL: [url]',
            execute: (args) => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                // Handle both array args from CLI and object args from API
                let url;
                if (Array.isArray(args)) {
                    url = args[0];
                } else if (args && typeof args === 'object') {
                    url = args.url;
                }

                if (!url) return '❌ Usage: /url-audio [url]';

                ui.showAudioPopup({ type: 'url', url });
                return `🎵 Playing audio from URL: ${url}`;
            }
        });

        // Volume command
        this.registerCommand('volume', {
            description: 'Set audio volume: [level 0-1]',
            execute: (args) => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                // Handle both array args from CLI and object args from API
                let level;
                if (Array.isArray(args)) {
                    level = parseFloat(args[0]);
                } else if (args && typeof args === 'object') {
                    level = parseFloat(args.level);
                }

                if (isNaN(level) || level < 0 || level > 1) {
                    return '❌ Usage: /volume [level 0-1]';
                }

                ui.setAudioVolume(level);
                return `🔊 Volume set to ${Math.round(level * 100)}%`;
            }
        });

        // Volume up command
        this.registerCommand('volume-up', {
            description: 'Increase audio volume by 10%',
            execute: () => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                ui.adjustAudioVolume(0.1);
                const newVolume = ui.currentVolume || 0;
                return `🔊 Volume increased to ${Math.round(newVolume * 100)}%`;
            }
        });

        // Volume down command
        this.registerCommand('volume-down', {
            description: 'Decrease audio volume by 10%',
            execute: () => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                ui.adjustAudioVolume(-0.1);
                const newVolume = ui.currentVolume || 0;
                return `🔉 Volume decreased to ${Math.round(newVolume * 100)}%`;
            }
        });

        // Close audio command
        this.registerCommand('close-audio', {
            description: 'Close current audio player',
            execute: () => {
                const ui = this.scene.uiGenerator;
                if (!ui) return '❌ UI system not available';

                ui.closeAudioPlayer();
                return `🎵 Audio player closed`;
            }
        });

        // Weather commands
        this.registerCommand('weather', {
            description: 'Control weather: clear, rain, snow, fog, leaves, status',
            execute: (args) => {
                const weather = this.scene.weatherGenerator;
                if (!weather) return '❌ Weather system not available';

                const action = args[0]?.toLowerCase();

                switch (action) {
                    case 'clear':
                        weather.setWeather('clear');
                        return '☀️ Weather set to clear';
                    case 'rain':
                        weather.setWeather('rain');
                        return '🌧️ Weather set to rain';
                    case 'snow':
                        weather.setWeather('snow');
                        return '❄️ Weather set to snow';
                    case 'fog':
                        weather.setWeather('fog');
                        return '🌫️ Weather set to fog';
                    case 'leaves':
                        weather.setWeather('leaves');
                        return '🍂 Weather set to falling leaves';
                    case 'status':
                        const status = weather.getWeatherStatus();
                        return `🌦️ Current weather: ${status.type} (intensity: ${status.intensity.toFixed(2)})`;
                    default:
                        return '❌ Usage: /weather clear|rain|snow|fog|leaves|status';
                }
            }
        });

        // Weather force command (for testing specific intensities)
        this.registerCommand('weather-force', {
            description: 'Force specific weather with intensity: [type] [intensity 0-1]',
            execute: (args) => {
                const weather = this.scene.weatherGenerator;
                if (!weather) return '❌ Weather system not available';

                const type = args[0]?.toLowerCase();
                const intensity = parseFloat(args[1]) || 0.5;

                if (!['clear', 'rain', 'snow', 'fog', 'leaves'].includes(type)) {
                    return '❌ Usage: /weather-force [clear|rain|snow|fog|leaves] [intensity 0-1]';
                }

                if (intensity < 0 || intensity > 1) {
                    return '❌ Intensity must be between 0 and 1';
                }

                weather.forceWeather(type, intensity);
                return `🌦️ Forced weather: ${type} (intensity: ${intensity})`;
            }
        });
    }

    /**
     * Register a new command
     */
    registerCommand(name, commandData) {
        this.commands.set(name.toLowerCase(), commandData);
    }

    /**
     * Setup keyboard input for commands
     */
    setupKeyboardInput() {
        // Listen for tilde key to show/hide help
        this.scene.input.keyboard.on('keydown-BACKTICK', () => {
            this.toggleHelp();
        });

        // Listen for slash key to start command input
        this.scene.input.keyboard.on('keydown-SLASH', (event) => {
            if (!this.isInputActive) {
                event.preventDefault();
                event.stopPropagation();
                console.log('🎮 Command input started');
                this.startCommandInput();
            }
        });

        // Listen for all key presses when input is active
        this.scene.input.keyboard.on('keydown', (event) => {
            if (this.isInputActive) {
                event.preventDefault();
                event.stopPropagation();
                this.handleKeyInput(event);
            }
        });
    }

    /**
     * Toggle help display
     */
    toggleHelp() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    /**
     * Show help overlay
     */
    showHelp() {
        if (this.helpOverlay) return;

        const bgWidth = 600;
        const commands = Array.from(this.commands.entries());
        // Calculate dynamic height: title + commands + instructions + padding
        const bgHeight = Math.min(
            this.scene.cameras.main.height - 100, // Max height (leave some screen space)
            140 + (commands.length * 40) // 60 title + 40 instructions + 40 padding + commands
        );
        const x = this.scene.cameras.main.width / 2;
        const y = this.scene.cameras.main.height / 2;

        // Background
        this.helpOverlay = this.scene.add.group();

        const bg = this.scene.add.rectangle(x, y, bgWidth, bgHeight, 0x000000, 0.9);
        bg.setStrokeStyle(4, 0x00ff00);
        bg.setScrollFactor(0);
        bg.setDepth(2000);

        // Title
        const title = this.scene.add.text(x, y - bgHeight / 2 + 30, '🎮 Event Slider Commands', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(2001);

        // Commands list - start closer to title
        let yOffset = y - bgHeight / 2 + 60;

        commands.forEach(([name, data]) => {
            const cmdText = this.scene.add.text(x - bgWidth / 2 + 20, yOffset, `/${name}`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffff00',
                fontStyle: 'bold'
            });
            cmdText.setOrigin(0, 0);
            cmdText.setScrollFactor(0);
            cmdText.setDepth(2001);

            const descText = this.scene.add.text(x - bgWidth / 2 + 20, yOffset + 16, data.description, {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#cccccc',
                wordWrap: { width: bgWidth - 40 }
            });
            descText.setOrigin(0, 0);
            descText.setScrollFactor(0);
            descText.setDepth(2001);

            this.helpOverlay.addMultiple([cmdText, descText]);
            yOffset += 40; // Reduced spacing
        });

        // Instructions
        const instructions = this.scene.add.text(x, y + bgHeight / 2 - 30, 'Press ~ to close • Press / to enter commands', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888',
            fontStyle: 'italic'
        });
        instructions.setOrigin(0.5);
        instructions.setScrollFactor(0);
        instructions.setDepth(2001);

        this.helpOverlay.addMultiple([bg, title, instructions]);
        this.helpVisible = true;
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        if (this.helpOverlay) {
            this.helpOverlay.clear(true, true);
            this.helpOverlay = null;
        }
        this.helpVisible = false;
    }

    /**
     * Start command input mode
     */
    startCommandInput() {
        console.log('🎮 Starting command input mode');
        this.isInputActive = true;
        this.commandText = '/';
        this.showCommandInput();
        console.log('🎮 Command input display shown');
    }

    /**
     * Show command input overlay
     */
    showCommandInput() {
        if (this.commandInput) this.hideCommandInput();

        const x = 20;
        const y = this.scene.cameras.main.height - 50;

        console.log(`🎮 Creating command input at position (${x}, ${y})`);

        this.commandInput = this.scene.add.text(x, y, this.commandText + '_', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.commandInput.setOrigin(0);
        this.commandInput.setScrollFactor(0);
        this.commandInput.setDepth(2000);

        console.log('🎮 Command input text object created');
    }

    /**
     * Hide command input
     */
    hideCommandInput() {
        if (this.commandInput) {
            this.commandInput.destroy();
            this.commandInput = null;
        }
    }

    /**
     * Handle keyboard input for commands
     */
    handleKeyInput(event) {
        if (event.keyCode === 13) { // Enter
            this.executeCommand();
        } else if (event.keyCode === 27) { // Escape
            this.cancelCommandInput();
        } else if (event.keyCode === 8) { // Backspace
            if (this.commandText.length > 1) {
                this.commandText = this.commandText.slice(0, -1);
                this.updateCommandInput();
            }
        } else if (event.key && event.key.length === 1) {
            this.commandText += event.key;
            this.updateCommandInput();
        }
    }

    /**
     * Update command input display
     */
    updateCommandInput() {
        if (this.commandInput) {
            this.commandInput.setText(this.commandText + '_');
        }
    }

    /**
     * Execute the current command
     * @param {string|object} commandInput - Command string or command name
     * @param {object} argObject - Optional arguments object when called programmatically
     */
    executeCommand(commandInput, argObject) {
        let commandName, args, fromUI = false;

        // Handle being called programmatically vs from UI
        if (commandInput && typeof commandInput === 'string') {
            // Called programmatically with a command name
            commandName = commandInput.toLowerCase();
            args = argObject || {};
        } else {
            // Called from UI with command text
            fromUI = true;
            const command = this.commandText.slice(1).trim(); // Remove leading /
            const parts = command.split(' ');
            commandName = parts[0].toLowerCase();
            args = parts.slice(1);
        }

        const commandData = this.commands.get(commandName);
        let result;

        if (commandData) {
            // Update the execute function to handle both array and object arguments
            result = commandData.execute(args);
            console.log(result);
            if (fromUI) {
                this.showFeedback(result);
            }
        } else {
            result = `❌ Unknown command: ${commandName}. Type ~ for help.`;
            console.log(result);
            if (fromUI) {
                this.showFeedback(result);
            }
        }

        // Cancel input if called from UI
        if (fromUI) {
            this.cancelCommandInput();
        }

        return result;
    }

    /**
     * Cancel command input
     */
    cancelCommandInput() {
        this.isInputActive = false;
        this.commandText = '';
        this.hideCommandInput();
    }

    /**
     * Show command feedback
     */
    showFeedback(message) {
        const feedback = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            message,
            {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 }
            }
        );
        feedback.setOrigin(0.5);
        feedback.setScrollFactor(0);
        feedback.setDepth(2000);

        // Fade out after 3 seconds
        this.scene.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 500,
            delay: 2500,
            onComplete: () => feedback.destroy()
        });
    }

    /**
     * Clean up
     */
    destroy() {
        this.hideHelp();
        this.hideCommandInput();
    }
}
