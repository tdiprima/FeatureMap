describe('TickMaxValueNotATickBehavior', function () {
  const SLIDER_ID = 'testSlider1'
  let slider
  let options

  describe('max value should be reached', function () {
    beforeEach(function () {
      options = {
        min: 40,
        max: 1310,
        step: 5,
        scale: 'logarithmic',
        value: 44
      }
      slider = new Slider(document.getElementById(SLIDER_ID), options)
    })

    it('Value should contain max value when slider is moved to outer right position', function () {
      const sliderLeft = slider.sliderElem.offsetLeft
      const offsetY = slider.sliderElem.offsetTop
      // I think the + 10 work because it is half of the handle size;
      const offsetX = sliderLeft + slider.sliderElem.clientWidth + 10
      const expectedValue = slider.options.max
      const mouseEvent = getMouseDownEvent(offsetX, offsetY)
      slider.mousedown(mouseEvent)
      // FIXME: Use 'mouseup' event type
      slider.mouseup(mouseEvent)
      expect(slider.getValue()).toBe(expectedValue)
    })
  })

  afterEach(function () {
    slider.destroy()
  })

  // helper functions
  function getMouseDownEvent (offsetXToClick, offsetYToClick) {
    const args = [
      'mousedown', // type
      true, // canBubble
      true, // cancelable
      document, // view,
      0, // detail
      0, // screenX
      0, // screenY
      offsetXToClick, // clientX
      offsetYToClick, // clientY,
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey,
      0, // button
      null // relatedTarget
    ]

    const event = document.createEvent('MouseEvents')
    event.initMouseEvent.apply(event, args)
    return event
  }
})
