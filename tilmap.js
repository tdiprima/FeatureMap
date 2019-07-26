/**
 * Parses querystring for parameters.
 * Transforms CSV to image.
 * Displays image to user.
 */
tilmap = function () {

  var queryString = location.search;
  if (queryString.length > 1) {

    let str = location.search.slice(1);
    tilmap.map = getQueryVariable('map', str); // json
    if (tilmap.map.endsWith("csv")) {
      alert('Expecting JSON file, got CSV.\nQuitting.');
      throw new Error('file error');
    }
    tilmap.slide = getQueryVariable('slideId', str); // drupal node of slide
    tilmap.mode = getQueryVariable('mode', str); // camic toggle switch
    tilmap.flag = true;

    promiseA = fetch_data(tilmap.map);
    promiseA.then(function (result) {
      if (result === null) {
        console.log('Abort.')
      } else {
        tilmap.data = JSON.parse(result); // if it borks here, file might be csv
        // tilmap.dataUri = result;
        // download(tilmap.slide + '.png', result);
        tilmap.calcTILfun()
      }
    });

  } else {
    alert('Expecting parameters: mode, slideId, and map');
  }

};

fetch_data = function (url) {

  return fetch(url).then(function (response) {
    console.log('url', url);
    console.log('response', response);

    if (response.ok) {

      let headers = response.headers.get('content-type');
      let data;

      if (headers.toLowerCase().indexOf("application/json") === -1) {
        data = response.text();
      } else {
        data = response.json();
      }
      return data; // fulfillment value given to user
    } else {
      // Alert that there's an error
      setTimeout((function () {
        if (url !== null) {
          let x = url.split('/');
          let y = x.length;
          alert(x[y - 1] + ' ' + response.status + ' ' + response.statusText);
          return false;

        } else {
          alert(response.status + ' ' + response.statusText);
          return false;

        }
      }), 1000);

    }
    throw new Error(response.status + ' ' + response.statusText);
  }).catch(function (error) {
    console.log('There has been a problem with your fetch operation: ', error.message);
  });
};

function scaler(canvas) {
  if (tilmap.scale > 0) {
    var canvas = document.getElementById(canvas);
    var context = canvas.getContext("2d");

    $("#scaler").click(function () {

      var imageObject = new Image();
      imageObject.onload = function () {

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.scale(parseFloat(tilmap.scale), parseFloat(tilmap.scale));
        context.drawImage(imageObject, 0, 0);

      };
      imageObject.src = canvas.toDataURL();

    });
  }

}

function getBoundingBox() {
  tilmap.width = parseInt((tilmap.imgTILDiv.style.width).replace('px;', ''));
  tilmap.height = parseInt((tilmap.imgTILDiv.style.height).replace('px;', ''));

  boundingBox = {
    "width": tilmap.width,
    "height": tilmap.height
  };
  console.log("boundingBox", boundingBox);

  return boundingBox;
}

function fitInBox(initWidth, initHeight, maxWidth, maxHeight) {
  console.log("init w,h", initWidth, initHeight);

  // First pass
  widthScale = maxWidth / initWidth;
  heightScale = maxHeight / initHeight;
  scale = Math.min(widthScale, heightScale);

  new_width = parseInt(initWidth * scale);
  new_height = parseInt(initHeight * scale);
  console.log("new w,h", new_width, new_height);

  // Second pass
  let aspect = parseFloat(initWidth / initHeight);

  if (new_width > maxWidth) {
    new_width = maxWidth;
    new_height = Math.floor(initWidth / aspect);
    console.log("new_width > maxWidth !!");
    console.log("new w,h", new_width, new_height);
  }

  if (new_height > maxHeight) {
    new_height = maxHeight;
    new_width = Math.floor(initWidth * aspect);
    console.log("height > maxHeight !!");
    console.log("new w,h", new_width, new_height);
  }

  if (new_width > maxWidth || new_height > maxHeight) {
    scale = 1.0;
    new_width = initWidth;
    new_height = initHeight;
    console.log("still n/g :(");
    console.log("new w,h", new_width, new_height);
  }

  result = {
    "width": Math.ceil(new_width),
    "height": Math.ceil(new_height),
    "scale": scale
  };

  return result;
}

