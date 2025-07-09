/**
 * SponsorGenerator - Generates and manages sponsor logo displays
 */
import SponsorConfig from '../data/SponsorConfig.js';
import ScanlineFilter from '../utils/ScanlineFilter.js';

export default class SponsorGenerator {
    constructor(scene) {
        this.scene = scene;
        this.sponsorConfig = new SponsorConfig();
        this.scanlineFilter = new ScanlineFilter();
        this.currentSponsorIndex = 0;
        this.sponsorGroup = null;
        this.currentSponsorSprite = null;
        this.sponsorTimer = null;
        this.isDisplaying = false;
        this.displayQueue = [];
        this.loadedTextures = new Set();
        this.failedAttempts = 0;
        this.maxFailedAttempts = 5; // Prevent infinite loops
        this.useRetroFilter = true; // Toggle for retro scanline styling

        // Display settings
        this.displayPosition = {
            x: this.scene.cameras.main.width - 150, // Right side of screen
            y: 150 // Top portion of screen
        };

        this.fadeInDuration = 500;
        this.fadeOutDuration = 500;

        this.setupSponsorDisplay();
    }

    /**
     * Initialize the sponsor display system
     */
    setupSponsorDisplay() {
        this.sponsorGroup = this.scene.add.group();

        // Get active sponsors and create display queue
        const activeSponsors = this.sponsorConfig.getActiveSponsors();
        this.displayQueue = [...activeSponsors];

        console.log(`🏢 SponsorGenerator initialized with ${this.displayQueue.length} active sponsors`);

        // Start the sponsor rotation
        if (this.displayQueue.length > 0) {
            this.preloadSponsorTextures();
            this.startSponsorRotation();
        }
    }

    /**
     * Preload sponsor logo textures
     */
    preloadSponsorTextures() {
        this.displayQueue.forEach((sponsor, index) => {
            const textureKey = `sponsor_${index}`;

            // Only load if not already loaded
            if (!this.scene.textures.exists(textureKey)) {
                this.scene.load.image(textureKey, sponsor.url);
                this.loadedTextures.add(textureKey);
            }
        });

        // Start loading process if there are textures to load
        if (this.loadedTextures.size > 0) {
            this.scene.load.once('complete', () => {
                console.log(`✅ Loaded ${this.loadedTextures.size} sponsor textures`);
            });

            this.scene.load.start();
        }
    }

    /**
     * Start the sponsor rotation cycle
     */
    startSponsorRotation() {
        if (this.displayQueue.length === 0) return;

        // Start with the first sponsor
        this.showNextSponsor();
    }

    /**
     * Display the next sponsor in the queue
     */
    showNextSponsor() {
        if (this.isDisplaying || this.displayQueue.length === 0) return;

        // Safety check to prevent infinite recursion
        if (this.failedAttempts >= this.maxFailedAttempts) {
            console.error('❌ Too many failed attempts to display sponsors, stopping rotation');
            return;
        }

        const sponsor = this.displayQueue[this.currentSponsorIndex];
        const tierConfig = this.sponsorConfig.getTierConfig(sponsor.level);
        const textureKey = `sponsor_${this.currentSponsorIndex}`;

        // Check if texture is loaded
        if (!this.scene.textures.exists(textureKey)) {
            console.warn(`⚠️ Sponsor texture ${textureKey} not loaded, skipping...`);
            this.failedAttempts++;
            // Skip to next sponsor with delay to prevent recursion
            this.scene.time.delayedCall(100, () => {
                this.currentSponsorIndex = (this.currentSponsorIndex + 1) % this.displayQueue.length;
                this.showNextSponsor();
            }, [], this);
            return;
        }

        // Reset failed attempts counter on successful display
        this.failedAttempts = 0;

        this.isDisplaying = true;

        // Create sponsor sprite
        this.currentSponsorSprite = this.scene.add.image(
            this.displayPosition.x,
            this.displayPosition.y,
            textureKey
        );

        // Configure sprite properties
        this.currentSponsorSprite.setOrigin(0.5, 0.5);

        // Calculate scale based on desired width and height from sponsor config
        const texture = this.scene.textures.get(textureKey);
        const sourceWidth = texture.source[0].width;
        const sourceHeight = texture.source[0].height;

        // Get effective dimensions (allows per-sponsor overrides)
        const targetWidth = this.sponsorConfig.getEffectiveWidth(sponsor);
        const targetHeight = this.sponsorConfig.getEffectiveHeight(sponsor);

        // Calculate scales to achieve desired dimensions
        const scaleX = targetWidth / sourceWidth;
        const scaleY = targetHeight / sourceHeight;

        // Apply tier scale modifier to the calculated scale
        const finalScaleX = scaleX * tierConfig.scale;
        const finalScaleY = scaleY * tierConfig.scale;

        this.currentSponsorSprite.setScale(finalScaleX, finalScaleY);
        this.currentSponsorSprite.setAlpha(0); // Start invisible
        this.currentSponsorSprite.setScrollFactor(0); // Stay in place during scrolling
        this.currentSponsorSprite.setDepth(1000); // Display above other elements

        // Add to group
        this.sponsorGroup.add(this.currentSponsorSprite);

        // Apply retro scanline effect if enabled
        if (this.useRetroFilter) {
            // Wait a frame for sprite to be properly positioned
            this.scene.time.delayedCall(50, () => {
                if (this.currentSponsorSprite) {
                    this.scanlineFilter.applyCRTEffect(this.scene, this.currentSponsorSprite);
                }
            }, [], this);
        }

        // Fade in animation
        this.scene.tweens.add({
            targets: this.currentSponsorSprite,
            alpha: tierConfig.alpha,
            duration: this.fadeInDuration,
            ease: 'Power2',
            onComplete: () => {
                // Schedule fade out
                this.sponsorTimer = this.scene.time.delayedCall(
                    tierConfig.displayDuration,
                    () => this.hideSponsor(),
                    [],
                    this
                );
            }
        });

        console.log(`🏢 Displaying sponsor: ${sponsor.url} (Level ${sponsor.level})`);
        console.log(`   📏 Target size: ${targetWidth}x${targetHeight}px`);
        console.log(`   📏 Source size: ${sourceWidth}x${sourceHeight}px`);
        console.log(`   📏 Scale: ${finalScaleX.toFixed(2)}x${finalScaleY.toFixed(2)} (tier modifier: ${tierConfig.scale})`);
        console.log(`   📺 Retro filter: ${this.useRetroFilter ? 'enabled (scanlines)' : 'disabled'}`);
    }

