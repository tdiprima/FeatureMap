/**
 * Parses querystring for parameters.
 * Transforms CSV to image.
 * Displays image to user.
 */
tilmap = function () {
  $('[data-toggle="tooltip"]').tooltip();

  tilmap.myBrowser = getBrowser(); // global variable for which browser we've got

  // blue-red colormap
  tilmap.colormap = util.colormap();

  var queryString = location.search;
  if (queryString.length > 1) {

    let str = location.search.slice(1);

    var r = getQueryVariable('r', str);
    var g = getQueryVariable('g', str);
    if (r !== undefined) {
      tilmap.parms.redRange = parseInt(r);
    }
    if (g !== undefined) {
      tilmap.parms.greenRange = parseInt(g);
    }

    tilmap.map = getQueryVariable('map', str); // json
    if (tilmap.map.endsWith("csv")) {
      alert('Expecting JSON file, got CSV.\nQuitting.');
      throw new Error('file error');
    }
    tilmap.slide = getQueryVariable('slideId', str); // drupal node of slide
    tilmap.mode = getQueryVariable('mode', str); // camic toggle switch
    tilmap.flag = true;
    navigation();

    promiseA = fetch_data(tilmap.map);
    promiseA.then(function (result) {
      if (result === null) {
        console.log('Abort.')
      } else {
        try {
          tilmap.data = JSON.parse(result);
          tilmap.calcTILfun()
        } catch (error) {
          // already alerted
        }
      }
    });

  } else {
    alert('Expecting parameters: mode, slideId, and map');
  }

};

// Starting parameters for Sliders
tilmap.parms = {
  greenRange: 100,
  redRange: 100,
  threshold: 0,
  transparency: 0
};

function navigation() {
  let dropdown = $('#navigation-dropdown');
  dropdown.empty();
  const loc = window.location;
  const len = loc.origin.length;
  // POPULATE DROPDOWN WITH LIST OF SLIDES
  const url1 = '/node/' + tilmap.slide + '?_format=json'; // GET SLIDE INFO TO GET COLLECTION
  $.getJSON(url1, function (data) {
    let collection = data.field_collection[0].target_id;
    const url2 = '/listofimages/' + collection + '?_format=json'; // GET COLLECTION TO GET LIST OF IMAGES
    $.getJSON(url2, function (data) {
      $.each(data, function (key, entry) {
        let nid = entry.nid[0].value;
        let name;
        //console.log('entry', entry);
        try {
          if (entry.field_iip_path[0]) {
            let arr = entry.field_iip_path[0].value.split("/");
            let x = arr.length;
            name = arr[x - 1]; // LAST PIECE OF STRING IS NAME
            if (name.length > 23) {
              name = name.substring(0, 23);
            }
          } else {
            if (entry.title) {
              name = entry.title[0].value;
            } else {
              name = entry.imageid[0].value;
            }
          }
        } catch (error) {
          console.error(error);
        }
        const url3 = '/maps/' + nid + '?_format=json'; // GET MAP TO GET FILE URI
        $.getJSON(url3, function (data) {
          let map;
          let type;
          try {
            if (data[0]) {
              map = data[0].field_map[0].url;
              map = map.substring(len);
            }
          } catch (e1) {
            console.error('e1', e1)
          }
          let constructaurl;
          if (map) {
            constructaurl = '/FeatureMap/?mode=pathdb&slideId=' + nid + '&map=' + map + '&r=' + tilmap.parms.redRange + '&g=' + tilmap.parms.greenRange;
          } else {
            constructaurl = '';
            name = ("None: " + name);
          }
          if (parseInt(tilmap.slide) === nid) {
            dropdown.append($('<option></option>').attr('value', constructaurl).text(name).prop('selected', true));

          } else {
            dropdown.append($('<option></option>').attr('value', constructaurl).text(name));
          }
        });
      });
    });
  });
}