/**
 * Url value extraction
 */
getQueryVariable = function (variable, queryString) {
  var vars = queryString.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
};

isItemInArray = function (array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][0] === item[0] && array[i][1] === item[1]) {
      return true;
    }
  }
  return false;
};


// Starting parameters for Sliders
tilmap.parms = {
  greenRange: 100,
  redRange: 100,
  transparency: 20,
  threshold: 0
};

tilmap.zoom2loc = function () { // event listener pointing to zoom2loc's code
  document.getElementById('imgTILDiv').onclick = function (ev) {
    if (typeof (zoom2loc) == "undefined") {
      var s = document.createElement('script');
      s.src = "zoom2loc.js";
      s.onload = function () {
        zoom2loc(ev)
      };
      document.head.appendChild(s)
    } else {
      zoom2loc(ev)
    }
  };
  return tilmap.calcTILdiv
};

ui = function (feature_names) {

  // feature_names => HTML Elements
  if (feature_names.length >= 3) {
    // should be red, green, blue
    let x = document.getElementById('calcTILred');
    if (feature_names[0].toUpperCase() === 'TIL') {
      let head2 = 'TIL';
      x.innerText = head2;
      x = document.getElementById('redRangePlay');
      x.innerText = head2;
    } else {
      let head2 = feature_names[0];
      x.innerText = head2;
      x = document.getElementById('redRangePlay');
      x.innerText = head2;
    }

    x = document.getElementById('calcTILgreen');
    x.innerText = feature_names[1];

    x = document.getElementById('calcTILblue');
    x.innerText = feature_names[2];

    x = document.getElementById('greenRangePlay');
    x.innerText = feature_names[1];

  } else {
    alert('Error: Not enough data\nThere are only ' + feature_names.length() + ' columns.');
  }

};


createImage = function (sel) {

  const d = tilmap.data;
  const index = d.data.locations;
  const features = d.data.features;
  let names = Object.getOwnPropertyNames(features);

  // let num_cols = names.length; // number of columns

  let R, G, B;
  if (sel) {
    ui([names[sel[0]], names[sel[1]], names[sel[2]]]);
    R = features[names[sel[0]]];
    G = features[names[sel[1]]];
    B = features[names[sel[2]]];
  } else {
    ui(names);
    R = features[names[0]];
    G = features[names[1]];
    B = features[names[2]];
  }

  // create off-screen canvas element
  let canvas = document.getElementById("myCanvas");

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
  }

  // size and scale
  // Initialize
  tilmap.scale = 1.0;
  png_w = parseInt(d.metadata.png_w);
  png_h = parseInt(d.metadata.png_h);
  tilmap.width = png_w;
  tilmap.height = png_h;
  boundingBox = getBoundingBox();
  dim = fitInBox(png_w, png_h, boundingBox.width, boundingBox.height);

  tilmap.scale = dim.scale;
  tilmap.width = dim.width;
  tilmap.height = dim.height;

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

    // Color

    // First 3 features R G B
    imgData.data[pixelindex] = R[n];      // R value [0, 255]
    imgData.data[pixelindex + 1] = G[n];  // G value
    imgData.data[pixelindex + 2] = B[n];  // B value
    imgData.data[pixelindex + 3] = 255;   // set alpha channel


  }
  // console.log('imgData', imgData);
  ctx.putImageData(imgData, 0, 0); // we now have an image painted to the canvas

  return canvas;
};


/**
 * Calculate TIL, build dynamic interface.
 */
