/**
 * BirdGenerator - Creates Mario-style procedural birds for Phaser
 */
import NoiseGenerator from '../utils/NoiseGenerator.js';
import ColorPalette from '../utils/ColorPalette.js';

export default class BirdGenerator {
    constructor(scene) {
        this.scene = scene;
        this.noise = new NoiseGenerator();
        this.colors = new ColorPalette();
    }

    createBirdSprite(x, y, type = 'small') {
        const graphics = this.scene.add.graphics();
        const pixelSize = 2; // Smaller pixels for birds (more detailed)

        // Get colors for bird type with time-based variations
        const timeOfDay = this.scene.skyGenerator ? this.scene.skyGenerator.getTimeOfDay() : 0.5;
        const birdColors = this.getBirdColors(type, timeOfDay);

        // Different bird sizes based on type (realistic bird proportions)
        let birdSize, wingSpan;
        switch (type) {
            case 'large':
                birdSize = { width: 2, height: 1 }; // Tiny streamlined body
                wingSpan = 16; // Proportional wings
                break;
            case 'medium':
                birdSize = { width: 1, height: 1 }; // Very tiny body
                wingSpan = 12; // Medium wings
                break;
            case 'small':
            default:
                birdSize = { width: 1, height: 1 }; // Minimal body
                wingSpan = 8; // Smaller wings but still prominent
                break;
        }

        // Draw the bird (simple but recognizable)
        this.drawBird(graphics, birdSize, wingSpan, pixelSize, birdColors, 0); // Start with wings neutral

        // Position bird
        graphics.setPosition(x, y);

        // Store bird properties
        graphics.birdType = type;
        graphics.birdColors = birdColors;
        graphics.birdSize = birdSize;
        graphics.wingSpan = wingSpan;
        graphics.pixelSize = pixelSize;
        graphics.wingPhase = Math.random() * Math.PI * 2; // Random start phase
        graphics.wingSpeed = 0.15 + Math.random() * 0.1; // Faster wing flapping speed for realism
        graphics.flySpeed = 0.5 + Math.random() * 1.0; // Horizontal flying speed
        graphics.bobSpeed = 0.02 + Math.random() * 0.01; // Vertical bobbing
        graphics.baseY = y; // Store base Y for bobbing motion

        return graphics;
    }

    /**
     * Draw a pixel-art style bird
     */
    drawBird(graphics, size, wingSpan, pixelSize, colors, wingPosition = 0) {
        graphics.clear(); // Clear previous drawing for animation

        // Create a more compact center point for the bird
        const bodyCenterX = Math.floor(wingSpan / 2); // Center the bird in the available space
        const bodyCenterY = 2; // Fixed vertical position

        // Calculate wing positions based on wingPosition (-1 to 1)
        const wingOffset = Math.floor(wingPosition * 2); // More subtle wing movement

        // Draw bird body (oval shape) - draw first so wings appear on top
        this.drawBirdBody(graphics, bodyCenterX, bodyCenterY, size, pixelSize, colors);

        // Draw wings extending from the body
        this.drawBirdWings(graphics, bodyCenterX, bodyCenterY, size, wingSpan, pixelSize, colors, wingOffset);

        // Draw head in front of the body
        this.drawBirdHead(graphics, bodyCenterX, bodyCenterY, size, pixelSize, colors);
    }

    drawBirdBody(graphics, bodyCenterX, bodyCenterY, size, pixelSize, colors) {
        // Ultra-tiny, streamlined body (just 1-2 pixels for small birds)
        if (size.width === 1 && size.height === 1) {
            // Smallest birds: just 1 pixel body
            graphics.fillStyle(colors.body);
            graphics.fillRect(bodyCenterX * pixelSize, bodyCenterY * pixelSize, pixelSize, pixelSize);
        } else {
            // Larger birds: small oval body
            for (let y = 0; y < size.height; y++) {
                for (let x = 0; x < size.width; x++) {
                    const dx = x - size.width / 2;
                    const dy = y - size.height / 2;

                    // Very compact oval (highly streamlined)
                    const distance = (dx * dx) / (size.width * size.width / 4) + (dy * dy) / (size.height * size.height / 4);

                    if (distance <= 1) {
                        graphics.fillStyle(colors.body);
                        graphics.fillRect(
                            (bodyCenterX - size.width / 2 + x) * pixelSize,
                            (bodyCenterY - size.height / 2 + y) * pixelSize,
                            pixelSize, pixelSize
                        );
                    }
                }
            }
        }
    } drawBirdWings(graphics, bodyCenterX, bodyCenterY, size, wingSpan, pixelSize, colors, wingOffset) {
        // More realistic, narrower wings that look less like a mustache
        const wingLength = Math.floor(wingSpan / 3); // Shorter wings
        const wingHeight = 2; // Narrower wings

        // Left wing (angled upward for bird-like appearance)
        const leftWingX = bodyCenterX - wingLength;
        const leftWingY = bodyCenterY + wingOffset - 1;
        this.drawBirdWing(graphics, leftWingX, leftWingY, wingLength, wingHeight, pixelSize, colors.wing, true);

        // Right wing (angled upward for bird-like appearance)
        const rightWingX = bodyCenterX + 1;
        const rightWingY = bodyCenterY + wingOffset - 1;
        this.drawBirdWing(graphics, rightWingX, rightWingY, wingLength, wingHeight, pixelSize, colors.wing, false);
    }

