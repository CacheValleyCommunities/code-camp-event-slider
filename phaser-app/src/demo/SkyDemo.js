/**
 * Sky Demo - Interactive demonstration of the procedural sky system
 * 
 * This script demonstrates the various features of the SkyGenerator:
 * - Time-of-day transitions
 * - Atmospheric noise effects
 * - Star field generation
 * - Horizon glow effects
 * - Color interpolation
 */

// Press these keys to test different times of day:
const timeControls = {
    'Q': { time: 0.05, name: 'Deep Night' },
    'W': { time: 0.2, name: 'Dawn' },
    'E': { time: 0.4, name: 'Morning' },
    'R': { time: 0.5, name: 'Noon' },
    'T': { time: 0.7, name: 'Afternoon' },
    'Y': { time: 0.82, name: 'Sunset' },
    'U': { time: 0.9, name: 'Night' }
};

console.log('🌌 Procedural Sky Demo');
console.log('=====================');
console.log('The procedural sky system includes:');
console.log('• Dynamic gradient generation with 4 color stops');
console.log('• Perlin noise-based atmospheric texture');
console.log('• Time-of-day color transitions');
console.log('• Procedural star field for night time');
console.log('• Horizon glow effects');
console.log('• Smooth color interpolation');
console.log('');
console.log('Interactive Controls:');
Object.entries(timeControls).forEach(([key, config]) => {
    console.log(`• ${key} = ${config.name} (${(config.time * 24).toFixed(1)}h)`);
});
console.log('');
console.log('Features demonstrated:');
console.log('✅ Eliminates large sky image files');
console.log('✅ Enables dynamic lighting effects');
console.log('✅ Provides infinite sky variations');
console.log('✅ Maintains retro pixel art aesthetic');
console.log('✅ Smooth real-time transitions');
console.log('✅ Performance-optimized rendering');

export default class SkyDemo {
    static logFeatures() {
        console.log('🎯 Procedural Sky Generation Features:');
        console.log('  📊 Performance: Reduced bundle size, dynamic generation');
        console.log('  🎨 Visual: 4-stop gradients, atmospheric noise, star fields');
        console.log('  ⏰ Time: 7 distinct time periods with smooth transitions');
        console.log('  🌟 Effects: Horizon glow, star twinkle, noise animation');
        console.log('  🎮 Interactive: Real-time time-of-day control');
        console.log('  🔧 Configurable: Easy color palette modifications');
    }

    static getTimeOfDayName(timeValue) {
        const times = [
            { max: 0.15, name: 'Midnight' },
            { max: 0.25, name: 'Dawn' },
            { max: 0.75, name: 'Day' },
            { max: 0.85, name: 'Sunset' },
            { max: 1.0, name: 'Night' }
        ];

        return times.find(t => timeValue <= t.max)?.name || 'Unknown';
    }
}