    /**
     * Hide the current sponsor
     */
    hideSponsor() {
        if (!this.currentSponsorSprite) return;

        // Fade out animation
        this.scene.tweens.add({
            targets: this.currentSponsorSprite,
            alpha: 0,
            duration: this.fadeOutDuration,
            ease: 'Power2',
            onComplete: () => {
                // Remove sprite and any scanline overlay
                if (this.currentSponsorSprite) {
                    this.scanlineFilter.removeScanlines(this.currentSponsorSprite);
                    this.currentSponsorSprite.destroy();
                    this.currentSponsorSprite = null;
                }

                this.isDisplaying = false;

                // Move to next sponsor after a short delay
                this.scene.time.delayedCall(
                    1000, // 1 second gap between sponsors
                    () => this.nextSponsor(),
                    [],
                    this
                );
            }
        });
    }

    /**
     * Move to the next sponsor in the queue
     */
    nextSponsor() {
        this.currentSponsorIndex = (this.currentSponsorIndex + 1) % this.displayQueue.length;
        this.showNextSponsor();
    }

    /**
     * Update sponsor position for responsive layout
     */
    updatePosition(x, y) {
        this.displayPosition.x = x;
        this.displayPosition.y = y;

        if (this.currentSponsorSprite) {
            this.currentSponsorSprite.setPosition(x, y);
        }
    }

    /**
     * Pause sponsor rotation
     */
    pause() {
        if (this.sponsorTimer) {
            this.sponsorTimer.paused = true;
        }

        // Pause any active tweens
        this.scene.tweens.getAllTweens().forEach(tween => {
            if (tween.targets.includes(this.currentSponsorSprite)) {
                tween.pause();
            }
        });
    }

    /**
     * Resume sponsor rotation
     */
    resume() {
        if (this.sponsorTimer) {
            this.sponsorTimer.paused = false;
        }

        // Resume any paused tweens
        this.scene.tweens.getAllTweens().forEach(tween => {
            if (tween.targets.includes(this.currentSponsorSprite)) {
                tween.resume();
            }
        });
    }

    /**
     * Stop sponsor rotation and clean up
     */
    stop() {
        if (this.sponsorTimer) {
            this.sponsorTimer.destroy();
            this.sponsorTimer = null;
        }

        if (this.currentSponsorSprite) {
            this.currentSponsorSprite.destroy();
            this.currentSponsorSprite = null;
        }

        if (this.sponsorGroup) {
            this.sponsorGroup.clear(true, true);
        }

        this.isDisplaying = false;
    }

    /**
     * Get current sponsor information
     */
    getCurrentSponsor() {
        if (this.displayQueue.length === 0) return null;
        return this.displayQueue[this.currentSponsorIndex];
    }

    /**
     * Force display of a specific sponsor by index
     */
    showSponsor(index) {
        if (index < 0 || index >= this.displayQueue.length) return;

        // Stop current display
        this.hideSponsor();

        // Set new index and show
        this.currentSponsorIndex = index;
        this.scene.time.delayedCall(500, () => this.showNextSponsor(), [], this);
    }

    /**
     * Toggle retro filter on/off
     */
    toggleRetroFilter() {
        this.useRetroFilter = !this.useRetroFilter;
        console.log(`📺 Retro filter ${this.useRetroFilter ? 'enabled' : 'disabled'}`);

        // If we have a current sponsor displaying, refresh it with new filter setting
        if (this.currentSponsorSprite) {
            if (this.useRetroFilter) {
                this.scanlineFilter.applyCRTEffect(this.scene, this.currentSponsorSprite);
            } else {
                this.scanlineFilter.removeScanlines(this.currentSponsorSprite);
            }
        }
    }

    /**
     * Enable retro filter
     */
    enableRetroFilter() {
        if (!this.useRetroFilter) {
            this.toggleRetroFilter();
        }
    }

    /**
     * Disable retro filter
     */
    disableRetroFilter() {
        if (this.useRetroFilter) {
            this.toggleRetroFilter();
        }
    }

    /**
     * Get current filter status
     */
    isRetroFilterEnabled() {
        return this.useRetroFilter;
    }

    /**
     * Set scanline intensity
     */
    setScanlineIntensity(intensity) {
        this.scanlineFilter.setScanlineIntensity(intensity);
        console.log(`📺 Scanline intensity set to ${intensity}`);
    }
}