    drawBirdWing(graphics, x, y, length, height, pixelSize, color, isLeft) {
        // Draw more realistic bird wing shape - angled and tapered
        for (let col = 0; col < length; col++) {
            for (let row = 0; row < height; row++) {
                // Create angled wing shape that tapers
                const taperFactor = col / length; // 0 to 1 from body to wing tip
                const angleOffset = Math.floor(taperFactor * 2); // Wing angles upward

                if (row < height - angleOffset) {
                    const pixelX = isLeft ? x - col : x + col;
                    const pixelY = y + row - angleOffset; // Angle the wing upward

                    graphics.fillStyle(color);
                    graphics.fillRect(pixelX * pixelSize, pixelY * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    drawBirdHead(graphics, bodyCenterX, bodyCenterY, size, pixelSize, colors) {
        // Position head in front of the body (like a tiny beak)
        const headX = bodyCenterX + 1; // Just in front of body
        const headY = bodyCenterY;

        // Head is just 1 pixel positioned like a beak
        graphics.fillStyle(colors.head);
        graphics.fillRect(headX * pixelSize, headY * pixelSize, pixelSize, pixelSize);

        // Skip the eye for now to keep it simple and bird-like
    }

    /**
     * Get bird colors based on type and time of day
     */
    getBirdColors(type, timeOfDay) {
        let baseColors;

        switch (type) {
            case 'large':
                baseColors = {
                    body: 0x2F2F2F,    // Dark gray
                    wing: 0x1A1A1A,    // Darker gray
                    head: 0x2F2F2F,    // Dark gray
                    eye: 0xFFFFFF      // White
                };
                break;
            case 'medium':
                baseColors = {
                    body: 0x8B4513,    // Brown
                    wing: 0x654321,    // Dark brown
                    head: 0x8B4513,    // Brown
                    eye: 0x000000      // Black
                };
                break;
            case 'small':
            default:
                baseColors = {
                    body: 0x696969,    // Dim gray
                    wing: 0x2F2F2F,    // Dark gray
                    head: 0x696969,    // Dim gray
                    eye: 0x000000      // Black
                };
                break;
        }

        // Adjust colors based on time of day (make darker at night)
        if (timeOfDay < 0.3 || timeOfDay > 0.8) {
            // Night/dawn/dusk - darker colors
            Object.keys(baseColors).forEach(key => {
                if (key !== 'eye') { // Don't darken eyes
                    baseColors[key] = this.darkenColor(baseColors[key], 0.4);
                }
            });
        }

        return baseColors;
    }

    /**
     * Update bird animation (wing flapping and redraw)
     */
    updateBird(bird, time) {
        if (!bird || !bird.active) return;

        // Update wing animation
        bird.wingPhase += bird.wingSpeed;
        const wingPosition = Math.sin(bird.wingPhase) * 0.8; // Less dramatic wing movement

        // Redraw bird with new wing position
        this.drawBird(
            bird,
            bird.birdSize,
            bird.wingSpan,
            bird.pixelSize,
            bird.birdColors,
            wingPosition
        );

        // Move bird horizontally
        bird.x -= bird.flySpeed;

        // Add subtle bobbing motion
        bird.y = bird.baseY + Math.sin(time * bird.bobSpeed) * 2;
    }

    /**
     * Create a flock of birds
     */
    createFlock(centerX, centerY, flockSize = 3, type = 'small') {
        const flock = [];
        const spacing = 15; // Distance between birds in flock

        for (let i = 0; i < flockSize; i++) {
            // Create V-formation
            const offsetX = (i - Math.floor(flockSize / 2)) * spacing;
            const offsetY = Math.abs(i - Math.floor(flockSize / 2)) * 8; // V-shape

            const bird = this.createBirdSprite(
                centerX + offsetX,
                centerY + offsetY,
                type
            );

            // Slightly vary the flight speed within the flock
            bird.flySpeed += (Math.random() - 0.5) * 0.2;
            bird.flockId = Math.random(); // Identify flock members

            flock.push(bird);
        }

        return flock;
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
}
