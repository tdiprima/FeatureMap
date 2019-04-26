console.log('datamap.js loaded');

datamap = function () {



  var queryString = location.search;
  if (queryString.length > 1) {

    let str = location.search.slice(1);
    datamap.map = datamap.getQueryVariable('map', str); // csv
    datamap.slide = datamap.getQueryVariable('slideId', str); // drupal node of slide
    datamap.mode = datamap.getQueryVariable('mode', str); // camic toggle switch


    promiseA = pathdb_util.getDataForImage(datamap.map);
    promiseA.then(function (result) {
      if (result === null) {
        console.log('Abort.')
      } else {
        datamap.dataUri = result;
        datamap.calcTILfun()
      }
    });

  } else {
    alert('Expecting parameters: mode, slideId, and map');
  }

};

datamap.getQueryVariable = function (variable, queryString) {
  var vars = queryString.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
};

// Sliders
datamap.parms = {
  cancerRange: 100,
  tilRange: 100,
  transparency: 20,
  threshold: 0
};

// imgTILDiv.onclick = function (ev) {
datamap.zoom2loc = function () { // event listener pointing to zoom2loc's code
  document.getElementById('imgTILDiv').onclick = function (ev) {
    //datamap.img.onclick=function(ev){
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
  return datamap.calcTILdiv
};

datamap.calcTILfun = function () {


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

  datamap.zoom2loc();
  cancerRange.value = datamap.parms.cancerRange;
  tilRange.value = datamap.parms.tilRange;
  rangeSegmentBt.onclick = datamap.segment;

  cancerRangePlay.onclick = tilRangePlay.onclick = function () {

    // make sure the other play is stopped
    if ((this.id === "cancerRangePlay") & (tilRangePlay.style.backgroundColor === "#dedede")) {
      tilRangePlay.click()
    }
    if ((this.id === "tilRangePlay") & (cancerRangePlay.style.backgroundColor === "#dedede")) {
      cancerRangePlay.click()
    }

    var range = document.getElementById(this.id.slice(0, -4)); // range input for this button
    if (this.style.backgroundColor === "silver") {
      this.style.backgroundColor = "#dedede";
      if (range.value === "") {
        range.value = datamap.parms[range.id]
      }
      datamap.parms.t = setInterval(function () {
        range.value = parseInt(range.value) + 5;
        //console.log(cancerTilRange.value)
        if (parseInt(range.value) >= 100) {
          range.value = "0"
        }
        datamap.parms[range.id] = range.value;
        range.onchange()
      }, 100)
    } else {
      clearInterval(datamap.parms.t);
      //this.textContent="Play"
      this.style.backgroundColor = "silver"
    }
  };

  /**
   * CREATE IN-MEMORY IMAGE
   * But also write img element
   */
  datamap.img = new Image();
  datamap.img.src = datamap.dataUri;
  datamap.img.id = 'imgTIL';
  datamap.imgTILDiv = document.getElementById('imgTILDiv');
  datamap.imgTILDiv.appendChild(datamap.img);

  datamap.img.onload = function () {

    datamap.cvBase = document.createElement('canvas');
    datamap.cvBase.hidden = true;
    
    // datamap.cvBase.width = datamap.img.width;  // NOTE! Browser resizes this. We don't want that!
    datamap.cvBase.width = pathdb_util.canvasWidth;
    
    // datamap.cvBase.height = datamap.img.height;  // DITTO! Browser resizes this. We don't want that!
    datamap.cvBase.height = pathdb_util.canvasHeight;
    tileSize.textContent = `${datamap.img.width}x${datamap.img.height}`;
    datamap.cvBase.id = "cvBase";
    datamap.imgTILDiv.appendChild(datamap.cvBase);
    datamap.ctx = datamap.cvBase.getContext('2d');
    datamap.ctx.drawImage(this, 0, 0);
    datamap.imgData = jmat.imread(datamap.cvBase);

    // extract RGB
    datamap.imgDataR = datamap.imSlice(0);
    datamap.imgDataG = datamap.imSlice(1);
    datamap.imgDataB = datamap.imSlice(2);
    datamap.imgDataB_count = datamap.imgDataB.map(x => x.map(x => x / 255)).map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);

    calcTILred.onclick = function () {
      datamap.from2D(datamap.imSlice(0))
    };
    calcTILgreen.onclick = function () {
      datamap.from2D(datamap.imSlice(1))
    };
    calcTILblue.onclick = function () {
      datamap.from2D(datamap.imSlice(2))
    };
    calcTIL0.onclick = function () {
      datamap.img.hidden = false;
      datamap.cvBase.hidden = true;
    };
    //debugger
    datamap.cvBase.onclick = datamap.img.onclick;

    cancerRange.onchange = tilRange.onchange = function () {

      if (this.id === 'cancerRange') {
        document.getElementById("slider_value").innerHTML = this.value;
      }

      if (this.id === 'tilRange') {
        document.getElementById("slider_value1").innerHTML = this.value;
      }

      //debugger
      datamap.cvBase.hidden = false;
      datamap.img.hidden = true;
      var cm = jmat.colormap();
      //var k = parseInt(this.value)/100 //slider value
      var cr = parseInt(cancerRange.value) / 100;
      var tr = parseInt(tilRange.value) / 100;
      datamap.parms[this.id] = this.value;
      var ddd = datamap.imgData.map(function (dd) {
        return dd.map(function (d) {
          //var r = k*d[0]/255
          //var g = (1-k)*d[1]/255
          //return cm[Math.round((r+g)*63)].map(x=>Math.round(x*255)).concat(d[2])
          return cm[Math.round((Math.max(d[1] * cr, d[0] * tr) / 255) * 63)].map(x => Math.round(x * 255)).concat(d[2])
          //debugger
        })
      });
      jmat.imwrite(datamap.cvBase, ddd)
      //debugger
    };

    // making sure clicking stops play and act as as onchange
    cancerRange.onclick = function () {
      if (cancerRangePlay.style.backgroundColor === "#dedede") {
        cancerRangePlay.onclick()
      }
      cancerRange.onchange()
    };

    tilRange.onclick = function () {
      if (tilRangePlay.style.backgroundColor === "#dedede") {
        tilRangePlay.onclick()
      }
      tilRange.onchange()
    };

    cancerRange.onchange();
    tilRange.onchange();
    datamap.cvTop = document.createElement('canvas');
    datamap.cvTop.width = datamap.img.width;
    datamap.cvTop.height = datamap.img.height;
    datamap.cvTop.id = "cvTop";
    datamap.imgTILDiv.appendChild(datamap.cvTop);
    datamap.cvTop.style.position = 'absolute';
    datamap.canvasAlign();
    datamap.segment()
  };
  document.getElementById('caMicrocopeIfr').src = `/caMicroscope/apps/viewer/viewer.html?slideId=${datamap.slide}&mode=${datamap.mode}`;
  segmentationRange.onchange = datamap.segment; //rangeSegmentBt.onclick
  transparencyRange.onchange = datamap.transpire

};

