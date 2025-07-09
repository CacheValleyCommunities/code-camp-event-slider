/**
 * Sponsor data configuration for the hack-a-thon event
 */

const images = [
    {
        url: "/logos/2048x800/bronze-eaglegate.png",
        width: 200,
        height: 170,
        level: 3
    },
    {
        url: "/logos/2048x800/bronze-infowest.png",
        width: 200,
        height: 170,
        level: 3,
        show: true
    },
    {
        url: "/logos/2048x800/bronze-sgchamber.png",
        width: 200,
        height: 170,
        level: 3
    },
    {
        url: "/logos/2048x800/gold-beatbread.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-integalactic.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-mango.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-stemoutreachcenter.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-usuext-new.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-usuext-roi.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-utahtech.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/gold-washco.png",
        width: 200,
        height: 170,
        level: 2
    },
    {
        url: "/logos/2048x800/platinum-codekeyz.png",
        width: 200,
        height: 170,
        level: 1
    },
    {
        url: "/logos/2048x800/platinum-tcn.png",
        width: 200,
        height: 170,
        level: 1
    },
    {
        url: "/logos/2048x800/platinum-techridge.png",
        width: 200,
        height: 170,
        level: 1
    },
    {
        url: "/logos/2048x800/platinum-vasion.png",
        width: 200,
        height: 170,
        level: 1
    },
    {
        url: "/logos/2048x800/platinum-zonos.png",
        width: 200,
        height: 170,
        level: 1
    },
    {
        url: "/logos/2048x800/silver-audience.png",
        width: 200,
        height: 170,
        level: 3
    },
    {
        url: "/logos/2048x800/silver-dixietech.png",
        width: 200,
        height: 170,
        level: 3
    },
    {
        url: "/logos/2048x800/silver-hq.png",
        width: 200,
        height: 170,
        level: 3
    },
    {
        url: "/logos/2048x800/silver-scitools.png",
        width: 200,
        height: 170,
        level: 3
    },
];

/**
 * Sponsor configuration class
 */
export default class SponsorConfig {
    constructor() {
        this.sponsors = images;
        this.tierConfig = {
            1: { // Platinum - highest tier
                scale: 1.2,
                displayDuration: 4000, // 4 seconds
                alpha: 1.0,
                priority: 3
            },
            2: { // Gold - middle tier
                scale: 1.0,
                displayDuration: 3000, // 3 seconds
                alpha: 0.9,
                priority: 2
            },
            3: { // Bronze/Silver - lowest tier
                scale: 0.8,
                displayDuration: 2000, // 2 seconds
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
