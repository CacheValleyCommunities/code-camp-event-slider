/**
 * UIGenerator - Generates and manages UI overlays for the event
 */
import EventConfig from '../data/EventConfig.js';

export default class UIGenerator {
    constructor(scene) {
        this.scene = scene;
        this.uiGroup = null;
        this.countdownText = null;
        this.bottomBar = null;
        this.eventLogo = null;
        this.alertText = null;
        this.alertBackground = null;

        // Event configuration with multi-day support
        this.eventConfig = {
            eventName: EventConfig.name,
            logoUrl: EventConfig.logoUrl,
            timezone: EventConfig.timezone,
            // Multi-day event dates
            eventStart: new Date(EventConfig.date),
            day1End: new Date(EventConfig.day1End),
            day2Start: new Date(EventConfig.day2Start),
            day2End: new Date(EventConfig.day2End),
        };

        // Current alert configuration
        this.currentAlert = {
            text: EventConfig.alerts.welcome,
            type: 'info', // 'info', 'warning', 'danger', 'success'
            blinking: false
        };

        // Alert type configurations with Mario-style colors
        this.alertTypes = {
            info: { color: '#ffffff', bgColor: '#1e90ff', icon: 'ℹ️' },      // Blue like Mario's shirt
            warning: { color: '#000000', bgColor: '#ffff00', icon: '⚠️' },   // Yellow like coins
            danger: { color: '#ffffff', bgColor: '#ff0000', icon: '🚨' },    // Red like Mario's hat
            success: { color: '#ffffff', bgColor: '#00ff00', icon: '✅' }    // Green like pipes
        };

        // --- AUDIO AUTOPLAY UNLOCK LOGIC ---
        this.audioUnlocked = false;

        this.unlockAudioIfNeeded();
        // --- END AUDIO AUTOPLAY UNLOCK LOGIC ---

        this.setupUI();
    }

    /**
     * Initialize all UI components
     */
    setupUI() {
        this.uiGroup = this.scene.add.group();

        this.createCountdownOverlay();
        this.createBottomBar();
        this.createEventLogo();
        this.createAlertSystem();

        // Start countdown timer
        this.startCountdownTimer();

        console.log('🎨 UI Generator initialized with countdown and alert system');
    }

    /**
     * Draw a pixel art style rectangle with border
     */
    drawPixelArtRect(graphics, x, y, width, height, fillColor, borderColor, pixelSize = 4) {
        graphics.clear();

        // Draw main fill
        graphics.fillStyle(fillColor);
        graphics.fillRect(x, y, width, height);

        // Draw pixel art border
        graphics.fillStyle(borderColor);

        // Top border
        for (let px = x; px < x + width; px += pixelSize) {
            graphics.fillRect(px, y, pixelSize, pixelSize);
        }

        // Bottom border
        for (let px = x; px < x + width; px += pixelSize) {
            graphics.fillRect(px, y + height - pixelSize, pixelSize, pixelSize);
        }

        // Left border
        for (let py = y; py < y + height; py += pixelSize) {
            graphics.fillRect(x, py, pixelSize, pixelSize);
        }

        // Right border
        for (let py = y; py < y + height; py += pixelSize) {
            graphics.fillRect(x + width - pixelSize, py, pixelSize, pixelSize);
        }
    }

    /**
     * Create countdown overlay in top left corner
     */
    createCountdownOverlay() {
        const padding = 20;
        const bgWidth = 300;
        const bgHeight = 100;

        // Create pixel art style background with green border (Mario pipe green)
        const countdownBg = this.scene.add.graphics();
        countdownBg.setScrollFactor(0);
        countdownBg.setDepth(1000);

        // Draw pixel art style background with question block colors
        this.drawPixelArtRect(countdownBg, padding, padding, bgWidth, bgHeight, 0xFFD700, 0xFFA500, 4);

        // Event title with pixel font styling
        const eventTitle = this.scene.add.text(
            padding + bgWidth / 2,
            padding + 25,
            this.eventConfig.eventName,
            {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#000000',
                fontStyle: 'bold'
            }
        );
        eventTitle.setOrigin(0.5);
        eventTitle.setScrollFactor(0);
        eventTitle.setDepth(1001);

        // Countdown text with dark text on gold background
        this.countdownText = this.scene.add.text(
            padding + bgWidth / 2,
            padding + 55,
            'Loading...',
            {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#000000',
                fontStyle: 'bold'
            }
        );
        this.countdownText.setOrigin(0.5);
        this.countdownText.setScrollFactor(0);
        this.countdownText.setDepth(1001);

        // Status text
        this.statusText = this.scene.add.text(
            padding + bgWidth / 2,
            padding + 80,
            'Event Status: Upcoming',
            {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#444444'
            }
        );
        this.statusText.setOrigin(0.5);
        this.statusText.setScrollFactor(0);
        this.statusText.setDepth(1001);

        // Add to UI group
        this.uiGroup.addMultiple([countdownBg, eventTitle, this.countdownText, this.statusText]);
    }

