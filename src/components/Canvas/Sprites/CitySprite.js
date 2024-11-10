const images = [
  {
    url: "/images/logos/skyline.png",
    width: 1920,
    height: 1000,
  },
];

function CitySprite(getRandomNumber, canvas, coords) {
  let index = 0;

  const citySprite = {
    x: coords.x,
    y: coords.y,
    width: 1920,
    height: 1000,
    speed: 0.1,
    getNextImage: null,
  };

  citySprite.getNextImage = async () => {
    try {
      if (index === images.length) {
        index = 0;
      }

      const image = images[index];

      index++;
      return image;
    } catch (e) {
      console.log("Something went wrong getting mountain image", e);
    }
  };
  return citySprite;
}

export default CitySprite;
