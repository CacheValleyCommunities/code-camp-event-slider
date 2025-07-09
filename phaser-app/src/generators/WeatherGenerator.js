/**
 * WeatherGenerator - Creates dynamic weather effects for the Mario-style forest scene
 * Includes rain, fog, falling leaves, and seasonal snow
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';

export default class WeatherGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noise = new NoiseGenerator();

        // Weather state
        this.currentWeather = 'rain'; // 'clear', 'rain', 'fog', 'snow', 'leaves'
        this.weatherIntensity = 0.5; // 0-1 scale
        this.weatherTimer = 0;
        this.weatherDuration = 0;
        this.nextWeatherChange = 30000; // 30 seconds until next weather change

        // Weather particles arrays
        this.rainDrops = [];
        this.snowFlakes = [];
        this.leaves = [];
        this.fogParticles = [];

        // Graphics objects
        this.weatherGraphics = null;
        this.fogGraphics = null;

        // Weather settings
        this.maxRainDrops = 150;
        this.maxSnowFlakes = 100;
        this.maxLeaves = 50;
        this.maxFogParticles = 80;

        // Screen dimensions
        this.width = this.scene.sys.game.config.width;
        this.height = this.scene.sys.game.config.height;

        console.log('🌦️ WeatherGenerator initialized');
    }

    /**
     * Initialize weather system
     */
    initializeWeather() {
        // Create graphics objects for weather effects
        this.weatherGraphics = this.scene.add.graphics();
        this.weatherGraphics.setDepth(15); // Above trees and houses
        this.weatherGraphics.setScrollFactor(0.1); // Slight parallax effect

        this.fogGraphics = this.scene.add.graphics();
        this.fogGraphics.setDepth(5); // Between trees and other elements
        this.fogGraphics.setScrollFactor(0.05); // Slower parallax for depth

        // Start with clear weather
        this.setWeather('rain');

        console.log('🌦️ Weather system initialized');
    }

    /**
     * Update weather system
     */
    update(delta) {
        this.weatherTimer += delta;

        // Check if it's time to change weather
        if (this.weatherTimer >= this.nextWeatherChange) {
            this.changeWeather();
            this.weatherTimer = 0;
        }

        // Update current weather effects
        this.updateCurrentWeather(delta);
        this.renderWeatherEffects();
    }

    /**
     * Change to a new weather pattern
     */
    changeWeather() {
        const timeOfDay = this.scene.skyGenerator ? this.scene.skyGenerator.getTimeOfDay() : 0.5;
        const weatherOptions = this.getWeatherOptions(timeOfDay);

        // Select random weather from available options
        const newWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

        this.setWeather(newWeather);

        // Set next weather change (random between 20-60 seconds)
        this.nextWeatherChange = 20000 + Math.random() * 40000;

        console.log(`🌦️ Weather changed to: ${newWeather} (intensity: ${this.weatherIntensity})`);
    }

    /**
     * Get available weather options based on time of day
     */
    getWeatherOptions(timeOfDay) {
        const baseOptions = ['clear', 'clear', 'clear']; // Higher chance of clear weather

        if (timeOfDay < 0.2 || timeOfDay > 0.8) {
            // Night/Dawn - fog and gentle effects
            return [...baseOptions, 'fog', 'fog', 'leaves'];
        } else if (timeOfDay < 0.3 || timeOfDay > 0.7) {
            // Dawn/Dusk - atmospheric effects
            return [...baseOptions, 'fog', 'leaves', 'rain'];
        } else {
            // Day - all weather types possible
            return [...baseOptions, 'rain', 'leaves', 'snow'];
        }
    }

    /**
     * Set specific weather type
     */
    setWeather(weatherType) {
        this.currentWeather = weatherType;

        // Set weather intensity based on type
        switch (weatherType) {
            case 'clear':
                this.weatherIntensity = 0;
                this.weatherDuration = 0;
                break;
            case 'rain':
                this.weatherIntensity = 0.3 + Math.random() * 10; // Light to moderate rain
                this.weatherDuration = 15000 + Math.random() * 25000; // 15-40 seconds
                break;
            case 'fog':
                this.weatherIntensity = 0.2 + Math.random() * 0.4; // Light to moderate fog
                this.weatherDuration = 20000 + Math.random() * 30000; // 20-50 seconds
                break;
            case 'snow':
                this.weatherIntensity = 0.2 + Math.random() * 0.3; // Light snow
                this.weatherDuration = 10000 + Math.random() * 20000; // 10-30 seconds
                break;
            case 'leaves':
                this.weatherIntensity = 0.3 + Math.random() * 0.4; // Moderate leaf fall
                this.weatherDuration = 8000 + Math.random() * 15000; // 8-23 seconds
                break;
            default:
                this.weatherIntensity = 0;
                this.weatherDuration = 0;
                break;
        }

        // Clear existing particles when changing weather
        this.clearAllParticles();
    }

    /**
     * Update current weather effects
     */
    updateCurrentWeather(delta) {
        switch (this.currentWeather) {
            case 'rain':
                this.updateRain(delta);
                break;
            case 'fog':
                this.updateFog(delta);
                break;
            case 'snow':
                this.updateSnow(delta);
                break;
            case 'leaves':
                this.updateLeaves(delta);
                break;
            case 'clear':
                // Gradually clear existing particles
                this.fadeOutParticles(delta);
                break;
            default:
                // Default to clear weather behavior
                this.fadeOutParticles(delta);
                break;
        }
    }

    /**
     * Update rain effects
     */
    updateRain(delta) {
        const deltaSeconds = delta / 1000;
        const targetDrops = Math.floor(this.maxRainDrops * this.weatherIntensity);

        // Create new raindrops
        while (this.rainDrops.length < targetDrops) {
            this.rainDrops.push(this.createRainDrop());
        }

        // Update existing raindrops
        for (let i = this.rainDrops.length - 1; i >= 0; i--) {
            const drop = this.rainDrops[i];

            // Move raindrop
            drop.x += drop.velocityX * deltaSeconds;
            drop.y += drop.velocityY * deltaSeconds;

            // Remove if off screen
            if (drop.y > this.height + 50 || drop.x > this.width + 100) {
                this.rainDrops.splice(i, 1);
            }
        }
    }

    /**
     * Create a rain drop
     */
    createRainDrop() {
        return {
            x: -50 + Math.random() * (this.width + 100),
            y: -20 + Math.random() * 50,
            velocityX: 50 + Math.random() * 100, // Diagonal rain
            velocityY: 400 + Math.random() * 200, // Fast falling
            length: 4 + Math.random() * 8,
            alpha: 0.4 + Math.random() * 0.4
        };
    }

    /**
     * Update snow effects
     */
    updateSnow(delta) {
        const deltaSeconds = delta / 1000;
        const targetFlakes = Math.floor(this.maxSnowFlakes * this.weatherIntensity);

        // Create new snowflakes
        while (this.snowFlakes.length < targetFlakes) {
            this.snowFlakes.push(this.createSnowFlake());
        }

        // Update existing snowflakes
        for (let i = this.snowFlakes.length - 1; i >= 0; i--) {
            const flake = this.snowFlakes[i];

            // Move snowflake with gentle swaying
            flake.x += flake.velocityX * deltaSeconds + Math.sin(flake.life * 0.002) * 0.5;
            flake.y += flake.velocityY * deltaSeconds;
            flake.life += delta;

            // Remove if off screen
            if (flake.y > this.height + 20) {
                this.snowFlakes.splice(i, 1);
            }
        }
    }

    /**
     * Create a snowflake
     */
    createSnowFlake() {
        return {
            x: Math.random() * (this.width + 100),
            y: -20,
            velocityX: -10 + Math.random() * 20, // Gentle horizontal drift
            velocityY: 30 + Math.random() * 50, // Slow falling
            size: 1 + Math.random() * 3,
            alpha: 0.6 + Math.random() * 0.4,
            life: 0
        };
    }

    /**
     * Update falling leaves effects
     */
    updateLeaves(delta) {
        const deltaSeconds = delta / 1000;
        const targetLeaves = Math.floor(this.maxLeaves * this.weatherIntensity);

        // Create new leaves
        while (this.leaves.length < targetLeaves) {
            this.leaves.push(this.createLeaf());
        }

        // Update existing leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            const leaf = this.leaves[i];

            // Move leaf with realistic swaying and rotation
            leaf.x += leaf.velocityX * deltaSeconds + Math.sin(leaf.life * 0.001) * 0.8;
            leaf.y += leaf.velocityY * deltaSeconds;
            leaf.rotation += leaf.rotationSpeed * deltaSeconds;
            leaf.life += delta;

            // Simulate wind gusts
            if (Math.random() < 0.01) {
                leaf.velocityX += (Math.random() - 0.5) * 50;
            }

            // Remove if off screen
            if (leaf.y > this.height + 20) {
                this.leaves.splice(i, 1);
            }
        }
    }

    /**
     * Create a falling leaf
     */
    createLeaf() {
        const leafTypes = [
            { color: 0xDEB887, size: 3 }, // Tan
            { color: 0xCD853F, size: 4 }, // Peru
            { color: 0xA0522D, size: 3 }, // Sienna
            { color: 0x8B4513, size: 2 }, // Saddle brown
            { color: 0xDAA520, size: 3 }  // Goldenrod
        ];

        const leafType = leafTypes[Math.floor(Math.random() * leafTypes.length)];

        return {
            x: Math.random() * (this.width + 200),
            y: -20,
            velocityX: -20 + Math.random() * 40,
            velocityY: 20 + Math.random() * 40, // Slow, gentle falling
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2,
            color: leafType.color,
            size: leafType.size,
            alpha: 0.7 + Math.random() * 0.3,
            life: 0
        };
    }

    /**
     * Update fog effects
     */
    updateFog(delta) {
        const deltaSeconds = delta / 1000;
        const targetParticles = Math.floor(this.maxFogParticles * this.weatherIntensity);

        // Create new fog particles
        while (this.fogParticles.length < targetParticles) {
            this.fogParticles.push(this.createFogParticle());
        }

        // Update existing fog particles
        for (let i = this.fogParticles.length - 1; i >= 0; i--) {
            const particle = this.fogParticles[i];

            // Move fog particle slowly
            particle.x += particle.velocityX * deltaSeconds;
            particle.y += particle.velocityY * deltaSeconds;
            particle.life += delta;

            // Fade in and out
            const lifeCycle = particle.life / particle.maxLife;
            if (lifeCycle < 0.3) {
                particle.alpha = (lifeCycle / 0.3) * particle.maxAlpha;
            } else if (lifeCycle > 0.7) {
                particle.alpha = ((1 - lifeCycle) / 0.3) * particle.maxAlpha;
            } else {
                particle.alpha = particle.maxAlpha;
            }

            // Remove if life exceeded or off screen
            if (particle.life > particle.maxLife || particle.x > this.width + 200) {
                this.fogParticles.splice(i, 1);
            }
        }
    }

    /**
     * Create a fog particle
     */
    createFogParticle() {
        return {
            x: -100 + Math.random() * 50,
            y: Math.random() * this.height,
            velocityX: 10 + Math.random() * 20,
            velocityY: -5 + Math.random() * 10,
            size: 20 + Math.random() * 60,
            maxAlpha: 0.1 + Math.random() * 0.2,
            alpha: 0,
            life: 0,
            maxLife: 8000 + Math.random() * 12000 // 8-20 seconds
        };
    }

    /**
     * Fade out existing particles when weather clears
     */
    fadeOutParticles(delta) {
        const fadeSpeed = delta * 0.001;

        // Fade out rain
        for (let i = this.rainDrops.length - 1; i >= 0; i--) {
            this.rainDrops[i].alpha -= fadeSpeed;
            if (this.rainDrops[i].alpha <= 0) {
                this.rainDrops.splice(i, 1);
            }
        }

        // Fade out snow
        for (let i = this.snowFlakes.length - 1; i >= 0; i--) {
            this.snowFlakes[i].alpha -= fadeSpeed;
            if (this.snowFlakes[i].alpha <= 0) {
                this.snowFlakes.splice(i, 1);
            }
        }

        // Fade out leaves
        for (let i = this.leaves.length - 1; i >= 0; i--) {
            this.leaves[i].alpha -= fadeSpeed;
            if (this.leaves[i].alpha <= 0) {
                this.leaves.splice(i, 1);
            }
        }

        // Fade out fog
        for (let i = this.fogParticles.length - 1; i >= 0; i--) {
            this.fogParticles[i].alpha -= fadeSpeed * 0.5; // Slower fog fade
            if (this.fogParticles[i].alpha <= 0) {
                this.fogParticles.splice(i, 1);
            }
        }
    }

    /**
     * Render all weather effects
     */
    renderWeatherEffects() {
        // Clear previous frame
        this.weatherGraphics.clear();
        this.fogGraphics.clear();

        // Render rain
        this.renderRain();

        // Render snow
        this.renderSnow();

        // Render leaves
        this.renderLeaves();

        // Render fog
        this.renderFog();
    }

    /**
     * Render rain effects
     */
    renderRain() {
        for (const drop of this.rainDrops) {
            this.weatherGraphics.lineStyle(1, 0x87CEEB, drop.alpha);
            this.weatherGraphics.beginPath();
            this.weatherGraphics.moveTo(drop.x, drop.y);
            this.weatherGraphics.lineTo(drop.x - drop.length * 0.3, drop.y + drop.length);
            this.weatherGraphics.strokePath();
        }
    }

    /**
     * Render snow effects
     */
    renderSnow() {
        for (const flake of this.snowFlakes) {
            this.weatherGraphics.fillStyle(0xFFFFFF, flake.alpha);
            this.weatherGraphics.fillCircle(flake.x, flake.y, flake.size);
        }
    }

    /**
     * Render falling leaves
     */
    renderLeaves() {
        for (const leaf of this.leaves) {
            // Simple leaf shape using rotated rectangle
            this.weatherGraphics.fillStyle(leaf.color, leaf.alpha);

            // Save current state
            this.weatherGraphics.save();

            // Translate and rotate
            this.weatherGraphics.translateCanvas(leaf.x, leaf.y);
            this.weatherGraphics.rotateCanvas(leaf.rotation);

            // Draw leaf shape
            this.weatherGraphics.fillEllipse(0, 0, leaf.size * 2, leaf.size);

            // Restore state
            this.weatherGraphics.restore();
        }
    }

    /**
     * Render fog effects
     */
    renderFog() {
        for (const particle of this.fogParticles) {
            this.fogGraphics.fillStyle(0xC0C0C0, particle.alpha);
            this.fogGraphics.fillCircle(particle.x, particle.y, particle.size);
        }
    }

    /**
     * Clear all weather particles
     */
    clearAllParticles() {
        this.rainDrops = [];
        this.snowFlakes = [];
        this.leaves = [];
        this.fogParticles = [];
    }

    /**
     * Force specific weather for testing
     */
    forceWeather(weatherType, intensity = 0.5) {
        this.currentWeather = weatherType;
        this.weatherIntensity = intensity;
        console.log(`🌦️ Forced weather: ${weatherType} (intensity: ${intensity})`);
    }

    /**
     * Get current weather status
     */
    getWeatherStatus() {
        return {
            type: this.currentWeather,
            intensity: this.weatherIntensity,
            particleCount: {
                rain: this.rainDrops.length,
                snow: this.snowFlakes.length,
                leaves: this.leaves.length,
                fog: this.fogParticles.length
            }
        };
    }

    /**
     * Clean up weather system
     */
    destroy() {
        this.clearAllParticles();

        if (this.weatherGraphics) {
            this.weatherGraphics.destroy();
        }

        if (this.fogGraphics) {
            this.fogGraphics.destroy();
        }

        console.log('🌦️ WeatherGenerator destroyed');
    }
}
