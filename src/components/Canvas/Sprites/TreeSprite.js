const size = 48 *3;

const images = [
  {
    url: "/images/trees/birch_1.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_2.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_3.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_4.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_5.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_6.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_7.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_8.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_9.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_10.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/birch_11.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_1.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_2.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_3.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_4.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_5.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_6.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_7.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_8.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_9.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_10.png",
    width: size,
    height: size,
  },
  {
    url: "/images/trees/fir_tree_11.png",
    width: size,
    height: size,
  },
];

function TreeSprite(getRandomNumber, canvas, coords) {
  return {
    x: coords.x,
    y: coords.y,
    width: size,
    height: size,
    speed: 0.5,
    getNextImage: () => {
      const image = images[getRandomNumber(0, images.length - 1)];
      return image;
    },
  };
}

export default TreeSprite;
