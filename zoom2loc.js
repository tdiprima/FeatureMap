/**
 * This code is run when someone clicks on the png file.
 * It changes the location, zooming in the slide viewer.
 */
zoom2loc = function (event) {

  let e = event;

  // Get click position
  let clickPos = {};
  let mydiv = document.getElementById("imgTILDiv");
  // clickPos.x = event.offsetX ? (event.offsetX) : event.pageX - mydiv.offsetLeft;
  // clickPos.y = event.offsetY ? (event.offsetY) : event.pageY - mydiv.offsetTop;
  // console.log('e.offsetXY ', [event.offsetX, event.offsetY]); // 0,0 in FireFox, no good.
  // console.log('e.pageXY   ', [event.pageX, event.pageY]); // Different
  // console.log('e.offsetDiv', [mydiv.offsetLeft, mydiv.offsetTop]); // Equal both browsers

  if (event.offsetX) {
    console.log('Using offsetX');
    clickPos.x = event.offsetX;
  }
  else {
    console.log('Using diff between pageX and div offset left');
    event.offsetX = event.pageX - mydiv.offsetLeft;
  }

  if (event.offsetY) {
    console.log('Using offsetX');
    clickPos.y = event.offsetY;
  }
  else {
    console.log('Using diff between pageY and div offset top')
    event.offsetY = event.pageY - mydiv.offsetTop;
  }
  console.log("clickPos", clickPos);

  function calcPageXY(e) {
    e = e || window.event;

    var pageX = e.pageX;
    var pageY = e.pageY;
    if (pageX === undefined) {
      pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    // console.log('pageXY', [pageX, pageY]); // Same as this e.pageXY
  }
  // calcPageXY(e);

  function normHeh(e) {
    e = e || window.event;

    var target = e.target || e.srcElement,
      style = target.currentStyle || window.getComputedStyle(target, null),
      borderLeftWidth = parseInt(style['borderLeftWidth'], 10),
      borderTopWidth = parseInt(style['borderTopWidth'], 10),
      rect = target.getBoundingClientRect(),
      offsetX = e.clientX - borderLeftWidth - rect.left,
      offsetY = e.clientY - borderTopWidth - rect.top;
    // console.log('offset', [offsetX, offsetY]); // Both browsers are close
  }
  // normHeh(e);

  // Get image size
  let canvases = document.getElementsByTagName("canvas");
  let imgDim = {};
  for (let i = 0; i < canvases.length; i++) {
    if (canvases[i].width > 0) {
      imgDim.w = canvases[i].width;
      imgDim.h = canvases[i].height;
      // console.log("imgDim", imgDim.w, imgDim.h);
      break;
    }
  }

  const ifrm = document.getElementById('caMicrocopeIfr');

  // Get slide data
  let getSlideData = async function () {
    const url = `/node/${tilmap.slide}/?_format=json`;
    // console.log('fetch: ', url);

    return (await fetch(url)).json()

  };

  let setIframe = getSlideData();

  // Get slide dimensions
  setIframe.then(function (result) {
    // console.log('result', result);

    // Build new iFrame src
    let slideDim = {};
    let success = true;

    try {
      // slideDim.width = result.field_width[0].value;
      // slideDim.height = result.field_height[0].value;
      slideDim.width = result.imagedvolumewidth[0].value;
      slideDim.height = result.imagedvolumeheight[0].value;

    } catch (e) {
      success = false;
      console.log({ "exception_was": e });
    }
    if (!success) {
      slideDim.width = pathdb_util.slideWidth;
      slideDim.height = pathdb_util.slideHeight;
    }
    // console.log("slideDim", slideDim);
    let scale = {};
    scale.w = slideDim.width / imgDim.w * 1.0;
    scale.h = slideDim.height / imgDim.h * 1.0;
    // console.log("scale", scale);

    // States
    let states = {};
    let x1 = clickPos.x * scale.w;
    // console.log('x1', x1);
    let y1 = clickPos.y * scale.h;
    // console.log('y1', y1);
    states.x = parseFloat(x1 / slideDim.width);
    states.y = parseFloat(y1 / slideDim.height);
    states.z = 1.6;
    states.hasMark = true;
    //console.log('states', states);

    // Encode to Base64
    let encodedData = encodeURIComponent(btoa(JSON.stringify(states)));

    // Set frame src to desired location
    ifrm.src = `/caMicroscope/apps/viewer/viewer.html?slideId=${tilmap.slide}&mode=${tilmap.mode}&states=${encodedData}`;
    // ifrm.src = `${newIfrmLoc}&x=${Math.ceil(clickPos.x * scale.w)}&y=${Math.ceil(clickPos.y * scale.h)}&zoom=5`;
    console.log('ifrm.src:', ifrm.src);

  });
  return true;

};
