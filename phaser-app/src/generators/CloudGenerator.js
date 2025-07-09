/**
 * CloudGenerator - Creates Mario-style procedural clouds for Phaser
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';
import ColorPalette from '../utils/ColorPalette.js';

export default class CloudGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noise = new NoiseGenerator();
        this.colors = new ColorPalette();
    }

    createMarioCloud(width = 160, height = 80) {
        // Create graphics object for drawing
        const graphics = this.scene.add.graphics();

        // Mario cloud colors
        const cloudColors = [
            0xFFFFFF, // Main white
            0xE8E8E8, // Light gray for shading
            0xD0D0D0, // Darker gray for shadows
            0xF8F8F8  // Bright highlight
        ];

        const pixelSize = 8;
        const gridWidth = Math.ceil(width / pixelSize);
        const gridHeight = Math.ceil(height / pixelSize);

        // Draw Mario-style cloud pattern
        const centerX = Math.floor(gridWidth / 2);
        const centerY = Math.floor(gridHeight / 2);

        for (let gridY = 0; gridY < gridHeight; gridY++) {
            for (let gridX = 0; gridX < gridWidth; gridX++) {
                const relX = gridX - centerX;
                const relY = gridY - centerY;

                if (this.isMarioCloudPixel(relX, relY, gridWidth, gridHeight)) {
                    // Determine shading
                    let colorIndex = 0;
                    if (relY < -1) {
                        colorIndex = 0; // Top highlight
                    } else if (relY > 1) {
                        colorIndex = 2; // Bottom shadow
                    } else if (relX < -2 || relX > 2) {
                        colorIndex = 1; // Side shading
                    } else {
                        colorIndex = 0; // Main body
                    }

                    graphics.fillStyle(cloudColors[colorIndex]);
                    graphics.fillRect(
                        gridX * pixelSize,
                        gridY * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }

        // Generate texture from graphics
        graphics.generateTexture(`cloud_${Date.now()}_${Math.random()}`, width, height);
        graphics.destroy();

        return graphics;
    }

    isMarioCloudPixel(relX, relY, gridWidth, gridHeight) {
        // Create classic Mario cloud shape with multiple bumps
        const maxRadius = Math.min(gridWidth, gridHeight) * 0.4;

        // Main cloud body (oval)
        const mainBody = (relX * relX) / (maxRadius * maxRadius) +
            (relY * relY) / ((maxRadius * 0.7) * (maxRadius * 0.7)) <= 1;

        // Add bumps for Mario-style puffiness
        const bump1 = Math.sqrt((relX + maxRadius * 0.6) * (relX + maxRadius * 0.6) +
            (relY - maxRadius * 0.3) * (relY - maxRadius * 0.3)) <= maxRadius * 0.5;

        const bump2 = Math.sqrt((relX - maxRadius * 0.6) * (relX - maxRadius * 0.6) +
            (relY - maxRadius * 0.3) * (relY - maxRadius * 0.3)) <= maxRadius * 0.5;

        const bump3 = Math.sqrt((relX) * (relX) +
            (relY - maxRadius * 0.8) * (relY - maxRadius * 0.8)) <= maxRadius * 0.4;

        return mainBody || bump1 || bump2 || bump3;
    }

    createCloudSprite(x, y, scale = 1) {
        const width = 120 + Math.random() * 80;
        const height = 60 + Math.random() * 40;

        // Create the cloud graphics
        const graphics = this.scene.add.graphics();

        // Mario cloud colors
        const cloudColors = [
            0xFFFFFF, // Main white
            0xE8E8E8, // Light gray for shading
            0xD0D0D0, // Darker gray for shadows
        ];

        const pixelSize = 6;
        const gridWidth = Math.ceil(width / pixelSize);
        const gridHeight = Math.ceil(height / pixelSize);

        // Draw Mario-style cloud pattern
        const centerX = Math.floor(gridWidth / 2);
        const centerY = Math.floor(gridHeight / 2);

        for (let gridY = 0; gridY < gridHeight; gridY++) {
            for (let gridX = 0; gridX < gridWidth; gridX++) {
                const relX = gridX - centerX;
                const relY = gridY - centerY;

                if (this.isMarioCloudPixel(relX, relY, gridWidth, gridHeight)) {
                    // Determine shading
                    let colorIndex = 0;
                    if (relY < -1) {
                        colorIndex = 0; // Top highlight
                    } else if (relY > 1) {
                        colorIndex = 2; // Bottom shadow
                    } else if (relX < -2 || relX > 2) {
                        colorIndex = 1; // Side shading
                    } else {
                        colorIndex = 0; // Main body
                    }

                    graphics.fillStyle(cloudColors[colorIndex]);
                    graphics.fillRect(
                        gridX * pixelSize,
                        gridY * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }

        // Position and scale
        graphics.setPosition(x, y);
        graphics.setScale(scale);

        return graphics;
    }
}