fetch_data = function (url) {

  return fetch(url).then(function (response) {
    console.log('url', url);
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
  return boundingBox;
}

function fitInBox(initWidth, initHeight, maxWidth, maxHeight) {

  // First pass
  widthScale = maxWidth / initWidth;
  heightScale = maxHeight / initHeight;
  scale = Math.min(widthScale, heightScale);

  new_width = parseInt(initWidth * scale);
  new_height = parseInt(initHeight * scale);

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

document.getElementById('imgTILDiv').onclick = function (event) {
  zoom2loc(event);
};

ui = function (feature_names) {
  // feature_names => HTML Elements
  if (feature_names.length >= 3) {
    // should be red, green, blue
    let redBtn = document.getElementById('calcTILred');
    let what = (feature_names[0].toUpperCase() === 'TIL') ? 'TIL' : feature_names[0];
    redBtn.innerText = what;
    document.getElementById('redRangePlay').innerText = what;

    let greenBtn = document.getElementById('calcTILgreen');
    greenBtn.innerText = feature_names[1];
    document.getElementById('greenRangePlay').innerText = feature_names[1];

    let blueBtn = document.getElementById('calcTILblue');
    blueBtn.innerText = feature_names[2];
  } else {
    alert('Error: Not enough data\nThere are only ' + feature_names.length() + ' columns.');
  }
};


createImage = function (sel) {
  const d = tilmap.data;
  const index = d.data.locations;
  const features = d.data.features;
  let names = Object.getOwnPropertyNames(features);

  let R, G, B;
  if (sel) {
    ui([names[sel[0]], names[sel[1]], names[2]]);
    R = features[names[sel[0]]];
    G = features[names[sel[1]]];
    B = features[names[2]];
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

  greenRange.value = tilmap.parms.greenRange;
  redRange.value = tilmap.parms.redRange;

  // PLAY
  greenRangePlay.onclick = redRangePlay.onclick = function () {
    // make sure the other play is stopped
    if ((this.id === "greenRangePlay") & (redRangePlay.style.backgroundColor === "rgb(222, 222, 222)")) {
      redRangePlay.click()
    }
    if ((this.id === "redRangePlay") & (greenRangePlay.style.backgroundColor === "rgb(222, 222, 222)")) {
      greenRangePlay.click()
    }
    var range = document.getElementById(this.id.slice(0, -4));  // range input for this button
    if (this.style.backgroundColor === "rgb(192, 192, 192)") {
      this.style.backgroundColor = "rgb(222, 222, 222)";
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
      this.style.backgroundColor = "rgb(192, 192, 192)"
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

    tileSize.textContent = `${tilmap.data.metadata.png_w}x${tilmap.data.metadata.png_h}`;
    tilmap.ctx = tilmap.cvBase.getContext('2d');

    if (tilmap.scale > 0 && tilmap.flag) {
      tilmap.ctx.scale(parseFloat(tilmap.scale), parseFloat(tilmap.scale));
    }

    tilmap.ctx.drawImage(tilmap.img, 0, 0);
    tilmap.imgData = util.imread(tilmap.cvBase);

    tilmap.imgDataR = tilmap.imSlice(0);
    tilmap.imgDataG = tilmap.imSlice(1);
    tilmap.imgDataB = tilmap.imSlice(2);

    tilmap.imgDataB_count = tilmap.imgDataB.map(x => x.map(x => (x > 0))).map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);

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

    // Event listener for both sliders
    greenRange.onchange = redRange.onchange = function () {

      // redRangeVal, greenRangeVal
      document.getElementById(this.id + 'Val').innerHTML = this.value;

      tilmap.cvBase.hidden = false;
      tilmap.img.hidden = true;
      var cm = tilmap.colormap;
      var cr = parseInt(greenRange.value) / 100;
      var tr = parseInt(redRange.value) / 100;
      tilmap.parms[this.id] = parseInt(this.value);
      // Normalize original image to colormap
      var ddd = tilmap.imgData.map(function (dd) { // 2d array
        return dd.map(function (d) { // pixel
          // we take either R or G because in the end, the value gets mapped to hot or cold
          return cm[Math.round((Math.max(d[1] * cr, d[0] * tr) / 255) * 63)].map(x => Math.round(x * 255)).concat(d[2]);
        });
      });
      util.imwrite(tilmap.cvBase, ddd);
      tilmap.segment(event, false);
    };

    // PLAY 2
    // making sure clicking stops play and act as as onchange
    greenRange.onclick = function () {
      if (greenRangePlay.style.backgroundColor === "rgb(222, 222, 222)") {
        greenRangePlay.onclick()
      }
      greenRange.onchange()
    };

    redRange.onclick = function () {
      if (redRangePlay.style.backgroundColor === "rgb(222, 222, 222)") {
        redRangePlay.onclick()
      }
      redRange.onchange()
    };

    redRange.onchange();
    greenRange.onchange();

    if (!document.getElementById('cvTop')) {
      tilmap.cvTop = document.createElement('canvas');
      tilmap.cvTop.width = tilmap.width;
      tilmap.cvTop.height = tilmap.height;
      tilmap.cvTop.id = "cvTop";
      tilmap.imgTILDiv.appendChild(tilmap.cvTop);
      tilmap.cvTop.style.position = 'absolute';
      //zoo(tilmap.cvTop);
    }
    tilmap.canvasAlign();
    tilmap.segment()
  };
  document.getElementById('caMicrocopeIfr').src = `/caMicroscope/apps/viewer/viewer.html?slideId=${tilmap.slide}&mode=${tilmap.mode}`;

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
    // Hide indication that blue is tissue
    document.getElementById("blue_is_tissue").innerHTML = '';

    // Hide toggle
    document.getElementById('toggle').style.display = 'none';

    // Create feature select box
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

    var textnode = document.createTextNode("Ctrl-click to select 2 features, ctrl-click 3rd feature to display selection.");
    // add the element to the div
    let myDiv = document.getElementById("choose");
    myDiv.appendChild(sel);
    let br = document.createElement("br");
    myDiv.appendChild(br);
    myDiv.appendChild(br);
    myDiv.appendChild(textnode);

    // add event listener
    let last_valid_selection = null;

    $('#sel1').change(function (event) {
      if ($(this).val().length > 2) {
        $(this).val(last_valid_selection);
        changeUI(last_valid_selection);
      } else {
        last_valid_selection = $(this).val();
      }
    });
  } else {
    // TOGGLE
    var t = document.getElementById('toggle');
    t.addEventListener('click', function (e) {
      t.value = (t.value == "on") ? "off" : "on"
      if (t.value == "on") {
        tilmap.parms.threshold = 50; // toggle isn't a simple matter of turning on or off, but we're gonna attempt to do it anyway
        tilmap.parms.transparency = 78;
        tilmap.segment(e, true);
      } else {
        tilmap.parms.threshold = 0;
        tilmap.parms.transparency = 0;
        tilmap.segment(e, true);
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
  var cm = tilmap.colormap;
  var k = 63 / 255; // png values are between 0-255. there are 64 color map values (0-63).
  var ddd = dd.map(function (d) {
    return d.map(function (v) {
      return cm[Math.round(v * k)].map(x => Math.round(x * 255)).concat(255)
    })
  });
  util.imwrite(tilmap.cvBase, ddd)
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
 * Draw line around the edges of nuclear material.
 */
tilmap.segment = function (event, doTranspire = false) {
  // generate mask
  var cr = parseInt(greenRange.value) / 100;
  var tr = parseInt(redRange.value) / 100;

  var sv = tilmap.parms.threshold.toString(); // segmentation threshold
  sv = 2.55 * parseInt((sv === '0') ? '1' : sv); // slider bug
  var sv1 = 2.55 * tilmap.parms.threshold;

  let countGreen = 0;
  let countRed = 0;
  tilmap.segMask = tilmap.imgData.map(dd => {
    return dd.map(d => {
      countGreen += (d[1] * cr >= sv) & (d[2] > 0); // use sv for count
      countRed += (d[0] * tr >= sv) & (d[2] > 0);
      return ((Math.max(d[1] * cr, d[0] * tr)) >= sv1) & (d[2] > 0); // use normal sv for mask
    })
  });
  greenTiles.textContent = `${countGreen} tiles`;
  redTiles.textContent = `${countRed} tiles`;

  var row = tilmap.imgData.length;
  var col = tilmap.imgData[0].length;
  // Make copy of array, but substitute [ 0 ] for EACH ELEMENT
  tilmap.segNeig = [...Array(row)].map(_ => {
    return [...Array(col)].map(_ => [0])
  });

  // Get neighbors
  var dd = tilmap.segMask;
  // Skip borders of rectangle.
  for (var i = 1; i < (row - 1); i++) {
    for (var j = 1; j < (col - 1); j++) {
      // Unpack the corresponding mask-neighbors into this pixel.
      tilmap.segNeig[i][j] = [
        dd[i - 1][j - 1],
        dd[i - 1][j],
        dd[i - 1][j + 1],
        dd[i][j - 1],
        dd[i][j],
        dd[i][j + 1],
        dd[i + 1][j - 1],
        dd[i + 1][j],
        dd[i + 1][j + 1]
      ]
    }
  }

  // find edges
  tilmap.segEdge = tilmap.segNeig.map(dd => {
    return dd.map(d => {
      var s = d.reduce((a, b) => a + b);
      return (s > 3 & s < 7);
    })
  });

  if (doTranspire) {
    tilmap.transpire();
  }
  let countBackTiles = tilmap.segMask.map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
  backTiles.textContent = `${countBackTiles} total tiles`;
  tilmap.canvasAlign()
};

/**
 * Calculate transparency
 */
tilmap.transpire = function () {
  var tr = tilmap.parms.transparency;
  var tp = Math.round(2.55 * tr); // range value
  var clrEdge = [255, 0, 144, 255 - tp]; // magenta
  var clrMask = [255, 255, 255, tp];
  util.imwrite(tilmap.cvTop, tilmap.segEdge.map((dd, i) => {
    return dd.map((d, j) => {
      var c = [0, 0, 0, 0];
      if (d) {
        // c = clrEdge
        c = clrMask
      } else if (!tilmap.segMask[i][j]) {
        c = clrMask
      }
      return c
    })
  }));

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

/**
 * Check file creation
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
