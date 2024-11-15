const size = 48 *3;

const images = [
  {
    url: "/images/trees/fir_tree_11.png",
    width: 20,
    height: 20,
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

function TreeFirStumpSprite(getRandomNumber, canvas, coords) {
  return {
    x: coords.x,
    y: coords.y,
    width: 20,
    height: 20,
    speed: 0.5,
    getNextImage: () => {
      const image = images[getRandomNumber(0, images.length - 1)];
      return image;
    },
  };
}

export default TreeFirStumpSprite;