    /**
     * Create bottom bar
     */
    createBottomBar() {
        const screenWidth = this.scene.cameras.main.width;
        const barHeight = 80;

        // Create pixel art style bottom bar
        this.bottomBar = this.scene.add.graphics();
        this.bottomBar.setScrollFactor(0);
        this.bottomBar.setDepth(1000);

        // Draw pixel art style bar with Mario blue (like Mario's overalls)
        this.drawPixelArtRect(this.bottomBar, 0, this.scene.cameras.main.height - barHeight,
            screenWidth, barHeight, 0x000000, 0x000000, 4);

        this.uiGroup.add(this.bottomBar);
    }

    /**
     * Create event logo in bottom bar
     */
    createEventLogo() {
        // Check if logo exists, otherwise create text logo
        if (this.scene.textures.exists('eventLogo')) {
            this.eventLogo = this.scene.add.image(
                110,
                this.scene.cameras.main.height - 40,
                'eventLogo'
            );
            this.eventLogo.setScale(0.15);
        } else {
            // Create text-based logo with pixel art styling
            this.eventLogo = this.scene.add.text(
                20,
                this.scene.cameras.main.height - 40,
                this.eventConfig.eventName,
                {
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    color: '#00ff00',
                    fontStyle: 'bold'
                }
            );
            this.eventLogo.setOrigin(0, 0.5);
        }

        this.eventLogo.setScrollFactor(0);
        this.eventLogo.setDepth(1001);

        this.uiGroup.add(this.eventLogo);
    }

    /**
     * Create alert system
     */
    createAlertSystem() {
        const screenWidth = this.scene.cameras.main.width;
        const alertY = this.scene.cameras.main.height - 40;
        const alertX = screenWidth - 220;

        // Alert background with pixel art styling
        this.alertBackground = this.scene.add.graphics();
        this.alertBackground.setScrollFactor(0);
        this.alertBackground.setDepth(1001);

        // Draw pixel art alert box
        this.drawPixelArtRect(this.alertBackground, alertX - 180, alertY - 25,
            400, 50, 0xff6b6b, 0xff0000, 4);

        // Alert text with pixel font
        this.alertText = this.scene.add.text(
            alertX,
            alertY,
            this.currentAlert.text,
            {
                fontSize: '16px',
                fontFamily: 'monospace',
                color: '#ffffff',
                fontStyle: 'bold',
                wordWrap: { width: 380, useAdvancedWrap: true }
            }
        );
        this.alertText.setOrigin(0.5);
        this.alertText.setScrollFactor(0);
        this.alertText.setDepth(1002);

        this.uiGroup.addMultiple([this.alertBackground, this.alertText]);

        // Update alert appearance
        this.updateAlertAppearance();
    }

