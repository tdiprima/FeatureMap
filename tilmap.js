/**
 * Parses querystring for parameters.
 * Transforms CSV to image.
 * Displays image to user.
 */
tilmap = function () {
  $('[data-toggle="tooltip"]').tooltip();

  tilmap.myBrowser = getBrowser(); // global variable for which browser we've got

  // blue-red colormap, 'default' in statistical computing env (Matlab)
  tilmap.colormap = jmat.colormap();
  // *** if we want different one, then generate or borrow the new array, under a new switch "case" in jmat.colormap() ***

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
    navigation();

    promiseA = fetch_data(tilmap.map);
    promiseA.then(function (result) {
      if (result === null) {
        console.log('Abort.')
      } else {
        try {
          tilmap.data = JSON.parse(result);
          // tilmap.dataUri = result;
          // download(tilmap.slide + '.png', result);
          tilmap.calcTILfun()
        } catch (error) {
          // If you failed here, it's 404, and you were already notified.
          console.log();
        }
      }
    });

  } else {
    alert('Expecting parameters: mode, slideId, and map');
  }

};

function navigation() {
  let dropdown = $('#navigation-dropdown');
  dropdown.empty();
  //dropdown.append('<option selected="true" disabled>Choose Slide</option>');
  //dropdown.prop('selectedIndex', 0);
  const loc = window.location;
  const len = loc.origin.length;
  // POPULATE DROPDOWN WITH LIST OF SLIDES
  const url1 = '/node/' + tilmap.slide + '?_format=json'; // GET SLIDE INFO TO GET COLLECTION
  // console.log('url1', url1);
  $.getJSON(url1, function (data) {
    // console.log('1.', data);
    let collection = data.field_collection[0].target_id;
    const url2 = '/listofimages/' + collection + '?_format=json'; // GET COLLECTION TO GET LIST OF IMAGES
    // console.log('url2', url2);
    $.getJSON(url2, function (data) {
      // console.log('2.', data);
      $.each(data, function (key, entry) {
        let nid = entry.nid[0].value;
        // let name = entry.imageid[0].value;
        let arr = entry.field_iip_path[0].value.split("/");
        let x = arr.length;
        let name = arr[x - 1]; // LAST PIECE OF STRING IS NAME
        if (name.length > 23) {
          name = name.substring(0, 23);
        }
        // console.log('name', name);
        const url3 = '/maps/' + nid + '?_format=json'; // GET MAP TO GET FILE URI
        // console.log('url3', url3);
        $.getJSON(url3, function (data) { // TODO:
          // console.log('3.', data);
          let map;
          let type;
          try {
            map = data[0].field_map[0].url;
            map = map.substring(len);
            /*
            type = data[0].field_map_type[0].value; // TODO: We're not getting into this loop. Fix!
            if (type.length > 5) {
              type = type.substring(0, 5)
            }
            name = (type + ' ' + name);
             */
            // console.log('map', map);
          } catch (e1) {
            // console.log('no map for this image', name);
          }
          let constructaurl;
          if (map) {
            constructaurl = '/FeatureMap/?mode=pathdb&slideId=' + nid + '&map=' + map;
          } else {
            constructaurl = '';
            name = ("None: " + name);
          }
          // name = name.toUpperCase();

          if (parseInt(tilmap.slide) === nid) {
            dropdown.append($('<option></option>').attr('value', constructaurl).text(name).prop('selected', true));

          } else {
            dropdown.append($('<option></option>').attr('value', constructaurl).text(name));
          }
        });
      });
    });
  });

  /*
  let selectedOption = $('#navigation-dropdown option:selected');
  if (selectedOption.prev().val()) {
    console.log(selectedOption.prev().val());
    $('#btnPrev').attr("disabled", false);
  } else {
    console.log(selectedOption.prev().val());
    $('#btnPrev').attr("disabled", true);
  }
  if (selectedOption.next().val()) {
    console.log(selectedOption.next().val());
    $('#btnNext').attr("disabled", false);
  } else {
    console.log(selectedOption.next().val());
    $('#btnNext').attr("disabled", true);
  }
   */

  /*
  $("#btnNext").click(function () {
    var isLastElementSelected = $('#navigation-dropdown > option:selected').index() == $('#navigation-dropdown > option').length - 1;

    if (!isLastElementSelected) {
      $('#navigation-dropdown > option:selected').removeAttr('selected').btnNext('option').attr('selected', 'selected');
    } else {
      $('#navigation-dropdown > option:selected').removeAttr('selected');
      $('#navigation-dropdown > option').first().attr('selected', 'selected');
    }
  });

  $("#btnPrev").click(function () {
    var isFirstElementSelected = $('#navigation-dropdown > option:selected').index() == 0;

    if (!isFirstElementSelected) {
      $('#navigation-dropdown > option:selected').removeAttr('selected').btnPrev('option').attr('selected', 'selected');
    } else {
      $('#navigation-dropdown > option:selected').removeAttr('selected');
      $('#navigation-dropdown > option').last().attr('selected', 'selected');
    }

  });
   */

}


