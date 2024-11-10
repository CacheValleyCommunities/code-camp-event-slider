const size = 48 * 3;

const images = [
    {
        url: "/images/clouds/Clouds-2.png",
        width: size,
        height: size / 2,
    },
    {
        url: "/images/clouds/Clouds.png",
        width: size,
        height: size / 2,
    },
];

function GetBandSpeed(canvasHeight, yCoord) {
    const numBands = 6;
    const bandHeight = Math.ceil(canvasHeight / numBands);
    const bandSpeedModifier = 0.1;

    for (let i = 1; i <= numBands; i++) {
        const bandStart = (i - 1) * bandHeight;
        const bandEnd = bandStart + bandHeight;

        if (yCoord >= bandStart && yCoord < bandEnd) {
            return 0.2 + (bandSpeedModifier * i);
        }
    }
    
    // Default return if yCoord doesn't fall in any defined band
    return 0.2;
}



function CloudSprite(getRandomNumber, canvas, coords) {
    return {
        x: coords.x,
        y: coords.y,
        width: size,
        height: size / 2,
        speed: .25 + GetBandSpeed(canvas.height, coords.y),
        getNextImage: () => {
            const image = images[getRandomNumber(0, images.length - 1)];
            return image;
        },
    };
}

export default CloudSprite;
