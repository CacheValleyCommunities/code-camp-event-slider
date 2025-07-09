// CRTGlowSync.js
// Dynamically updates the CRT glow color based on the average color of the game canvas

export default function setupCRTGlowSync() {
    const canvas = document.querySelector('#game-container canvas');
    const glow = document.querySelector('#crt-overlay .glow');
    if (!canvas || !glow) return;

    // Create an offscreen canvas for pixel sampling
    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d');

    function getAverageColor() {
        // Match canvas size
        offscreen.width = Math.max(1, Math.floor(canvas.width / 32));
        offscreen.height = Math.max(1, Math.floor(canvas.height / 32));
        ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
        const data = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        return { r, g, b };
    }

    function updateGlow() {
        const { r, g, b } = getAverageColor();
        // Animate glow size (pulsing)
        const t = Date.now() * 0.002;
        const pulse = 1 + Math.sin(t) * 0.08; // 8% size pulse
        const base80 = 80 * pulse;
        const base120 = 120 * pulse;
        const glowColor = `rgba(${r},${g},${b},0.25)`;
        glow.style.boxShadow = `0 0 ${base80}px 15px ${glowColor}, 0 0 ${base120}px 30px ${glowColor}`;
    }

    // Update every animation frame
    function loop() {
        updateGlow();
        requestAnimationFrame(loop);
    }
    loop();
}
