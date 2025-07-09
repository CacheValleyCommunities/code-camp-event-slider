/**
 * EightBitFilter - Converts images to 8-bit pixel art style
 */
export default class EightBitFilter {
    constructor() {
        // 8-bit color palette (Mario-style limited colors)
        this.palette = [
            0x000000, // Black
            0xffffff, // White
            0xff0000, // Red
            0x00ff00, // Green
            0x0000ff, // Blue
            0xffff00, // Yellow
            0xff00ff, // Magenta
            0x00ffff, // Cyan
            0x800000, // Dark Red
            0x008000, // Dark Green
            0x000080, // Dark Blue
            0x808000, // Olive
            0x800080, // Purple
            0x008080, // Teal
            0xc0c0c0, // Silver
            0x808080, // Gray
            0xff8000, // Orange
            0x80ff00, // Lime
            0x8000ff, // Violet
            0x0080ff, // Sky Blue
            0xff0080, // Pink
            0x80ff80, // Light Green
            0x8080ff, // Light Blue
            0xff8080, // Light Red
            0xffff80, // Light Yellow
            0xff80ff, // Light Magenta
            0x80ffff, // Light Cyan
            0x404040, // Dark Gray
            0xc0c0c0, // Light Gray
            0x8b4513, // Brown (Mario blocks)
            0x654321, // Dark Brown
            0xffd700  // Gold
        ];
    }

    /**
     * Apply 8-bit filter to a Phaser texture
     */
    apply8BitFilter(scene, textureKey, targetKey = null) {
        const outputKey = targetKey || `${textureKey}_8bit`;

        // Get the original texture
        const texture = scene.textures.get(textureKey);
        if (!texture) {
            console.warn(`⚠️ Texture ${textureKey} not found for 8-bit conversion`);
            return textureKey;
        }

        const canvas = scene.textures.createCanvas(outputKey, texture.source[0].width, texture.source[0].height);
        const context = canvas.getContext('2d');

        // Draw original image to canvas
        const image = texture.source[0].image;
        context.drawImage(image, 0, 0);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply 8-bit conversion
        this.pixelateAndReduceColors(data, canvas.width, canvas.height);

        // Put modified data back
        context.putImageData(imageData, 0, 0);

        // Update the canvas texture
        canvas.refresh();

        console.log(`🎨 Applied 8-bit filter to ${textureKey} -> ${outputKey}`);
        return outputKey;
    }

    /**
     * Pixelate and reduce colors in image data
     */
    pixelateAndReduceColors(data, width, height) {
        const pixelSize = 4; // Size of each "pixel" in the 8-bit version

        // First pass: pixelate by averaging colors in blocks
        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                const blockColor = this.getAverageColor(data, x, y, pixelSize, width, height);
                const paletteColor = this.findClosestPaletteColor(blockColor);

                // Fill the entire block with the palette color
                this.fillBlock(data, x, y, pixelSize, width, height, paletteColor);
            }
        }
    }

    /**
     * Get average color of a pixel block
     */
    getAverageColor(data, startX, startY, blockSize, width, height) {
        let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
        let pixelCount = 0;

        for (let y = startY; y < Math.min(startY + blockSize, height); y++) {
            for (let x = startX; x < Math.min(startX + blockSize, width); x++) {
                const index = (y * width + x) * 4;
                totalR += data[index];
                totalG += data[index + 1];
                totalB += data[index + 2];
                totalA += data[index + 3];
                pixelCount++;
            }
        }

        return {
            r: Math.round(totalR / pixelCount),
            g: Math.round(totalG / pixelCount),
            b: Math.round(totalB / pixelCount),
            a: Math.round(totalA / pixelCount)
        };
    }

    /**
     * Find the closest color in the 8-bit palette
     */
    findClosestPaletteColor(color) {
        // Skip transparent pixels
        if (color.a < 128) {
            return { r: 0, g: 0, b: 0, a: 0 };
        }

        let closestColor = null;
        let minDistance = Infinity;

        for (const paletteHex of this.palette) {
            const paletteColor = this.hexToRgb(paletteHex);
            const distance = this.colorDistance(color, paletteColor);

            if (distance < minDistance) {
                minDistance = distance;
                closestColor = paletteColor;
            }
        }

        return { ...closestColor, a: color.a };
    }

    /**
     * Calculate color distance (Euclidean distance in RGB space)
     */
    colorDistance(color1, color2) {
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        return {
            r: (hex >> 16) & 255,
            g: (hex >> 8) & 255,
            b: hex & 255
        };
    }

    /**
     * Fill a block with a specific color
     */
    fillBlock(data, startX, startY, blockSize, width, height, color) {
        for (let y = startY; y < Math.min(startY + blockSize, height); y++) {
            for (let x = startX; x < Math.min(startX + blockSize, width); x++) {
                const index = (y * width + x) * 4;
                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = color.a;
            }
        }
    }

    /**
     * Apply 8-bit filter to multiple textures
     */
    applyBatchFilter(scene, textureKeys) {
        const results = [];

        for (const key of textureKeys) {
            const filteredKey = this.apply8BitFilter(scene, key);
            results.push(filteredKey);
        }

        console.log(`🎨 Applied 8-bit filter to ${textureKeys.length} textures`);
        return results;
    }

    /**
     * Create a preview of the 8-bit palette
     */
    createPalettePreview(scene, previewKey = 'palette_preview') {
        const tileSize = 32;
        const tilesPerRow = 8;
        const rows = Math.ceil(this.palette.length / tilesPerRow);

        const canvas = scene.textures.createCanvas(
            previewKey,
            tilesPerRow * tileSize,
            rows * tileSize
        );
        const context = canvas.getContext('2d');

        this.palette.forEach((color, index) => {
            const x = (index % tilesPerRow) * tileSize;
            const y = Math.floor(index / tilesPerRow) * tileSize;

            context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            context.fillRect(x, y, tileSize, tileSize);
        });

        canvas.refresh();
        console.log(`🎨 Created 8-bit palette preview: ${previewKey}`);
        return previewKey;
    }
}
