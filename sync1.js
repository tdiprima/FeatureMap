let viewer1 = {}
let viewer2 = {}
let viewer3 = {}
let viewer4 = {}
// let url = url1 = '/caMicroscope/img/IIP/raw/?DeepZoom=/data/images/demo/dir1/TCGA-A2-A3XZ-01Z-00-DX1.svs_files/'
let wsi_w = 46336
let wsi_h = 44288
let uno = 0.5
// let due = 0.2
let due = 0.5
let max_l = getMaxLevel(wsi_w, wsi_h)
let img1 = 'https://openseadragon.github.io/example-images/duomo/duomo.dzi'
let img2 = 'https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2'
let x = OpenSeadragon.Filters.GREYSCALE

function colorIt(viewer) {
  x.prototype.COLORIZE = function (r, g, b) {
    return function (context, callback) {
      let imgData = context.getImageData(
        0, 0, context.canvas.width, context.canvas.height)
      let pixels = imgData.data
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = r * pixels[i] / 255
        pixels[i + 1] = g * pixels[i + 1] / 255
        pixels[i + 2] = b * pixels[i + 2] / 255
        pixels[i + 3] = 255
      }
      context.putImageData(imgData, 0, 0)
      callback()
    }
  }

  viewer.setFilterOptions({
    filters: [{
      items: viewer.world.getItemAt(0),
      processors: [
        x.prototype.COLORIZE(255, 255, 0)
      ]
    }, {
      items: viewer.world.getItemAt(1),
      processors: [
        x.prototype.COLORIZE(255, 0, 0)
      ]
    }]
  })
}

function getWorldItems(viewer) {
  let i, tiledImage
  let count = viewer.world.getItemCount()
  console.log('getItemCount:', count)
  for (i = 0; i < count; i++) {
    tiledImage = viewer.world.getItemAt(i)
    console.log(i + ':', tiledImage)
  }
}

function getMaxLevel(width, height) {
  // do natural logarithm (base e)
  if (width > height) {
    return Math.ceil(Math.log(width) / Math.log(2))
  } else {
    return Math.ceil(Math.log(height) / Math.log(2))
  }
}

function setViewer(id, imageArray, opacityArray) {
  let viewer = {}

  viewer = OpenSeadragon({
    id: id,
    prefixUrl: '//openseadragon.github.io/openseadragon/images/',
    crossOriginPolicy: 'Anonymous'
  })

  imageArray.forEach(function (image, index) {
    viewer.addTiledImage({
      tileSource: image,
      opacity: opacityArray ? opacityArray[index] : 0,
      x: 0,
      y: 0
    })
  })
  // console.log('viewer', viewer);
  return viewer
}

function demo() {
  // let img1 = {
  //   height: wsi_h,
  //   width: wsi_w,
  //   tileSize: 256,
  //   minLevel: 0,
  //   maxLevel: max_l,
  //   getTileUrl: function (level, x, y) {
  //     return (url + level + '/' + x + '_' + y + '.png')
  //   }
  // }

  // let img2 = {
  //   height: wsi_h,
  //   width: wsi_w,
  //   tileSize: 256,
  //   minLevel: 0,
  //   maxLevel: max_l,
  //   getTileUrl: function (level, x, y) {
  //     return (url1 + level + '/' + x + '_' + y + '.png')
  //   }
  // }

  viewer1 = setViewer('viewer1', [img1, img2], [uno, due])
  viewer2 = setViewer('viewer2', [img1, img2], [uno, due])
  viewer3 = setViewer('viewer3', [img1, img2], [uno, due])
  viewer4 = setViewer('viewer4', [img1, img2], [uno, due])

  // TODO: FACTORY.
  let viewer1Leading = false
  let viewer2Leading = false

  let viewer1Handler = function () {
    if (viewer2Leading || viewer3Leading || viewer4Leading) {
      return
    }

    viewer1Leading = true
    viewer2.viewport.zoomTo(viewer1.viewport.getZoom())
    viewer2.viewport.panTo(viewer1.viewport.getCenter())
    viewer3.viewport.zoomTo(viewer1.viewport.getZoom())
    viewer3.viewport.panTo(viewer1.viewport.getCenter())
    viewer4.viewport.zoomTo(viewer1.viewport.getZoom())
    viewer4.viewport.panTo(viewer1.viewport.getCenter())
    viewer1Leading = false
  }

  let viewer2Handler = function () {
    if (viewer1Leading || viewer3Leading || viewer4Leading) {
      return
    }

    viewer2Leading = true
    viewer1.viewport.zoomTo(viewer2.viewport.getZoom())
    viewer1.viewport.panTo(viewer2.viewport.getCenter())
    viewer3.viewport.zoomTo(viewer2.viewport.getZoom())
    viewer3.viewport.panTo(viewer2.viewport.getCenter())
    viewer4.viewport.zoomTo(viewer2.viewport.getZoom())
    viewer4.viewport.panTo(viewer2.viewport.getCenter())
    viewer2Leading = false
  }

  viewer1.addHandler('zoom', viewer1Handler) // When Viewer 1 is zooming we want Viewer 1 to lead
  viewer2.addHandler('zoom', viewer2Handler)
  viewer1.addHandler('pan', viewer1Handler) // When Viewer 1 is panning we want Viewer 1 to lead
  viewer2.addHandler('pan', viewer2Handler)

  var viewer3Leading = false
  var viewer4Leading = false

  let viewer3Handler = function () {
    if (viewer2Leading || viewer1Leading || viewer4Leading) {
      return
    }

    viewer3Leading = true
    viewer1.viewport.zoomTo(viewer3.viewport.getZoom())
    viewer1.viewport.panTo(viewer3.viewport.getCenter())
    viewer2.viewport.zoomTo(viewer3.viewport.getZoom())
    viewer2.viewport.panTo(viewer3.viewport.getCenter())
    viewer4.viewport.zoomTo(viewer3.viewport.getZoom())
    viewer4.viewport.panTo(viewer3.viewport.getCenter())
    viewer3Leading = false
  }

  let viewer4Handler = function () {
    if (viewer2Leading || viewer3Leading || viewer1Leading) {
      return
    }

    viewer4Leading = true
    viewer1.viewport.zoomTo(viewer4.viewport.getZoom())
    viewer1.viewport.panTo(viewer4.viewport.getCenter())
    viewer2.viewport.zoomTo(viewer4.viewport.getZoom())
    viewer2.viewport.panTo(viewer4.viewport.getCenter())
    viewer3.viewport.zoomTo(viewer4.viewport.getZoom())
    viewer3.viewport.panTo(viewer4.viewport.getCenter())
    viewer4Leading = false
  }

  viewer3.addHandler('zoom', viewer3Handler) // When Viewer 3 is zooming we want Viewer 3 to lead
  viewer4.addHandler('zoom', viewer4Handler)
  viewer3.addHandler('pan', viewer3Handler) // When Viewer 3 is panning we want Viewer 3 to lead
  viewer4.addHandler('pan', viewer4Handler)

  return [viewer1, viewer2, viewer3, viewer4]
}
