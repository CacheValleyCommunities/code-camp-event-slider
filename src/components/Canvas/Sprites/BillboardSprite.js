const images = [
  {
    url: "/images/logos/pxArt.png",
    width: 500,
    height: 500,
  },
];

function BillboardSprite(getRandomNumber, canvas, coords) {
  let index = 0;

  return {
    x: coords.x,
    y: coords.y,
    width: 500,
    height: 600,
    speed: 0.5,
    getNextImage: () => {
      if (index === images.length) index = 0;

      const image = images[index];
      index++;
      return image;
    },
  };
}

export default BillboardSprite;