tilmap.calcTILfun = function () {

  // Show/hide buttons - Red Green Tissue Original
  hideRGBbuttons.onclick = function () {
    if (rgbButtons.hidden) {
      rgbButtons.hidden = false;
      hideRGBbuttons.textContent = 'RGB[-] ';
      hideRGBbuttons.style.color = "maroon"
    } else {
      rgbButtons.hidden = true;
      hideRGBbuttons.textContent = 'RGB[+] ';
      hideRGBbuttons.style.color = "blue"
    }
    tilmap.canvasAlign();
  };

  tilmap.zoom2loc();
  greenRange.value = tilmap.parms.greenRange;
  redRange.value = tilmap.parms.redRange;
  rangeSegmentBt.onclick = tilmap.segment;

  greenRangePlay.onclick = redRangePlay.onclick = function () {

    // make sure the other play is stopped
    if ((this.id === "greenRangePlay") & (redRangePlay.style.backgroundColor === "#dedede")) {
      redRangePlay.click()
    }
    if ((this.id === "redRangePlay") & (greenRangePlay.style.backgroundColor === "#dedede")) {
      greenRangePlay.click()
    }

    // range input for this button
    var range = document.getElementById(this.id.slice(0, -4));  // Ex: greenRangePlay -> greenRange
    if (this.style.backgroundColor === "silver") {
      this.style.backgroundColor = "#dedede";
      if (range.value === "") {
        range.value = tilmap.parms[range.id]
      }
      tilmap.parms.t = setInterval(function () {
        range.value = parseInt(range.value) + 5;
        if (parseInt(range.value) >= 100) {
          range.value = "0"
        }
        tilmap.parms[range.id] = range.value;
        range.onchange()
      }, 100)
    } else {
      clearInterval(tilmap.parms.t);
      this.style.backgroundColor = "silver"
    }
  };

  /**
   * CREATE IN-MEMORY IMAGE
   * And also write img DOM element
   */
  tilmap.imgTILDiv = document.getElementById('imgTILDiv');

  let canvas = createImage();
  tilmap.dataUri = canvas.toDataURL();
  tilmap.img = new Image();
  tilmap.img.src = tilmap.dataUri;
  tilmap.img.id = 'imgTIL';
  tilmap.img.width = tilmap.width;
  tilmap.img.height = tilmap.height;

  tilmap.imgTILDiv.appendChild(tilmap.img);

  tilmap.img.onload = function () {

    if (!document.getElementById('cvBase')) {
      tilmap.cvBase = document.createElement('canvas');

      tilmap.cvBase.hidden = true;
      tilmap.cvBase.width = tilmap.width;
      tilmap.cvBase.height = tilmap.height;
      tilmap.cvBase.id = "cvBase";
      tilmap.imgTILDiv.appendChild(tilmap.cvBase);
    }

    tileSize.textContent = `${tilmap.img.width}x${tilmap.img.height}`;
    tilmap.ctx = tilmap.cvBase.getContext('2d');


    if (tilmap.scale > 0 && tilmap.flag) {
      console.log('scaling', tilmap.scale);
      tilmap.ctx.scale(parseFloat(tilmap.scale), parseFloat(tilmap.scale));
    }

    // tilmap.ctx.drawImage(this, 0, 0);
    tilmap.ctx.drawImage(tilmap.img, 0, 0);
    tilmap.imgData = jmat.imread(tilmap.cvBase);

    /*
    const features = tilmap.data.data.features;
    let names = Object.getOwnPropertyNames(features);
    // let num_cols = names.length; // number of columns
    let R = features[names[0]];
    let G = features[names[1]];
    let B = features[names[2]];
     */

    // extract blue channel
    tilmap.imgDataB = tilmap.imSlice(2);

    // Convert the 255's from the blue channel to 1's and sum all the values.  This will be total tiles.
    // tilmap.imgDataB_count = tilmap.imgDataB.map(x => x.map(x => x / 255)).map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
    tilmap.imgDataB_count = tilmap.imgDataB.map(x => x.map(x => (x > 0))).map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);

    // Event listeners for buttons - Red Green Tissue Original
    calcTILred.onclick = function () {
      // tilmap.from2D(R);
      tilmap.from2D(tilmap.imSlice(0))
    };
    calcTILgreen.onclick = function () {
      // tilmap.from2D(G);
      tilmap.from2D(tilmap.imSlice(1))
    };
    calcTILblue.onclick = function () {
      // tilmap.from2D(B);
      tilmap.from2D(tilmap.imSlice(2))
    };
    /*
    calcTILblue.onclick = function () {
      let dd = tilmap.imSlice(2);
      // tilmap.from2D(dd) <-- this is the base function we are expanding here to represent extracted classifications
      tilmap.cvBase.hidden = false;
      tilmap.img.hidden = true;
      tilmap.cv2D = dd; // keeping current value 2D slice
      var cm = jmat.colormap();
      var k = 63 / 255; // png values are between 0-255 and cm 0-63
      // extract classifications
      // channel B storing 5 codes:
      // 255:[tissue, no cancer, no til]
      // 254:[tissue + cancer + no til]
      // 253:[tissue + no cancer + til]
      // 252:[tissue + cancer + til]
      // 0:[no tissue]
      var ddd = dd.map(function (d) {
        return d.map(function (v) {
          let rgba;
          switch (v) {
            case 255: // [tissue + cancer + no til]
              rgba = [192, 192, 192, 255];
              break;
            case 254: // [tissue + cancer + no til]
              rgba = [255, 255, 0, 255];
              break;
            case 253: // [tissue + no cancer + til]
              rgba = [255, 0, 0, 255];
              break;
            case 252: // [tissue + cancer + til]
              rgba = [255, 165, 0, 255];
              break;
            default:
              rgba = [0, 0, 0, 0] // notice transparency
              //rgba = cm[Math.round(v*k)].map(x=>Math.round(x*255)).concat(255)
          }
          return rgba
        })
      });
      jmat.imwrite(tilmap.cvBase, ddd)
    };
    */
    calcTIL0.onclick = function () {
      tilmap.img.hidden = false;
      tilmap.cvBase.hidden = true;
    };
    tilmap.cvBase.onclick = tilmap.img.onclick;

    // Event listener for both sliders - red and green
    greenRange.onchange = redRange.onchange = function () {

      document.getElementById(this.id + 'Val').innerHTML = this.value;

      tilmap.cvBase.hidden = false;
      tilmap.img.hidden = true;
      var cm = jmat.colormap();  //[[1, 0, 0], [1, 1, 0], [0, 0, 1]];
      // var k = parseInt(this.value) / 100 //slider value
      var cr = parseInt(greenRange.value) / 100;
      var tr = parseInt(redRange.value) / 100;
      tilmap.parms[this.id] = this.value;
      var ddd = tilmap.imgData.map(function (dd) {
        return dd.map(function (d) {
          // var r = k * d[0] / 255
          // var g = (1 - k) * d[1] / 255
          // return cm[Math.round((r + g) * 63)].map(x => Math.round(x * 255)).concat(d[2])
          return cm[Math.round((Math.max(d[1] * cr, d[0] * tr) / 255) * 63)].map(x => Math.round(x * 255)).concat(d[2])
        })
      });
      jmat.imwrite(tilmap.cvBase, ddd);
      tilmap.segment(event, false);
      //tilmap.segment;

    };

    // making sure clicking stops play and act as as onchange
    greenRange.onclick = function () {
      if (greenRangePlay.style.backgroundColor === "#dedede") {
        greenRangePlay.onclick()
      }
      greenRange.onchange()
    };

    redRange.onclick = function () {
      if (redRangePlay.style.backgroundColor === "#dedede") {
        redRangePlay.onclick()
      }
      redRange.onchange()
    };

    // if (!document.getElementById('cvTop')) {
    // calcTILblue.click(); // <-- classify first
    // }
    redRange.onchange();
    greenRange.onchange();

    if (!document.getElementById('cvTop')) {
      tilmap.cvTop = document.createElement('canvas');
      tilmap.cvTop.width = tilmap.width;
      tilmap.cvTop.height = tilmap.height;
      tilmap.cvTop.id = "cvTop";
      tilmap.imgTILDiv.appendChild(tilmap.cvTop);
      tilmap.cvTop.style.position = 'absolute';

    }
    tilmap.canvasAlign();
    //continueTool.style.backgroundColor = "yellow";
    //continueTool.style.color = "red";
    tilmap.segment()
  };
  document.getElementById('caMicrocopeIfr').src = `/caMicroscope/apps/viewer/viewer.html?slideId=${tilmap.slide}&mode=${tilmap.mode}`;
  segmentationRange.onchange = tilmap.segment; //rangeSegmentBt.onclick
  transparencyRange.onchange = tilmap.transpire;

  set_multiple_select();

};

