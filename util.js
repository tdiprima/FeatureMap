util = {

  gId: function (x) { // x is the id of an existing DOM element
    return document.getElementById(x)
  },

  data2imData: function (data) { // the reverse of im2data, data is a matlabish set of 4 2d matrices, with the r, g, b and alpha values
    var n = data.length, m = data[0].length;
    //var imData = {width:m, height:n, data:[]};
    var imData = document.createElement('canvas').getContext('2d').createImageData(m, n);
    for (var i = 0; i < n; i++) { //row
      //data.r[i]=[];data.g[i]=[];data.b[i]=[];data.a[i]=[];
      for (var j = 0; j < m; j++) { // column
        ij = (i * m + j) * 4;
        imData.data[ij] = data[i][j][0];
        imData.data[ij + 1] = data[i][j][1];
        imData.data[ij + 2] = data[i][j][2];
        imData.data[ij + 3] = data[i][j][3];
      }
    }
    return imData;
  },

  imData2data: function (imData) { // imData is the data structure returned by canvas.getContext('2d').getImageData(0,0,n,m)
    var m = imData.width, n = imData.height, data = [];
    for (var i = 0; i < n; i++) { //row
      data[i] = [];
      for (var j = 0; j < m; j++) { // column
        ij = (i * m + j) * 4;
        data[i][j] = [imData.data[ij], imData.data[ij + 1], imData.data[ij + 2], imData.data[ij + 3]]
      }
    }
    return data;
  },

  imread: function (cv) { // reads image from context into matrix
    // find out what type of input
    if (typeof (cv) == 'string') { // cv is the id of a canvas element
      cv = util.gId(cv)
    }
    var ct = cv.getContext('2d'), n = cv.width, m = cv.height;
    var imData = ct.getImageData(0, 0, n, m); // pixel values will be stored in imData.data
    return this.imData2data(imData)
  },

  imwrite: function (cv, im, dx, dy) {
    if (!cv) {
      cv = document.createElement('canvas');
      document.body.appendChild(cv)
    }
    if (!dy) {
      dx = 0;
      dy = 0
    } // default location
    if (typeof (cv) == 'string') {
      cv = util.gId(cv)
    } //cv can also be the id of a canvas element
    if (!im.data) {
      im = util.data2imData(im)
    } // such that im can also be the matrix created by imread
    var ct = cv.getContext('2d');
    ct.putImageData(im, dx, dy);
    return ct;
  },

  colormap: function (c) {
    if (!c) {
      c = 'default'
    }
    switch (c) {
      case 'default':
        c = [[0, 0, 0.5625], [0, 0, 0.625], [0, 0, 0.6875], [0, 0, 0.75], [0, 0, 0.8125], [0, 0, 0.875], [0, 0, 0.9375], [0, 0, 1], [0, 0.0625, 1], [0, 0.125, 1], [0, 0.1875, 1], [0, 0.25, 1], [0, 0.3125, 1], [0, 0.375, 1], [0, 0.4375, 1], [0, 0.5, 1], [0, 0.5625, 1], [0, 0.625, 1], [0, 0.6875, 1], [0, 0.75, 1], [0, 0.8125, 1], [0, 0.875, 1], [0, 0.9375, 1], [0, 1, 1], [0.0625, 1, 0.9375], [0.125, 1, 0.875], [0.1875, 1, 0.8125], [0.25, 1, 0.75], [0.3125, 1, 0.6875], [0.375, 1, 0.625], [0.4375, 1, 0.5625], [0.5, 1, 0.5], [0.5625, 1, 0.4375], [0.625, 1, 0.375], [0.6875, 1, 0.3125], [0.75, 1, 0.25], [0.8125, 1, 0.1875], [0.875, 1, 0.125], [0.9375, 1, 0.0625], [1, 1, 0], [1, 0.9375, 0], [1, 0.875, 0], [1, 0.8125, 0], [1, 0.75, 0], [1, 0.6875, 0], [1, 0.625, 0], [1, 0.5625, 0], [1, 0.5, 0], [1, 0.4375, 0], [1, 0.375, 0], [1, 0.3125, 0], [1, 0.25, 0], [1, 0.1875, 0], [1, 0.125, 0], [1, 0.0625, 0], [1, 0, 0], [0.9375, 0, 0], [0.875, 0, 0], [0.8125, 0, 0], [0.75, 0, 0], [0.6875, 0, 0], [0.625, 0, 0], [0.5625, 0, 0], [0.5, 0, 0]];
        break;
      default:
        c = 'not found';
    }
    return c
  }
};