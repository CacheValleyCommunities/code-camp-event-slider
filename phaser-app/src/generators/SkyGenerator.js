/**
 * SkyGenerator - Procedural sky generation with gradient, noise, and time-of-day variations
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';

export default class SkyGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noiseGenerator = new NoiseGenerator();
        this.skyGraphics = null;
        this.starField = null;

        // Animation properties
        this.timeOfDay = 0; // 0-1, where 0 is midnight, 0.5 is noon
        this.timeSpeed = 0.00001; // How fast time progresses (10x slower)
        this.cloudNoiseOffset = 0;

        // Shooting star properties
        this.shootingStars = [];
        this.shootingStarTimer = 0;
        this.shootingStarInterval = 5000; // Base interval between shooting stars (5 seconds)
        this.maxShootingStars = 3; // Maximum concurrent shooting stars

        // Sky dimensions - ensure they're valid and cover the visible screen
        this.width = Math.max(this.scene.sys.game.config.width, 1200);
        this.height = Math.max(this.scene.sys.game.config.height, 600);

        console.log(`🌌 SkyGenerator initialized with dimensions: ${this.width}x${this.height}`);
    }/**
     * Create procedural sky with gradient and optional noise
     */
    createSky(timeOfDay = 0, showStars = true, addNoise = true) {
        this.timeOfDay = timeOfDay;

        // Create graphics object directly instead of render texture
        this.skyGraphics = this.scene.add.graphics();
        this.skyGraphics.setDepth(-100);
        this.skyGraphics.setScrollFactor(0); // Sky should not scroll with camera

        // Generate the sky
        this.generateSky(addNoise);

        // Add stars for night time
        if (showStars && this.isNightTime()) {
            this.generateStars();
        }

        console.log('🌌 Procedural sky generated');
        return this.skyGraphics;
    }    /**
     * Generate the main sky gradient with optional noise
     */
    generateSky(addNoise = true) {
        // Validate dimensions
        if (this.width <= 0 || this.height <= 0) {
            console.error('❌ Invalid sky dimensions:', this.width, 'x', this.height);
            return;
        }

        console.log('🎨 Generating sky with dimensions:', this.width, 'x', this.height);

        // Clear any existing graphics
        this.skyGraphics.clear();

        // Get time-based colors
        const colors = this.getTimeBasedColors();
        const topColor = this.hexStringToNumber(colors.top);
        const bottomColor = this.hexStringToNumber(colors.bottom);

        // Create vertical gradient by drawing multiple horizontal lines
        // This is more reliable than fillGradientStyle which can be buggy
        const steps = 50; // Number of gradient steps (reduced for performance)
        for (let i = 0; i < steps; i++) {
            const y = (i / steps) * this.height;
            const ratio = i / (steps - 1);

            // Interpolate between top and bottom color
            const color = this.interpolateColors(topColor, bottomColor, ratio);

            this.skyGraphics.fillStyle(color);
            this.skyGraphics.fillRect(0, y, this.width, this.height / steps + 1);
        }

        // Add atmospheric effects using additional graphics
        if (addNoise) {
            this.addAtmosphericEffects(colors);
        }
    }    /**
     * Add simplified atmospheric effects using graphics
     */
    addAtmosphericEffects(colors) {
        // Create some atmospheric "noise" using small semi-transparent shapes
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 3 + 1;
            const alpha = Math.random() * 0.1 + 0.05;

            // Use noise to determine if we should place an effect here
            const noiseValue = this.noiseGenerator.perlin2D(x * 0.01, y * 0.01);
            if (noiseValue > 0) {
                this.skyGraphics.fillStyle(0xFFFFFF, alpha);
                this.skyGraphics.fillCircle(x, y, size);
            }
        }
    }

    /**
     * Convert hex color string to number
     */
    hexStringToNumber(hexString) {
        if (typeof hexString === 'string') {
            return parseInt(hexString.replace('#', ''), 16);
        }
        return hexString;
    }    /**
     * Generate star field for night sky
     */
    generateStars() {
        if (!this.isNightTime()) return;

        const starCount = Math.floor(50 + Math.random() * 50);
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-99);
        graphics.setScrollFactor(0); // FIXED: Stars should not scroll with camera

        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * (this.height * 0.6); // Only in upper sky
            const size = Math.random() * 1.5 + 0.5;
            const brightness = 0.5 + Math.random() * 0.5;

            // Simple star placement
            graphics.fillStyle(0xFFFFFF, brightness);
            graphics.fillCircle(x, y, size);
        }

        this.starField = graphics;
        console.log('⭐ Generated', starCount, 'stars');
    }

    /**
     * Get colors based on time of day
     */
    getTimeBasedColors() {
        const time = this.timeOfDay;

        // Define color stops for different times (using hex numbers for simplicity)
        const colorStops = {
            // Midnight (0.0)
            midnight: {
                top: '#0a0a2e',
                bottom: '#533483'
            },
            // Dawn (0.2)
            dawn: {
                top: '#ff6b6b',
                bottom: '#54a0ff'
            },
            // Morning (0.3)
            morning: {
                top: '#74b9ff',
                bottom: '#fd79a8'
            },
            // Noon (0.5)
            noon: {
                top: '#87CEEB',
                bottom: '#B0E0E6'
            },
            // Sunset (0.8)
            sunset: {
                top: '#fd79a8',
                bottom: '#6c5ce7'
            },
            // Night (0.9)
            night: {
                top: '#2d3436',
                bottom: '#0984e3'
            }
        };

        // Simple time-based selection (no interpolation for now to avoid errors)
        if (time < 0.15) {
            return colorStops.midnight;
        } else if (time < 0.25) {
            return colorStops.dawn;
        } else if (time < 0.4) {
            return colorStops.morning;
        } else if (time < 0.7) {
            return colorStops.noon;
        } else if (time < 0.85) {
            return colorStops.sunset;
        } else {
            return colorStops.night;
        }
    }

    /**
     * Check if it's night time
     */
    isNightTime() {
        return this.timeOfDay < 0.15 || this.timeOfDay > 0.85;
    }

    /**
     * Check if it's dawn time (when shooting stars are most visible)
     */
    isDawnTime() {
        return this.timeOfDay >= 0.15 && this.timeOfDay <= 0.25;
    }

    /**
     * Check if shooting stars should appear (night or dawn)
     */
    shouldShowShootingStars() {
        return this.isNightTime() || this.isDawnTime();
    }

    /**
     * Update the sky (for time progression)
     */
    update(delta) {
        // Progress time slowly
        this.timeOfDay += this.timeSpeed * delta;
        if (this.timeOfDay > 1) this.timeOfDay = 0;

        // Update noise offset for subtle animation
        this.cloudNoiseOffset += 0.00001 * delta;

        // Update star twinkle
        if (this.starField && this.isNightTime()) {
            this.updateStarTwinkle();
        }

        // Update shooting stars
        if (this.shouldShowShootingStars()) {
            this.updateShootingStars(delta);
        } else {
            // Clean up shooting stars during day time
            this.cleanupShootingStars();
        }
    }

    /**
     * Update star twinkling effect
     */
    updateStarTwinkle() {
        // Simple alpha oscillation for twinkling effect
        if (this.starField) {
            const twinkle = 0.7 + Math.sin(Date.now() * 0.003) * 0.3;
            this.starField.setAlpha(twinkle);
        }
    }

    /**
     * Update shooting stars system
     */
    updateShootingStars(delta) {
        // Update timer for creating new shooting stars
        this.shootingStarTimer += delta;

        // Create new shooting star if conditions are met
        if (this.shootingStarTimer >= this.shootingStarInterval &&
            this.shootingStars.length < this.maxShootingStars) {

            // Random chance to create a shooting star (30% chance when timer expires)
            if (Math.random() < 0.3) {
                this.createShootingStar();
                this.shootingStarTimer = 0;
            } else {
                // Reset timer with some randomness if no star was created
                this.shootingStarTimer = this.shootingStarInterval * 0.7;
            }
        }

        // Update existing shooting stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const star = this.shootingStars[i];
            this.updateShootingStar(star, delta);

            // Remove if off screen or faded out
            if (star.x > this.width + 200 || star.y > this.height + 200 || star.alpha <= 0) {
                star.graphics.destroy();
                this.shootingStars.splice(i, 1);
            }
        }
    }

    /**
     * Create a new shooting star
     */
    createShootingStar() {
        // Create shooting star starting from random position on left/top edges
        const startSide = Math.random() < 0.7 ? 'top' : 'left'; // Prefer starting from top
        let startX, startY;

        if (startSide === 'top') {
            startX = Math.random() * this.width * 0.8; // Don't start too far right
            startY = -50;
        } else {
            startX = -50;
            startY = Math.random() * this.height * 0.4; // Upper portion of sky
        }

        // Random velocity - shooting stars move diagonally down and right
        const velocity = {
            x: 200 + Math.random() * 300, // 200-500 pixels per second
            y: 100 + Math.random() * 200  // 100-300 pixels per second
        };

        // Create graphics for the shooting star
        const graphics = this.scene.add.graphics();
        graphics.setDepth(-98); // In front of stars, behind other sky elements
        graphics.setScrollFactor(0); // Don't scroll with camera

        const shootingStar = {
            x: startX,
            y: startY,
            velocity: velocity,
            graphics: graphics,
            alpha: 1,
            trail: [], // Trail points for streak effect
            trailLength: 15,
            life: 0,
            maxLife: 3000 + Math.random() * 2000 // 3-5 seconds
        };

        this.shootingStars.push(shootingStar);
        console.log('🌠 Shooting star created');
    }

    /**
     * Update a single shooting star
     */
    updateShootingStar(star, delta) {
        const deltaSeconds = delta / 1000;

        // Update position
        star.x += star.velocity.x * deltaSeconds;
        star.y += star.velocity.y * deltaSeconds;

        // Update life and alpha
        star.life += delta;
        const lifeRatio = star.life / star.maxLife;

        // Fade out over time (start fading at 70% of life)
        if (lifeRatio > 0.7) {
            star.alpha = 1 - ((lifeRatio - 0.7) / 0.3);
        }

        // Add point to trail
        star.trail.push({ x: star.x, y: star.y, alpha: star.alpha });

        // Limit trail length
        if (star.trail.length > star.trailLength) {
            star.trail.shift();
        }

        // Render the shooting star
        this.renderShootingStar(star);
    }

    /**
     * Render a shooting star with trail effect
     */
    renderShootingStar(star) {
        star.graphics.clear();

        // Draw trail
        if (star.trail.length > 1) {
            for (let i = 0; i < star.trail.length - 1; i++) {
                const point = star.trail[i];
                const nextPoint = star.trail[i + 1];
                const trailAlpha = (i / star.trail.length) * point.alpha * 0.6;
                const thickness = (i / star.trail.length) * 3;

                if (trailAlpha > 0.01) {
                    star.graphics.lineStyle(thickness, 0xFFFFFF, trailAlpha);
                    star.graphics.beginPath();
                    star.graphics.moveTo(point.x, point.y);
                    star.graphics.lineTo(nextPoint.x, nextPoint.y);
                    star.graphics.strokePath();
                }
            }
        }

        // Draw main star (bright point)
        if (star.alpha > 0.01) {
            star.graphics.fillStyle(0xFFFFFF, star.alpha);
            star.graphics.fillCircle(star.x, star.y, 2);

            // Add glow effect
            star.graphics.fillStyle(0xFFFFFF, star.alpha * 0.3);
            star.graphics.fillCircle(star.x, star.y, 4);
        }
    }

    /**
     * Clean up all shooting stars
     */
    cleanupShootingStars() {
        for (const star of this.shootingStars) {
            star.graphics.destroy();
        }
        this.shootingStars = [];
        this.shootingStarTimer = 0;
    }

    /**
     * Set specific time of day
     */
    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
        console.log('🕐 Time set to:', this.timeOfDay);

        // Regenerate sky with new time
        this.generateSky(true);

        // Update stars
        if (this.starField) {
            this.starField.destroy();
            this.starField = null;
        }

        if (this.isNightTime()) {
            this.generateStars();
        }

        // Clean up shooting stars if not appropriate time
        if (!this.shouldShowShootingStars()) {
            this.cleanupShootingStars();
        }
    }

    /**
     * Get current time of day
     */
    getTimeOfDay() {
        return this.timeOfDay;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.skyGraphics) {
            this.skyGraphics.destroy();
        }
        if (this.starField) {
            this.starField.destroy();
        }
        // Clean up shooting stars
        this.cleanupShootingStars();
    }

    /**
     * Interpolate between two colors
     */
    interpolateColors(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;

        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }
}
