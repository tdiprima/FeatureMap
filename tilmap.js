console.log('tilmap.js loaded');

/**
 * Parses querystring for parameters.
 * Transforms CSV to image.
 * Displays image to user.
 */
tilmap = function () {

  var queryString = location.search;
  if (queryString.length > 1) {

    let str = location.search.slice(1);
    tilmap.map = tilmap.getQueryVariable('map', str); // csv
    tilmap.slide = tilmap.getQueryVariable('slideId', str); // drupal node of slide
    tilmap.mode = tilmap.getQueryVariable('mode', str); // camic toggle switch

    promiseA = pathdb_util.getDataForImage(tilmap.map);
    promiseA.then(function (result) {
      if (result === null) {
        console.log('Abort.')
      } else {
        tilmap.dataUri = result;
        tilmap.calcTILfun()
      }
    });

  } else {
    alert('Expecting parameters: mode, slideId, and map');
  }

};

/**
 * Url value extraction
 */
tilmap.getQueryVariable = function (variable, queryString) {
  var vars = queryString.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
};

tilmap.isItemInArray = function (array, item) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][0] == item[0] && array[i][1] == item[1]) {
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

/**
 * Calculate TIL, build dynamic interface.
 */
tilmap.calcTILfun = function () {

  // Show/hide buttons - TIL green Tissue Original
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
  tilmap.img = new Image();
  tilmap.img.src = tilmap.dataUri;
  tilmap.img.id = 'imgTIL';
  tilmap.img.width = pathdb_util.imgWidth;
  tilmap.img.height = pathdb_util.imgHeight;
  tilmap.imgTILDiv = document.getElementById('imgTILDiv');
  tilmap.imgTILDiv.appendChild(tilmap.img);

  tilmap.img.onload = function () {

    tilmap.cvBase = document.createElement('canvas');
    tilmap.cvBase.hidden = true;

    tilmap.cvBase.width = pathdb_util.imgWidth;
    tilmap.cvBase.height = pathdb_util.imgHeight;

    tileSize.textContent = `${tilmap.img.width}x${tilmap.img.height}`;
    tilmap.cvBase.id = "cvBase";
    tilmap.imgTILDiv.appendChild(tilmap.cvBase);
    tilmap.ctx = tilmap.cvBase.getContext('2d');
    tilmap.ctx.drawImage(this, 0, 0);
    tilmap.imgData = jmat.imread(tilmap.cvBase);

    // extract blue channel
    tilmap.imgDataB = tilmap.imSlice(2);

    // Convert the 255's from the blue channel to 1's and sum all the values.  This will be total tiles.
    tilmap.imgDataB_count = tilmap.imgDataB.map(x => x.map(x => x / 255)).map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);

    // Event listeners for buttons - TIL green Tissue Original
    calcTILred.onclick = function () {
      tilmap.from2D(tilmap.imSlice(0))
    };
    calcTILgreen.onclick = function () {
      tilmap.from2D(tilmap.imSlice(1))
    };
    calcTILblue.onclick = function () {
      tilmap.from2D(tilmap.imSlice(2))
    };
    calcTIL0.onclick = function () {
      tilmap.img.hidden = false;
      tilmap.cvBase.hidden = true;
    };
    tilmap.cvBase.onclick = tilmap.img.onclick;

    // Event listener for both sliders - green and TIL
    greenRange.onchange = redRange.onchange = function () {

      document.getElementById(this.id + 'Val').innerHTML = this.value;

      tilmap.cvBase.hidden = false;
      tilmap.img.hidden = true;
      var cm = jmat.colormap();
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

    greenRange.onchange();
    redRange.onchange();

    tilmap.cvTop = document.createElement('canvas');
    tilmap.cvTop.width = tilmap.img.width;
    tilmap.cvTop.height = tilmap.img.height;
    tilmap.cvTop.id = "cvTop";
    tilmap.imgTILDiv.appendChild(tilmap.cvTop);
    tilmap.cvTop.style.position = 'absolute';
    tilmap.canvasAlign();
    tilmap.segment()
  };
  document.getElementById('caMicrocopeIfr').src = `/caMicroscope/apps/viewer/viewer.html?slideId=${tilmap.slide}&mode=${tilmap.mode}`;
  segmentationRange.onchange = tilmap.segment; //rangeSegmentBt.onclick
  transparencyRange.onchange = tilmap.transpire;

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
  // var k = parseInt(greenRange.value) / 100 // range value
  var cr = parseInt(greenRange.value) / 100;
  var tr = parseInt(redRange.value) / 100;
  var sv = segmentationRange.value;
  sv = 2.55 * parseInt((sv === '0') ? '1' : sv);
  var sv1 = 2.55 * parseInt(segmentationRange.value);


  let countGreen = 0;
  let countRed = 0;

  tilmap.segMask = tilmap.imgData.map(dd => {
    return dd.map(d => {
      // return (d[0] * (k) + d[1] * (1 - k)) > sv
      // return (d[0] * (k) + d[1] * (1 - k)) >= sv
      countGreen += (d[1] * cr >= sv) & (d[2] == 255);
      countRed += (d[0] * tr >= sv) & (d[2] == 255);
      return ((Math.max(d[1] * cr, d[0] * tr)) >= sv1) & (d[2] == 255);
      // return cm[Math.round((Math.max(d[1] * cr, d[0] * tr) / 255) * 63)].map(x => Math.round(x * 255)).concat(d[2])
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

window.onload = tilmap;
