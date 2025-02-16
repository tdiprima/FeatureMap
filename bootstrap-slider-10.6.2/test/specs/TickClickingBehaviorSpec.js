describe('TickClickingBehavior', function () {
  const SLIDER_ID = 'testSlider1'
  let slider
  let options

  describe('ticks start with 0', function () {
    beforeEach(function () {
      options = {
        ticks: [0, 1, 2, 3, 4],
        ticks_positions: [0, 25, 50, 75, 100],
        step: 1,
        value: 4
      }

      slider = new Slider(document.getElementById(SLIDER_ID), options)
    })

    it('Should set slider to corresponding value when ticks are clicked', function () {
      for (let i = 0; i < options.ticks.length; i++) {
        clickTickAtIndexAndVerify(slider, i)
      }
    })
  })

  describe('ticks start with positive value', function () {
    beforeEach(function () {
      options = {
        ticks: [1, 2, 3, 4, 5],
        ticks_positions: [0, 25, 50, 75, 100],
        step: 1,
        value: 5
      }

      slider = new Slider(document.getElementById(SLIDER_ID), options)
    })

    it('Should set slider to corresponding value when ticks are clicked', function () {
      for (let i = 0; i < options.ticks.length; i++) {
        clickTickAtIndexAndVerify(slider, i)
      }
    })
  })

  describe('ticks start with negative value', function () {
    beforeEach(function () {
      options = {
        ticks: [-5, -4, -3, -2, -1],
        ticks_positions: [0, 25, 50, 75, 100],
        step: 1,
        value: -1
      }

      slider = new Slider(document.getElementById(SLIDER_ID), options)
    })

    it('Should set slider to corresponding value when ticks are clicked', function () {
      for (let i = 0; i < options.ticks.length; i++) {
        clickTickAtIndexAndVerify(slider, i)
      }
    })
  })

  afterEach(function () { slider.destroy() })

  // helper functions
  function clickTickAtIndexAndVerify (slider, tickIndex) {
    const sliderLeft = slider.sliderElem.offsetLeft
    const tickLeft = slider.ticks[tickIndex].offsetLeft
    const handleHalfWidth = $('.slider-handle.round').width() / 2

    const offsetX = sliderLeft + tickLeft + handleHalfWidth
    const offsetY = slider.sliderElem.offsetTop

    const mouseEvent = getMouseDownEvent(offsetX, offsetY)

    slider.mousedown(mouseEvent)
    // FIXME: Use 'mouseup' event type
    slider.mouseup(mouseEvent)

    const expectedValue = slider.options.ticks[tickIndex]
    expect(slider.getValue()).toBe(expectedValue)
  }

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
