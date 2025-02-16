describe('Element Data Attributes Tests', function () {
  let slider

  it("reads the 'data-slider-min' property and sets it on slider", function () {
    slider = $('#minSlider').slider()
    slider.slider('setValue', 1)

    const sliderValue = slider.slider('getValue')
    expect(sliderValue).toBe(5)
  })

  it("reads the 'data-slider-max' property and sets it on slider", function () {
    slider = $('#maxSlider').slider()
    slider.slider('setValue', 10)

    const sliderValue = slider.slider('getValue')
    expect(sliderValue).toBe(5)
  })

  it("reads the 'data-slider-step' property and sets it on slider", function () {
    slider = $('#stepSlider').slider()
    // TODO How do you test this? Maybe manually trigger a slideChange event?
    expect(true).toBeTruthy()
  })

  it("reads the 'data-slider-precision' property (which is set to 2) and sets it on slider", function () {
    slider = $('#precisionSlider').slider()
    slider.slider('setValue', 8.115)

    const sliderValue = slider.slider('getValue')
    expect(sliderValue).toBe(8.12)
  })

  it("reads the 'data-slider-orientation' property and sets it on slider", function () {
    slider = $('#orientationSlider').slider()

    const orientationIsVertical = $('#orientationSlider').data('slider').options.orientation === 'vertical'
    expect(orientationIsVertical).toBeTruthy()
  })

  it("reads the 'data-slider-value' property and sets it on slider", function () {
    slider = $('#valueSlider').slider()

    const sliderValue = slider.slider('getValue')
    expect(sliderValue).toBe(5)
  })

  it("reads the 'data-slider-ticks-labels' property and sets it on slider", function () {
    slider = $('#sliderWithTickMarksAndLabels').slider()

    const ticksLabelsAreCorrect = arraysEqual($('#sliderWithTickMarksAndLabels').data('slider').options.ticks_labels, ['$0', '$100', '$200', '$300', '$400'])
    expect(ticksLabelsAreCorrect).toBeTruthy()

    function arraysEqual (a, b) {
	  if (a === b) { return true }
	  if (a == null || b == null) { return false }
	  if (a.length !== b.length) { return false }

	  for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) { return false }
	  }
	  return true
    }
  })

  it("reads the 'data-slider-selection' property and sets it on slider", function () {
    slider = $('#selectionSlider').slider({
      id: 'selectionSliderId'
    })
    slider.slider('setValue', 0)

    const newSliderValue = slider.slider('getValue')
    expect(newSliderValue).toBe(0)
  })

  it("reads the 'data-slider-tooltip' property and sets it on slider", function () {
    slider = $('#tooltipSlider').slider({
      id: 'tooltipSliderElem'
    })
    const tooltipIsHidden = $('#tooltipSliderElem').children('div.tooltip').hasClass('hide')
    expect(tooltipIsHidden).toBeTruthy()
  })

  describe("reads the 'data-slider-handle' property and sets it on slider", function () {
    it("applies 'triangle' class tag to handle", function () {
      slider = $('#handleSlider').slider({
        id: 'handleSliderElem'
      })
      const handleIsSetToTriangle = $('#handleSliderElem div.slider-handle').hasClass('triangle')
      expect(handleIsSetToTriangle).toBeTruthy()
    })

    it("applies 'custom' class tag to handle", function () {
      slider = $('#customHandleSlider').slider({
        id: 'customHandleSliderElem'
      })
      const handleIsSetToCustom = $('#customHandleSliderElem div.slider-handle').hasClass('custom')
      expect(handleIsSetToCustom).toBeTruthy()
    })
  })

  it("reads the 'data-slider-reversed' property and sets it on slider", function () {
    slider = $('#reversedSlider').slider({
      id: 'reversedSliderElem'
    })
    slider.slider('setValue', 10)

    const sliderSelectionHeightAtMaxValue = $('#reversedSliderElem div.slider-track').children('div.slider-selection').width()
    expect(sliderSelectionHeightAtMaxValue).toBe(0)
  })

  it("reads the 'data-slider-enabled' property and sets it on slider", function () {
    slider = $('#disabledSlider').slider()
    const isEnabled = slider.slider('isEnabled')
    expect(isEnabled).not.toBeTruthy()
  })

  it("always sets the 'value' attribute of the original <input> element to be the current slider value", function () {
    const $slider = $('#testSliderGeneric')
    const val = 7

    slider = $slider.slider({
      value: val
    })
    const sliderValueAttrib = $slider.val()
    const valAsString = val.toString()

    expect(sliderValueAttrib).toBe(valAsString)
  })

  it("always sets the 'data-value' attribute of the original <input> element to be the current slider value", function () {
    // Setup
    const sliderInputElem = document.getElementById('testSliderGeneric')
    const val = 7

    slider = new Slider(sliderInputElem, {
      value: val
    })

    // Assert
    expect(sliderInputElem.dataset.value).toBe(val.toString())

    // Cleanup
    slider.destroy()
    slider = null
  })

  afterEach(function () {
    if (slider) { slider.slider('destroy') }
  })

  describe("Test element attribute values after calling 'setValue()'", function () {
    let sliderObj

    afterEach(function () {
      if (sliderObj) {
        sliderObj.destroy()
        sliderObj = null
      }
    })

    it("The 'data-value' attribute of the original <input> element should equal the new value", function () {
      // Setup
      const sliderInputElem = document.getElementById('testSliderGeneric')
      const newVal = 7

      sliderObj = new Slider(sliderInputElem, {
        min: 0,
        max: 10,
        value: 5
      })

      sliderObj.setValue(newVal)

      expect(sliderInputElem.dataset.value).toBe(newVal.toString())
    })

    it("The 'value' attribute of the original <input> element should equal the new value", function () {
      const sliderInputElem = document.getElementById('testSliderGeneric')
      const newVal = 7

      sliderObj = new Slider(sliderInputElem, {
        min: 0,
        max: 10,
        value: 5
      })

      sliderObj.setValue(newVal)

      const sliderValueAttrib = sliderInputElem.getAttribute('value')

      expect(sliderValueAttrib).toBe(newVal.toString())
    })

    it("The 'value' property of the original <input> element should equal the new value", function () {
      const sliderInputElem = document.getElementById('testSliderGeneric')
      const newVal = 7

      sliderObj = new Slider(sliderInputElem, {
        min: 0,
        max: 10,
        value: 5
      })

      sliderObj.setValue(newVal)

      expect(sliderInputElem.value).toBe(newVal.toString())
    })
  })
})
