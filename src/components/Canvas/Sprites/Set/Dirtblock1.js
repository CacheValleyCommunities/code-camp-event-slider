const sprites = [
  "/images/sprites/nature/PNG/Tiles/tile52.png",
  "/images/sprites/nature/PNG/Tiles/tile76.png",
  "/images/sprites/nature/PNG/Tiles/tile118.png",
  "/images/sprites/nature/PNG/Tiles/tile121.png",
];

let spriteImage = {
  url: "/images/sprites/nature/PNG/Tiles/tile52.png",
  width: 1920,
  height: 1000,
};

function DirtBlock1Sprite({ x, y, width, height }) {
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

export default DirtBlock1Sprite;
