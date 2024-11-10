const sprites = [
  "/images/sprites/nature/PNG/Tiles/tile22.png",
  "/images/sprites/nature/PNG/Tiles/tile23.png",
  "/images/sprites/nature/PNG/Tiles/tile24.png",
  "/images/sprites/nature/PNG/Tiles/tile27.png",
  "/images/sprites/nature/PNG/Tiles/tile28.png",
];

let spriteImage = {
  url: "/images/sprites/nature/PNG/Tiles/tile22.png",
  width: 1920,
  height: 1000,
};

function GrassBlock1Sprite({ x, y, width, height }) {
  const sprite = {
    x: x,
    y: y,
    width: width,
    height: height,
    speed: 0.5,
  };

  spriteImage.height = height;
  spriteImage.width = width;

  sprite.getNextImage = () => {
    const randomIndex = Math.floor(Math.random() * sprites.length);
    spriteImage.url = sprites[randomIndex];

    return spriteImage;
  };

  return sprite;
}

export default GrassBlock1Sprite;
