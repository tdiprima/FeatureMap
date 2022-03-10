describe('Orientation Tests', function () {
  let testSlider
  let sliderHandleTopPos
  let sliderHandleLeftPos

  describe('Vertical', function () {
    beforeEach(function () {
      testSlider = new Slider('#orientationSlider', {
        id: 'orientationSliderId',
        orientation: 'vertical',
        min: 0,
        max: 10,
        value: 5
      })

      const sliderHandleEl = document.querySelector('#orientationSliderId .slider-handle')
      const sliderHandleBoundingBoxInfo = sliderHandleEl.getBoundingClientRect()
      sliderHandleTopPos = sliderHandleBoundingBoxInfo.top
      sliderHandleLeftPos = sliderHandleBoundingBoxInfo.left
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.destroy()
      }
    })

    it('slides up when handle moves upwards', function () {
      const mousemove = document.createEvent('MouseEvents')
      const mousemoveX = sliderHandleLeftPos
      const mousemoveY = sliderHandleTopPos - 100
      let newSliderValue

      mousemove.initMouseEvent(
        'mousedown',
        true /* bubble */,
        true /* cancelable */,
        window,
        null,
        0, 0, mousemoveX, mousemoveY, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /* left */,
        null
      )
      testSlider.sliderElem.dispatchEvent(mousemove)
      newSliderValue = testSlider.getValue()

      expect(newSliderValue).toBeLessThan(5)
    })

    it('slides down when handle moves downwards', function () {
      const mousemove = document.createEvent('MouseEvents')
      const mousemoveX = sliderHandleLeftPos
      const mousemoveY = sliderHandleTopPos + 100
      let newSliderValue

      mousemove.initMouseEvent(
        'mousedown',
        true /* bubble */,
        true /* cancelable */,
        window,
        null,
        0, 0, mousemoveX, mousemoveY, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /* left */,
        null
      )
      testSlider.sliderElem.dispatchEvent(mousemove)
      newSliderValue = testSlider.getValue()

      expect(newSliderValue).toBeGreaterThan(5)
    })
  })
}) // End of spec
