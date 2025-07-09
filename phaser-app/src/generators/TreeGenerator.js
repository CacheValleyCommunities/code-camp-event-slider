/**
 * TreeGenerator - Creates Mario-style procedural trees for Phaser
 * Following the same pattern as GroundGenerator for consistent infinite scrolling
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';
import ColorPalette from '../utils/ColorPalette.js';

export default class TreeGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noise = new NoiseGenerator();
        this.colors = new ColorPalette();

        // Track tree chunks for seamless scrolling
        this.chunks = [];
        this.chunkWidth = 0;
        this.currentSeed = Math.random() * 10000;
    }

    /**
     * Create multiple tree chunks for seamless scrolling
     */
    createTreeChunks(screenWidth, screenHeight, chunksCount = 3) {
        console.log('🌳 TreeGenerator: Creating tree chunks...');

        // Store chunk width for recycling
        this.chunkWidth = screenWidth;

        // Create a container for all tree chunks
        const container = this.scene.add.container(0, 0);

        // Clean up any existing chunks first to prevent memory leaks
        this.chunks.forEach(chunk => {
            if (chunk && chunk.graphics) {
                chunk.graphics.destroy();
            }
        });
        this.chunks = [];

        // Create initial chunks
        for (let i = 0; i < chunksCount; i++) {
            // Create position-based seed for consistency
            const positionSeed = this.currentSeed + (i * 100);

            const chunk = this.createTreeChunk(
                screenWidth,
                screenHeight,
                positionSeed
            );

            chunk.x = i * screenWidth;
            container.add(chunk);

            // Store chunk for recycling with tracking info
            const chunkObj = {
                graphics: chunk,
                index: i,
                positionX: i * screenWidth,
                lastUpdated: Date.now(),
                seed: positionSeed
            };

            this.chunks.push(chunkObj);
        }

        console.log(`🌳 Created ${chunksCount} tree chunks`);
        return container;
    }

    /**
     * Create a single tree chunk
     */
    createTreeChunk(width, height, seed = null) {
        // Set seed for consistent noise if provided
        if (seed !== null) {
            this.noise.setSeed(seed);
        }

        const graphics = this.scene.add.graphics();

        // Calculate ground level (same as in MainScene)
        const groundLevel = height - 80 - 60; // UI bar height + ground height

        // Forest generation parameters - much denser for forest feel
        const primarySpacing = 80; // Main trees spacing
        const secondarySpacing = 40; // Smaller trees/bushes spacing

        const primaryTrees = Math.floor(width / primarySpacing) + 1;
        const secondaryTrees = Math.floor(width / secondarySpacing) + 1;

        console.log(`🌳 Creating forest chunk with ${primaryTrees} primary + ${secondaryTrees} secondary trees, groundLevel: ${groundLevel}`);

        // Generate primary forest trees (larger trees)
        for (let i = 0; i < primaryTrees; i++) {
            const baseX = (i * primarySpacing) + (Math.random() * primarySpacing * 0.4);
            const treeX = Math.min(baseX, width - 50);
            const treeY = groundLevel + (Math.random() * 8 - 4);

            // Higher chance for primary trees in forest
            if (Math.random() < 0.9) {
                this.drawTreeAt(graphics, treeX, treeY, 'primary');
            }
        }

        // Generate secondary vegetation (bushes, small trees, undergrowth)
        for (let i = 0; i < secondaryTrees; i++) {
            const baseX = (i * secondarySpacing) + (Math.random() * secondarySpacing * 0.6);
            const treeX = Math.min(baseX, width - 30);
            const treeY = groundLevel + (Math.random() * 6 - 3);

            // Mix of bushes and small trees
            if (Math.random() < 0.7) {
                this.drawTreeAt(graphics, treeX, treeY, 'secondary');
            }
        }

        // Add forest undergrowth and ferns
        this.addForestUndergrowth(graphics, width, groundLevel);

        return graphics;
    }    /**
     * Draw a single tree at the specified position using predefined pixel maps
     */
    drawTreeAt(graphics, x, y, layer = 'primary') {
        console.log(`🌳 Drawing ${layer} tree at (${x}, ${y})`);

        // Get colors
        const timeOfDay = this.scene.skyGenerator ? this.scene.skyGenerator.getTimeOfDay() : 0.5;
        const treeColors = this.colors.getTreeColors('fir', timeOfDay);

        // Fallback colors if palette fails
        const colors = {
            trunk: treeColors?.trunk || 0x8B4513,
            bark: treeColors?.bark || 0x654321,
            leaves: treeColors?.leaves || 0x228B22
        };

        // Add color variation for natural look
        const colorVariation = {
            trunk: this.addColorVariation(colors.trunk, 0.15),
            bark: this.addColorVariation(colors.bark, 0.1),
            leaves: this.addColorVariation(colors.leaves, 0.12)
        };

        // Choose tree type based on layer and forest distribution
        const treeType = this.chooseForestTreeType(layer);
        const pixelMap = this.getTreePixelMap(treeType);

        // Draw the tree from the pixel map with layer-appropriate scaling
        this.drawTreeFromPixelMap(graphics, x, y, pixelMap, colorVariation, layer);
    }

    /**
     * Choose tree type with weighted probabilities
     */
    chooseTreeType() {
        const rand = Math.random();
        if (rand < 0.3) return 'fir';      // 30% - Classic fir trees
        if (rand < 0.5) return 'oak';      // 20% - Round oak trees  
        if (rand < 0.7) return 'tall';     // 20% - Tall thin trees
        if (rand < 0.9) return 'bush';     // 20% - Small bushes
        return 'pine';                     // 10% - Pine trees
    }

    /**
     * Choose tree type based on forest layer for more realistic distribution
     */
    chooseForestTreeType(layer = 'primary') {
        const rand = Math.random();

        if (layer === 'primary') {
            // Primary forest layer - mostly tall trees
            if (rand < 0.4) return 'fir';      // 40% - Classic fir trees
            if (rand < 0.7) return 'oak';      // 30% - Round oak trees  
            if (rand < 0.9) return 'tall';     // 20% - Tall thin trees
            return 'pine';                     // 10% - Pine trees
        } else {
            // Secondary layer - more bushes and smaller trees
            if (rand < 0.5) return 'bush';     // 50% - Small bushes
            if (rand < 0.7) return 'fir';      // 20% - Smaller fir trees
            if (rand < 0.85) return 'oak';     // 15% - Young oak trees
            return 'pine';                     // 15% - Small pine trees
        }
    }

    /**
     * Get predefined pixel map for a tree type
     * 0 = empty, 1 = trunk, 2 = leaves
     */
    getTreePixelMap(type) {
        switch (type) {
            case 'fir':
                return this.getFirTreeMap();
            case 'oak':
                return this.getOakTreeMap();
            case 'tall':
                return this.getTallTreeMap();
            case 'bush':
                return this.getBushTreeMap();
            case 'pine':
                return this.getPineTreeMap();
            default:
                return this.getFirTreeMap();
        }
    }

    /**
     * Classic fir tree with triangular layers
     */
    getFirTreeMap() {
        return [
            [0, 0, 0, 2, 0, 0, 0],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 2, 2, 2, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 2, 2, 2, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 2, 2, 2, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0]
        ];
    }

    /**
     * Round oak tree with full crown
     */
    getOakTreeMap() {
        return [
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 2, 2, 2, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 2, 2, 2, 2, 2, 0],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]
        ];
    }

    /**
     * Tall thin tree with narrow crown
     */
    getTallTreeMap() {
        return [
            [0, 0, 2, 0, 0],
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ];
    }

    /**
     * Small bush/shrub
     */
    getBushTreeMap() {
        return [
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ];
    }

    /**
     * Pine tree with spiky appearance
     */
    getPineTreeMap() {
        return [
            [0, 0, 0, 2, 0, 0, 0],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 0, 2, 0, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 0, 2, 0, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 2, 2, 2, 0, 0],
            [0, 2, 0, 2, 0, 2, 0],
            [2, 2, 2, 2, 2, 2, 2],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0]
        ];
    }    /**
     * Draw tree from pixel map with size variation and color variation
     */
    drawTreeFromPixelMap(graphics, x, y, pixelMap, colors, layer = 'primary') {
        const basePixelSize = 4;

        // Different scaling for forest layers
        let sizeVariant;
        if (layer === 'primary') {
            sizeVariant = 1.0 + Math.random() * 0.6; // 100% to 160% for primary trees
        } else {
            sizeVariant = 0.5 + Math.random() * 0.4; // 50% to 90% for secondary vegetation
        }

        const scaledPixelSize = Math.max(2, Math.round(basePixelSize * sizeVariant));

        const mapHeight = pixelMap.length;
        const mapWidth = pixelMap[0].length;

        // Calculate total tree dimensions
        const treeWidth = mapWidth * scaledPixelSize;
        const treeHeight = mapHeight * scaledPixelSize;

        // Position tree centered horizontally and grounded vertically
        const startX = x - (treeWidth / 2);
        const startY = y - treeHeight;

        // Draw each pixel from the map
        for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                const pixelType = pixelMap[row][col];

                if (pixelType !== 0) { // Skip empty pixels
                    let pixelColor;

                    if (pixelType === 1) { // Trunk
                        // Add bark texture variation
                        const barkNoise = this.noise.perlin2D(col * 0.5, row * 0.3);
                        if (barkNoise > 0.2) {
                            pixelColor = colors.bark;
                        } else if (barkNoise < -0.2) {
                            pixelColor = this.lightenColor(colors.trunk, 0.1);
                        } else {
                            pixelColor = colors.trunk;
                        }

                        // Darker edges for trunk depth
                        if (col === 0 || col === mapWidth - 1) {
                            pixelColor = this.darkenColor(pixelColor, 0.2);
                        }
                    } else { // Leaves (pixelType === 2)
                        // Add leaf color variation for depth and texture
                        const leafNoise = this.noise.perlin2D(col * 0.3, row * 0.3);

                        if (leafNoise > 0.3) {
                            pixelColor = this.lightenColor(colors.leaves, 0.15);
                        } else if (leafNoise < -0.2) {
                            pixelColor = this.darkenColor(colors.leaves, 0.15);
                        } else {
                            pixelColor = colors.leaves;
                        }

                        // Add highlights and shadows based on position
                        if (row < mapHeight * 0.3) { // Top of tree gets highlights
                            pixelColor = this.lightenColor(pixelColor, 0.1);
                        }
                        if (col === 0 || col === mapWidth - 1) { // Edges get shadows
                            pixelColor = this.darkenColor(pixelColor, 0.1);
                        }
                    }

                    graphics.fillStyle(pixelColor);
                    graphics.fillRect(
                        startX + (col * scaledPixelSize),
                        startY + (row * scaledPixelSize),
                        scaledPixelSize,
                        scaledPixelSize
                    );
                }
            }
        }
    }    /**
     * Update tree chunks for infinite scrolling (call this in update loop)
     */
    updateTreeChunks(container, cameraX, screenWidth, screenHeight) {
        if (!this.chunks || this.chunks.length === 0) return { chunksUpdated: 0 };

        let chunksUpdated = 0;

        // Use modulo to handle very large camera positions
        const normalizedCameraX = cameraX % (100000000);

        // Determine visible area with buffer
        const viewportLeftEdge = normalizedCameraX - 300;

        // Find the rightmost chunk position
        let rightmostX = -Infinity;
        let rightmostIndex = -1;

        this.chunks.forEach((c, i) => {
            if (c.graphics.x > rightmostX) {
                rightmostX = c.graphics.x;
                rightmostIndex = i;
            }
        });

        // Recycle chunks that are off screen to the left
        this.chunks.forEach(chunk => {
            const chunkWorldX = container.x + chunk.graphics.x;
            const chunkRightEdge = chunkWorldX + this.chunkWidth;

            // If chunk is completely off screen to the left, move it to the right
            if (chunkRightEdge < viewportLeftEdge) {
                // Position this chunk to the right of the rightmost chunk
                if (rightmostIndex >= 0) {
                    const newXPosition = this.chunks[rightmostIndex].graphics.x + this.chunkWidth;
                    chunk.graphics.x = newXPosition;

                    // This chunk becomes the new rightmost
                    rightmostX = newXPosition;
                    rightmostIndex = this.chunks.indexOf(chunk);

                    // Generate a consistent seed based on chunk position
                    const chunkSeed = Math.abs(this.currentSeed + Math.floor(newXPosition / this.chunkWidth) * 100);

                    // Track when we last updated this chunk
                    chunk.lastUpdated = Date.now();
                    chunk.positionX = newXPosition;

                    // Remove old graphics from container
                    const chunkIndex = container.getIndex(chunk.graphics);
                    container.removeAt(chunkIndex);

                    // Destroy the old graphics to prevent memory leaks
                    chunk.graphics.destroy();

                    // Create new graphics with proper seed
                    const newGraphics = this.createTreeChunk(
                        this.chunkWidth,
                        screenHeight,
                        chunkSeed
                    );

                    // Position the new graphics correctly
                    newGraphics.x = newXPosition;

                    // Add to container and update chunk reference
                    container.add(newGraphics);
                    chunk.graphics = newGraphics;
                    chunk.seed = chunkSeed;

                    chunksUpdated++;

                    console.log(`🌳 Recycled tree chunk to position ${newXPosition}, seed: ${chunkSeed}`);
                }
            }
        });

        return { chunksUpdated };
    }

    /**
     * Legacy method for compatibility - creates a single tree sprite
     */
    createTreeSprite(x, y, type = 'fir') {
        console.log(`🌳 TreeGenerator: Creating single tree sprite at (${x}, ${y}), type: ${type}`);

        const graphics = this.scene.add.graphics();
        this.drawTreeAt(graphics, x, y);

        return graphics;
    }

    /**
     * Add slight color variation to make trees look more natural
     */
    addColorVariation(baseColor, variation = 0.1) {
        const r = (baseColor >> 16) & 0xFF;
        const g = (baseColor >> 8) & 0xFF;
        const b = baseColor & 0xFF;

        const vary = () => {
            const change = (Math.random() - 0.5) * variation * 255;
            return Math.max(0, Math.min(255, Math.round(change)));
        };

        const newR = Math.max(0, Math.min(255, r + vary()));
        const newG = Math.max(0, Math.min(255, g + vary()));
        const newB = Math.max(0, Math.min(255, b + vary()));

        return (newR << 16) | (newG << 8) | newB;
    }

    /**
     * Lighten a color by a percentage
     */
    lightenColor(color, amount = 0.1) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const newR = Math.min(255, Math.round(r + (255 - r) * amount));
        const newG = Math.min(255, Math.round(g + (255 - g) * amount));
        const newB = Math.min(255, Math.round(b + (255 - b) * amount));

        return (newR << 16) | (newG << 8) | newB;
    }

    /**
     * Darken a color by a percentage
     */
    darkenColor(color, amount = 0.1) {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const newR = Math.max(0, Math.round(r * (1 - amount)));
        const newG = Math.max(0, Math.round(g * (1 - amount)));
        const newB = Math.max(0, Math.round(b * (1 - amount)));

        return (newR << 16) | (newG << 8) | newB;
    }

    /**
     * Add forest undergrowth including ferns, small plants, and forest floor details
     */
    addForestUndergrowth(graphics, width, groundLevel) {
        const pixelSize = 4;

        // Add ferns and small plants
        for (let x = 0; x < width; x += 25 + Math.random() * 15) {
            const undergrowthType = Math.random();

            if (undergrowthType < 0.3) {
                // Draw fern
                this.drawFern(graphics, x, groundLevel, pixelSize);
            } else if (undergrowthType < 0.5) {
                // Draw small shrub
                this.drawSmallShrub(graphics, x, groundLevel, pixelSize);
            } else if (undergrowthType < 0.7) {
                // Draw forest grass
                this.drawForestGrass(graphics, x, groundLevel, pixelSize);
            }
        }

        // Add fallen logs occasionally
        for (let x = 0; x < width; x += 200 + Math.random() * 100) {
            if (Math.random() < 0.4) {
                this.drawFallenLog(graphics, x, groundLevel, pixelSize);
            }
        }
    }

    /**
     * Draw a small fern for forest undergrowth
     */
    drawFern(graphics, x, y, pixelSize) {
        const fernPattern = [
            [0, 2, 0, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [0, 0, 1, 0, 0]
        ];

        const colors = {
            leaves: 0x2d5016, // Dark forest green
            trunk: 0x654321
        };

        this.drawPixelPattern(graphics, fernPattern, x, y, pixelSize, colors);
    }

    /**
     * Draw a small shrub for undergrowth
     */
    drawSmallShrub(graphics, x, y, pixelSize) {
        const shrubPattern = [
            [0, 2, 2, 2, 0],
            [2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2],
            [0, 2, 2, 2, 0],
            [0, 0, 1, 0, 0]
        ];

        const colors = {
            leaves: 0x228b22, // Forest green
            trunk: 0x8b4513
        };

        this.drawPixelPattern(graphics, shrubPattern, x, y, pixelSize, colors);
    }

    /**
     * Draw forest grass patches
     */
    drawForestGrass(graphics, x, y, pixelSize) {
        const grassColors = [0x32cd32, 0x228b22, 0x9acd32];

        // Draw scattered grass blades
        for (let i = 0; i < 3; i++) {
            const grassX = x + (i * pixelSize) + Math.random() * pixelSize;
            const grassHeight = 1 + Math.floor(Math.random() * 3);

            graphics.fillStyle(grassColors[Math.floor(Math.random() * grassColors.length)]);

            for (let h = 0; h < grassHeight; h++) {
                graphics.fillRect(grassX, y - (h * pixelSize), pixelSize, pixelSize);
            }
        }
    }

    /**
     * Draw a fallen log for forest floor detail
     */
    drawFallenLog(graphics, x, y, pixelSize) {
        const logColors = {
            base: 0x8b4513,
            bark: 0x654321,
            moss: 0x556b2f
        };

        // Draw horizontal log
        const logLength = 6;
        for (let i = 0; i < logLength; i++) {
            graphics.fillStyle(logColors.base);
            graphics.fillRect(x + (i * pixelSize), y, pixelSize, pixelSize);

            // Add bark texture
            if (i % 2 === 0) {
                graphics.fillStyle(logColors.bark);
                graphics.fillRect(x + (i * pixelSize), y - pixelSize, pixelSize, pixelSize);
            }
        }

        // Add moss patches
        if (Math.random() < 0.6) {
            graphics.fillStyle(logColors.moss);
            graphics.fillRect(x + pixelSize * 2, y - pixelSize, pixelSize, pixelSize);
        }
    }

    /**
     * Helper method to draw pixel patterns
     */
    drawPixelPattern(graphics, pattern, x, y, pixelSize, colors) {
        const mapHeight = pattern.length;
        const mapWidth = pattern[0].length;

        const startX = x - ((mapWidth * pixelSize) / 2);
        const startY = y - (mapHeight * pixelSize);

        for (let row = 0; row < mapHeight; row++) {
            for (let col = 0; col < mapWidth; col++) {
                const pixelType = pattern[row][col];

                if (pixelType !== 0) {
                    let pixelColor;

                    if (pixelType === 1) {
                        pixelColor = colors.trunk;
                    } else {
                        pixelColor = colors.leaves;
                        // Add slight color variation
                        if (Math.random() < 0.3) {
                            pixelColor = this.darkenColor(pixelColor, 0.1);
                        }
                    }

                    graphics.fillStyle(pixelColor);
                    graphics.fillRect(
                        startX + (col * pixelSize),
                        startY + (row * pixelSize),
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }
}