datamap.from2D = function (dd) {
  datamap.cvBase.hidden = false;
  datamap.img.hidden = true;
  datamap.cv2D = dd; // keeping current value 2D slice
  var cm = jmat.colormap();
  var k = 63 / 255; // png values are between 0-255 and cm 0-63
  var ddd = dd.map(function (d) {
    return d.map(function (v) {
      return cm[Math.round(v * k)].map(x => Math.round(x * 255)).concat(255)
    })
  });
  //datamap.ctx.putImageData(jmat.data2imData(ddd),0,0)
  //jmat.imwrite(datamap.img,ddd)
  jmat.imwrite(datamap.cvBase, ddd)
  //debugger
};

datamap.imSlice = function (i) { // slice ith layer of imgData matrix
  i = i || 0;
  return datamap.imgData.map(x => {
    return x.map(y => {
      return y[i]
    })
  })
};

datamap.segment = function () {

  document.getElementById("slider_value2").innerHTML = segmentationRange.value;

  // generate mask
  //var k = parseInt(cancerRange.value)/100 // range value
  var cr = parseInt(cancerRange.value) / 100;
  var tr = parseInt(tilRange.value) / 100;
  var sv = 2.55 * parseInt(segmentationRange.value); // segmentation value
  var tp = Math.round(2.55 * parseInt(transparencyRange.value)); // range value

  let countCancer = 0;
  let countTil = 0;

  datamap.segMask = datamap.imgData.map(dd => {
    return dd.map(d => {
      //return (d[0]*(k)+d[1]*(1-k))>sv
      //return (d[0]*(k)+d[1]*(1-k))>=sv
      countCancer += (d[1] * cr >= sv) & (d[2] == 255);
      countTil += (d[0] * tr >= sv) & (d[2] == 255);
      return ((Math.max(d[1] * cr, d[0] * tr)) >= sv) & (d[2] == 255);
      //return cm[Math.round((Math.max(d[1]*cr,d[0]*tr)/255)*63)].map(x=>Math.round(x*255)).concat(d[2])
    })
  });
  cancerTiles.textContent = `${countCancer} tiles, ${Math.round((countCancer / datamap.imgDataB_count) * 10000) / 100}% of tissue`;
  tilTiles.textContent = `${countTil} tiles, ${Math.round((countTil / datamap.imgDataB_count) * 10000) / 100}% of tissue`;

  // find neighbors
  var n = datamap.imgData.length;
  var m = datamap.imgData[0].length;
  datamap.segNeig = [...Array(n)].map(_ => {
    return [...Array(m)].map(_ => [0])
  });
  var dd = datamap.segMask;
  for (var i = 1; i < (n - 1); i++) {
    for (var j = 1; j < (m - 1); j++) {
      datamap.segNeig[i][j] = [dd[i - 1][j - 1], dd[i - 1][j], dd[i - 1][j + 1], dd[i][j - 1], dd[i][j], dd[i][j + 1], dd[i + 1][j - 1], dd[i + 1][j], dd[i + 1][j + 1]]
    }
  }
  // find edges
  datamap.segEdge = datamap.segNeig.map(dd => {
    return dd.map(d => {
      var s = d.reduce((a, b) => a + b);
      return (s > 3 & s < 7)
      //return d.reduce((a,b)=>Math.max(a,b))!=d.reduce((a,b)=>Math.min(a,b))
    })
  });
  datamap.transpire();
  datamap.parms.threshold = segmentationRange.value;
  let countBackTiles = datamap.segMask.map(x => x.reduce((a, b) => a + b)).reduce((a, b) => a + b);
  backTiles.textContent = `${countBackTiles} tiles, ${Math.round((countBackTiles / datamap.imgDataB_count) * 10000) / 100}% of tissue `;
  datamap.canvasAlign() // making sure it doesn't lose alignment
};