/**
 * selectedOptions contains the index
 * @param selectedOptions
 */
changeUI = function (selectedOptions) {

  const features = tilmap.data.data.features;
  let names = Object.getOwnPropertyNames(features);
  document.getElementById('calcTILred').innerText = names[selectedOptions[0]];
  document.getElementById('redRangePlay').innerText = names[selectedOptions[0]];
  document.getElementById('calcTILgreen').innerText = names[selectedOptions[1]];
  document.getElementById('greenRangePlay').innerText = names[selectedOptions[1]];
  // download(tilmap.slide + '.png', createImage(selectedOptions));
  let canvas = createImage(selectedOptions);
  tilmap.dataUri = canvas.toDataURL();
  tilmap.img.src = tilmap.dataUri;
  tilmap.flag = false;

};

set_multiple_select = function () {

  const features = tilmap.data.data.features;
  let names = Object.getOwnPropertyNames(features);
  let num_cols = names.length; // number of columns

  if (num_cols > 5) {
    let sel = document.createElement('select');
    sel.multiple = true;
    sel.id = 'sel1';
    if (num_cols < 10) {
      sel.size = num_cols;
    } else {
      sel.size = 10;
    }

    for (let i = 0; i < num_cols; i++) {
      // Add the options
      sel.options[sel.options.length] = new Option(names[i], i);
    }

    // add the element to the div
    document.getElementById("choose").appendChild(sel);

    // add event listener
    let last_valid_selection = null;

    $('#sel1').change(function (event) {

      if ($(this).val().length > 3) {

        $(this).val(last_valid_selection);
        changeUI(last_valid_selection);

      } else {
        last_valid_selection = $(this).val();
      }
    });
  }

};

