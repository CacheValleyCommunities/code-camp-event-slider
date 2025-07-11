/**
 * Sponsor data configuration for the hack-a-thon event
 */

const images = [
    {
        url: "/bridgerland-codecamp-2025-sponsors/timely-devs.png",
        width: 400,
        height: 200,
        level: 3
    },
    {
        url: "/bridgerland-codecamp-2025-sponsors/bridgerland.png",
        width: 400,
        height: 200,
        level: 3
    },
    {
        url: "/bridgerland-codecamp-2025-sponsors/import-auto.png",
        width: 400,
        height: 200,
        level: 3
    },
    {
        url: "/bridgerland-codecamp-2025-sponsors/epiroc.png",
        width: 400,
        height: 200,
        level: 2
    },
    {
        url: "/bridgerland-codecamp-2025-sponsors/iota.png",
        width: 400,
        height: 200,
        level: 1
    },
];

const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
const THREE_MINUTES = 3 * 60 * 1000; // 3 minutes in milliseconds
const ONE_MINUTE = 60 * 1000; // 1 minute in milliseconds

/**
 * Sponsor configuration class
 */
export default class SponsorConfig {
    constructor() {
        this.sponsors = images;
        this.tierConfig = {
            3: { // Platinum - highest tier
                scale: 1.2,
                displayDuration: FIVE_MINUTES, // 4 seconds
                alpha: 1.0,
                priority: 3
            },
            2: { // Gold - middle tier
                scale: 1.2,
                displayDuration: THREE_MINUTES, // 3 seconds
                alpha: 0.9,
                priority: 2
            },
            1: { // Bronze/Silver - lowest tier
                scale: 1.2,
                displayDuration: ONE_MINUTE, // 2 seconds
                alpha: 0.8,
                priority: 1
            }
        };
    }

    /**
     * Get all sponsors sorted by tier priority
     */
    getAllSponsors() {
        return this.sponsors.sort((a, b) => {
            const priorityA = this.tierConfig[a.level]?.priority || 0;
            const priorityB = this.tierConfig[b.level]?.priority || 0;
            return priorityB - priorityA; // Higher priority first
        });
    }

    /**
     * Get sponsors that should be shown (have show: true or no show property)
     */
    getActiveSponsors() {
        return this.getAllSponsors().filter(sponsor =>
            sponsor.show !== false // Show if show is true or undefined
        );
    }

    /**
     * Get tier configuration for a sponsor level
     */
    getTierConfig(level) {
        return this.tierConfig[level] || this.tierConfig[3]; // Default to lowest tier
    }

    /**
     * Get effective width for a sponsor (respects individual overrides)
     */
    getEffectiveWidth(sponsor) {
        return sponsor.displayWidth || sponsor.width;
    }

    /**
     * Get effective height for a sponsor (respects individual overrides)
     */
    getEffectiveHeight(sponsor) {
        return sponsor.displayHeight || sponsor.height;
    }

    /**
     * Get sponsors by tier level
     */
    getSponsorsByTier(level) {
        return this.sponsors.filter(sponsor => sponsor.level === level);
    }

    /**
     * Update display size for a specific sponsor by URL
     */
    setSponsorDisplaySize(url, width, height) {
        const sponsor = this.sponsors.find(s => s.url === url);
        if (sponsor) {
            sponsor.displayWidth = width;
            sponsor.displayHeight = height;
            console.log(`🏢 Updated display size for ${url}: ${width}x${height}px`);
        } else {
            console.warn(`⚠️ Sponsor not found: ${url}`);
        }
    }

    /**
     * Reset display size for a specific sponsor (use original width/height)
     */
    resetSponsorDisplaySize(url) {
        const sponsor = this.sponsors.find(s => s.url === url);
        if (sponsor) {
            delete sponsor.displayWidth;
            delete sponsor.displayHeight;
            console.log(`🏢 Reset display size for ${url} to original: ${sponsor.width}x${sponsor.height}px`);
        }
    }
}