datamap.transpire = function () {

  document.getElementById("slider_value3").innerHTML = transparencyRange.value;
  var tp = Math.round(2.55 * parseInt(transparencyRange.value)); // range value
  //var clrEdge = [255,255,0,255-tp] // yellow
  var clrEdge = [255, 0, 144, 255 - tp]; // magenta
  var clrMask = [255, 255, 255, tp];
  jmat.imwrite(datamap.cvTop, datamap.segEdge.map((dd, i) => {
    return dd.map((d, j) => {
      var c = [0, 0, 0, 0];
      if (d) {
        c = clrEdge
      } else if (!datamap.segMask[i][j]) {
        c = clrMask
      }
      return c
      //return [255,255,255,255].map(v=>v*d) // white
    })
  }));
  datamap.parms.transparency = transparencyRange.value
};

datamap.canvasAlign = function () {

  let zzTop = datamap.cvBase.getBoundingClientRect().top;
  let zzLeft = datamap.cvBase.getBoundingClientRect().left;
  if (zzTop === 0 || zzLeft === 0) {
    console.log("Something's not right.");
    console.log(datamap.cvBase);
    console.log(datamap.cvBase.getBoundingClientRect());

  } else {
    datamap.cvTop.style.top = datamap.cvBase.getBoundingClientRect().top;
    datamap.cvTop.style.left = datamap.cvBase.getBoundingClientRect().left;
    // correction if needed
    datamap.cvTop.style.top = parseFloat(datamap.cvTop.style.top) + datamap.cvBase.getBoundingClientRect().top - datamap.cvTop.getBoundingClientRect().top;

  }

};

window.onload = datamap;
