pathdb_util = function () {

  pathdb_util.imgHeight = 0;
  pathdb_util.imgWidth = 0;
  pathdb_util.slideHeight = 0;
  pathdb_util.slideWidth = 0;
  pathdb_util.columns = [];
  pathdb_util.csvData = [];

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
  for (let i = 0; i < d.length; i++) {
    if (i > 0) { //skip 1st line
      pathdb_util.csvData.push(d[i].split(','));
    }
  }
  // Retrieved data from csv file content
  console.log(pathdb_util.csvData);
};

/**
 * Returns a dataURL (PNG)
 *
 * @param strData
 * @param strDelimiter
 * @returns {string}
 */
pathdb_util.csv2png = function (strData, strDelimiter) {
  strDelimiter = (strDelimiter || ",");

  let lines;

  if (typeof strData === 'undefined') {
    console.log('No file, no data!');
    return null;
  } else {
    pathdb_util.data(strData);
    lines = strData.split(/\r?\n/); // split by newline

    // Columns => Buttons
    let columns = lines[1].split(',');
    pathdb_util.columns = columns;
    if (columns.length >= 5) {
      // should be x, y, red, green, blue
      let x = document.getElementById('calcTILred');
      if (columns[2].toUpperCase() === 'TIL') {
        let head2 = 'TIL';
        x.innerText = head2;
        x = document.getElementById('redRangePlay');
        x.innerText = head2;
      } else {
        let head2 = pathdb_util.jsUcfirst(columns[2]);
        x.innerText = head2;
        x = document.getElementById('redRangePlay');
        x.innerText = head2;
      }

      x = document.getElementById('calcTILgreen');
      x.innerText = pathdb_util.jsUcfirst(columns[3]);

      x = document.getElementById('calcTILblue');
      x.innerText = pathdb_util.jsUcfirst(columns[4]);

      //~~~~~~~~

      x = document.getElementById('greenRangePlay');
      x.innerText = pathdb_util.jsUcfirst(columns[3]);

    }

    // Parse JSON Metadata
    let str = lines[0];
    str = str.replace(/['""]+/g, '"'); // double quotes
    // str = str.replace(/['"]+/, ''); // starts with quote
    // str = str.replace(/^\"/, ''); // starts with quote
    str = str.replace(/^"/, ''); // starts with quote
    str = str.replace("}\"", "}");
    // str = str.replace("\",,,,", ""); // ends with quote and commas
    if (str.endsWith(",,,,"))
    {
      str = str.replace(",,,,", "");
    }
    if(str.endsWith(",,,"))
    {
      str = str.replace(",,,", "");
    }
    console.log(str);

    const metadata = JSON.parse(str);

    var width = parseInt(metadata.png_w),
        height = parseInt(metadata.png_h);

    pathdb_util.imgHeight = height;
    pathdb_util.imgWidth = width;

    pathdb_util.slideHeight = parseInt(metadata.img_height);
    pathdb_util.slideWidth = parseInt(metadata.img_width);

    console.log('size of buffer', width * height * 4);// = imgData.data.length

    // create off-screen canvas element
    var canvas = document.getElementById("myCanvas");

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'myCanvas';
    }
    canvas.width = width;
    canvas.height = height;
    // console.log('metadata.png_w', metadata.png_w);
    // console.log('metadata.png_h', metadata.png_h);
    console.log('canvas.width', canvas.width);
    console.log('canvas.height', canvas.height);
    var ctx = canvas.getContext("2d");
    var imgData = ctx.createImageData(width, height);
    var i;

    // Initialize buffer to all black with transparency
    for (i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = 0;
      imgData.data[i + 1] = 0;
      imgData.data[i + 2] = 0;
      imgData.data[i + 3] = 255;
    }

    // Data from CSV file
    for (i = 2; i < lines.length; i++) {

      // Ignore if blank line
      if (lines[i].trim().length > 0) {

        var line = lines[i].split(strDelimiter);
        var x = parseInt(line[0]);
        var y = parseInt(line[1]);
        let pixelindex = (y * width + x) * 4;

        // Color
        imgData.data[pixelindex] = parseInt(line[2]);      // R value [0, 255]
        imgData.data[pixelindex + 1] = parseInt(line[3]);  // G value
        imgData.data[pixelindex + 2] = parseInt(line[4]);  // B value
        imgData.data[pixelindex + 3] = 255;                // set alpha channel
      }
    }
    // console.log('imgData', imgData);
    ctx.putImageData(imgData, 0, 0); // we now have an image painted to the canvas

    // Next, create an image file:
    var dataUri = canvas.toDataURL(); // produces a PNG file
    return dataUri;

  }

};

pathdb_util.jsUcfirst = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
