import React, { useEffect, useRef } from "react";
import "./Canvas.css";
import SponsorSprite from "./Sprites/SponsorSprite";
import CitySprite from "./Sprites/CitySprite";
import GrassSprite1 from "./Sprites/Set/GrassBlock1";
import DirtBlock1Sprite from "./Sprites/Set/Dirtblock1";
import SkyBlock1 from "./Sprites/Set/Skyblock1";
import TreeSprite from "./Sprites/TreeSprite";
import CloudSprite from "./Sprites/CloudSprite";

// console.log = () => null;

function Canvas() {
  const canvasRef = useRef(null);
  const hasSetupBeenCalled = useRef(false);
  const layers = useRef({
    background: [],
    mountains: [],
    clouds: [],
    trees: [],
    'trees-2': [],
    'trees-3': [],
    'trees-4': [],
    stars: [],
    sprites: [],
    foreground: [],
  });

  useEffect(() => {
    const getRandomStartingXLocation = (canvasWidth, elementWidth) => {
      // Generate a random X position starting from the right edge of the canvas
      return getRandomNumber(0, canvasWidth);
    };

    const updateSpriteImage = async (sprite) => {
      const img = new Image();
      const nextImage = await sprite.config.getNextImage();
      img.src = nextImage.url;

      img.onload = () => {
        sprite.image = img; // Store the loaded image in the element
        sprite.width = nextImage.width;
        sprite.height = nextImage.height;
      };
    };

    const getRandomNumber = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Utility function to get a random color representing stars
    const getRandomColor = () => {
      const colors = [
        "#FFFFFF", // White
        "#FFD700", // Gold
        "#FF4500", // Orange Red
        "#FF8C00", // Dark Orange
      ];

      return colors[Math.floor(Math.random() * colors.length)];
    };

    const createElement = async (type, config, layer, delay = 0) => {
      // Create a promise that resolves after the specified delay
      if (delay !== 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const element = { type, ...config };

      if (type === "sprite") {
        const img = new Image();
        try {
          const nextImage = await config.getNextImage();
          config.height = nextImage.height;
          config.width = nextImage.width;
          img.src = nextImage.url;
          element.image = img; // Store the loaded image in the element
        } catch (e) {
          console.log("Something went wrong creating sprite", e);
        }
      }

      element.config = config;

      // Ensure the layer exists
      if (!layers.current[layer]) {
        console.error(
          `Layer "${layer}" does not exist. Available layers:`,
          Object.keys(layers.current)
        );
        return; // Exit early if the layer is invalid
      }

      layers.current[layer].push(element);

      return element;
    };

    const drawElements = (context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      Object.keys(layers.current).forEach((layer) => {
        layers.current[layer].forEach((element) => {
          if (element.type === "rectangle") {
            context.fillStyle = element.color || "rgba(255, 100, 100, 0.8)";
            context.fillRect(
              element.x,
              element.y,
              element.width,
              element.height
            );

            // Move rectangle
            element.x -= element.speed;
            if (
              element.x + element.width < 0 &&
              element.config &&
              !element.config.noRegen
            ) {
              element.x = context.canvas.width;
            }

            if (element.config && element.config.perTickTranslation) {
              const { modifier, xFunc, yFunc } =
                element.config.perTickTranslation;
              const yUnitChange = yFunc() * modifier;
              element.y += yUnitChange * 10;

              if (xFunc) {
                const xUnitChange = yFunc() * modifier;
                element.x += xUnitChange * 10;
              }
            }
          } else if (element.type === "sprite") {
            if (element.image.complete) {
              context.drawImage(
                element.image,
                element.x,
                element.y,
                element.width,
                element.height
              );
            }

            // Move sprite
            element.x -= element.speed;
            if (element.x + element.width < 0 && !element.config.noRegen) {
              updateSpriteImage(element);
              element.x = context.canvas.width; // Reset position to the right
            }
          }
        });
      });
    };

    const animate = (context) => {
      drawElements(context);
      requestAnimationFrame(() => animate(context));
    };

    const setup = async () => {
      hasSetupBeenCalled.current = true;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = 1920;
      canvas.height = 1080;

      // Create example elements only once
      if (layers.current.background.length === 0 || true) {
        StartShootingStars(
          getRandomNumber,
          createElement,
          getRandomStartingXLocation,
          canvas,
          getRandomColor
        ); // Start the first star creation

        let width = 0;
        const maxWidth = 1920 + 48;
        let height = 0;
        const maxHeight = 1080 + 48;

        const dirtHeight = canvas.height - 100 - 48;
        const grassHeight = dirtHeight - 48;
        const skyHeight = grassHeight - 48;

        while (width < maxWidth) {
          await createElement(
            "sprite",
            DirtBlock1Sprite({
              x: width,
              y: dirtHeight,
              width: 48,
              height: 48,
            }),
            "foreground"
          );
          await createElement(
            "sprite",
            GrassSprite1({
              x: width,
              y: grassHeight,
              width: 48,
              height: 48,
            }),
            "foreground"
          );

          height = 0;

          while (height < maxHeight) {
            await createElement(
              "sprite",
              SkyBlock1({
                x: width,
                y: height,
                width: 48,
                height: 48,
              }),
              "background"
            );

            height += 48;
          }

          width += 48;
        }

        for (let i = 0; i < 100; i++) {
          const starDimension = getRandomNumber(0.5, 3);

          createElement(
            "rectangle",
            {
              x: getRandomStartingXLocation(canvas.width, 5),
              y: getRandomNumber(0, canvas.height),
              width: starDimension,
              height: starDimension,
              speed: 0.1, //getRandomNumber(0.01, 0.02),
              color: getRandomColor(),
              noRegen: false,
            },
            "stars"
          );
        }

        for (let i = 0; i < 5; i++) {
          createElement(
            "sprite",
            CloudSprite(getRandomNumber, canvas, {
              x: getRandomStartingXLocation(canvas.width, 5),
              y: getRandomNumber(96, canvas.height - 300),
            }),
            "clouds"
          );
        }

        createForest(canvas);

        // await createCityScapeSprites(createElement, getRandomNumber, canvas);

        createSponsorBillboard(canvas);
      }

      animate(context);
    };

    async function createForest(canvas) {
      let height = canvas.height - 18 - 328;

      for (let i = 0; i < 20; i++) {
        createElement(
          "sprite",
          TreeSprite(getRandomNumber, canvas, { x: getRandomNumber(0, canvas.width), y: height }),
          "trees"
        )
      }

      for (let i = 0; i < 20; i++) {
        createElement(
          "sprite",
          TreeSprite(getRandomNumber, canvas, { x: getRandomNumber(0, canvas.width), y: height + 10 }),
          "trees-2"
        )
      }

      for (let i = 0; i < 20; i++) {
        createElement(
          "sprite",
          TreeSprite(getRandomNumber, canvas, { x: getRandomNumber(0, canvas.width), y: height + 15 }),
          "trees-3"
        )
      }

      for (let i = 0; i < 20; i++) {
        createElement(
          "sprite",
          TreeSprite(getRandomNumber, canvas, { x: getRandomNumber(0, canvas.width), y: height + 20 }),
          "trees-4"
        )
      }
    }

    async function createSponsorBillboard(canvas) {
      let height = canvas.height - (96*3) - 300;

      let coords = {
        x: 0,
        y: height, // sprite height - footer height
      };

      await createElement(
        "sprite",
        SponsorSprite(getRandomNumber, canvas, coords),
        "foreground"
      );
    }

    function StartShootingStars(
      getRandomNumber,
      createElement,
      getRandomStartingXLocation,
      canvas,
      getRandomColor
    ) {
      let pendingInterval = null;

      const createStar = async () => {
        // Wait for a random delay
        await new Promise((resolve) =>
          setTimeout(resolve, getRandomNumber(100, 1000 * 6) * 1)
        );

        // Create a shooting star
        await createShootingStar(
          createElement,
          getRandomStartingXLocation,
          canvas,
          getRandomNumber,
          getRandomColor
        );

        // Check for the next star
        pendingInterval = setTimeout(createStar, 1000); // Schedule the next star creation
      };

      pendingInterval = setTimeout(createStar, 1000); // Start the first star creation
      return pendingInterval;
    }

    function createShootingStar(
      createElement,
      getRandomStartingXLocation,
      canvas,
      getRandomNumber,
      getRandomColor
    ) {
      const starDir = Math.random() < 0.5 ? -1 : 1;
      const perYTranslate = getRandomNumber(0.01, 0.5);
      createElement(
        "rectangle",
        {
          x: getRandomStartingXLocation(canvas.width, 5),
          y: getRandomNumber(200, 500),
          width: getRandomNumber(1, 12),
          height: 5,
          speed: getRandomNumber(10, 20),
          color: getRandomColor(),
          noRegen: true,
          perTickTranslation: {
            x: -1,
            y: -0.1,
            modifier: starDir,
            yFunc: () => perYTranslate,
          },
        },
        "stars",
        5000
      );
    }

    if (!hasSetupBeenCalled.current) {
      setup();
    }
  }, [layers]);

  return (
    <div className="app-canvas">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default Canvas;
