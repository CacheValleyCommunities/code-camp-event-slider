/**
 * ColorPalette - Mario-style color management
 */
export default class ColorPalette {
    constructor() {
        this.timeOfDay = 'night';
        this.initializePalettes();
    }

    initializePalettes() {
        this.palettes = {
            // Midnight - Deep night
            midnight: {
                sky: {
                    top: 0x0a0a2e,      // Very dark blue
                    middle: 0x16213e,   // Dark navy
                    bottom: 0x0f3460    // Darker blue
                },
                clouds: {
                    base: 0x666666,     // Dark gray
                    highlight: 0x888888,
                    shadow: 0x444444
                },
                trees: {
                    birch: {
                        trunk: 0xC0C0C0,
                        bark: 0x2F4F4F,
                        leaves: 0x1a4a1a
                    },
                    fir: {
                        trunk: 0x5a3d2b,
                        leaves: 0x2d5d2d
                    },
                    oak: {
                        trunk: 0x5a3d2b,
                        leaves: 0x1a5a1a
                    },
                    jungle: {
                        trunk: 0x5a3d2b,
                        leaves: 0x1a4a1a
                    }
                }
            },
            // Dawn - Early morning
            dawn: {
                sky: {
                    top: 0xff6b6b,      // Pink-red
                    middle: 0xfeca57,   // Golden yellow
                    bottom: 0xff9ff3    // Light pink
                },
                clouds: {
                    base: 0xffd700,     // Golden
                    highlight: 0xffffff,
                    shadow: 0xffa500
                },
                trees: {
                    birch: {
                        trunk: 0xF5F5DC,
                        bark: 0x8B4513,
                        leaves: 0x32CD32
                    },
                    fir: {
                        trunk: 0x8B4513,
                        leaves: 0x006400
                    },
                    oak: {
                        trunk: 0x8B4513,
                        leaves: 0x228B22
                    },
                    jungle: {
                        trunk: 0x8B4513,
                        leaves: 0x228B22
                    }
                }
            },
            // Day - Bright daylight
            day: {
                sky: {
                    top: 0x87CEEB,      // Sky blue
                    middle: 0x87CEFA,   // Light sky blue
                    bottom: 0xB0E0E6    // Powder blue
                },
                clouds: {
                    base: 0xFFFFFF,     // Pure white
                    highlight: 0xFFFFFF,
                    shadow: 0xE0E0E0
                },
                trees: {
                    birch: {
                        trunk: 0xF5F5DC,
                        bark: 0x000000,
                        leaves: 0x90EE90
                    },
                    fir: {
                        trunk: 0x8B4513,
                        leaves: 0x228B22
                    },
                    oak: {
                        trunk: 0x8B4513,
                        leaves: 0x32CD32
                    },
                    jungle: {
                        trunk: 0x8B4513,
                        leaves: 0x228B22
                    }
                }
            },
            // Sunset - Evening
            sunset: {
                sky: {
                    top: 0x8B4513,      // Orange-brown
                    middle: 0xFFA500,   // Orange
                    bottom: 0xFF6347    // Tomato red
                },
                clouds: {
                    base: 0xFFB347,     // Golden orange
                    highlight: 0xFFFFFF,
                    shadow: 0xCD853F
                },
                trees: {
                    birch: {
                        trunk: 0xD2B48C,
                        bark: 0x8B4513,
                        leaves: 0x9ACD32
                    },
                    fir: {
                        trunk: 0x8B4513,
                        leaves: 0x556B2F
                    },
                    oak: {
                        trunk: 0x8B4513,
                        leaves: 0x6B8E23
                    },
                    jungle: {
                        trunk: 0x8B4513,
                        leaves: 0x556B2F
                    }
                }
            },
            // Night - Late evening
            night: {
                sky: {
                    top: 0x191970,      // Midnight blue
                    middle: 0x000080,   // Navy
                    bottom: 0x2F4F4F    // Dark slate gray
                },
                clouds: {
                    base: 0xDDDDDD,     // Light gray
                    highlight: 0xFFFFFF,
                    shadow: 0xAAAAAAA
                },
                trees: {
                    birch: {
                        trunk: 0xF5F5DC,
                        bark: 0x2F4F4F,
                        leaves: 0x228B22
                    },
                    fir: {
                        trunk: 0x8B4513,
                        leaves: 0x006400
                    },
                    oak: {
                        trunk: 0x8B4513,
                        leaves: 0x32CD32
                    },
                    jungle: {
                        trunk: 0x8B4513,
                        leaves: 0x228B22
                    }
                }
            }
        };
    }

    setTimeOfDay(timeOfDay) {
        this.timeOfDay = timeOfDay;
    }

    getSkyColors() {
        return this.palettes[this.timeOfDay].sky;
    }

    getCloudColors() {
        return this.palettes[this.timeOfDay].clouds;
    }

    getTreeColors(treeType) {
        return this.palettes[this.timeOfDay].trees[treeType];
    }

    hexToRgb(hex) {
        const r = (hex >> 16) & 0xFF;
        const g = (hex >> 8) & 0xFF;
        const b = hex & 0xFF;
        return { r, g, b };
    }

    rgbToHex(r, g, b) {
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Get sky colors based on numerical time of day (0-1)
     * @param {number} timeOfDay - Time from 0 (midnight) to 1 (next midnight)
     * @returns {object} Sky color object
     */
    getSkyColorsForTime(timeOfDay) {
        // Map time to palette
        if (timeOfDay < 0.15) {
            return this.palettes.midnight.sky;
        } else if (timeOfDay < 0.25) {
            return this.palettes.dawn.sky;
        } else if (timeOfDay < 0.75) {
            return this.palettes.day.sky;
        } else if (timeOfDay < 0.85) {
            return this.palettes.sunset.sky;
        } else {
            return this.palettes.night.sky;
        }
    }

    /**
     * Get tree colors based on time of day
     * @param {string} treeType - Type of tree
     * @param {number} timeOfDay - Time from 0 (midnight) to 1 (next midnight)
     * @returns {object} Tree color object
     */
    getTreeColorsForTime(treeType, timeOfDay) {
        // Map time to palette
        let paletteName;
        if (timeOfDay < 0.15) {
            paletteName = 'midnight';
        } else if (timeOfDay < 0.25) {
            paletteName = 'dawn';
        } else if (timeOfDay < 0.75) {
            paletteName = 'day';
        } else if (timeOfDay < 0.85) {
            paletteName = 'sunset';
        } else {
            paletteName = 'night';
        }

        return this.palettes[paletteName].trees[treeType] || this.palettes[paletteName].trees.oak;
    }

    /**
     * Get cloud colors based on time of day
     * @param {number} timeOfDay - Time from 0 (midnight) to 1 (next midnight)
     * @returns {object} Cloud color object
     */
    getCloudColorsForTime(timeOfDay) {
        // Map time to palette
        let paletteName;
        if (timeOfDay < 0.15) {
            paletteName = 'midnight';
        } else if (timeOfDay < 0.25) {
            paletteName = 'dawn';
        } else if (timeOfDay < 0.75) {
            paletteName = 'day';
        } else if (timeOfDay < 0.85) {
            paletteName = 'sunset';
        } else {
            paletteName = 'night';
        }

        return this.palettes[paletteName].clouds;
    }
}
