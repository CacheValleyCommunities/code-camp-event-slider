import overlayImages from "../Helpers/overlayImages";
const images = [
  {
    url: "/images/logos/2048x800/bronze-eaglegate.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/bronze-infowest.png",
    width: 133,
    height: 100,
    show: true
  },
  {
    url: "/images/logos/2048x800/bronze-sgchamber.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-beatbread.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-integalactic.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-mango.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-stemoutreachcenter.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-usuext-new.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-usuext-roi.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-utahtech.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/gold-washco.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/platinum-codekeyz.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/platinum-tcn.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/platinum-techridge.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/platinum-vasion.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/platinum-zonos.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/silver-audience.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/silver-dixietech.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/silver-hq.png",
    width: 133,
    height: 100,
  },
  {
    url: "/images/logos/2048x800/silver-scitools.png",
    width: 133,
    height: 100,
  },
];


function SponsorSprite(getRandomNumber, canvas, coords) {
  let index = 0;

  const sponsorSprite = {
    x: coords.x,
    y: coords.y,
    width: 400,
    height: 200,
    speed: 0.5,
    getNextImage: null,
  };

  sponsorSprite.getNextImage = async () => {
    try {
      if (index === images.length) {
        index = 0;
      }

      const image = images[index];
      const melded = await overlayImages(
        "/images/logos/pxArt-1.png",
        image.url,
        {
          width: 750,
          height:750,
        },
        {
          width: 400,
          height: 400,
        }
      );

      index++;
      return {
        ...image,
        // url: melded,
        width: 400,
        height: 200,
      };
    } catch (e) {
      console.log("Something went wrong getting next sponsor image", e);
    }
  };
  return sponsorSprite;
}

export default SponsorSprite;
