pathdb_util = function () {

  pathdb_util.imgHeight = 0;
  pathdb_util.imgWidth = 0;
  pathdb_util.slideHeight = 0;
  pathdb_util.slideWidth = 0;
  pathdb_util.columns = [];
  pathdb_util.csvData = [];
  pathdb_util.jsonMeta = '';

};

/**
 * Param url = path to csv
 *
 * @param url
 * @returns {Promise<string | any | never>}
 */
pathdb_util.fetch_data = function (url) {

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

/**
 * Get PNG data
 *
 * @param url
 * @returns {Promise<string | never>}
 */
pathdb_util.getDataForImage = function (url) {
  // Get CSV data
  return pathdb_util.fetch_data(url).then((response) => {
    // Convert CSV to PNG
    return this.csv2png(response, ',');
  });

};

pathdb_util.data = function (strData) {

  pathdb_util.csvData = [];
  let d = strData.split(/\r?\n|\r/);

  if ((typeof (pathdb_util.jsonMeta) === 'undefined') || pathdb_util.jsonMeta.length === 0) {
    parseMetadata(d[0]);
  }

  for (let i = 0; i < d.length; i++) {
    pathdb_util.csvData.push(d[i].split(','));
  }
  return pathdb_util.csvData;
};

/**
 * Returns a dataURL (PNG)
 *
 * @param strData
 * @returns {string}
 */
pathdb_util.csv2png = function (strData) {

  let arr = strData;

  if (typeof strData === 'undefined') {
    console.log('No file, no data!');
    return null;
  } else {
    if (typeof strData === 'string') {
      arr = pathdb_util.data(strData);
    }

    ui(arr[1]);

    // Return a PNG file:
    return createImage(arr);
  }

};

createImage = function (arr) {

  // create off-screen canvas element
  let canvas = document.getElementById("myCanvas");

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
  }
  canvas.width = pathdb_util.imgWidth;
  canvas.height = pathdb_util.imgHeight;

  let ctx = canvas.getContext("2d");
  let imgData = ctx.createImageData(pathdb_util.imgWidth, pathdb_util.imgHeight);

  // Initialize buffer to all black with transparency
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 0;
    imgData.data[i + 1] = 0;
    imgData.data[i + 2] = 0;
    imgData.data[i + 3] = 255;
  }

  // Data from CSV file
  for (let i = 2; i < arr.length; i++) {

      let line = arr[i];

      for (let j = 0; j < line.length; j++)
      {
        let x = parseInt(line[0]);
        let y = parseInt(line[1]);
        let pixelindex = (y * pathdb_util.imgWidth + x) * 4;

        // Color
        imgData.data[pixelindex] = parseInt(line[2]);      // R value [0, 255]
        imgData.data[pixelindex + 1] = parseInt(line[3]);  // G value
        imgData.data[pixelindex + 2] = parseInt(line[4]);  // B value
        imgData.data[pixelindex + 3] = 255;                // set alpha channel
      }

  }
  // console.log('imgData', imgData);
  ctx.putImageData(imgData, 0, 0); // we now have an image painted to the canvas

  // Return a PNG file:
  return canvas.toDataURL();
};

parseMetadata = function (str) {

  // Cleanup
  str = str.replace(/['""]+/g, '"'); // double quotes
  // str = str.replace(/['"]+/, ''); // starts with quote
  // str = str.replace(/^\"/, ''); // starts with quote
  str = str.replace(/^"/, ''); // starts with quote
  str = str.replace("}\"", "}");
  // str = str.replace("\",,,,", ""); // ends with quote and commas
  if (str.endsWith(",,,,")) {
    str = str.replace(",,,,", "");
  }
  if (str.endsWith(",,,")) {
    str = str.replace(",,,", "");
  }
  console.log(str);

  // Parse JSON Metadata
  const metadata = JSON.parse(str);

  pathdb_util.imgHeight = parseInt(metadata.png_h);
  pathdb_util.imgWidth = parseInt(metadata.png_w);

  pathdb_util.slideHeight = parseInt(metadata.img_height);
  pathdb_util.slideWidth = parseInt(metadata.img_width);

};

jsUcfirst = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

ui = function (columns) {

  // Columns => HTML Elements
  pathdb_util.columns = columns.map(function(item) {
    return jsUcfirst(item);
  });

  if (columns.length >= 5) {
    // should be x, y, red, green, blue
    let x = document.getElementById('calcTILred');
    if (columns[2].toUpperCase() === 'TIL') {
      let head2 = 'TIL';
      x.innerText = head2;
      x = document.getElementById('redRangePlay');
      x.innerText = head2;
    } else {
      let head2 = jsUcfirst(columns[2]);
      x.innerText = head2;
      x = document.getElementById('redRangePlay');
      x.innerText = head2;
    }

    x = document.getElementById('calcTILgreen');
    x.innerText = jsUcfirst(columns[3]);

    x = document.getElementById('calcTILblue');
    x.innerText = jsUcfirst(columns[4]);

    x = document.getElementById('greenRangePlay');
    x.innerText = jsUcfirst(columns[3]);

  } else {
    alert('Error: Not enough data\nThere are only ' + columns.length() + ' columns.');
  }

};
