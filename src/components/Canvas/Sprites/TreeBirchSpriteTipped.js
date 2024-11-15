const size = 48 *3;

const images = [
  {
    url: "/images/trees/birch_8.png",
    width: 125,
    height: 125,
  },
  // {
  //   url: "/images/trees/birch_3.png",
  //   width: 75,
  //   height: 200,
  // },
  // {
  //   url: "/images/trees/birch_2.png",
  //   width: 100,
  //   height: 200,
  // },
  // {
  //   url: "/images/trees/birch_1.png",
  //   width: 100,
  //   height: 200,
  // }
];

function BirchTreeSpriteTipped(getRandomNumber, canvas, coords) {
  return {
    x: coords.x,
    y: coords.y,
    width: 125,
    height: 125,
    speed: 0.5,
    getNextImage: () => {
      const image = images[getRandomNumber(0, images.length - 1)];
      return image;
    },
  };
}

export default BirchTreeSpriteTipped;
