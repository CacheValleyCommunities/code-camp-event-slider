import Phaser from 'phaser';
import MainScene from './scenes/MainScene.js';
import SkyDemo from './demo/SkyDemo.js';

// Import plugin as a side effect (no default export)
import './plugins/rexbarreldistortionpipelineplugin.min.js';

// Log environment configuration
console.log('Environment: ', {
    wsServerUrl: import.meta.env.VITE_WS_SERVER_URL || 'wss://websocket-server:8081',
    mode: import.meta.env.MODE
});

const config = {
    type: Phaser.WEBGL, // Force WebGL only
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainScene],
};

// Remove plugins.global, plugin registers itself

const game = new Phaser.Game(config);

// Add some global info
window.game = game;
console.log('🎮 Procedural Event Slider Started!');
console.log('🌲 Mario-style procedural graphics loading...');

// Display sky demo information
SkyDemo.logFeatures();
