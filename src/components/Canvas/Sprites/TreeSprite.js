const size = 48 *3;

const images = [
  {
    url: "/images/trees/fir_tree_4.png",
    width: 75,
    height: 350,
  },
  {
    url: "/images/trees/fir_tree_3.png",
    width: 75,
    height: 350,
  },
  {
    url: "/images/trees/fir_tree_2.png",
    width: 100,
    height: 350,
  },
  {
    url: "/images/trees/fir_tree_1.png",
    width: 100,
    height: 350,
  }
];

function TreeSprite(getRandomNumber, canvas, coords) {
  return {
    x: coords.x,
    y: coords.y,
    width: 75,
    height: 350,
    speed: 0.5,
    getNextImage: () => {
      const image = images[getRandomNumber(0, images.length - 1)];
      return image;
    },
  };
}

export default TreeSprite;
