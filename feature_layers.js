let threshLow = 40
let threshHigh = 100

// slice ith layer of 2d array
function imSlice(i, arr) {
  return arr.map(x => {
    return x.map(y => {
      if (y[0] === 255 && y[1] === 255 && y[2] === 255) { // White background
        return [y[0], y[1], y[2], 0] // transparent background
      } else if (y[0] === 0 && y[1] === 0 && y[2] === 0) { // Black background
        return [y[0], y[1], y[2], 0] // make transparent
      } else {
        if (i === 0) { // Red channel
          return [y[0], 0, 0, 170] // shut off everything but y[0], and make semi-transparent
        } else if (i === 1) { // Green channel
          return [0, y[1], 0, 170]
        } else if (i === 2) { // Blue channel
          return [0, 0, y[2], 50]
        } else {
          return y
        }
      }
    })
  })
}

// slice ith layer of 2d array
function imSlice1(i, arr) {
  return arr.map(x => {
    return x.map(y => {
      if (y[0] === 255 && y[1] === 255 && y[2] === 255) {
        return [y[0], y[1], y[2], 0] // transparent background
      } else if (y[0] === 0 && y[1] === 0 && y[2] === 0) {
        return [y[0], y[1], y[2], 0] // make transparent
      } else {
        if (i === 0) {
          if (scale(y[0]) >= threshLow && scale(y[0]) <= threshHigh) {
            return [y[0], 0, 0, (y[3] / 2)] // shut off everything but y[0], and make half transparent
          } else {
            return [y[0], y[1], y[2], 0] // make transparent
          }
        } else if (i === 1) {
          if (scale(y[1]) >= threshLow && scale(y[1]) <= threshHigh) {
            return [0, y[1], 0, (y[3] / 2)] // shut off everything but y[1], and make half transparent
          } else {
            return [y[0], y[1], y[2], 0] // make transparent
          }
        } else if (i === 2) {
          if (scale(y[2]) >= threshLow && scale(y[2]) <= threshHigh) {
            return [0, 0, y[2], (y[3] / 2)] // shut off everything but y[2], and make half transparent
          } else {
            return [y[0], y[1], y[2], 0] // make transparent
          }
        } else {
          return y
        }
      }
    })
  })
}

function replicate(dataRed, dataGrn, dataBlu) {
  let c = document.getElementById('layer1')
  let ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataRed)

  c = document.getElementById('layer2')
  ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataGrn)

  c = document.getElementById('layer3')
  ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataBlu)
}

function setDimensions(id, imageObj) {
  let c = document.getElementById(id)
  c.width = imageObj.width
  c.height = imageObj.height
  return c
}

function dim(mat) {
  if (mat instanceof Array) {
    return [mat.length].concat(dim(mat[0]))
  } else {
    return []
  }
}

function transparentize(pixelArray, canvas) {
  pixelArray = pixelArray.map(dd => {
    return dd.map(d => {
      if (d[0] < threshLow && d[1] < threshLow && d[2] < threshLow) {
        // Transparentize
        return [0, 0, 0, 0]
      } else {
        // We have TIL or tumor
        return d
      }
    })
  })

  util.imwrite(canvas, pixelArray)

  return pixelArray
}

let imgDataR = []
let imgDataG = []
let imgDataB = []

function loadImage() {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let imageObj = new Image()
  let imageData
  let pixelArray

  imageObj.onload = () => {
    // Paint it
    canvas.width = imageObj.width
    canvas.height = imageObj.height
    context.drawImage(imageObj, 0, 0)

    // Get data
    imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    pixelArray = util.imData2data(imageData)
    pixelArray = transparentize(pixelArray, canvas)

    // extract RGB
    imgDataR = imSlice(0, pixelArray)
    imgDataG = imSlice(1, pixelArray)
    imgDataB = imSlice(2, pixelArray);

    ['layer1', 'layer2', 'layer3'].forEach(lay => {
      setDimensions(lay, imageObj)
    })

    replicate(imSlice1(0, pixelArray), imSlice1(1, pixelArray), imSlice1(2, pixelArray))
  }
  imageObj.src = './dist/img/TCGA-EW-A1P7-01Z-00-DX1.png'
}

function checkAll() {
  // check/un-check toggle
  let canvases = document.querySelectorAll('canvas')
  let htmlCollection = document.getElementsByTagName('input')

  for (let i = 0; i < htmlCollection.length; i++) {
    const input = htmlCollection[i]
    if (input.type === 'checkbox') {
      if (input.checked) {
        input.checked = false;              //checkbox
        canvases[i].style.display = 'none'  //canvas
      } else {
        input.checked = true;               //checkbox
        canvases[i].style.display = 'block' //canvas
      }
    }
  }
}

// Event Handlers
function reset() {
  let inputs = document.getElementsByTagName('input')
  for (const input of inputs) {
    if (input.type === 'checkbox') {
      input.checked = true
    }
  }

  let canvases = document.querySelectorAll('canvas')
  for (const canvas of canvases) {
    canvas.style.display = 'block'
  }

  cancer.refresh()
  til.refresh()

  loadImage()
}

function toggleLayer(layerId, checkBox) {
  let x = document.getElementById(layerId)

  // If the checkbox is checked, display the output
  if (checkBox.checked) {
    x.style.display = 'block'
  } else {
    x.style.display = 'none'
  }
}

function visible(idx) {
  // Check to see which toggle is on or off?
  // For now shutting off the opposite layer, and blue.
  let x = document.getElementById('layer3')
  x.style.display = 'none'
  if (idx === 1) {
    let x = document.getElementById('layer1')
    x.style.display = 'block'
    x = document.getElementById('layer2')
    x.style.display = 'none'
  } else {
    let x = document.getElementById('layer2')
    x.style.display = 'block'
    x = document.getElementById('layer1')
    x.style.display = 'none'
  }
}

function rangeSlider(data, slider, idx) {
  visible(idx)
  idx--

  let arr = slider.getValue()
  threshLow = arr[0]
  threshHigh = arr[1]

  let newArray = data.map(dd => {
    return dd.map(d => {
      // In range (return pixels)
      if (scale(d[idx]) >= threshLow && scale(d[idx]) <= threshHigh) {
        return d
      } else {
        // Outside range (blanche)
        return [255, 255, 255, 255]
      }
    })
  })
  idx++
  let x = document.getElementById('layer' + idx)
  util.imwrite(x, newArray)
}

// scale rgb colors to percentage
let scale = db => {
  return db / 255 * 100
}

window.onload = () => {
  loadImage()
}

let cancer
let til
$(document).ready(() => {
  cancer = new Slider('#cancer', {})
  til = new Slider('#til', {})
})
