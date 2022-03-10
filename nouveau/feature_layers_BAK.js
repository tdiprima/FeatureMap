let threshold = 10

function imSlice (i, arr) { // slice ith layer of 2d array
  // var arr = document.getElementById('til').value.split(',').map(str => parseInt(str));
  // let threshold = arr[0];
  // i = i || 0;
  return arr.map(x => {
    return x.map(y => {
      if (y[0] === 255 && y[1] === 255 && y[2] === 255) { // White background
        return [y[0], y[1], y[2], 0] // transparent background
      } else if (y[0] === 0 && y[1] === 0 && y[2] === 0) { // Black background
        return [y[0], y[1], y[2], 0] // make transparent
      } else {
        if (i === 0) { // Red channel
          if (y[0] < threshold) {
            return [y[0], y[1], y[2], 0] // make transparent bc it looks black on screen anyway
          } else {
            if (y[3] !== 255) {
              console.log('red', y[3])
            }
            return [y[0], 0, 0, 170] // shut off everything but y[0], and make half transparent
          }
        } else if (i === 1) { // Green channel
          if (y[1] < threshold) {
            return [y[0], y[1], y[2], 0]
          } else {
            if (y[3] !== 255) {
              console.log('green', y[3])
            }
            return [0, y[1], 0, 170]
          }
        } else if (i === 2) { // Blue channel
          if (y[2] < threshold) {
            return [y[0], y[1], y[2], 0]
          } else {
            if (y[3] !== 255) {
              console.log('blue', y[3])
            }
            return [0, 0, y[2], 50]
          }
        } else {
          return y
        }
      }
    })
  })
}

function replicate (dataRed, dataGrn, dataBlu) {
  let c = document.getElementById('layerTIL')
  let ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataRed)

  c = document.getElementById('layerCancer')
  ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataGrn)

  c = document.getElementById('layerTissue')
  ctx = c.getContext('2d')
  ctx.globalAlpha = 0.2
  util.imwrite(c, dataBlu)
}

function setDimensions (id, imageObj) {
  let c = document.getElementById(id)
  c.width = imageObj.width
  c.height = imageObj.height
  return c
}

function dim (mat) {
  if (mat instanceof Array) {
    return [mat.length].concat(dim(mat[0]))
  } else {
    return []
  }
}

function turnOnTheLights (my2DArray, canvas) {
  my2DArray = my2DArray.map(dd => {
    return dd.map(d => {
      // If we have til or tumor
      if (d[0] < threshold && d[1] < threshold && d[2] < threshold) {
        return [255, 255, 255, 0]
      } else {
        return d
      }
    })
  })
  util.imwrite(canvas, my2DArray)
  return my2DArray
}

let imgDataR = []
let imgDataG = []
let imgDataB = []

function loadImage () {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let imageObj = new Image()
  let imageData
  let my2DArray

  imageObj.onload = () => {
    // Paint it
    canvas.width = imageObj.width
    canvas.height = imageObj.height
    context.drawImage(imageObj, 0, 0)

    // Get data
    imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    my2DArray = util.imData2data(imageData)
    my2DArray = turnOnTheLights(my2DArray, canvas)

    // extract RGB
    imgDataR = imSlice(0, my2DArray)
    imgDataG = imSlice(1, my2DArray)
    imgDataB = imSlice(2, my2DArray);

    ['layerTIL', 'layerCancer', 'layerTissue'].forEach(lay => {
      setDimensions(lay, imageObj)
    })

    replicate(imgDataR, imgDataG, imgDataB)
  }
  // imageObj.src = 'TCGA-2F-A9KP-01Z-00-DX2.png';
  imageObj.src = 'TCGA-EW-A1P7-01Z-00-DX1.png'
}

// Event Handlers
function reset () {
  let canvases = document.querySelectorAll('canvas')
  canvases.forEach(c => {
    c.style.display = 'block'
  })

  cancer.refresh()
  til.refresh()

  // document.getElementsByClassName("slider slider-horizontal")[0].children[4] and [5]
  // document.getElementsByClassName("slider slider-horizontal")[1].children[4] and [5]

  loadImage()
}

function toggleLayer (layerId) {
  // https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
  let x = document.getElementById(layerId)
  if (x.style.display === 'none') {
    x.style.display = 'block'
  } else {
    x.style.display = 'none'
  }
}

function visible (idx) {
  // Check to see which toggle is on or off?
  // For now shutting off the opposite layer, and blue.
  let x = document.getElementById('layerTissue')
  x.style.display = 'none'
  if (idx === 1) {
    let x = document.getElementById('layerTIL')
    x.style.display = 'block'
    x = document.getElementById('layerCancer')
    x.style.display = 'none'
  } else {
    let x = document.getElementById('layerCancer')
    x.style.display = 'block'
    x = document.getElementById('layerTIL')
    x.style.display = 'none'
  }
}

function rangeSlider (data, slider, idx) {
  visible(idx)
  idx--

  let arr = slider.getValue()
  // arr = slider.value.split(',').map(str => parseInt(str));
  // console.log(arr);
  let newArray = data.map(dd => {
    return dd.map(d => {
      // In range
      if (scale(d[idx]) >= arr[0] && scale(d[idx]) <= arr[1]) {
        return d
      } else {
        // Outside range
        return [255, 255, 255, 255]
      }
    })
  })
  idx++
  let x = document.getElementById('layer' + idx)
  util.imwrite(x, newArray)
}

var scale = db => {
  return db / 255 * 100
}

window.onload = loadImage()

let cancer
let til
$(document).ready(() => {
  cancer = new Slider('#cancer', {})
  til = new Slider('#til', {})
})

function imSliceBAK (i, arr) { // slice ith layer of 2d array
  i = i || 0
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
