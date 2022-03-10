describe('Scrollable test', function () {
  let testSlider
  let sliderHandleTopPos
  let sliderHandleLeftPos
  let scrollableContainer

  describe('Vertical inside scrollable container', function () {
    beforeEach(function () {
      testSlider = new Slider('#ex1', {
        id: 'ex1Slider',
        orientation: 'vertical',
        min: 0,
        max: 20,
        value: 10,
        step: 1
      })

      scrollableContainer = document.querySelector('#scrollable-div')
      scrollableContainer.scrollTop = 145

      const sliderHandleEl = document.querySelector('#ex1Slider .slider-handle')
      const sliderHandleBoundingBoxInfo = sliderHandleEl.getBoundingClientRect()
      sliderHandleTopPos = sliderHandleBoundingBoxInfo.top
      sliderHandleLeftPos = sliderHandleBoundingBoxInfo.left
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.destroy()
      }
    })

    // The difference between sliderHandleTopPos and mousemoveY is equal to 50 in both cases,
    // but difference between initial and final slider value is not equal (6 and 4).
    // It happens because we don't 'hit' the center of handle but the top left corner.

    it('slides up when handle moves upwards inside scrollable element after scrolling', function () {
      const mousemove = document.createEvent('MouseEvents')
      const mousemoveX = sliderHandleLeftPos
      const mousemoveY = sliderHandleTopPos - 50
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

      expect(newSliderValue).toEqual(4)
    })

    it('slides down when handle moves downwards inside scrollable element after scrolling', function () {
      const mousemove = document.createEvent('MouseEvents')
      const mousemoveX = sliderHandleLeftPos
      const mousemoveY = sliderHandleTopPos + 50
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

      expect(newSliderValue).toEqual(14)
    })
  })
}) // End of spec