/**
 * Do colormap of 2D matrix of one channel.
 * Draw the resulting matrix on the base canvas.
 */
tilmap.from2D = function (dd) {
  tilmap.cvBase.hidden = false;
  tilmap.img.hidden = true;
  tilmap.cv2D = dd; // keeping current value 2D slice
  var cm = jmat.colormap();
  var k = 63 / 255; // png values are between 0-255 and cm 0-63
  var ddd = dd.map(function (d) {
    return d.map(function (v) {
      return cm[Math.round(v * k)].map(x => Math.round(x * 255)).concat(255)
    })
  });
  // tilmap.ctx.putImageData(jmat.data2imData(ddd), 0, 0)
  // jmat.imwrite(tilmap.img, ddd)
  jmat.imwrite(tilmap.cvBase, ddd)
};

/**
 * Replicate image data (a 2D matrix) with values from the ith channel.
 */
tilmap.imSlice = function (i) { // slice ith layer of imgData matrix
  i = i || 0;
  return tilmap.imgData.map(x => {
    return x.map(y => {
      return y[i]
    })
  })
};

/**
 * Draw yellow (or magenta) line around the edges of nuclear material.
 */
tilmap.segment = function (event, doTranspire = true) {
//tilmap.segment = function () {

  document.getElementById("segmentationRangeVal").innerHTML = segmentationRange.value;

  // generate mask
  var cr = parseInt(greenRange.value) / 100;
  var tr = parseInt(redRange.value) / 100;
  // var sv = 2.55 * parseInt(segmentationRange.value); // segmentation value

  var sv = segmentationRange.value; // segmentation value
  sv = 2.55 * parseInt((sv === '0') ? '1' : sv); //slider bug
  var sv1 = 2.55 * parseInt(segmentationRange.value);

  let countGreen = 0;
  let countRed = 0;
  tilmap.segMask = tilmap.imgData.map(dd => {
    return dd.map(d => {
      countGreen += (d[1] * cr >= sv) & (d[2] > 0); // use sv for count
      countRed += (d[0] * tr >= sv) & (d[2] > 0);
      return ((Math.max(d[1] * cr, d[0] * tr)) >= sv1) & (d[2] > 0); // use normal sv for mask
    })
  });
  greenTiles.textContent = `${countGreen} tiles, ${Math.round((countGreen / tilmap.imgDataB_count) * 10000) / 100}% of tissue`;
  redTiles.textContent = `${countRed} tiles, ${Math.round((countRed / tilmap.imgDataB_count) * 10000) / 100}% of tissue`;

  // find neighbors
  var n = tilmap.imgData.length;
  var m = tilmap.imgData[0].length;
  tilmap.segNeig = [...Array(n)].map(_ => {
    return [...Array(m)].map(_ => [0])
  });
  var dd = tilmap.segMask;
  for (var i = 1; i < (n - 1); i++) {
    for (var j = 1; j < (m - 1); j++) {
      tilmap.segNeig[i][j] = [dd[i - 1][j - 1], dd[i - 1][j], dd[i - 1][j + 1], dd[i][j - 1], dd[i][j], dd[i][j + 1], dd[i + 1][j - 1], dd[i + 1][j], dd[i + 1][j + 1]]
    }
  }

  // find edges
  tilmap.segEdge = tilmap.segNeig.map(dd => {
    return dd.map(d => {
      var s = d.reduce((a, b) => a + b);
      return (s > 3 & s < 7)
      // return d.reduce((a, b) => Math.max(a, b)) != d.reduce((a, b) => Math.min(a, b))
    })
  });

  // background suppression
  if (doTranspire) {
    tilmap.transpire();
  }

  tilmap.parms.threshold = segmentationRange.value;
  let countBackTiles = tilmap.segMask.map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
  backTiles.textContent = `${countBackTiles} tiles, ${Math.round((countBackTiles / tilmap.imgDataB_count) * 10000) / 100}% of tissue `;
  tilmap.canvasAlign() // making sure it doesn't lose alignment
};

