let spriteImage = {
  url: "/images/sprites/nature/PNG/Tiles/tile11.png",
  width: 1920,
  height: 1000,
};

function SkyBlock1({ x, y, width, height }) {
  const sprite = {
    x: x,
    y: y,
    width: width,
    height: height,
    speed: 0,
  };

  spriteImage.height = height;
  spriteImage.width = width;

  sprite.getNextImage = () => {
    return spriteImage;
  };

  return sprite;
}

export default SkyBlock1;
