/**
 * ScanlineFilter - Adds retro scanline effect to make logos look more 8-bit
 */
export default class ScanlineFilter {
    constructor() {
        this.scanlineSpacing = 2; // Every 2 pixels
        this.scanlineOpacity = 0.3; // How dark the scanlines are
    }

    /**
     * Apply scanline overlay to a sprite
     */
    applyScanlines(scene, sprite, intensity = 0.3) {
        const bounds = sprite.getBounds();

        // Create a graphics object for scanlines
        const scanlines = scene.add.graphics();
        scanlines.setPosition(bounds.x, bounds.y);
        scanlines.setDepth(sprite.depth + 1);
        scanlines.setScrollFactor(sprite.scrollFactorX, sprite.scrollFactorY);

        // Draw horizontal scanlines
        scanlines.fillStyle(0x000000, intensity);

        for (let y = 0; y < bounds.height; y += this.scanlineSpacing) {
            scanlines.fillRect(0, y, bounds.width, 1);
        }

        // Store reference so we can clean it up later
        sprite.scanlineOverlay = scanlines;

        return scanlines;
    }

    /**
     * Remove scanlines from a sprite
     */
    removeScanlines(sprite) {
        if (sprite.scanlineOverlay) {
            sprite.scanlineOverlay.destroy();
            sprite.scanlineOverlay = null;
        }
    }

    /**
     * Create a scanline texture that can be reused
     */
    createScanlineTexture(scene, width = 256, height = 256, textureKey = 'scanlines') {
        if (scene.textures.exists(textureKey)) {
            return textureKey;
        }

        const canvas = scene.textures.createCanvas(textureKey, width, height);
        const context = canvas.getContext('2d');

        // Create scanline pattern
        context.fillStyle = `rgba(0, 0, 0, ${this.scanlineOpacity})`;

        for (let y = 0; y < height; y += this.scanlineSpacing) {
            context.fillRect(0, y, width, 1);
        }

        canvas.refresh();
        console.log(`📺 Created scanline texture: ${textureKey}`);
        return textureKey;
    }

    /**
     * Apply scanline texture as overlay
     */
    applyScanlineTexture(scene, sprite, textureKey = 'scanlines') {
        // Ensure scanline texture exists
        this.createScanlineTexture(scene);

        const bounds = sprite.getBounds();

        // Create scanline overlay sprite
        const scanlineOverlay = scene.add.tileSprite(
            sprite.x - bounds.width / 2,
            sprite.y - bounds.height / 2,
            bounds.width,
            bounds.height,
            textureKey
        );

        scanlineOverlay.setOrigin(0, 0);
        scanlineOverlay.setDepth(sprite.depth + 1);
        scanlineOverlay.setScrollFactor(sprite.scrollFactorX, sprite.scrollFactorY);
        scanlineOverlay.setAlpha(0.4);

        // Store reference
        sprite.scanlineOverlay = scanlineOverlay;

        return scanlineOverlay;
    }

    /**
     * Add CRT-style effects (scanlines + slight distortion)
     */
    applyCRTEffect(scene, sprite) {
        this.applyScanlineTexture(scene, sprite);

        // Add slight color tint for CRT effect
        sprite.setTint(0xf0f0f0); // Slightly dimmed

        return sprite.scanlineOverlay;
    }

    /**
     * Set scanline intensity
     */
    setScanlineIntensity(intensity) {
        this.scanlineOpacity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Set scanline spacing
     */
    setScanlineSpacing(spacing) {
        this.scanlineSpacing = Math.max(1, spacing);
    }
}
