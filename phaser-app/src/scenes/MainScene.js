/**
 * MainScene - The main game scene with procedural graphics
 */
import Phaser from 'phaser';
import CloudGenerator from '../generators/CloudGenerator.js';
import TreeGenerator from '../generators/TreeGenerator.js';
import SkyGenerator from '../generators/SkyGenerator.js';
import GroundGenerator from '../generators/GroundGenerator.js';
import BirdGenerator from '../generators/BirdGenerator.js';
import WeatherGenerator from '../generators/WeatherGenerator.js';
import SponsorGenerator from '../generators/SponsorGenerator.js';
import UIGenerator from '../generators/UIGenerator.js';
import ColorPalette from '../utils/ColorPalette.js';
import CommandSystem from '../utils/CommandSystem.js';
import WebSocketController from '../utils/WebSocketController.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Preload any essential assets here if needed
        // Sponsor logos will be loaded dynamically by SponsorGenerator
        // Load event logo for UI
        this.load.image('eventLogo', '/codecamp.png');

        // // Load the runtime barrel pipeline plugin
        // this.load.plugin(
        //     'rexbarrelpipelineplugin',
        //     'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbarrelpipelineplugin.min.js',
        //     true
        // );

        console.log('🎮 MainScene preloading assets...');
    }

    create() {
        console.log('🎮 MainScene created - Setting up procedural graphics...');

        // Enable CRT barrel distortion pipeline (runtime plugin)
        const postFxPlugin = this.plugins.get('rexbarrelpipelineplugin');
        if (postFxPlugin) {
            postFxPlugin.add(this.cameras.main, {
                radius: 1000,   // adjust as needed
                power: .05,    // adjust as needed
                shrink: false
            });
        }

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Initialize generators
        this.cloudGenerator = new CloudGenerator(this);
        this.treeGenerator = new TreeGenerator(this);
        this.skyGenerator = new SkyGenerator(this);
        this.groundGenerator = new GroundGenerator(this);
        this.birdGenerator = new BirdGenerator(this);
        this.weatherGenerator = new WeatherGenerator(this);
        this.sponsorGenerator = new SponsorGenerator(this);
        this.uiGenerator = new UIGenerator(this);
        this.commandSystem = new CommandSystem(this);
        this.webSocketController = new WebSocketController(this);
        this.colorPalette = new ColorPalette();
        this.colorPalette.setTimeOfDay('night');

        // Initialize environmental features (houses, etc.) to be enabled by default
        this.showEnvironmentalFeatures = true;

        // Track last camera scroll and time of day for redraw logic
        this.lastCameraScrollX = Math.round(this.cameras.main.scrollX / 4) * 4; // Snap to pixel size
        this.lastTimeOfDay = this.skyGenerator.getTimeOfDay ? this.skyGenerator.getTimeOfDay() : 0;

        // Create parallax layers
        this.createSky();
        this.createClouds();
        this.createBirds();
        this.createTrees();
        this.createGround();

        // Initialize weather effects
        this.createWeather();

        // Setup scrolling
        this.setupParallaxScrolling();

        // Setup web console commands
        this.setupWebConsoleCommands();

        console.log('✅ All procedural graphics loaded successfully!');
        console.log('💻 Web console commands available - see COMMANDS.md for details');
        console.log('📚 Press ~ to show help overlay or type /help in console');
        console.log('🔌 WebSocket controller initialized - listening for remote commands');
    } createSky() {
        // Create procedural sky with time-of-day variation
        // Start with dawn (0.2) for better visibility
        const timeOfDay = .1;
        this.sky = this.skyGenerator.createSky(timeOfDay, true, true);

        console.log('🌌 Procedural sky created with dawn colors and atmospheric effects');
    }

    createClouds() {
        this.clouds = this.add.group();

        // Create more clouds to fill the extended world width
        const worldWidth = this.cameras.main.width * 3 + 100; // Include 100px buffer
        const cloudCount = Math.ceil(worldWidth / 250); // One cloud every ~250px

        for (let i = 0; i < cloudCount; i++) {
            const x = (i * 250) + Math.random() * 100 - 50; // Start before screen edge
            const y = 50 + Math.random() * 150;
            const scale = 0.5 + Math.random() * 0.5;

            const cloud = this.cloudGenerator.createCloudSprite(x, y, scale);
            cloud.setScrollFactor(0.01); // Slow parallax for clouds
            cloud.setAlpha(0.8);

            // Add custom properties for animation
            cloud.baseY = y;
            cloud.floatSpeed = 0.1 + Math.random() * 0.5;
            cloud.scrollSpeed = 0.1 + Math.random() * 0.2;

            this.clouds.add(cloud);
        }

        console.log('☁️ Created', this.clouds.children.entries.length, 'procedural clouds across extended world');
    }

    createBirds() {
        this.birds = this.add.group();

        // Create birds that fly across the scene
        const worldWidth = this.cameras.main.width * 3 + 100;
        const screenHeight = this.cameras.main.height;

        // Birds fly in the upper portion of the screen (above trees)
        const birdZone = {
            minY: 80,  // Above clouds
            maxY: screenHeight * 0.4, // Don't fly too low (above trees)
            spawnX: worldWidth + 100, // Start off-screen right
            resetX: -100 // Reset when they go off-screen left
        };

        // Create different types of birds
        this.createBirdFlocks(birdZone, worldWidth);

        console.log('🐦 Created flying birds across the sky');
    }

    createBirdFlocks(birdZone, worldWidth) {
        // Create a few single birds
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * worldWidth;
            const y = birdZone.minY + Math.random() * (birdZone.maxY - birdZone.minY);

            const bird = this.birdGenerator.createBirdSprite(x, y, 'small');
            bird.setScrollFactor(0.3); // Parallax effect (slower than foreground)
            bird.setDepth(5); // Above clouds, below UI

            // Store reset boundaries
            bird.spawnX = birdZone.spawnX;
            bird.resetX = birdZone.resetX;
            bird.birdZone = birdZone;

            this.birds.add(bird);
        }

        // Create a medium-sized flock
        const flockX = Math.random() * worldWidth;
        const flockY = birdZone.minY + Math.random() * (birdZone.maxY - birdZone.minY);
        const flock = this.birdGenerator.createFlock(flockX, flockY, 4, 'small');

        flock.forEach(bird => {
            bird.setScrollFactor(0.3);
            bird.setDepth(5);
            bird.spawnX = birdZone.spawnX;
            bird.resetX = birdZone.resetX;
            bird.birdZone = birdZone;
            this.birds.add(bird);
        });

        // Create one large bird (occasional)
        if (Math.random() > 0.7) {
            const x = Math.random() * worldWidth;
            const y = birdZone.minY + Math.random() * (birdZone.maxY - birdZone.minY);

            const largeBird = this.birdGenerator.createBirdSprite(x, y, 'large');
            largeBird.setScrollFactor(0.4); // Slightly different parallax
            largeBird.setDepth(6); // Above other birds
            largeBird.flySpeed *= 0.7; // Slower flight for larger bird

            largeBird.spawnX = birdZone.spawnX;
            largeBird.resetX = birdZone.resetX;
            largeBird.birdZone = birdZone;

            this.birds.add(largeBird);
        }
    }

    createTrees() {
        console.log('🌲 Starting tree creation using new chunk system...');

        // Create tree chunks using the new tree generator system
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        this.treeContainer = this.treeGenerator.createTreeChunks(screenWidth, screenHeight, 3);
        this.treeContainer.setDepth(1); // In front of ground (-50) but behind birds (5+)

        console.log(`🌲 Tree chunk system created successfully`);
    }

    /**
     * Update tree chunks for infinite scrolling (new system)
     */
    updateTreeChunks() {
        if (this.treeContainer && this.treeGenerator) {
            const cameraX = this.cameras.main.scrollX;
            const screenWidth = this.cameras.main.width;
            const screenHeight = this.cameras.main.height;

            this.treeGenerator.updateTreeChunks(this.treeContainer, cameraX, screenWidth, screenHeight);
        }
    }

    createGround() {
        // Calculate dimensions
        const screenWidth = this.cameras.main.width;
        // Adjust world height to account for UI bottom bar (80px high)
        const worldHeight = this.cameras.main.height - 80;
        const groundHeight = 60; // Slightly taller ground for more detail
        const chunksCount = 3; // Number of chunks to create for seamless scrolling

        // Create main ground layer with chunks for seamless scrolling
        this.groundContainer = this.groundGenerator.createGroundChunks(
            screenWidth,
            worldHeight,
            groundHeight,
            chunksCount
        );
        this.groundContainer.setDepth(-50);

        console.log('🌱 Created procedural ground chunks with seamless scrolling');
    }

    createWeather() {
        // Initialize weather system
        this.weatherGenerator.initializeWeather();

        console.log('🌦️ Weather system initialized - dynamic weather effects enabled');
    }

    /**
     * Cycle between different ground styles for testing
     */
    cycleGroundStyle() {
        const styles = ['detailed', 'variable', 'simple'];
        const currentIndex = styles.indexOf(this.groundStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        this.groundStyle = styles[nextIndex];

        // Remove existing ground
        if (this.ground) {
            this.ground.destroy();
        }
        if (this.backgroundGround) {
            this.backgroundGround.destroy();
        }

        // Extended world width with 100px buffer to prevent pop-in
        const worldWidth = this.cameras.main.width * 3 + 100;
        const worldHeight = this.cameras.main.height - 80; // Account for UI bar
        const groundHeight = 60;

        switch (this.groundStyle) {
            case 'detailed':
                this.ground = this.groundGenerator.createGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);

                this.backgroundGround = this.groundGenerator.createGround(worldWidth * 1.2, worldHeight, groundHeight - 10, true);
                this.backgroundGround.setDepth(-60);
                this.backgroundGround.setScrollFactor(0.8);
                this.backgroundGround.setAlpha(0.6);
                console.log('🌱 Switched to detailed ground style');
                break;

            case 'variable':
                this.ground = this.groundGenerator.createVariableGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);
                console.log('🏔️ Switched to variable height ground style');
                break;

            case 'simple':
                // Fallback to simple solid color ground
                this.ground = this.add.graphics();
                this.ground.fillStyle(0x8B4513);
                this.ground.fillRect(0, worldHeight - groundHeight, worldWidth, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);

                const grass = this.add.graphics();
                grass.fillStyle(0x228B22);
                grass.fillRect(0, worldHeight - groundHeight - 10, worldWidth, 10);
                grass.setDepth(-49);
                grass.setScrollFactor(1);
                console.log('🟫 Switched to simple ground style');
                break;

            default:
                // Default to detailed style
                this.groundStyle = 'detailed';
                this.ground = this.groundGenerator.createGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);
                console.log('🌱 Using default detailed ground style');
                break;
        }
    }

    /**
     * Toggle environmental features (rocks, logs, ponds) visibility
     */
    toggleEnvironmentalFeatures() {
        this.showEnvironmentalFeatures = !this.showEnvironmentalFeatures;
        console.log(`🪨 Environmental features ${this.showEnvironmentalFeatures ? 'enabled' : 'disabled'}`);

        // Recreate the ground with current style but updated feature settings
        if (this.ground) {
            this.ground.destroy();
        }
        if (this.backgroundGround) {
            this.backgroundGround.destroy();
        }

        // Extended world width with 100px buffer to prevent pop-in
        const worldWidth = this.cameras.main.width * 3 + 100;
        const worldHeight = this.cameras.main.height - 80; // Account for UI bar
        const groundHeight = 60;

        // Recreate ground based on current style
        switch (this.groundStyle) {
            case 'detailed':
                this.ground = this.groundGenerator.createGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);

                this.backgroundGround = this.groundGenerator.createGround(worldWidth * 1.2, worldHeight, groundHeight - 10, true);
                this.backgroundGround.setDepth(-60);
                this.backgroundGround.setScrollFactor(0.8);
                this.backgroundGround.setAlpha(0.6);
                break;

            case 'variable':
                this.ground = this.groundGenerator.createVariableGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);
                break;

            case 'simple':
                // Simple ground doesn't have environmental features
                this.ground = this.add.graphics();
                this.ground.fillStyle(0x8B4513);
                this.ground.fillRect(0, worldHeight - groundHeight, worldWidth, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);

                const grass = this.add.graphics();
                grass.fillStyle(0x228B22);
                grass.fillRect(0, worldHeight - groundHeight - 10, worldWidth, 10);
                grass.setDepth(-49);
                grass.setScrollFactor(1);
                break;

            default:
                this.groundStyle = 'detailed';
                this.ground = this.groundGenerator.createGround(worldWidth, worldHeight, groundHeight);
                this.ground.setDepth(-50);
                this.ground.setScrollFactor(1);
                break;
        }
    }

    setupParallaxScrolling() {
        // With the chunk-based approach, we don't need to set explicit world bounds
        // as chunks will be recycled to create infinite scrolling

        // Start automatic scrolling
        this.scrollSpeed = 1;
        this.cameras.main.scrollX = 0;

        // Define maxSafeScrollX to prevent precision issues
        this.maxSafeScrollX = Number.MAX_SAFE_INTEGER / 2;

        // Add debugging and performance monitoring
        this.lastChunkUpdateTime = Date.now();
        this.debugIntervalMS = 60000; // Log debug info every minute
        this.lastDebugTime = Date.now();
        this.chunkUpdateCounter = 0;

        console.log('🏃 Infinite parallax scrolling initialized with chunk-based ground');
        console.log(`📏 Using camera position reset when approaching ${(this.maxSafeScrollX / 1000000).toFixed(1)} million pixels`);
    }

    /**
     * Change the time of day (useful for events or testing)
     * @param {number} timeOfDay - Time from 0 (midnight) to 1 (midnight next day)
     */
    setTimeOfDay(timeOfDay) {
        if (this.skyGenerator) {
            this.skyGenerator.setTimeOfDay(timeOfDay);

            // When time of day changes, recreate all ground chunks with updated colors
            if (this.groundContainer && this.groundGenerator) {
                // Remove old ground chunks
                if (this.groundContainer.removeAll) {
                    this.groundContainer.removeAll(true);
                }

                // Create new ground chunks
                const chunksCount = 3;
                const screenWidth = this.cameras.main.width;
                const worldHeight = this.cameras.main.height - 80;

                this.groundContainer = this.groundGenerator.createGroundChunks(
                    screenWidth,
                    worldHeight,
                    60, // groundHeight
                    chunksCount,
                    false // not background
                );
                this.groundContainer.setDepth(-50);
            }

            console.log(`🕐 Time of day set to: ${(timeOfDay * 24).toFixed(1)} hours`);
        }
    }

    /**
     * Get current time of day
     */
    getTimeOfDay() {
        return this.skyGenerator ? this.skyGenerator.getTimeOfDay() : 0;
    }

    /**
     * Web console commands are available through the command system
     * Press ~ to show help or type commands directly in the browser console
     */
    setupWebConsoleCommands() {
        // Command system is automatically initialized
        console.log('💻 Web console commands available - see COMMANDS.md for details');
        console.log('💻 Use the web browser console to control all features');
        console.log('💻 Example: window.game.scene.scenes[0].commandSystem.executeCommand("day")');
    }

    /**
     * Spawn a random bird on demand
     */
    spawnRandomBird() {
        const screenHeight = this.cameras.main.height;
        const birdZone = {
            minY: 80,
            maxY: screenHeight * 0.4,
            spawnX: this.cameras.main.width + 100,
            resetX: -100
        };

        // Random bird type
        const birdTypes = ['small', 'medium', 'large'];
        const randomType = birdTypes[Math.floor(Math.random() * birdTypes.length)];

        // Random position in bird zone
        const x = this.cameras.main.scrollX + this.cameras.main.width + 50; // Spawn ahead of camera
        const y = birdZone.minY + Math.random() * (birdZone.maxY - birdZone.minY);

        const bird = this.birdGenerator.createBirdSprite(x, y, randomType);
        bird.setScrollFactor(0.3 + Math.random() * 0.2); // Varied parallax
        bird.setDepth(5 + Math.random() * 2); // Varied depth

        bird.spawnX = birdZone.spawnX;
        bird.resetX = birdZone.resetX;
        bird.birdZone = birdZone;

        this.birds.add(bird);

        console.log(`🐦 Spawned a ${randomType} bird!`);
    }

    /**
     * Setup performance monitoring to detect and fix issues
     */
    setupPerformanceMonitoring() {
        // Initialize frame rate monitoring
        this.frameRateHistory = [];
        this.frameTimes = [];
        this.lastFrameTime = Date.now();
        this.frameMonitoringStartTime = Date.now();
        this.pauseDetected = false;

        // How many frames to consider for calculating average frame rate
        this.frameHistorySize = 60;

        // Thresholds for pause detection
        this.minAcceptableFPS = 20;
        this.pauseDetectionFrames = 30;
        this.longPauseDetectionTime = 1000; // 1 second without updates is a long pause
        this.lastUpdateTime = Date.now();

        // Auto-recovery options
        this.autoRecoveryEnabled = true;

        console.log('📊 Performance monitoring initialized');
    }

    /**
     * Monitor performance and detect pauses
     * @param {number} time - current game time
     */
    monitorPerformance(time) {
        const now = Date.now();

        // Calculate time since last frame
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Calculate instantaneous FPS
        const fps = 1000 / frameTime;

        // Store frame time history
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > this.frameHistorySize) {
            this.frameTimes.shift();
        }

        // Store FPS history
        this.frameRateHistory.push(fps);
        if (this.frameRateHistory.length > this.frameHistorySize) {
            this.frameRateHistory.shift();
        }

        // Calculate average FPS from recent history
        const avgFPS = this.frameRateHistory.reduce((sum, val) => sum + val, 0) / this.frameRateHistory.length;

        // Check for pauses - one minute reporting interval
        if (now - this.frameMonitoringStartTime > 60000) {
            console.log(`📊 Performance: Avg FPS: ${avgFPS.toFixed(1)} | Current FPS: ${fps.toFixed(1)}`);
            this.frameMonitoringStartTime = now;
        }

        // Detect significant pauses/stutters
        if (frameTime > this.longPauseDetectionTime) {
            console.warn(`⚠️ Long frame time detected: ${frameTime}ms (${(frameTime / 1000).toFixed(2)} seconds)`);
            this.pauseDetected = true;
        }

        // Check for consistently low frame rate
        if (this.frameRateHistory.length >= this.pauseDetectionFrames) {
            const recentAvg = this.frameRateHistory.slice(-this.pauseDetectionFrames).reduce((sum, val) => sum + val, 0) / this.pauseDetectionFrames;

            if (recentAvg < this.minAcceptableFPS) {
                console.warn(`⚠️ Low frame rate detected: ${recentAvg.toFixed(1)} FPS`);
                this.pauseDetected = true;
            }
        }

        // Auto-recovery if needed
        if (this.pauseDetected && this.autoRecoveryEnabled) {
            console.log('🔄 Attempting auto-recovery from performance issue...');
            this.recoverFromPause();
            this.pauseDetected = false;
        }
    }

    /**
     * Recover from a detected pause or performance issue
     */
    recoverFromPause() {
        // Reset camera position to prevent numeric precision issues
        if (this.cameras.main.scrollX > 1000000) {
            // Reset camera position
            this.cameras.main.scrollX = 0;

            // Trees are automatically handled by chunk recycling system
            // No manual adjustment needed

            console.log('📏 Reset camera position during recovery');
        }

        // Clear chunk arrays and recreate ground chunks
        if (this.groundGenerator) {
            // Recreate main ground chunks
            if (this.groundContainer) {
                this.groundContainer.removeAll(true);
                this.groundGenerator.chunks = [];

                const screenWidth = this.cameras.main.width;
                const worldHeight = this.cameras.main.height - 80;
                const groundHeight = 60;
                const chunksCount = 3;

                this.groundContainer = this.groundGenerator.createGroundChunks(
                    screenWidth,
                    worldHeight,
                    groundHeight,
                    chunksCount,
                    false
                );
                this.groundContainer.setDepth(-50);
            }

            console.log('🧩 Ground chunks recreated during recovery');
        }

        // Reset frame rate monitoring
        this.frameRateHistory = [];
        this.frameTimes = [];
        this.lastFrameTime = Date.now();

        console.log('✅ Recovery complete');
    }

    update(time, delta) {
        // Monitor performance and detect pauses
        this.monitorPerformance(time);

        // Update procedural sky
        this.skyGenerator.update(delta);

        // Update weather effects
        this.weatherGenerator.update(delta);

        // Update tree chunks for infinite scrolling
        this.updateTreeChunks();

        // Auto-scroll the camera with safety check

        // Reset camera if approaching our defined safe limit
        if (this.cameras.main.scrollX > this.maxSafeScrollX - 10000) {
            console.log("📏 Reset camera position - approaching MAX_SAFE_INTEGER");

            // Save all the relative positions first
            // Reset camera position
            this.cameras.main.scrollX = 0;

            // Trees are automatically handled by chunk recycling system
            // No manual adjustment needed

            // No need to reset chunks as they're regenerated based on camera position
        } else {
            // Normal scrolling
            this.cameras.main.scrollX += this.scrollSpeed;
        }

        // Periodic debug info to diagnose performance issues
        const now = Date.now();
        if (now - this.lastDebugTime > this.debugIntervalMS) {
            const distanceTraveled = this.cameras.main.scrollX.toFixed(0);
            const minutesElapsed = ((now - this.lastDebugTime) / 60000).toFixed(2);
            console.log(`📊 Performance check: Scrolled ${distanceTraveled}px in ${minutesElapsed} minutes`);
            console.log(`🧩 Current camera position: ${this.cameras.main.scrollX.toFixed(0)}`);
            console.log(`🔄 Chunk updates since last check: ${this.chunkUpdateCounter}`);

            // Reset counters
            this.lastDebugTime = now;
            this.chunkUpdateCounter = 0;
        }

        // Update ground chunks for seamless scrolling
        if (this.groundContainer && this.groundGenerator) {
            // Track chunk updates for performance monitoring
            const updateResult = this.groundGenerator.updateGroundChunks(
                this.groundContainer,
                this.cameras.main.scrollX,
                this.cameras.main.width,
                this.cameras.main.height - 80, // Account for UI bottom bar
                60 // groundHeight
            );

            // Track chunk updates
            if (updateResult && updateResult.chunksUpdated > 0) {
                this.chunkUpdateCounter += updateResult.chunksUpdated;
            }
        }

        // Update ground chunks
        if (this.groundContainer && this.groundGenerator) {
            const updateResult = this.groundGenerator.updateGroundChunks(
                this.groundContainer,
                this.cameras.main.scrollX,
                this.cameras.main.width,
                this.cameras.main.height - 80,
                60 // groundHeight
            );

            if (updateResult && updateResult.chunksUpdated > 0) {
                this.chunkUpdateCounter += updateResult.chunksUpdated;
            }
        }

        // Animate clouds floating
        this.clouds.children.entries.forEach((cloud, index) => {
            if (cloud && cloud.active) {
                // Floating animation
                cloud.y = cloud.baseY + Math.sin(time * 0.001 * cloud.floatSpeed) * 10;

                // Additional horizontal movement
                cloud.x -= cloud.scrollSpeed;

                // Reset cloud position when it goes off screen (accounting for extended world)
                if (cloud.x < -200) {
                    cloud.x = this.cameras.main.width + Math.random() * 400 + 100; // Start further right
                    cloud.y = 50 + Math.random() * 150;
                    cloud.baseY = cloud.y;
                }
            }
        });

        // Animate birds flying and flapping wings
        this.birds.children.entries.forEach((bird, index) => {
            if (bird && bird.active) {
                // Update bird animation (wing flapping)
                this.birdGenerator.updateBird(bird, time);

                // Reset bird position when it goes off screen
                if (bird.x < bird.resetX) {
                    bird.x = bird.spawnX + Math.random() * 200; // Stagger respawn
                    bird.baseY = bird.birdZone.minY + Math.random() * (bird.birdZone.maxY - bird.birdZone.minY);
                    bird.y = bird.baseY;

                    // Slightly randomize flight speed on reset
                    bird.flySpeed = 0.5 + Math.random() * 1.0;
                }
            }
        });

        // Monitor performance each frame
        this.monitorPerformance(time);
    }

    /**
     * Clean up resources when scene is destroyed
     */
    destroy() {
        if (this.webSocketController) {
            this.webSocketController.destroy();
        }
        if (this.commandSystem) {
            this.commandSystem.destroy();
        }
        super.destroy();
    }
}
