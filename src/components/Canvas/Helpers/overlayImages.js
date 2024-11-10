function overlayImages(
  baseImageSrc,
  coverImageSrc,
  baseImageOptions,
  coverImageOptions
) {
  return new Promise((resolve, reject) => {
    const baseImage = new Image();
    const coverImage = new Image();

    baseImage.src = baseImageSrc;
    coverImage.src = coverImageSrc;

    // Wait for both images to load
    Promise.all([
      new Promise((res) => {
        baseImage.onload = res;
      }),
      new Promise((res) => {
        coverImage.onload = res;
      }),
    ])
      .then(() => {
        // Create canvas and context
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on base image options
        canvas.width = baseImageOptions.width;
        canvas.height = baseImageOptions.height;

        // Draw the base image scaled to its specified dimensions
        ctx.drawImage(
          baseImage,
          0,
          0,
          baseImageOptions.width,
          baseImageOptions.height
        );

        // Calculate scaling factors for the cover image
        const scaleX = baseImageOptions.width / coverImage.width;
        const scaleY = baseImageOptions.height / coverImage.height;
        const scale = Math.min(scaleX, scaleY) - 0.15; // Maintain aspect ratio

        // Calculate new dimensions for the cover image
        const coverWidth = coverImage.width * scale;
        const coverHeight = coverImage.height * scale;

        // Calculate position to center the resized cover image
        const coverX = (canvas.width - coverWidth) / 2;
        const coverY = (canvas.height - coverHeight) / 2;

        // Draw the cover image centered and resized
        ctx.drawImage(coverImage, coverX, coverY, coverWidth, coverHeight);

        // Convert canvas to Blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          } else {
            reject(new Error("Failed to create Blob from canvas."));
          }
        }, "image/png");
      })
      .catch((e) => {
        console.error(e);
        reject(new Error("Image loading error."));
      });
  });
}

export default overlayImages;

// Example usage:
// overlayImages('baseImage.png', 'coverImage.png', { width: 800, height: 600 }, { width: 300, height: 400 })
//     .then(blobUrl => {
//         console.log('Blob URL:', blobUrl);
//     })
//     .catch(err => {
//         console.error('Error:', err);
//     });
