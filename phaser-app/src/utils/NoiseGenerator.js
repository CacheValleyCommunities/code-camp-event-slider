/**
 * NoiseGenerator - Perlin noise for procedural generation
 */
export default class NoiseGenerator {
    constructor(seed = Math.random() * 1000) {
        this.seed = seed;
        this.gradients = {};
        this.memory = {};
    }

    setSeed(seed) {
        this.seed = seed;
        // Clear caches when seed changes
        this.gradients = {};
        this.memory = {};
    }

    random(x, y) {
        const angle = (Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453123) % (2 * Math.PI);
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    dotProductGrid(x, y, vx, vy) {
        const gradient = this.random(x, y);
        return (vx - x) * gradient.x + (vy - y) * gradient.y;
    }

    smootherstep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    interpolate(a, b, t) {
        return a + this.smootherstep(t) * (b - a);
    }

    perlin2D(x, y) {
        const key = `${x},${y}`;
        if (this.memory[key]) return this.memory[key];

        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const sx = x - x0;
        const sy = y - y0;

        const n0 = this.dotProductGrid(x0, y0, x, y);
        const n1 = this.dotProductGrid(x1, y0, x, y);
        const ix0 = this.interpolate(n0, n1, sx);

        const n2 = this.dotProductGrid(x0, y1, x, y);
        const n3 = this.dotProductGrid(x1, y1, x, y);
        const ix1 = this.interpolate(n2, n3, sx);

        const value = this.interpolate(ix0, ix1, sy);
        this.memory[key] = value;
        return value;
    }

    octavePerlin2D(x, y, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.perlin2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}