fetch_data = function (url) {

  return fetch(url).then(function (response) {
    console.log('url', url);
    // console.log('response', response);

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
  // console.log("boundingBox", boundingBox);

  return boundingBox;
}

function fitInBox(initWidth, initHeight, maxWidth, maxHeight) {
  // console.log("init w,h", initWidth, initHeight);

  // First pass
  widthScale = maxWidth / initWidth;
  heightScale = maxHeight / initHeight;
  scale = Math.min(widthScale, heightScale);

  new_width = parseInt(initWidth * scale);
  new_height = parseInt(initHeight * scale);
  // console.log("new w,h", new_width, new_height);

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
  threshold: 0,
  transparency: 100
  //   transparency: 20
};

document.getElementById('imgTILDiv').onclick = function (event) {
  // console.log('event.target', event.target)
  zoom2loc(event);
};

ui = function (feature_names) {

  // feature_names => HTML Elements
  if (feature_names.length >= 3) {
    // should be red, green, blue
    let redBtn = document.getElementById('calcTILred');
    let what = (feature_names[0].toUpperCase() === 'TIL') ? 'TIL' : feature_names[0];
    redBtn.innerText = what;
    // TOOLTIPS DON'T WORK IF YOU'RE GONNA SET THE TITLE DYNAMICALLY
    // redBtn.title = "Showing " + what + " vs. " + what;
    // document.getElementById('redTiles').title = "total tissue area and percent tissue area classified as " + what;
    document.getElementById('redRangePlay').innerText = what;

    let greenBtn = document.getElementById('calcTILgreen');
    greenBtn.innerText = feature_names[1];
    // greenBtn.title = "Showing " + feature_names[1] + " vs. " + feature_names[1];
    // document.getElementById('greenTiles').title = "total tissue area and percent tissue area classified as " + feature_names[1];
    document.getElementById('greenRangePlay').innerText = feature_names[1];

    // TODO: not background anymore
    let blueBtn = document.getElementById('calcTILblue');
    blueBtn.innerText = feature_names[2];
    // blueBtn.title = "Showing " + feature_names[2] + " vs. " + feature_names[2];
    // document.getElementById('backTiles').title = "total tissue area and percent tissue area classified as " + feature_names[2];

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
    // ui([names[sel[0]], names[sel[1]], names[sel[2]]]);
    ui([names[sel[0]], names[sel[1]], names[2]]);
    R = features[names[sel[0]]];
    G = features[names[sel[1]]];
    // B = features[names[sel[2]]];
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

  // tilmap.zoom2loc(event);
  greenRange.value = tilmap.parms.greenRange;
  redRange.value = tilmap.parms.redRange;
  // rangeSegmentBt.onclick = tilmap.segment;

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
  // window.addEventListener('mousewheel', (e)=>console.info(e))

  tilmap.img.onload = function () {

    if (!document.getElementById('cvBase')) {
      tilmap.cvBase = document.createElement('canvas');

      tilmap.cvBase.hidden = true;
      tilmap.cvBase.width = tilmap.width;
      tilmap.cvBase.height = tilmap.height;
      tilmap.cvBase.id = "cvBase";
      tilmap.imgTILDiv.appendChild(tilmap.cvBase);
    }

    // tileSize.textContent = `${tilmap.img.width}x${tilmap.img.height}`;
    tileSize.textContent = `${tilmap.data.metadata.png_w}x${tilmap.data.metadata.png_h}`;
    tilmap.ctx = tilmap.cvBase.getContext('2d');


    if (tilmap.scale > 0 && tilmap.flag) {
      // console.log('scaling', tilmap.scale);
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

    tilmap.imgDataR = tilmap.imSlice(0);
    // console.log('Red channel zeroes?', tilmap.imgDataR.every(item => item === 0));
    tilmap.imgDataG = tilmap.imSlice(1);
    // console.log('Green channel zeroes?', tilmap.imgDataG.every(item => item === 0));
    // extract blue channel
    tilmap.imgDataB = tilmap.imSlice(2);
    // console.log('Blue channel zeroes?', tilmap.imgDataB.every(item => item === 0));

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

    // Event listener for both sliders
    greenRange.onchange = redRange.onchange = function () {

      // redRangeVal, greenRangeVal
      document.getElementById(this.id + 'Val').innerHTML = this.value; // TODO: tag type (%)?

      tilmap.cvBase.hidden = false;
      tilmap.img.hidden = true;
      var cm = tilmap.colormap;
      // var k = parseInt(this.value) / 100 //slider value
      var cr = parseInt(greenRange.value) / 100;
      var tr = parseInt(redRange.value) / 100;
      tilmap.parms[this.id] = this.value;
      var ddd = tilmap.imgData.map(function (dd) {
        return dd.map(function (d) {
          // If it's a variant of black, it's b/g. If it's gray (shouldn't happen), it's b/g. Return white b/g.
          if ((d[0] == 0 && d[2] == 0 && (d[1] > 0 && d[1] < 10)) || (d[0] == d[1] && d[0] == d[2])) {
            return [255, 255, 255, 1];
          }
          else {
            var wat = cm[Math.round(Math.max(d[1] * cr, d[0] * tr) / 255 * 63)].map(function (x) {
              return Math.round(x * 255);
            });
            var len = d.length;
            var alpha = d[len - 1];
            if (alpha === 255 || alpha === 1) {
              return wat.concat(255);
            }
            else {
              return wat.concat(0);
            }

          }
        });
      });
      jmat.imwrite(tilmap.cvBase, ddd);
      tilmap.segment(event, false);
      // tilmap.segment;
      // debugger

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
      //zoo(tilmap.cvTop);

    }
    tilmap.canvasAlign();
    //continueTool.style.backgroundColor = "yellow";
    //continueTool.style.color = "red";
    tilmap.segment()
  };
  document.getElementById('caMicrocopeIfr').src = `/caMicroscope/apps/viewer/viewer.html?slideId=${tilmap.slide}&mode=${tilmap.mode}`;
  // segmentationRange.onchange = tilmap.segment; //rangeSegmentBt.onclick
  //transparencyRange.onchange = tilmap.transpire;

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
  // document.getElementById('calcTILblue').innerText = names[selectedOptions[2]];
  //document.getElementById('TBA').innerText = names[selectedOptions[2]];
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
    document.getElementById("blue_is_tissue").innerHTML = '';
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

    // var textnode = document.createTextNode("Ctrl-click to select 3 features, ctrl-click 4th feature to display selection.");
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

      // if ($(this).val().length > 3) {
      if ($(this).val().length > 2) {
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
  var cm = tilmap.colormap;
  var k = 63 / 255; // png values are between 0-255. there are 64 color map values (0-63).
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

  // document.getElementById("segmentationRangeVal").innerHTML = segmentationRange.value;

  // generate mask
  var cr = parseInt(greenRange.value) / 100;
  var tr = parseInt(redRange.value) / 100;
  // var sv = 2.55 * parseInt(segmentationRange.value); // segmentation value

  var sv = "0"; //segmentationRange.value; // segmentation value
  // console.log(cr, tr, sv);
  sv = 2.55 * parseInt((sv === '0') ? '1' : sv); //slider bug
  // console.log("sv", sv);
  var sv1 = 2.55 * 0; //parseInt(segmentationRange.value);
  // console.log("sv1", sv1);

  let countGreen = 0;
  let countRed = 0;
  tilmap.segMask = tilmap.imgData.map(dd => {
    return dd.map(d => {
      countGreen += (d[1] * cr >= sv) & (d[2] > 0); // use sv for count
      countRed += (d[0] * tr >= sv) & (d[2] > 0);
      return ((Math.max(d[1] * cr, d[0] * tr)) >= sv1) & (d[2] > 0); // use normal sv for mask
    })
  });
  /*
  Tile size is equal for both TILs and tumor after registration of the sizes of tiles during the overlay.
  Even if the original grid would differ between tumor and TIL, it would be matched in a similarly gridded tiled.
  */
  greenTiles.textContent = `${countGreen} tiles`; //, ${Math.round((countGreen / tilmap.imgDataB_count) * 10000) / 100}% of tissue`;
  redTiles.textContent = `${countRed} tiles`; //, ${Math.round((countRed / tilmap.imgDataB_count) * 10000) / 100}% of tissue`;

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
/*
  // background suppression
  if (doTranspire) {
    tilmap.transpire();
  }
*/
  // tilmap.parms.threshold = segmentationRange.value;
  let countBackTiles = tilmap.segMask.map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
  backTiles.textContent = `${countBackTiles} total tiles`; //, ${Math.round((countBackTiles / tilmap.imgDataB_count) * 10000) / 100}% of tissue `;
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

zoo = function (canvas) {
  let ctx = canvas.getContext('2d');
  trackTransforms(ctx);
  function redraw() {
    // Clear the entire canvas
    var p1 = ctx.transformedPoint(0, 0);
    var p2 = ctx.transformedPoint(canvas.width, canvas.height);
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    // Alternatively:
    // ctx.save();
    // ctx.setTransform(1,0,0,1,0,0);
    // ctx.clearRect(0,0,canvas.width,canvas.height);
    // ctx.restore();

    ctx.drawImage(tilmap.img, 200, 50);

  }
  redraw();

  var lastX = canvas.width / 2, lastY = canvas.height / 2;
  var dragStart, dragged;
  canvas.addEventListener('mousedown', function (evt) {
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX, lastY);
    dragged = false;
  }, false);
  canvas.addEventListener('mousemove', function (evt) {
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart) {
      var pt = ctx.transformedPoint(lastX, lastY);
      ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
      redraw();
    }
  }, false);
  canvas.addEventListener('mouseup', function (evt) {
    dragStart = null;
    if (!dragged) zoom(evt.shiftKey ? -1 : 1);
  }, false);

  var scaleFactor = 1.1;
  var zoom = function (clicks) {
    var pt = ctx.transformedPoint(lastX, lastY);
    ctx.translate(pt.x, pt.y);
    var factor = Math.pow(scaleFactor, clicks);
    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);
    redraw();
  }

  var handleScroll = function (evt) {
    var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
  };
  canvas.addEventListener('DOMMouseScroll', handleScroll, false);
  canvas.addEventListener('mousewheel', handleScroll, false);
};

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  var xform = svg.createSVGMatrix();
  ctx.getTransform = function () { return xform; };

  var savedTransforms = [];

  var scale = ctx.scale;
  ctx.scale = function (sx, sy) {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };

  var translate = ctx.translate;
  ctx.translate = function (dx, dy) {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };

  var pt = svg.createSVGPoint();
  ctx.transformedPoint = function (x, y) {
    pt.x = x; pt.y = y;
    return pt.matrixTransform(xform.inverse());
  }
}

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
