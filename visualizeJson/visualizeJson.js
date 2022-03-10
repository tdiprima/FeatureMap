visualizeJson = function (myFile) {
  return fetch(myFile).then(function (response) {
    if (response.ok) {
      return response.json() // raw data
    } else {
      return {x: 'something wrong :('}
    }
  })
}

validJson = function (myFile) {
  'use strict'

  let fs = require('fs')

  let rawData = fs.readFileSync(myFile)
  let myData = JSON.parse(rawData)
  console.log(myData)
}

promiseA = visualizeJson('TCGA-AC-A3W5-01Z-00-DX1_07-08-2019.json')

promiseA.then(function (result) {
  console.log(result)
  if (result === null) {
    console.error('Abort.')
  } else {
    try {
      let myData = result // JSON.parse(result);

      // console.log(myData);
      let index = myData.data.locations
      let features = myData.data.features
      let names = Object.getOwnPropertyNames(features)

      let R = features[names[0]]
      let G = features[names[1]]
      let B = features[names[2]]

      // create off-screen canvas element
      let canvas = document.getElementById('myCanvas')

      if (!canvas) {
        canvas = document.createElement('canvas')
        canvas.id = 'myCanvas'
      }

      let png_w = parseInt(myData.metadata.png_w)
      let png_h = parseInt(myData.metadata.png_h)

      canvas.width = png_w
      canvas.height = png_h

      let ctx = canvas.getContext('2d')
      // Create a (png_w * png_h) pixels ImageData object
      let imgData = ctx.createImageData(png_w, png_h)

      // Initialize buffer to all black with transparency
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 0
        imgData.data[i + 1] = 0
        imgData.data[i + 2] = 0
        imgData.data[i + 3] = 255
      }

      // JSON data to image
      for (let n = 0; n < imgData.data.length; n++) {
        let x = index.i[n]
        let y = index.j[n]

        let pixelIndex = (y * png_w + x) * 4 // increment our pointer

        // COLOR!

        // First 3 features R G B
        imgData.data[pixelIndex] = R[n] // R value [0, 255]
        imgData.data[pixelIndex + 1] = G[n] // G value
        imgData.data[pixelIndex + 2] = B[n] // B value
        imgData.data[pixelIndex + 3] = 255 // set alpha channel
      }
      ctx.putImageData(imgData, 0, 0) // we now have an image painted to the canvas
      document.body.appendChild(canvas)
    } catch (error) {
      console.error(error)
    }
  }
})