/**
 * Calculate transparency
 */
tilmap.transpire = function () {

  document.getElementById("transparencyRangeVal").innerHTML = transparencyRange.value;
  var tp = Math.round(2.55 * parseInt(transparencyRange.value)); // range value
  // var clrEdge = [255, 255, 0, 255 - tp] // yellow
  var clrEdge = [255, 0, 144, 255 - tp]; // magenta
  var clrMask = [255, 255, 255, tp];

  jmat.imwrite(tilmap.cvTop, tilmap.segEdge.map((dd, i) => {
    return dd.map((d, j) => {
      var c = [0, 0, 0, 0];
      if (d) {
        c = clrEdge
      } else if (!tilmap.segMask[i][j]) {
        c = clrMask
      }
      return c
      // return [255, 255, 255, 255].map(v => v * d) // white
    })
  }));

  tilmap.parms.transparency = transparencyRange.value

};

window.addEventListener('resize', () => {
  tilmap.canvasAlign()
});

window.addEventListener('scroll', () => {
  tilmap.canvasAlign()
});

/**
 * Make sure both canvases stay aligned with each other.
 */
tilmap.canvasAlign = function () {

  let a = document.getElementById('cvTop');
  let b = document.getElementById('cvBase');

  if (typeof a !== 'undefined' && a !== null) {

    if (typeof b !== 'undefined' && b !== null) {
      a.style.top = b.getBoundingClientRect().top;
      a.style.left = b.getBoundingClientRect().left;
      // correction if needed
      a.style.top = parseFloat(a.style.top) + b.getBoundingClientRect().top - a.getBoundingClientRect().top;
    }
  }

};

/*
continueTool.onclick = function () {
  tilmap.div.hidden = false;
  tilmap.homeDiv.hidden = true;
  setTimeout(tilmap.canvasAlign, 100)
};
*/

/**
 * Check file creation
 *
 * @param filename
 * @param dataURL
 */
function download(filename, dataURL) {
  var element = document.createElement('a');
  element.setAttribute('href', dataURL);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

window.onload = tilmap;
