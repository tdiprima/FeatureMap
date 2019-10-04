var threshLow = 40;
var threshHigh = 100;

function imSlice1(i, arr) { // slice ith layer of 2d array

  console.log('imSlice1', [threshLow, threshHigh]);

  return arr.map(x => {
    return x.map(y => {
      if (y[0] === 255 && y[1] === 255 && y[2] === 255) {
        return [y[0], y[1], y[2], 0]; // transparent background
      }
      else if (y[0] === 0 && y[1] === 0 && y[2] === 0) {
        return [y[0], y[1], y[2], 0]; // make transparent
      }
      else {
        if (i === 0) {

          if (scale(y[0]) >= threshLow && scale(y[0]) <= threshHigh) {
            return [y[0], 0, 0, (y[3] / 2)];   // shut off everything but y[0], and make half transparent
          }
          else
          {
            return [y[0], y[1], y[2], 0]; // make transparent
          }
        }
        else if (i === 1) {
          if (scale(y[1]) >= threshLow && scale(y[1]) <= threshHigh) {
            return [0, y[1], 0, (y[3] / 2)];   // shut off everything but y[1], and make half transparent
          }
          else
          {
            return [y[0], y[1], y[2], 0]; // make transparent
          }
        }
        else if (i === 2) {
          if (scale(y[2]) >= threshLow && scale(y[2]) <= threshHigh) {
            return [0, 0, y[2], (y[3] / 2)];   // shut off everything but y[2], and make half transparent
          }
          else
          {
            return [y[0], y[1], y[2], 0]; // make transparent
          }
        }
        else {
          return y;
        }
      }
    })
  })
}

function replicate(dataRed, dataGrn, dataBlu) {
  var c = document.getElementById("layer1");
  var ctx = c.getContext("2d");
  ctx.globalAlpha = 0.2;
  util.imwrite(c, dataRed);

  c = document.getElementById("layer2");
  ctx = c.getContext("2d");
  ctx.globalAlpha = 0.2;
  util.imwrite(c, dataGrn);

  c = document.getElementById("layer3");
  ctx = c.getContext("2d");
  ctx.globalAlpha = 0.2;
  util.imwrite(c, dataBlu);
}

function setDimensions(id, imageObj) {
  var c = document.getElementById(id);
  c.width = imageObj.width;
  c.height = imageObj.height;
  return c;
}

function dim(mat) {
  if (mat instanceof Array) {
    return [mat.length].concat(dim(mat[0]));
  } else {
    return [];
  }
}

function turnOnTheLights(my2DArray, canvas) {
  my2DArray = my2DArray.map(function (dd) {
    return dd.map(function (d) {
      // If we have til or tumor
      if (d[0] < threshLow && d[1] < threshLow && d[2] < threshLow) {
        return [255, 255, 255, 0];
      }
      else {
        return d;
      }
    });
  });
  util.imwrite(canvas, my2DArray);
  return my2DArray;
}

var imgDataR = [];
var imgDataG = [];
var imgDataB = [];

function loadImage() {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var imageObj = new Image();
  var imageData;
  var my2DArray;

  imageObj.onload = function () {
    // Paint it
    canvas.width = imageObj.width;
    canvas.height = imageObj.height;
    context.drawImage(imageObj, 0, 0);

    // Get data
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    my2DArray = util.imData2data(imageData);
    my2DArray = turnOnTheLights(my2DArray, canvas);

    // extract RGB
    imgDataR = imSlice(0, my2DArray);
    imgDataG = imSlice(1, my2DArray);
    imgDataB = imSlice(2, my2DArray);

    ['layer1', 'layer2', 'layer3'].forEach(function (lay) {
      setDimensions(lay, imageObj);
    });

    replicate(imSlice1(0, my2DArray), imSlice1(1, my2DArray), imSlice1(2, my2DArray));

  };
  imageObj.src = './dist/img/TCGA-EW-A1P7-01Z-00-DX1.png';

}

// Event Handlers
function reset() {

  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(c => {
    c.style.display = "block";
  });

  cancer.refresh();
  til.refresh();

  // document.getElementsByClassName("slider slider-horizontal")[0].children[4] and [5]
  // document.getElementsByClassName("slider slider-horizontal")[1].children[4] and [5]

  loadImage();
}

function toggleLayer(layerId) {
  // https://www.w3schools.com/howto/howto_js_toggle_hide_show.asp
  var x = document.getElementById(layerId);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function visible(idx) {
  // Check to see which toggle is on or off?
  // For now shutting off the opposite layer, and blue.
  let x = document.getElementById("layer3");
  x.style.display = "none";
  if (idx === 1) {
    let x = document.getElementById("layer1");
    x.style.display = "block";
    x = document.getElementById("layer2");
    x.style.display = "none";
  }
  else {
    let x = document.getElementById("layer2");
    x.style.display = "block";
    x = document.getElementById("layer1");
    x.style.display = "none";
  }
}

function rangeSlider(data, slider, idx) {

  visible(idx);
  idx--;

  var arr = slider.getValue();
  threshLow = arr[0];
  threshHigh = arr[1];
  console.log('rangeSlider', [threshLow, threshHigh]);
  var newArray = data.map(function (dd) {
    return dd.map(function (d) {
      // In range
      if (scale(d[idx]) >= threshLow && scale(d[idx]) <= threshHigh) {
        return d;
      }
      else {
        // Outside range
        return [255, 255, 255, 255];
      }
    });
  });
  idx++;
  let x = document.getElementById("layer" + idx);
  util.imwrite(x, newArray);

}

var scale = function (db) {
  return db / 255 * 100;
};

window.onload = loadImage();

var cancer;
var til;
$(document).ready(function () {
  cancer = new Slider('#cancer', {});
  til = new Slider('#til', {});
});

function imSlice(i, arr) { // slice ith layer of 2d array
  console.log('imSlice', [threshLow, threshHigh]);
  i = i || 0;
  return arr.map(x => {
    return x.map(y => {
      if (y[0] === 255 && y[1] === 255 && y[2] === 255) { // White background
        return [y[0], y[1], y[2], 0]; // transparent background
      }
      else if (y[0] === 0 && y[1] === 0 && y[2] === 0) { // Black background
        return [y[0], y[1], y[2], 0]; // make transparent
      }
      else {
        if (i === 0) { // Red channel
          return [y[0], 0, 0, 170];   // shut off everything but y[0], and make semi-transparent
        }
        else if (i === 1) { // Green channel
          return [0, y[1], 0, 170];
        }
        else if (i === 2) { // Blue channel
          return [0, 0, y[2], 50];
        }
        else {
          return y;
        }
      }
    })
  })
}