    /**
     * Start the countdown timer
     */
    startCountdownTimer() {
        // Update countdown every second
        this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });

        // Initial update
        this.updateCountdown();
    }

    /**
     * Update countdown display with multi-day event support
     */
    updateCountdown() {
        const now = new Date();

        // Determine current event phase and target time
        let targetTime, statusText, phaseText;

        if (now < this.eventConfig.eventStart) {
            // Before event starts
            targetTime = this.eventConfig.eventStart;
            statusText = 'Event Status: Upcoming';
            phaseText = 'Starts in: ';
        } else if (now >= this.eventConfig.eventStart && now < this.eventConfig.day1End) {
            // Day 1 in progress
            targetTime = this.eventConfig.day1End;
            statusText = 'Event Status: Day 1 LIVE';
            phaseText = 'Day 1 ends in: ';
        } else if (now >= this.eventConfig.day1End && now < this.eventConfig.day2Start) {
            // Between Day 1 and Day 2
            targetTime = this.eventConfig.day2Start;
            statusText = 'Event Status: Day 1 Complete';
            phaseText = 'Day 2 starts in: ';
        } else if (now >= this.eventConfig.day2Start && now < this.eventConfig.day2End) {
            // Day 2 in progress
            targetTime = this.eventConfig.day2End;
            statusText = 'Event Status: Day 2 LIVE';
            phaseText = 'Day 2 ends in: ';
        } else {
            // Event is over
            this.countdownText.setText('EVENT COMPLETE!');
            this.countdownText.setColor('#00ff00');
            this.statusText.setText('Event Status: COMPLETE');
            this.statusText.setColor('#00ff00');
            return;
        }

        // Calculate time difference
        const timeLeft = targetTime - now;

        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            let countdownString = phaseText;
            if (days > 0) {
                countdownString += `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else if (hours > 0) {
                countdownString += `${hours}h ${minutes}m ${seconds}s`;
            } else if (minutes > 0) {
                countdownString += `${minutes}m ${seconds}s`;
            } else {
                countdownString += `${seconds}s`;
            }

            this.countdownText.setText(countdownString);

            // Set colors based on event phase
            if (statusText.includes('LIVE')) {
                this.countdownText.setColor('#ff0000');
                this.statusText.setColor('#ff0000');
            } else {
                this.countdownText.setColor('#000000');
                this.statusText.setColor('#444444');
            }

            this.statusText.setText(statusText);
        }
    }

    /**
     * Update alert message
     */
    updateAlert(text, type = 'info', blinking = false) {
        this.currentAlert = { text, type, blinking };

        this.alertText.setText(text);
        this.updateAlertAppearance();

        if (blinking) {
            this.startAlertBlinking();
        } else {
            this.stopAlertBlinking();
        }

        console.log(`🚨 Alert updated: ${text} (${type})`);
    }

    /**
     * Update alert visual appearance based on type
     */
    updateAlertAppearance() {
        const alertConfig = this.alertTypes[this.currentAlert.type];
        const screenWidth = this.scene.cameras.main.width;
        const alertY = this.scene.cameras.main.height - 40;
        const alertX = screenWidth - 230;

        if (alertConfig) {
            // Clear and redraw the alert background with new colors
            this.alertBackground.clear();
            const bgColorNum = parseInt(alertConfig.bgColor.replace('#', ''), 16);
            const borderColorNum = parseInt(alertConfig.color.replace('#', ''), 16);

            this.drawPixelArtRect(this.alertBackground, alertX - 180, alertY - 25,
                400, 50, bgColorNum, borderColorNum, 4);

            // Update text color and add icon
            this.alertText.setColor(alertConfig.color);
            const iconText = `${alertConfig.icon} ${this.currentAlert.text}`;
            this.alertText.setText(iconText);
        }
    }

    /**
     * Start alert blinking animation
     */
    startAlertBlinking() {
        this.stopAlertBlinking(); // Stop any existing blinking

        this.blinkTween = this.scene.tweens.add({
            targets: [this.alertBackground, this.alertText],
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    /**
     * Stop alert blinking animation
     */
    stopAlertBlinking() {
        if (this.blinkTween) {
            this.blinkTween.stop();
            this.blinkTween = null;

            // Reset alpha
            this.alertBackground.setAlpha(0.9);
            this.alertText.setAlpha(1);
        }
    }

    /**
     * Set event dates for multi-day events
     */
    setEventDate(date) {
        this.eventConfig.eventStart = new Date(date);
        console.log(`📅 Event start date set to: ${this.eventConfig.eventStart}`);
    }

    /**
     * Set all event dates from config object
     */
    setEventDates(config) {
        if (config.date) this.eventConfig.eventStart = new Date(config.date);
        if (config.day1End) this.eventConfig.day1End = new Date(config.day1End);
        if (config.day2Start) this.eventConfig.day2Start = new Date(config.day2Start);
        if (config.day2End) this.eventConfig.day2End = new Date(config.day2End);
        if (config.timezone) this.eventConfig.timezone = config.timezone;

        console.log(`📅 Event dates updated:`, {
            start: this.eventConfig.eventStart,
            day1End: this.eventConfig.day1End,
            day2Start: this.eventConfig.day2Start,
            day2End: this.eventConfig.day2End,
            timezone: this.eventConfig.timezone
        });
    }

    /**
     * Preset alert messages for common scenarios
     */
    showMealAlert(mealType, location, time) {
        this.updateAlert(`🍽️ ${mealType} served at ${location} - ${time}`, 'info', true);
    }

    showSafetyAlert(message) {
        this.updateAlert(`🚨 SAFETY: ${message}`, 'danger', true);
    }

    showGeneralNotice(message) {
        this.updateAlert(`📢 ${message}`, 'info', false);
    }

    showWarning(message) {
        this.updateAlert(`⚠️ ${message}`, 'warning', true);
    }

    showSuccess(message) {
        this.updateAlert(`✅ ${message}`, 'success', false);
    }

    /**
     * Quick preset alerts from EventConfig
     */
    showPresetAlert(alertKey) {
        const alertText = EventConfig.alerts[alertKey];
        if (alertText) {
            let type = 'info';
            let blinking = false;

            // Determine alert type based on content
            if (alertKey === 'emergency') {
                type = 'danger';
                blinking = true;
            } else if (alertKey.includes('parking') || alertKey.includes('close')) {
                type = 'warning';
                blinking = true;
            } else if (alertKey.includes('award') || alertKey.includes('success')) {
                type = 'success';
            }

            this.updateAlert(alertText, type, blinking);
        } else {
            console.warn(`⚠️ Alert preset '${alertKey}' not found`);
        }
    }

    /**
     * Hide all UI elements
     */
    hide() {
        this.uiGroup.setVisible(false);
    }

    /**
     * Show all UI elements
     */
    show() {
        this.uiGroup.setVisible(true);
    }

    /**
     * Clean up
     */
    destroy() {
        this.stopAlertBlinking();

        if (this.uiGroup) {
            this.uiGroup.clear(true, true);
        }
    }

    /**
     * Show a video popup overlay (YouTube or direct URL)
     * @param {Object} opts - { type: 'youtube'|'url', videoId, url }
     */
    showVideoPopup(opts) {
        this.closeVideoPopup(); // Only one at a time
        let overlay = document.createElement('div');
        overlay.id = 'video-popup-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        let content;
        if (opts.type === 'youtube' && opts.videoId) {
            content = document.createElement('iframe');
            content.width = 960;
            content.height = 540;
            content.src = `https://www.youtube.com/embed/${opts.videoId}?autoplay=1`;
            content.frameBorder = '0';
            content.allow = 'autoplay; encrypted-media';
            content.allowFullscreen = true;
        } else if (opts.type === 'url' && opts.url) {
            content = document.createElement('video');
            content.src = opts.url;
            content.controls = true;
            content.autoplay = true;
            content.muted = !this.audioUnlocked; // Only unmute if unlocked
            content.style.maxWidth = '90vw';
            content.style.maxHeight = '80vh';
            // Try to play with audio if unlocked
            setTimeout(() => {
                const playPromise = content.play();
                if (playPromise) {
                    playPromise.catch(() => {
                        // Show overlay prompt if autoplay with audio fails
                        this.showAudioPrompt(content);
                    });
                }
            }, 100);
        } else {
            content = document.createElement('div');
            content.innerText = 'Invalid video source.';
            content.style.color = 'white';
        }
        overlay.appendChild(content);

        // Close button
        let closeBtn = document.createElement('button');
        closeBtn.innerText = '✖';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '30px';
        closeBtn.style.right = '40px';
        closeBtn.style.fontSize = '2rem';
        closeBtn.style.background = 'rgba(0,0,0,0.5)';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => this.closeVideoPopup();
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);
    }

    /**
     * Close the video popup if it exists
     */
    closeVideoPopup() {
        const popup = document.getElementById('video-popup-overlay');
        if (popup) {
            popup.remove();
        }
    }

    /**
     * Show an audio player (YouTube or direct URL) that plays audio without visible video
     * @param {Object} opts - { type: 'youtube'|'url', videoId, url }
     */
    showAudioPopup(opts) {
        console.log('🔊 showAudioPopup called with options:', JSON.stringify(opts));
        this.closeAudioPlayer(); // Only one at a time

        // Create audio container - small and minimal
        let container = document.createElement('div');
        container.id = 'audio-player-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.padding = '10px';
        container.style.background = 'rgba(0,0,0,0.7)';
        container.style.borderRadius = '8px';
        container.style.color = 'white';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.zIndex = '9990';
        container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        container.style.maxWidth = '600px';

        // Create title element
        let titleElement = document.createElement('div');
        titleElement.style.marginRight = '10px';
        titleElement.style.fontSize = '12px';
        titleElement.style.whiteSpace = 'nowrap';
        titleElement.style.overflow = 'hidden';
        titleElement.style.textOverflow = 'ellipsis';
        titleElement.innerText = 'Now Playing: ';

        // Add content based on type
        if (opts.type === 'youtube' && opts.videoId) {
            // Create a hidden iframe for YouTube
            let iframe = document.createElement('iframe');
            iframe.id = 'youtube-audio-player';
            iframe.width = '1';
            iframe.height = '1';
            iframe.style.opacity = '0.01'; // Nearly invisible but still loads
            iframe.style.position = 'absolute';
            iframe.style.pointerEvents = 'none';
            // Use YouTube embed with autoplay and audio only
            iframe.src = `https://www.youtube.com/embed/${opts.videoId}?autoplay=1&enablejsapi=1`;
            iframe.allow = 'autoplay; encrypted-media';

            // Store reference for volume control
            this.audioElement = iframe;
            // Reset the YouTube player reference
            this.ytPlayer = null;
            titleElement.innerText += `YouTube Audio #${opts.videoId}`;

            // Add YouTube API script if not already added
            if (!window.YT) {
                console.log('Loading YouTube API');
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                // Set up the onYouTubeIframeAPIReady function
                window.onYouTubeIframeAPIReady = () => {
                    console.log('YouTube API ready, initializing player');
                    this.initializeYouTubePlayer();
                };
            } else {
                // API already loaded, create player directly
                setTimeout(() => {
                    console.log('YouTube API already loaded, initializing player');
                    this.initializeYouTubePlayer();
                }, 100);
            }

            container.appendChild(iframe);
        } else if (opts.type === 'url' && opts.url) {
            // Create audio element for direct URLs
            let audio = document.createElement('audio');
            audio.id = 'direct-audio-player';
            audio.src = opts.url;
            audio.controls = false; // We'll provide our own controls
            audio.autoplay = true;
            audio.style.display = 'none';

            // Store reference for volume control
            this.audioElement = audio;

            // Set initial volume
            if (this.currentVolume !== undefined) {
                audio.volume = this.currentVolume;
            } else {
                this.currentVolume = 0.7; // Default volume
                audio.volume = this.currentVolume;
            }

            // Extract filename from URL for display
            const urlParts = opts.url.split('/');
            const filename = urlParts[urlParts.length - 1];
            titleElement.innerText += filename;

            container.appendChild(audio);

            // Try to play with audio
            setTimeout(() => {
                const playPromise = audio.play();
                if (playPromise) {
                    playPromise.catch(() => {
                        // Show overlay prompt if autoplay with audio fails
                        this.showAudioPrompt(audio);
                    });
                }
            }, 100);
        } else {
            titleElement.innerText = 'Invalid audio source';
        }

        container.appendChild(titleElement);

        // Add volume display
        let volumeDisplay = document.createElement('div');
        volumeDisplay.id = 'audio-volume-display';
        volumeDisplay.style.marginRight = '10px';
        volumeDisplay.style.fontSize = '12px';
        volumeDisplay.style.minWidth = '40px';
        volumeDisplay.style.textAlign = 'center';
        volumeDisplay.innerText = `${Math.round((this.currentVolume || 0.7) * 100)}%`;
        container.appendChild(volumeDisplay);

        // Volume controls
        let volumeControlsDiv = document.createElement('div');
        volumeControlsDiv.style.display = 'flex';
        volumeControlsDiv.style.alignItems = 'center';

        // Volume down button
        let volumeDownBtn = document.createElement('button');
        volumeDownBtn.innerText = '−';
        volumeDownBtn.style.background = 'rgba(50,50,50,0.8)';
        volumeDownBtn.style.color = 'white';
        volumeDownBtn.style.border = 'none';
        volumeDownBtn.style.borderRadius = '4px';
        volumeDownBtn.style.margin = '0 5px';
        volumeDownBtn.style.cursor = 'pointer';
        volumeDownBtn.style.width = '30px';
        volumeDownBtn.style.height = '24px';
        volumeDownBtn.onclick = () => this.adjustAudioVolume(-0.1);
        volumeControlsDiv.appendChild(volumeDownBtn);

        // Volume up button
        let volumeUpBtn = document.createElement('button');
        volumeUpBtn.innerText = '+';
        volumeUpBtn.style.background = 'rgba(50,50,50,0.8)';
        volumeUpBtn.style.color = 'white';
        volumeUpBtn.style.border = 'none';
        volumeUpBtn.style.borderRadius = '4px';
        volumeUpBtn.style.margin = '0 5px';
        volumeUpBtn.style.cursor = 'pointer';
        volumeUpBtn.style.width = '30px';
        volumeUpBtn.style.height = '24px';
        volumeUpBtn.onclick = () => this.adjustAudioVolume(0.1);
        volumeControlsDiv.appendChild(volumeUpBtn);

        container.appendChild(volumeControlsDiv);

        // Close button
        let closeBtn = document.createElement('button');
        closeBtn.innerText = '✖';
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.marginLeft = '10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '16px';
        closeBtn.onclick = () => this.closeAudioPlayer();
        container.appendChild(closeBtn);

        document.body.appendChild(container);
    }

    /**
     * Close the audio player if it exists
     */
    closeAudioPlayer() {
        const player = document.getElementById('audio-player-container');
        if (player) {
            player.remove();
            this.audioElement = null;

            // Clean up YouTube player reference
            if (this.ytPlayer) {
                try {
                    this.ytPlayer.destroy();
                } catch (e) {
                    console.warn('Error destroying YouTube player:', e);
                }
                this.ytPlayer = null;
            }
        }
    }

    /**
     * Set the volume for the current audio player
     * @param {number} level - Volume level (0-1)
     */
    setAudioVolume(level) {
        // Ensure level is between 0 and 1
        const volume = Math.max(0, Math.min(1, level));
        this.currentVolume = volume;

        console.log(`Setting audio volume to ${Math.round(volume * 100)}%`);

        // Apply to audio element if it exists
        if (this.audioElement) {
            if (this.audioElement.tagName === 'AUDIO') {
                // Standard HTML5 audio element
                this.audioElement.volume = volume;
                console.log('Applied volume to HTML5 audio element');
            } else if (this.audioElement.id === 'youtube-audio-player') {
                // YouTube iframe needs special handling via API
                // Store player reference if we don't have one yet
                if (!this.ytPlayer && window.YT && window.YT.Player) {
                    try {
                        console.log('Creating new YouTube player reference');
                        // Create a reference to the YouTube player
                        this.ytPlayer = new window.YT.Player(this.audioElement.id, {
                            events: {
                                'onReady': (event) => {
                                    console.log('YouTube player ready');
                                    event.target.setVolume(volume * 100);
                                }
                            }
                        });
                    } catch (e) {
                        console.warn('Could not create YouTube player:', e);
                    }
                } else if (this.ytPlayer) {
                    // Use existing player reference
                    try {
                        console.log('Using existing YouTube player reference');
                        this.ytPlayer.setVolume(volume * 100); // YouTube uses 0-100
                    } catch (e) {
                        console.warn('Could not set YouTube volume with existing player:', e);
                    }
                } else {
                    console.warn('YouTube API not ready yet');

                    // Add the YouTube API if not present
                    if (!window.YT) {
                        const tag = document.createElement('script');
                        tag.src = "https://www.youtube.com/iframe_api";
                        const firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                        // Set up the onYouTubeIframeAPIReady function if not defined
                        if (!window.onYouTubeIframeAPIReady) {
                            window.onYouTubeIframeAPIReady = () => {
                                console.log('YouTube API ready, creating player');
                                this.setAudioVolume(this.currentVolume); // Try again
                            };
                        }
                    }
                }
            }
        } else {
            console.warn('No audio element available to adjust volume');
        }

        // Update volume display
        const volumeDisplay = document.getElementById('audio-volume-display');
        if (volumeDisplay) {
            volumeDisplay.innerText = `${Math.round(volume * 100)}%`;
        }
    }

    /**
     * Adjust the volume by the given amount
     * @param {number} amount - Amount to adjust (-1 to 1)
     */
    adjustAudioVolume(amount) {
        console.log(`Adjusting volume by ${amount > 0 ? '+' : ''}${amount * 100}%`);
        const currentVol = this.currentVolume !== undefined ? this.currentVolume : 0.7;
        const newVolume = Math.max(0, Math.min(1, currentVol + amount));
        console.log(`Volume changing from ${Math.round(currentVol * 100)}% to ${Math.round(newVolume * 100)}%`);
        this.setAudioVolume(newVolume);
    }

    /**
     * Show a livestream popup overlay (YouTube or Twitch)
     * @param {Object} opts - { type: 'youtube'|'twitch', channelId, channel }
     */
    showLivestreamPopup(opts) {
        this.closeLivestreamPopup(); // Only one at a time
        let overlay = document.createElement('div');
        overlay.id = 'livestream-popup-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        let content;
        if (opts.type === 'youtube' && opts.channelId) {
            content = document.createElement('iframe');
            content.width = 960;
            content.height = 540;
            content.src = `https://www.youtube.com/embed/live_stream?channel=${opts.channelId}&autoplay=1`;
            content.frameBorder = '0';
            content.allow = 'autoplay; encrypted-media';
            content.allowFullscreen = true;
        } else if (opts.type === 'twitch' && opts.channel) {
            content = document.createElement('iframe');
            content.width = 960;
            content.height = 540;
            content.src = `https://player.twitch.tv/?channel=${opts.channel}&parent=${window.location.hostname}`;
            content.frameBorder = '0';
            content.allowFullscreen = true;
        } else {
            content = document.createElement('div');
            content.innerText = 'Invalid livestream source.';
            content.style.color = 'white';
        }
        overlay.appendChild(content);

        // Close button
        let closeBtn = document.createElement('button');
        closeBtn.innerText = '✖';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '30px';
        closeBtn.style.right = '40px';
        closeBtn.style.fontSize = '2rem';
        closeBtn.style.background = 'rgba(0,0,0,0.5)';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => this.closeLivestreamPopup();
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);
    }

    /**
     * Remove the livestream popup overlay
     */
    closeLivestreamPopup() {
        let overlay = document.getElementById('livestream-popup-overlay');
        if (overlay) overlay.remove();
    }

    /**
     * Listen for first user interaction to unlock audio for autoplay
     */
    unlockAudioIfNeeded() {
        if (this.audioUnlocked) return;
        const unlock = () => {
            this.audioUnlocked = true;
            window.removeEventListener('pointerdown', unlock, true);
            window.removeEventListener('keydown', unlock, true);
        };
        window.addEventListener('pointerdown', unlock, true);
        window.addEventListener('keydown', unlock, true);
    }

    /**
     * Initialize the YouTube player for volume control
     */
    initializeYouTubePlayer() {
        if (!this.audioElement || this.audioElement.id !== 'youtube-audio-player') {
            console.warn('Cannot initialize YouTube player: audio element not available');
            return;
        }

        if (!window.YT || !window.YT.Player) {
            console.warn('YouTube API not available yet');
            return;
        }

        try {
            console.log('Creating YouTube player object');
            this.ytPlayer = new window.YT.Player('youtube-audio-player', {
                events: {
                    'onReady': (event) => {
                        console.log('YouTube player ready, setting initial volume');
                        const volume = this.currentVolume !== undefined ? this.currentVolume : 0.7;
                        event.target.setVolume(volume * 100);

                        // Explicitly start playing
                        console.log('Attempting to play YouTube audio...');
                        event.target.playVideo();

                        // Check play status after a short delay
                        setTimeout(() => {
                            const state = event.target.getPlayerState();
                            console.log('YouTube player state after play attempt:', state);
                            // 1 = playing, 2 = paused, 3 = buffering, 5 = cued
                            if (state !== 1 && state !== 3) {
                                console.warn('YouTube player not playing, trying again...');
                                event.target.playVideo();
                            }
                        }, 1000);
                    },
                    'onStateChange': (event) => {
                        console.log('YouTube player state changed:', event.data);
                        // 1 = playing, 2 = paused, 3 = buffering, 5 = cued
                        if (event.data === 1) {
                            console.log('YouTube player is now playing');
                        } else if (event.data === 2) {
                            console.log('YouTube player is now paused');
                        }
                    },
                    'onError': (event) => {
                        console.error('YouTube player error:', event.data);
                        // YouTube error codes: 2 = invalid parameter, 5 = HTML5 player error, 100 = video not found, 101/150 = embedding disabled
                        let errorMessage = 'Unknown error';
                        switch (event.data) {
                            case 2: errorMessage = 'Invalid parameter'; break;
                            case 5: errorMessage = 'HTML5 player error'; break;
                            case 100: errorMessage = 'Video not found'; break;
                            case 101:
                            case 150: errorMessage = 'Embedding disabled'; break;
                        }
                        console.error(`YouTube error: ${errorMessage}`);
                    }
                }
            });
        } catch (e) {
            console.error('Failed to initialize YouTube player:', e);
        }
    }
}
