/**
 * This code is run when someone clicks on the png file.
 * It changes the location, zooming in the slide viewer.
 */
zoom2loc = function (event) {

  // Get click position
  let clickPos = {};
  clickPos.x = event.offsetX ? (event.offsetX) : event.pageX - document.getElementById("imgTILDiv").offsetLeft;
  clickPos.y = event.offsetY ? (event.offsetY) : event.pageY - document.getElementById("imgTILDiv").offsetTop;
  //console.log("clickPos", clickPos);

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

    } catch(e) {
      success = false;
      console.log({"exception_was": e});
    }
    if(!success) {
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
