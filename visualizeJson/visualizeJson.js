visualizeJson = function (myFile) {
  return fetch(myFile).then(function (response) {
    if (response.ok) {
      return response.json(); // raw data
    }
    else {
      return { "x": "something wrong :(" };
    }
  });
};

validJson = function (myFile) {
  'use strict';

  const fs = require('fs');

  let rawdata = fs.readFileSync(myFile);
  let mydata = JSON.parse(rawdata);
  console.log(mydata);

};

promiseA = visualizeJson('TCGA-AC-A3W5-01Z-00-DX1_07-08-2019.json');

promiseA.then(function (result) {
  console.log(result);
  if (result === null) {
    console.error('Abort.')
  } else {
    try {
      let mydata = result; // JSON.parse(result);

      // console.log(mydata);
      const index = mydata.data.locations;
      const features = mydata.data.features;
      let names = Object.getOwnPropertyNames(features);

      let R = features[names[0]];
      let G = features[names[1]];
      let B = features[names[2]];

      // create off-screen canvas element
      let canvas = document.getElementById("myCanvas");

      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'myCanvas';
      }

      const png_w = parseInt(mydata.metadata.png_w);
      const png_h = parseInt(mydata.metadata.png_h);

      canvas.width = png_w;
      canvas.height = png_h;

      let ctx = canvas.getContext("2d");
      // Create a (png_w * png_h) pixels ImageData object
      let imgData = ctx.createImageData(png_w, png_h);

      // Initialize buffer to all black with transparency
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
      }

      // JSON data to image
      for (let n = 0; n < imgData.data.length; n++) {

        let x = index.i[n];
        let y = index.j[n];

        let pixelindex = (y * png_w + x) * 4; // increment our pointer

        // COLOR!

        // First 3 features R G B
        imgData.data[pixelindex] = R[n];      // R value [0, 255]
        imgData.data[pixelindex + 1] = G[n];  // G value
        imgData.data[pixelindex + 2] = B[n];  // B value
        imgData.data[pixelindex + 3] = 255;   // set alpha channel

      }
      ctx.putImageData(imgData, 0, 0); // we now have an image painted to the canvas
      document.body.appendChild(canvas);
    } catch (error) {
      console.error(error);
    }
  }
});
