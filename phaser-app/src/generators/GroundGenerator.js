/**
 * GroundGenerator - Creates Mario-style ground using pixel maps for consistent, deterministic rendering
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';
import ColorPalette from '../utils/ColorPalette.js';

export default class GroundGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noise = new NoiseGenerator();
        this.colors = new ColorPalette();

        // Track ground chunks for seamless scrolling
        this.chunks = [];
        this.houseChunks = []; // Track house chunks separately
        this.chunkWidth = 800; // Initialize with a default chunk width
        this.currentSeed = Math.random() * 10000;

        // Initialize ground pattern pixel maps
        this.initializeGroundPatterns();
    }

    /**
     * Initialize pixel map patterns for different ground types
     */
    initializeGroundPatterns() {
        // Simplified grass surface patterns (mostly grass with subtle variation)
        this.grassPatterns = {
            forest: [
                [1, 1, 1, 1, 1, 1, 1, 1], // Clean grass surface
                [1, 1, 2, 1, 1, 1, 1, 1], // Occasional grass highlights
                [1, 1, 1, 1, 2, 1, 1, 1], // Sparse highlights
                [1, 1, 1, 1, 1, 1, 1, 1]  // More clean grass
            ],
            mossy: [
                [1, 1, 1, 1, 1, 1, 1, 1], // Mostly grass
                [1, 8, 1, 1, 1, 8, 1, 1], // Occasional moss spots
                [1, 1, 1, 8, 1, 1, 1, 1], // Sparse moss
                [1, 1, 1, 1, 1, 1, 1, 1]  // Clean grass
            ],
            rich: [
                [1, 1, 1, 1, 1, 1, 1, 1], // Clean grass base
                [1, 1, 1, 2, 1, 1, 1, 1], // Minimal highlights
                [1, 1, 1, 1, 1, 1, 2, 1], // Occasional highlights
                [1, 1, 1, 1, 1, 1, 1, 1]  // Clean grass
            ]
        };

        // Simplified dirt patterns (mostly consistent dirt with minimal variation)
        this.dirtPatterns = {
            forest: [
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt layer
                [4, 4, 4, 4, 4, 4, 4, 4], // Consistent dirt
                [4, 4, 5, 4, 4, 4, 4, 4], // Rare clay spots
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 5, 4, 4, 4], // Occasional clay
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4]  // Clean dirt bottom
            ],
            rocky: [
                [4, 4, 4, 4, 4, 4, 4, 4], // Mostly dirt
                [4, 4, 6, 4, 4, 4, 4, 4], // Occasional stones
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 6, 4, 4, 4], // Rare stones
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean dirt
                [4, 4, 4, 4, 4, 4, 4, 4]  // Clean dirt bottom
            ],
            deep: [
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean deep soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Consistent soil
                [4, 4, 4, 5, 4, 4, 4, 4], // Minimal clay variation
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4], // Clean soil
                [4, 4, 4, 4, 4, 4, 4, 4]  // Clean soil bottom
            ],
            bones: [
                // Sparse bone fragments pattern - very rare occurrences
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 7, 7, 0, 0, 0], // Small bone fragment
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty row
                [0, 7, 7, 7, 0, 0, 0, 0]  // Longer bone fragment
            ]
        };

        // Define color mapping for pattern values
        // This will be populated when we get colors based on time of day
        this.colorMap = {};

        // Initialize house patterns for environmental features
        this.initializeHousePatterns();
    }

    /**
     * Initialize pixel map patterns for different house types
     */
    initializeHousePatterns() {
        this.housePatterns = {
            cabin: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Empty sky
                [0, 0, 0, 0, 11, 11, 11, 11, 0, 0, 0, 0], // Roof peak
                [0, 0, 0, 11, 11, 11, 11, 11, 11, 0, 0, 0], // Roof upper
                [0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0], // Roof wide
                [0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0], // Wall top
                [0, 10, 12, 10, 10, 13, 13, 10, 10, 12, 10, 0], // Wall with door/window
                [0, 10, 12, 10, 10, 13, 13, 10, 10, 12, 10, 0], // Wall with door/window
                [0, 10, 10, 10, 10, 13, 13, 10, 10, 10, 10, 0], // Wall bottom
            ],
            cottage: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Empty sky
                [0, 0, 11, 11, 11, 11, 11, 11, 0, 0], // Roof
                [0, 11, 11, 11, 11, 11, 11, 11, 11, 0], // Roof wide
                [0, 10, 10, 10, 10, 10, 10, 10, 10, 0], // Wall top
                [0, 10, 12, 10, 13, 13, 10, 12, 10, 0], // Wall with features
                [0, 10, 10, 10, 13, 13, 10, 10, 10, 0], // Wall bottom
            ],
            hut: [
                [0, 0, 0, 0, 0, 0, 0, 0], // Empty sky
                [0, 0, 11, 11, 11, 11, 0, 0], // Small roof
                [0, 10, 10, 10, 10, 10, 10, 0], // Wall top
                [0, 10, 12, 13, 13, 12, 10, 0], // Wall with door
                [0, 10, 10, 13, 13, 10, 10, 0], // Wall bottom
            ]
        };
    }

    /**
     * Update color mapping based on current time of day
     */
    updateColorMap(timeOfDay) {
        const groundColors = this.getGroundColors(timeOfDay);

        this.colorMap = {
            0: 0x000000,                    // Transparent/air (won't be drawn)
            1: groundColors.grass.base,     // Main grass color - most common
            2: groundColors.grass.light,    // Subtle grass highlights - rare
            3: groundColors.grass.dark,     // Dark grass/shadow - unused
            4: groundColors.dirt.base,      // Main dirt color - most common
            5: groundColors.dirt.light,     // Subtle dirt variation - rare
            6: groundColors.stone,          // Stones/pebbles - rare
            7: groundColors.roots,          // Root systems and bone fragments - rare organic matter
            8: groundColors.moss,           // Forest moss - occasional
            9: groundColors.organic,        // Decomposed organic matter - unused
            10: groundColors.house.wall,    // House walls
            11: groundColors.house.roof,    // House roof
            12: groundColors.house.window,  // House windows
            13: groundColors.house.door,    // House door
        };
    }

    // Create multiple ground chunks for seamless scrolling
    createGroundChunks(screenWidth, screenHeight, groundHeight = 50, chunksCount = 3) {
        console.log('🏞️ GroundGenerator: Creating ground chunks with pixel maps...');

        // Store chunk width for recycling
        this.chunkWidth = screenWidth;

        // Create a container for all ground chunks
        const container = this.scene.add.container(0, 0);

        // Clear existing chunks if any
        this.chunks.forEach(chunk => {
            if (chunk && chunk.graphics) {
                chunk.graphics.destroy();
            }
        });
        this.chunks = [];

        // Clear existing house chunks if any
        this.houseChunks.forEach(houseChunk => {
            if (houseChunk && houseChunk.graphics) {
                houseChunk.graphics.destroy();
            }
        });
        this.houseChunks = [];

        // Create initial chunks
        for (let i = 0; i < chunksCount; i++) {
            const positionSeed = this.currentSeed + (i * 100);

            const chunk = this.createGroundChunk(
                screenWidth,
                screenHeight,
                groundHeight,
                positionSeed
            );

            chunk.x = i * screenWidth;
            container.add(chunk);

            const chunkObj = {
                graphics: chunk,
                index: i,
                positionX: i * screenWidth,
                lastUpdated: Date.now(),
                seed: positionSeed
            };

            this.chunks.push(chunkObj);

            // Create houses for this chunk (rendered separately to appear in front of trees)
            const houseGraphics = this.createHousesForChunk(i * screenWidth, chunk.groundInfo);
            if (houseGraphics) {
                const houseChunkObj = {
                    graphics: houseGraphics,
                    index: i,
                    positionX: i * screenWidth,
                    lastUpdated: Date.now(),
                    seed: positionSeed
                };
                this.houseChunks.push(houseChunkObj);
            }
        }

        console.log('🏞️ Ground chunks created successfully');
        return container;
    }

    // Create a single ground chunk using pixel maps
    createGroundChunk(width, height, groundHeight = 50, seed = null) {
        if (seed !== null) {
            this.noise.setSeed(seed);
        }

        const graphics = this.scene.add.graphics();
        const pixelSize = 4; // Mario-style chunky pixels

        // Get time-based colors and update color mapping
        const timeOfDay = this.scene.skyGenerator ? this.scene.skyGenerator.getTimeOfDay() : 0.5;
        this.updateColorMap(timeOfDay);

        // Calculate how many pattern repetitions we need
        const patternWidth = 8; // All patterns are 8 pixels wide
        const patternsNeeded = Math.ceil(width / (patternWidth * pixelSize));

        // Choose patterns based on position for variation but consistency
        const chunkPosition = seed ? Math.floor(seed / 100) : 0;
        const grassPatternType = this.selectPatternType(chunkPosition, Object.keys(this.grassPatterns));
        const dirtPatternType = this.selectPatternType(chunkPosition + 1, Object.keys(this.dirtPatterns));

        const grassPattern = this.grassPatterns[grassPatternType];
        const dirtPattern = this.dirtPatterns[dirtPatternType];

        // Calculate layer heights
        const grassLayerHeight = grassPattern.length * pixelSize;
        const dirtLayerHeight = groundHeight - grassLayerHeight;
        const dirtRows = Math.ceil(dirtLayerHeight / pixelSize);

        // Draw the ground using pixel maps
        for (let patternIndex = 0; patternIndex < patternsNeeded; patternIndex++) {
            const baseX = patternIndex * patternWidth * pixelSize;
            const patternVariation = this.getPatternVariation(patternIndex, chunkPosition);

            // Draw grass layer
            this.drawPatternLayer(
                graphics,
                grassPattern,
                baseX,
                height - groundHeight,
                pixelSize,
                patternVariation
            );

            // Draw dirt layer (repeat pattern vertically to fill the space)
            const dirtStartY = height - groundHeight + grassLayerHeight;
            for (let dirtRow = 0; dirtRow < dirtRows; dirtRow++) {
                const patternRowIndex = dirtRow % dirtPattern.length;
                const rowPattern = [dirtPattern[patternRowIndex]]; // Convert single row to array

                this.drawPatternLayer(
                    graphics,
                    rowPattern,
                    baseX,
                    dirtStartY + (dirtRow * pixelSize),
                    pixelSize,
                    patternVariation
                );
            }

            // Occasionally add bones in the dirt layer
            if (patternIndex % 8 === 3) { // Very sparse - only every 8th pattern at offset 3
                const bonesPattern = this.dirtPatterns.bones;
                const bonesStartY = dirtStartY + Math.floor(dirtRows / 3) * pixelSize; // Start 1/3 down in dirt

                this.drawPatternLayer(
                    graphics,
                    bonesPattern,
                    baseX,
                    bonesStartY,
                    pixelSize,
                    patternVariation
                );
            }
        }

        // Add surface details and features
        this.addPixelMapSurfaceDetails(graphics, width, height, groundHeight, pixelSize);
        this.addEnvironmentalFeatures(graphics, width, height, groundHeight, pixelSize, this.getGroundColors(timeOfDay));

        // Store ground info for house rendering (houses will be drawn separately to appear in front of trees)
        graphics.groundInfo = {
            width: width,
            height: height,
            groundHeight: groundHeight,
            pixelSize: pixelSize,
            colors: this.getGroundColors(timeOfDay),
            chunkSeed: seed
        };

        return graphics;
    }

    selectPatternType(position, patternTypes) {
        // Use much slower pattern changes for more continuous ground
        const smoothPosition = Math.floor(position / 5); // Change pattern every 5 chunks instead of 1
        const index = Math.abs(smoothPosition) % patternTypes.length;
        return patternTypes[index];
    }

    getPatternVariation(patternIndex, chunkPosition) {
        // Dramatically reduce variation for continuous ground appearance
        const smoothVariation = Math.floor((patternIndex + chunkPosition) / 8); // Much slower variation
        return {
            offsetX: 0, // Remove horizontal offset variation
            colorShift: smoothVariation % 2 // Only use 2 subtle variations instead of 4
        };
    }

    drawPatternLayer(graphics, pattern, baseX, baseY, pixelSize, variation = {}) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const patternValue = pattern[row][col];

                if (patternValue === 0) continue;

                const pixelX = baseX + (col * pixelSize);
                const pixelY = baseY + (row * pixelSize);

                let color = this.colorMap[patternValue];

                // Apply very subtle noise-based color variation for natural look
                const noiseValue = this.noise.perlin2D(col * 0.1, row * 0.1); // Reduced frequency for smoother variation

                if (noiseValue > 0.5) { // Higher threshold for lighter areas
                    // Very subtle highlights for ground continuity
                    color = this.lightenColor(color, 0.04); // Much more subtle
                } else if (noiseValue < -0.4) { // Higher threshold for darker areas
                    // Very subtle shadows for ground continuity
                    color = this.darkenColor(color, 0.04); // Much more subtle
                }

                // Add subtle variation based on position (like trees)
                if (variation.colorShift) {
                    color = this.applyColorVariation(color, variation.colorShift);
                }

                graphics.fillStyle(color);
                graphics.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
        }
    }

    applyColorVariation(baseColor, variation) {
        if (variation === 0) return baseColor;

        // Very subtle color variations for ground continuity
        if (variation === 1) {
            return this.lightenColor(baseColor, 0.03); // Much more subtle than before
        }

        return baseColor; // Only use one subtle variation to maintain continuity
    }

    adjustColorTone(color, amount) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        // Tree-style tone adjustments for consistency
        const newR = Math.min(255, Math.max(0, r + Math.round(amount * 25))); // Similar to trees
        const newG = Math.min(255, Math.max(0, g - Math.round(amount * 12))); // Similar to trees
        const newB = Math.min(255, Math.max(0, b - Math.round(amount * 18))); // Similar to trees

        return (newR << 16) | (newG << 8) | newB;
    }

    addPixelMapSurfaceDetails(graphics, width, height, groundHeight, pixelSize) {
        const surfaceY = height - groundHeight;
        const groundColors = this.getGroundColors(this.scene.skyGenerator?.getTimeOfDay() || 0.5);

        // Add surface details with tree-style variation
        for (let x = 0; x < width; x += pixelSize * 6) {
            const position = x / pixelSize;

            if (position % 15 === 0) {
                // Moss patches with noise-based color variation
                let mossColor = groundColors.moss;
                const mossNoise = this.noise.perlin2D(position * 0.2, 0);
                if (mossNoise > 0.2) {
                    mossColor = this.lightenColor(mossColor, 0.1);
                } else if (mossNoise < -0.2) {
                    mossColor = this.darkenColor(mossColor, 0.1);
                }

                graphics.fillStyle(mossColor);
                graphics.fillRect(x, surfaceY - pixelSize, pixelSize, pixelSize);
            } else if (position % 18 === 8) {
                // Grass highlights with variation
                let grassColor = groundColors.grass.light;
                const grassNoise = this.noise.perlin2D(position * 0.3, 1);
                if (grassNoise > 0.3) {
                    grassColor = this.lightenColor(grassColor, 0.15);
                }

                graphics.fillStyle(grassColor);
                graphics.fillRect(x, surfaceY - pixelSize, pixelSize, pixelSize);

                // Sometimes add a second pixel for taller grass
                if (grassNoise > 0.5) {
                    graphics.fillRect(x, surfaceY - pixelSize * 2, pixelSize, pixelSize);
                }
            } else if (position % 25 === 12) {
                // Small dirt patches with variation
                let dirtColor = groundColors.dirt.light;
                const dirtNoise = this.noise.perlin2D(position * 0.25, 2);
                if (dirtNoise > 0.2) {
                    dirtColor = this.lightenColor(dirtColor, 0.08);
                } else if (dirtNoise < -0.2) {
                    dirtColor = this.darkenColor(dirtColor, 0.08);
                }

                graphics.fillStyle(dirtColor);
                graphics.fillRect(x, surfaceY, pixelSize, pixelSize);
            }
        }

        // Occasional mushrooms with tree-style spacing
        for (let x = 0; x < width; x += pixelSize * 40) {
            if (Math.random() < 0.25) {
                this.drawMushroom(graphics, x, surfaceY, pixelSize);
            }
        }
    }

    /**
     * Draw a small mushroom for forest floor detail
     */
    drawMushroom(graphics, x, y, pixelSize) {
        // Mushroom stem
        graphics.fillStyle(0xF5F5DC); // Beige
        graphics.fillRect(x, y - pixelSize, pixelSize + 1, pixelSize + 1);

        // Mushroom cap
        graphics.fillStyle(0x8B4513); // Brown cap
        graphics.fillRect(x - pixelSize, y - pixelSize * 2, pixelSize * 3 + 1, pixelSize + 1);

        // Cap highlight
        graphics.fillStyle(0xD2691E); // Lighter brown
        graphics.fillRect(x, y - pixelSize * 2, pixelSize + 1, pixelSize + 1);
    }

    /**
     * Draw a pixel-art house on the ground surface
     */
    drawHouse(graphics, x, y, pixelSize, houseColors) {
        // Randomly select a house type
        const houseTypes = Object.keys(this.housePatterns);
        const selectedTypeIndex = Math.abs(Math.floor(Math.sin(x * 0.01) * 100)) % houseTypes.length;
        const selectedType = houseTypes[selectedTypeIndex];
        const housePattern = this.housePatterns[selectedType];

        console.log(`🏠 Drawing house type: ${selectedType} at position ${x}`); // Debug log

        // Draw the house pattern from bottom to top
        for (let row = 0; row < housePattern.length; row++) {
            for (let col = 0; col < housePattern[row].length; col++) {
                const patternValue = housePattern[row][col];

                if (patternValue === 0) continue; // Skip transparent pixels

                const pixelX = x + col * pixelSize;
                const pixelY = y - (housePattern.length - row) * pixelSize;

                let color;
                switch (patternValue) {
                    case 10: // Wall
                        color = houseColors.wall;
                        // Add slight wall variation
                        if (Math.sin((x + col) * 0.1) > 0.3) {
                            color = this.darkenColor(color, 0.1);
                        }
                        break;
                    case 11: // Roof
                        color = houseColors.roof;
                        // Add roof shading
                        if (row < 2) { // Top of roof is lighter
                            color = this.lightenColor(color, 0.15);
                        }
                        break;
                    case 12: // Window
                        color = houseColors.window;
                        break;
                    case 13: // Door
                        color = houseColors.door;
                        break;
                    default:
                        color = houseColors.wall;
                }

                graphics.fillStyle(color);
                graphics.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
        }

        // Add a small chimney for some houses
        if (selectedType === 'cabin' && Math.sin(x * 0.05) > 0.5) {
            const chimneyX = x + (housePattern[0].length - 3) * pixelSize;
            const chimneyY = y - (housePattern.length + 2) * pixelSize;

            // Chimney stack
            graphics.fillStyle(houseColors.chimney || 0x696969);
            graphics.fillRect(chimneyX, chimneyY, pixelSize, pixelSize * 3);
            graphics.fillRect(chimneyX + pixelSize, chimneyY, pixelSize, pixelSize * 3);

            // Chimney smoke (small gray pixels)
            if (Math.random() > 0.7) {
                graphics.fillStyle(0xC0C0C0); // Light gray smoke
                graphics.fillRect(chimneyX + pixelSize, chimneyY - pixelSize, pixelSize, pixelSize);
                if (Math.random() > 0.5) {
                    graphics.fillRect(chimneyX, chimneyY - pixelSize * 2, pixelSize, pixelSize);
                }
            }
        }

        // Add a small garden patch in front of some houses
        if (Math.sin(x * 0.07) > 0.4) {
            const gardenX = x + Math.floor(housePattern[0].length / 2) * pixelSize;
            graphics.fillStyle(0x2F4F2F); // Dark green for bushes
            graphics.fillRect(gardenX - pixelSize, y, pixelSize, pixelSize);
            graphics.fillStyle(0x228B22); // Grass green
            graphics.fillRect(gardenX, y, pixelSize, pixelSize);
            graphics.fillStyle(0x2F4F2F);
            graphics.fillRect(gardenX + pixelSize, y, pixelSize, pixelSize);
        }
    }

    // Update ground chunks for infinite scrolling
    updateGroundChunks(container, cameraX, screenWidth, screenHeight, groundHeight) {
        if (!this.chunks || this.chunks.length === 0) return { chunksUpdated: 0 };

        let chunksUpdated = 0;
        const normalizedCameraX = cameraX % (100000000);
        const viewportLeftEdge = normalizedCameraX - 300;
        const viewportRightEdge = normalizedCameraX + screenWidth + 300;

        // Find the rightmost chunk position BEFORE any modifications
        let rightmostX = -Infinity;
        this.chunks.forEach(chunk => {
            if (chunk.graphics.x > rightmostX) {
                rightmostX = chunk.graphics.x;
            }
        });

        // Process chunks that need to be moved
        const chunksToUpdate = [];
        this.chunks.forEach(chunk => {
            const chunkWorldX = container.x + chunk.graphics.x;
            const chunkRightEdge = chunkWorldX + this.chunkWidth;

            if (chunkRightEdge < viewportLeftEdge) {
                chunksToUpdate.push(chunk);
            }
        });

        // Update chunks one by one to avoid race conditions
        chunksToUpdate.forEach(chunk => {
            const newXPosition = rightmostX + this.chunkWidth;
            chunk.graphics.x = newXPosition;

            // Update rightmost position for next chunk
            rightmostX = newXPosition;

            // Generate deterministic seed based on position
            const chunkSeed = Math.abs(this.currentSeed + Math.floor(newXPosition / Math.max(this.chunkWidth, 1)) * 100);

            chunk.lastUpdated = Date.now();
            chunk.positionX = newXPosition;

            const chunkIndex = container.getIndex(chunk.graphics);
            container.removeAt(chunkIndex);
            chunk.graphics.destroy();

            const newGraphics = this.createGroundChunk(
                this.chunkWidth,
                screenHeight,
                groundHeight,
                chunkSeed
            );

            newGraphics.x = newXPosition;
            container.addAt(newGraphics, chunkIndex);
            chunk.graphics = newGraphics;
            chunksUpdated++;

            // Also update corresponding house chunk
            const correspondingHouseChunk = this.houseChunks.find(hc => hc.index === chunk.index);
            if (correspondingHouseChunk) {
                // Destroy old house graphics
                correspondingHouseChunk.graphics.destroy();

                // Create new house graphics
                const newHouseGraphics = this.createHousesForChunk(newXPosition, newGraphics.groundInfo);

                if (newHouseGraphics) {
                    correspondingHouseChunk.graphics = newHouseGraphics;
                    correspondingHouseChunk.positionX = newXPosition;
                    correspondingHouseChunk.lastUpdated = Date.now();
                } else {
                    // Remove the house chunk if no houses were created
                    const houseIndex = this.houseChunks.indexOf(correspondingHouseChunk);
                    this.houseChunks.splice(houseIndex, 1);
                }
            }
        });

        return {
            chunksUpdated,
            normalizedCameraX,
            viewportLeftEdge,
            viewportRightEdge
        };
    }

    createGround(width, height, groundHeight = 50) {
        return this.createGroundChunk(width, height, groundHeight);
    }

    getGroundColors(timeOfDay) {
        const colors = {
            grass: {
                base: 0x228B22,    // Forest green - main color
                light: 0x32CD32,   // Slightly lighter green - subtle highlights only
                dark: 0x1F5F1F,    // Slightly darker green - for shadows
                yellow: 0x9ACD32   // Yellow green - for environmental details
            },
            dirt: {
                base: 0x8B4513,    // Saddle brown - main dirt color
                light: 0x9B5523,   // Just slightly lighter brown - subtle variation
                dark: 0x7B3F03,    // Slightly darker brown - for shadows
                clay: 0x8B4513     // Same as base to reduce noise
            },
            stone: 0x888888,       // Medium gray - for rare rocks
            roots: 0x654321,       // Dark brown - same as dirt dark to reduce contrast
            moss: 0x2F4F2F,        // Dark forest green - for occasional accent
            organic: 0x8B4513,     // Same as dirt base to reduce noise
            rock: {
                base: 0x888888,    // Medium gray
                light: 0x999999,   // Slightly lighter gray
                dark: 0x777777,    // Slightly darker gray
                moss: 0x2F4F2F     // Dark olive green
            },
            log: {
                base: 0x8B4513,    // Saddle brown
                bark: 0x654321,    // Dark brown
                light: 0x9B5523,   // Slightly lighter brown
                rings: 0x654321    // Dark brown for tree rings
            },
            water: {
                base: 0x4A90E2,      // Soft blue
                light: 0x5BA3F5,     // Lighter blue highlight
                dark: 0x357ABD,      // Darker blue
                reflection: 0x6BB6FF, // Sky reflection
                dawn: 0x6fa3ef,      // Dawn: soft blue-violet
                dusk: 0x3b5998,      // Dusk: muted blue
                night: 0x2C3E50,     // Night: dark blue-gray
                highlight: 0x85C1E9, // Soft highlight
                shadow: 0x2E86AB     // Shadow/edge
            },
            house: {
                wall: 0x8B4513,      // Brown wood walls
                roof: 0x654321,      // Dark brown roof
                window: 0xFFFF99,    // Warm yellow window light
                door: 0x5D4037,      // Dark brown door
                chimney: 0x696969    // Gray stone chimney
            }
        };

        // Adjust colors based on time of day for forest atmosphere - more subtle changes
        if (timeOfDay < 0.3 || timeOfDay > 0.8) {
            // Slightly darker, more mysterious forest at night/dawn/dusk
            colors.grass.base = this.darkenColor(colors.grass.base, 0.2);
            colors.grass.light = this.darkenColor(colors.grass.light, 0.2);
            colors.dirt.base = this.darkenColor(colors.dirt.base, 0.15);
            colors.dirt.light = this.darkenColor(colors.dirt.light, 0.15);
            colors.moss = this.darkenColor(colors.moss, 0.15);
            colors.water.base = this.darkenColor(colors.water.base, 0.2);
            colors.water.light = this.darkenColor(colors.water.light, 0.2);
            // Houses glow warmly at night
            colors.house.window = 0xFFDD44; // Brighter warm glow
            colors.house.wall = this.darkenColor(colors.house.wall, 0.3);
            colors.house.roof = this.darkenColor(colors.house.roof, 0.3);
        } else if (timeOfDay > 0.4 && timeOfDay < 0.6) {
            // Slightly brighter, vibrant forest during day
            colors.grass.base = this.lightenColor(colors.grass.base, 0.05);
            colors.grass.light = this.lightenColor(colors.grass.light, 0.05);
            colors.moss = this.lightenColor(colors.moss, 0.08);
            colors.dirt.light = this.lightenColor(colors.dirt.light, 0.05);
            colors.water.light = this.lightenColor(colors.water.light, 0.1);
            // Houses look normal during day
            colors.house.window = 0xB8860B; // Darker windows during day
        }

        return colors;
    }

    addEnvironmentalFeatures(graphics, width, height, groundHeight, pixelSize, colors) {
        console.log('🏞️ Environmental features enabled:', this.scene.showEnvironmentalFeatures);

        if (this.scene.showEnvironmentalFeatures === false) {
            return;
        }

        const surfaceY = height - groundHeight;
        const gridWidth = Math.ceil(width / pixelSize);
        let rockCount = 0, logCount = 0, pondCount = 0;

        // Much more spaced out environmental features for cleaner look
        for (let x = 0; x < gridWidth; x += 50) { // Increased spacing significantly
            const worldX = x * pixelSize;
            const featureRandom = Math.sin(x * 0.1) * Math.cos(x * 0.05);

            if (featureRandom > 0.6) { // Higher threshold for features
                this.drawRock(graphics, worldX, surfaceY, pixelSize, colors.rock);
                rockCount++;
            } else if (featureRandom < -0.6) { // Higher threshold for features
                this.drawLog(graphics, worldX, surfaceY, pixelSize, colors.log);
                logCount++;
            } else if (featureRandom > -0.1 && featureRandom < 0.1 && Math.random() < 0.3) { // Much rarer ponds
                this.drawPond(graphics, worldX, surfaceY, pixelSize, colors.water, colors.grass);
                pondCount++;
            }
        }

        if (!this.scene.groundFeaturesLogged) {
            console.log(`🏞️ Environmental features: ${rockCount} rocks, ${logCount} logs, ${pondCount} ponds`);
            this.scene.groundFeaturesLogged = true;
        }
    }

    drawRock(graphics, x, y, pixelSize, rockColors) {
        const rockPattern = [
            [0, 1, 1, 0, 0],
            [1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ];

        for (let row = 0; row < rockPattern.length; row++) {
            for (let col = 0; col < rockPattern[row].length; col++) {
                if (rockPattern[row][col] === 1) {
                    const pixelX = x + col * pixelSize;
                    const pixelY = y - (rockPattern.length - row) * pixelSize;

                    let color = rockColors.base;
                    if (row === 0 || col === 0) {
                        color = rockColors.light;
                    } else if (row === rockPattern.length - 1 || col === rockPattern[row].length - 1) {
                        color = rockColors.dark;
                    }

                    graphics.fillStyle(color);
                    graphics.fillRect(pixelX, pixelY, pixelSize, pixelSize);
                }
            }
        }

        if (Math.sin(x * 0.1) > 0.3) {
            graphics.fillStyle(rockColors.moss);
            graphics.fillRect(x + pixelSize, y - pixelSize * 2, pixelSize, pixelSize);
        }

        graphics.fillStyle(rockColors.base);
        graphics.fillRect(x + pixelSize * 6, y, pixelSize, pixelSize);
        graphics.fillStyle(rockColors.light);
        graphics.fillRect(x + pixelSize * 6, y - pixelSize, pixelSize, pixelSize);

        graphics.fillStyle(rockColors.dark);
        graphics.fillRect(x - pixelSize, y, pixelSize, pixelSize);
    }

    drawLog(graphics, x, y, pixelSize, logColors) {
        const logLength = 8;
        const logHeight = 3;

        for (let i = 0; i < logLength; i++) {
            for (let j = 0; j < logHeight; j++) {
                const pixelX = x + i * pixelSize;
                const pixelY = y - (logHeight - j) * pixelSize;

                let color = logColors.base;

                if (j === 0) {
                    color = logColors.light;
                } else if (j === logHeight - 1) {
                    color = logColors.bark;
                } else {
                    color = logColors.base;
                }

                graphics.fillStyle(color);
                graphics.fillRect(pixelX, pixelY, pixelSize, pixelSize);
            }
        }

        graphics.fillStyle(logColors.light);
        graphics.fillRect(x, y - pixelSize * 2, pixelSize, pixelSize * 2);

        graphics.fillStyle(logColors.rings);
        graphics.fillRect(x, y - pixelSize * 2, pixelSize, pixelSize);
        graphics.fillStyle(logColors.base);
        graphics.fillRect(x, y - pixelSize, pixelSize, pixelSize);

        graphics.fillStyle(logColors.light);
        graphics.fillRect(x + (logLength - 1) * pixelSize, y - pixelSize * 2, pixelSize, pixelSize * 2);

        graphics.fillStyle(logColors.rings);
        graphics.fillRect(x + (logLength - 1) * pixelSize, y - pixelSize * 2, pixelSize, pixelSize);
        graphics.fillStyle(logColors.base);
        graphics.fillRect(x + (logLength - 1) * pixelSize, y - pixelSize, pixelSize, pixelSize);

        for (let i = 1; i < logLength - 1; i++) {
            if (i % 2 === 0) {
                graphics.fillStyle(logColors.bark);
                graphics.fillRect(x + i * pixelSize, y - pixelSize * 3, pixelSize, pixelSize);
            }
        }

        if (Math.sin(x * 0.15) > 0.4) {
            graphics.fillStyle(logColors.bark);
            graphics.fillRect(x + pixelSize * 2, y - pixelSize * 4, pixelSize, pixelSize);
        }
        if (Math.cos(x * 0.12) > 0.5) {
            graphics.fillStyle(logColors.bark);
            graphics.fillRect(x + pixelSize * 5, y - pixelSize * 4, pixelSize, pixelSize);
        }

        if (Math.sin(x * 0.08) > 0.6) {
            graphics.fillStyle(0x556B2F);
            graphics.fillRect(x + pixelSize * 3, y - pixelSize * 2, pixelSize, pixelSize);
        }
    }

    drawPond(graphics, x, y, pixelSize, waterColors, grassColors) {
        const pondPattern = [
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        ];

        const timeOfDay = (this.scene.skyGenerator && typeof this.scene.skyGenerator.getTimeOfDay === 'function')
            ? this.scene.skyGenerator.getTimeOfDay()
            : 0.5;

        let mainColor, highlightColor, shadowColor;
        if (timeOfDay < 0.18 || timeOfDay > 0.82) {
            mainColor = waterColors.light;
            highlightColor = waterColors.dark;
            shadowColor = waterColors.light;
        } else if (timeOfDay < 0.32) {
            mainColor = waterColors.light;
            highlightColor = waterColors.reflection;
            shadowColor = waterColors.light;
        } else if (timeOfDay > 0.68) {
            mainColor = waterColors.light;
            highlightColor = waterColors.reflection;
            shadowColor = waterColors.light;
        } else {
            mainColor = waterColors.light;
            highlightColor = waterColors.light;
            shadowColor = waterColors.light;
        }

        for (let row = pondPattern.length - 1; row >= 0; row--) {
            for (let col = 0; col < pondPattern[row].length; col++) {
                if (pondPattern[row][col] === 1) {
                    const pixelX = x + col * pixelSize;
                    const pixelY = y - (pondPattern.length - row - 4) * pixelSize + pixelSize;
                    let color = mainColor;

                    if (row === 2 && col % 3 !== 0) color = highlightColor;
                    if (row === pondPattern.length - 3 && col % 4 === 0) color = shadowColor;

                    graphics.fillStyle(color);
                    graphics.fillRect(pixelX, pixelY, pixelSize, pixelSize);
                }
            }
        }

        if (Math.random() > 0.7 && grassColors.yellow) {
            graphics.fillStyle(grassColors.yellow);
            graphics.fillRect(x + pixelSize * 4, y - pixelSize * 6, pixelSize, pixelSize);
        }
    }

    lightenColor(color, amount = 0.1) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const newR = Math.min(255, Math.round(r + (255 - r) * amount));
        const newG = Math.min(255, Math.round(g + (255 - g) * amount));
        const newB = Math.min(255, Math.round(b + (255 - b) * amount));

        return (newR << 16) | (newG << 8) | newB;
    }

    darkenColor(color, amount = 0.1) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const newR = Math.max(0, Math.round(r * (1 - amount)));
        const newG = Math.max(0, Math.round(g * (1 - amount)));
        const newB = Math.max(0, Math.round(b * (1 - amount)));

        return (newR << 16) | (newG << 8) | newB;
    }

    redrawGround(width, height, groundHeight = 50) {
        if (this.groundGraphics) {
            this.groundGraphics.destroy();
        }
        this.groundGraphics = this.createGround(width, height, groundHeight);
        return this.groundGraphics;
    }

    /**
     * Create houses for a ground chunk - rendered separately to appear in front of trees
     */
    createHousesForChunk(chunkX, groundInfo) {
        if (this.scene.showEnvironmentalFeatures === false) {
            return null;
        }

        const { width, height, groundHeight, pixelSize, colors, chunkSeed } = groundInfo;
        const graphics = this.scene.add.graphics();

        // Position the graphics at the chunk location
        graphics.x = chunkX;

        const surfaceY = height - groundHeight;
        const gridWidth = Math.ceil(width / pixelSize);
        let houseCount = 0;

        // Set seed for deterministic house placement based on chunk position
        if (chunkSeed !== null) {
            this.noise.setSeed(chunkSeed);
        }

        // Add houses rarely - about 1 every few minutes of gameplay
        console.log('🏠 Creating houses for chunk at x:', chunkX, 'gridWidth:', gridWidth);
        for (let x = 0; x < gridWidth; x += 300) { // Much wider spacing - every 300 grid units
            const worldX = x * pixelSize;
            const houseRandom = Math.abs(Math.sin(x * 0.005) * Math.cos(x * 0.007)); // Slower frequency for rarer placement

            if (houseRandom > 0.7 && Math.random() < 0.15) { // High threshold and low probability for rare houses
                console.log('🏠 ✅ Drawing rare house at:', worldX, 'houseRandom:', houseRandom);
                this.drawHouse(graphics, worldX, surfaceY, pixelSize, colors.house);
                houseCount++;
            }
        }

        if (houseCount > 0) {
            console.log(`🏠 Created ${houseCount} rare houses for chunk`);
        }

        // Set depth to render in front of trees
        graphics.setDepth(10); // Trees typically have depth 0-5

        return houseCount > 0 ? graphics : null;
    }

    /**
     * Cleanup all house chunks
     */
    destroyHouseChunks() {
        this.houseChunks.forEach(houseChunk => {
            if (houseChunk && houseChunk.graphics) {
                houseChunk.graphics.destroy();
            }
        });
        this.houseChunks = [];
    }
}
