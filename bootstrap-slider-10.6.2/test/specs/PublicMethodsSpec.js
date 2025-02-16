describe('Public Method Tests', function () {
  let testSlider

  describe('slider constructor', function () {
    describe('returns a jQuery object if it is called on a jQuery object with zero or more matching elements', function () {
      it('returns a jQuery object if it is called on with no matching elements', function () {
        testSlider = $()
        expect(testSlider.slider() instanceof jQuery).toBe(true)
      })
      it('returns a jQuery object if it is called on with one matching element', function () {
        testSlider = $('#testSlider1')
        expect(testSlider.slider() instanceof jQuery).toBe(true)
      })
      it('returns a jQuery object if it is called on with multiple matching elements', function () {
        testSlider = $('#testSlider1, #testSlider2')
        expect(testSlider.slider() instanceof jQuery).toBe(true)
      })
    })

    it("reads and sets the 'id' attribute of the slider instance that is created", function () {
      const sliderId = 'mySlider'

      testSlider = $('#testSlider1').slider({
        id: sliderId
      })

      const sliderInstanceHasExpectedId = $('#testSlider1').siblings('div.slider').is('#' + sliderId)
      expect(sliderInstanceHasExpectedId).toBeTruthy()
    })

    it('generates multiple slider instances from selector', function () {
      $('.makeSlider').slider()
      const sliderInstancesExists = $('.makeSlider').siblings().is('.slider')
      expect(sliderInstancesExists).toBeTruthy()
      const sliderInstancesCount = $('.makeSlider').siblings('.slider').length
      expect(sliderInstancesCount).toEqual(2)

      $('.makeSlider').slider('destroy')
    })

    it("reads and sets the 'min' option properly", function () {
      const minVal = -5

      testSlider = $('#testSlider1').slider({
        min: minVal
      })
      testSlider.slider('setValue', minVal)

      const sliderValue = testSlider.slider('getValue')
      expect(sliderValue).toBe(minVal)
    })

    it("reads and sets the 'max' option properly", function () {
      const maxVal = 15

      testSlider = $('#testSlider1').slider({
        max: maxVal
      })
      testSlider.slider('setValue', maxVal)

      const sliderValue = testSlider.slider('getValue')
      expect(sliderValue).toBe(maxVal)
    })

    it("reads and sets the 'precision' option properly", function () {
      testSlider = $('#testSlider1').slider({
        precision: 2
      })
      testSlider.slider('setValue', 8.115)

      const sliderValue = testSlider.slider('getValue')
      expect(sliderValue).toBe(8.12)
    })

    it("reads and sets the 'orientation' option properly", function () {
      const orientationVal = 'vertical'

      testSlider = $('#testSlider1').slider({
        orientation: orientationVal
      })

      const orientationClassApplied = $('#testSlider1').siblings('div.slider').hasClass('slider-vertical')
      expect(orientationClassApplied).toBeTruthy()
    })

    it("reads and sets the 'value' option properly", function () {
      const val = 8

      testSlider = $('#testSlider1').slider({
        value: val
      })
      testSlider.slider('setValue', val)

      const sliderValue = testSlider.slider('getValue')
      expect(sliderValue).toBe(val)
    })

    it("reads and sets the 'selection' option properly", function () {
      const selectionVal = 'after'
      const maxSliderVal = 10

      testSlider = $('#testSlider1').slider({
        selection: selectionVal
      })
      testSlider.slider('setValue', maxSliderVal)

      const sliderSelectionWidthAtMaxValue = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-selection').width()
      expect(sliderSelectionWidthAtMaxValue).toBe(0)
    })

    it("updates the 'selection' option properly", function () {
      const selectionVal = 'none'
      const maxSliderVal = 10

      testSlider = $('#testSlider1').slider({
        selection: selectionVal
      })
      testSlider.slider('setValue', maxSliderVal)
      testSlider.slider('refresh')

      const sliderSelectionHasHideClass_A = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-track-low').hasClass('hide')
      expect(sliderSelectionHasHideClass_A).toBe(true)
      const sliderSelectionHasHideClass_B = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-selection').hasClass('hide')
      expect(sliderSelectionHasHideClass_B).toBe(true)
      const sliderSelectionHasHideClass_C = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-track-high').hasClass('hide')
      expect(sliderSelectionHasHideClass_C).toBe(true)

      const newSelectionVal = 'after'
      testSlider.slider('setAttribute', 'selection', newSelectionVal)
      testSlider.slider('refresh')

      const sliderSelectionHasHideClass_D = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-track-low').hasClass('hide')
      expect(sliderSelectionHasHideClass_D).toBe(false)
      const sliderSelectionHasHideClass_E = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-selection').hasClass('hide')
      expect(sliderSelectionHasHideClass_E).toBe(false)
      const sliderSelectionHasHideClass_F = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-track-high').hasClass('hide')
      expect(sliderSelectionHasHideClass_F).toBe(false)
    })
    it("reads and sets the 'handle' option properly", function () {
      const handleVal = 'triangle'

      testSlider = $('#testSlider1').slider({
        handle: handleVal
      })

      const handleIsSetToTriangle = $('#testSlider1').siblings('.slider').children('div.slider-handle').hasClass('triangle')
      expect(handleIsSetToTriangle).toBeTruthy()
    })

    it("reads and sets the 'reversed' option properly", function () {
      const reversedVal = true
      const maxSliderVal = 10

      testSlider = $('#testSlider1').slider({
        reversed: reversedVal
      })
      testSlider.slider('setValue', maxSliderVal)

      const sliderSelectionHeightAtMaxValue = $('#testSlider1').siblings('.slider').children('div.slider-track').children('div.slider-selection').width()
      expect(sliderSelectionHeightAtMaxValue).toBe(0)
    })

    it("reads and sets the 'formatter' option properly", function () {
      const tooltipFormatter = function (value) {
        return 'Current value: ' + value
      }

      testSlider = $('#testSlider1').slider({
        formatter: tooltipFormatter
      })
      testSlider.slider('setValue', 9)

      const tooltipMessage = $('#testSlider1').siblings('.slider').find('div.tooltip').children('div.tooltip-inner').text()
      const expectedMessage = tooltipFormatter(9)
      expect(tooltipMessage).toBe(expectedMessage)
    })

    it("reads and sets the 'enabled' option properly", function () {
      testSlider = $('#testSlider1').slider({
        enabled: false
      })
      const isEnabled = testSlider.slider('isEnabled')
      expect(isEnabled).not.toBeTruthy()
    })

    describe("reads and sets the 'tooltip' option properly", function () {
      it("tooltip is not shown if set to 'hide'", function () {
        testSlider = $('#testSlider1').slider({
          tooltip: 'hide'
        })

        const tooltipIsHidden = testSlider.siblings('.slider').children('div.tooltip').hasClass('hide')
        expect(tooltipIsHidden).toBeTruthy()
      })

      it("tooltip is shown during sliding if set to 'show'", function () {
        testSlider = $('#testSlider1').slider({
          tooltip: 'show'
        })

        const tooltipIsHidden = !($('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in'))
        expect(tooltipIsHidden).toBeTruthy()

        // Trigger hover
        const mouseenterEvent = document.createEvent('Events')
        mouseenterEvent.initEvent('mouseenter', true, true)
        testSlider.data('slider').sliderElem.dispatchEvent(mouseenterEvent)

        const tooltipIsShownAfterSlide = $('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in')
        expect(tooltipIsShownAfterSlide).toBeTruthy()
      })

      it('tooltip is shown on mouse over and hides correctly after mouse leave', function () {
        testSlider = $('#testSlider1').slider({
          tooltip: 'show'
        })

        const tooltipIsHidden = !($('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in'))
        expect(tooltipIsHidden).toBeTruthy()

        // Trigger hover
        const mouseenterEvent = document.createEvent('Events')
        mouseenterEvent.initEvent('mouseenter', true, true)
        testSlider.data('slider').sliderElem.dispatchEvent(mouseenterEvent)

        const tooltipIsShownAfterSlide = $('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in')
        expect(tooltipIsShownAfterSlide).toBeTruthy()

        // Trigger leave
        const mouseleaveEvent = document.createEvent('Events')
        mouseleaveEvent.initEvent('mouseleave', true, true)
        testSlider.data('slider').sliderElem.dispatchEvent(mouseleaveEvent)

        const tooltipIsAgainHidden = !($('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in'))
        expect(tooltipIsAgainHidden).toBeTruthy()
      })

      it("tooltip is always shown if set to 'always'", function () {
        testSlider = $('#testSlider1').slider({
          tooltip: 'always'
        })

        const tooltipIsShown = $('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in')
        expect(tooltipIsShown).toBeTruthy()
      })

      it("defaults to 'show' option if invalid value is passed", function () {
        testSlider = $('#testSlider1').slider({
          tooltip: 'invalid option value'
        })

        const tooltipIsHidden = !($('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in'))
        expect(tooltipIsHidden).toBeTruthy()

        // Trigger hover
        const mouseenterEvent = document.createEvent('Events')
        mouseenterEvent.initEvent('mouseenter', true, true)
        testSlider.data('slider').sliderElem.dispatchEvent(mouseenterEvent)

        const tooltipIsShownOnHover = $('#testSlider1').siblings('.slider').children('div.tooltip').hasClass('in')
        expect(tooltipIsShownOnHover).toBeTruthy()
      })
    })
  })

  describe("'setValue()' tests", function () {
    const formatInvalidInputMsg = function (invalidValue) { return "Invalid input value '" + invalidValue + "' passed in" }

    describe('if slider is a single value slider', function () {
      beforeEach(function () {
        testSlider = $('#testSlider1').slider()
      })

      it('properly sets the value of the slider when given a numeric value', function () {
        const valueToSet = 5
        testSlider.slider('setValue', valueToSet)

        const sliderValue = testSlider.slider('getValue')
        expect(sliderValue).toBe(valueToSet)
      })

      it('properly sets the value of the slider when given a string value', function () {
        const valueToSet = '5'
        testSlider.slider('setValue', valueToSet)

        const sliderValue = testSlider.slider('getValue')
        expect(sliderValue).toBe(5)
      })

      it('if a value passed in is greater than the max (10), the slider only goes to the max', function () {
        const maxValue = 10
        const higherThanSliderMaxVal = maxValue + 5

        testSlider.slider('setValue', higherThanSliderMaxVal)

        const sliderValue = testSlider.slider('getValue')
        expect(sliderValue).toBe(maxValue)
      })

      it('if a value passed in is less than the min (0), the slider only goes to the min', function () {
        const minValue = 0
        const lowerThanSliderMaxVal = minValue - 5

        testSlider.slider('setValue', lowerThanSliderMaxVal)

        const sliderValue = testSlider.slider('getValue')
        expect(sliderValue).toBe(minValue)
      })

      it("sets the 'value' property of the slider <input> element", function () {
        const value = 9
        testSlider.slider('setValue', value)

        let currentValue = document.querySelector('#testSlider1').value
        currentValue = parseFloat(currentValue)

        expect(currentValue).toBe(value)
      })

      it("sets the 'value' attribute of the slider <input> element", function () {
        const value = 9
        testSlider.slider('setValue', value)

        let currentValue = document.querySelector('#testSlider1').getAttribute('value')
        currentValue = parseFloat(currentValue)

        expect(currentValue).toBe(value)
      })

      describe('when an invalid value type is passed in', function () {
        let invalidValue

        beforeEach(function () {
          invalidValue = 'a'
        })

        it('throws an error and does not alter the slider value', function () {
          const originalSliderValue = testSlider.slider('getValue')

          const settingValue = function () {
            testSlider.slider('setValue', invalidValue)
          }
          expect(settingValue).toThrow(new Error(formatInvalidInputMsg(invalidValue)))

          const sliderValue = testSlider.slider('getValue')
          expect(sliderValue).toBe(originalSliderValue)
        })
      })
    })

    describe('if slider is a range slider', function () {
      beforeEach(function () {
        testSlider = $('#testSlider1').slider({
          value: [3, 8]
        })
      })

      it('properly sets the values if both within the max and min', function () {
        const valuesToSet = [5, 7]
        testSlider.slider('setValue', valuesToSet)

        const sliderValues = testSlider.slider('getValue')
        expect(sliderValues[0]).toBe(valuesToSet[0])
        expect(sliderValues[1]).toBe(valuesToSet[1])
      })

      describe('caps values to the min if they are set to be less than the min', function () {
        const minValue = -5
        const otherValue = 7

        it('first value is capped to min', function () {
          testSlider.slider('setValue', [minValue, otherValue])

          const sliderValues = testSlider.slider('getValue')
          expect(sliderValues[0]).toBe(0)
        })

        it('second value is capped to min', function () {
          testSlider.slider('setValue', [otherValue, minValue])

          const sliderValues = testSlider.slider('getValue')
          expect(sliderValues[1]).toBe(0)
        })
      })

      describe('caps values to the max if they are set to be higher than the max', function () {
        const maxValue = 15
        const otherValue = 7

        it('first value is capped to max', function () {
          testSlider.slider('setValue', [maxValue, otherValue])

          const sliderValues = testSlider.slider('getValue')
          expect(sliderValues[0]).toBe(10)
        })

        it('second value is capped to max', function () {
          testSlider.slider('setValue', [otherValue, maxValue])

          const sliderValues = testSlider.slider('getValue')
          expect(sliderValues[1]).toBe(10)
        })
      })

      describe('if either value is of invalid type', function () {
        const invalidValue = 'a'
        const otherValue = 7

        it('first value is of invalid type', function () {
          const setSliderValueFn = function () {
            testSlider.slider('setValue', [invalidValue, otherValue])
          }
          expect(setSliderValueFn).toThrow(new Error(formatInvalidInputMsg(invalidValue)))
        })
        it('second value is of invalid type', function () {
          const setSliderValueFn = function () {
            testSlider.slider('setValue', [otherValue, invalidValue])
          }
          expect(setSliderValueFn).toThrow(new Error(formatInvalidInputMsg(invalidValue)))
        })
      })
    })

    describe('triggerSlideEvent argument', function () {
      it("if triggerSlideEvent argument is true, the 'slide' event is triggered", function () {
        const testSlider = $('#testSlider1').slider({
          value: 3
        })

        const newSliderVal = 5

        testSlider.on('slide', function (evt) {
          expect(newSliderVal).toEqual(evt.value)
        })

        testSlider.slider('setValue', newSliderVal, true)
      })

      it("if triggerSlideEvent argument is false, the 'slide' event is not triggered", function () {
        const newSliderVal = 5
        let slideEventTriggered = false
        const testSlider = $('#testSlider1').slider({
          value: 3
        })

        testSlider.on('slide', function () {
          slideEventTriggered = true
        })
        testSlider.slider('setValue', newSliderVal, false)

        expect(slideEventTriggered).toEqual(false)
      })
    })

    describe('triggerChangeEvent argument', function () {
      it("if triggerChangeEvent argument is true, the 'change' event is triggered", function () {
        const testSlider = $('#testSlider1').slider({
          value: 3
        })

        const newSliderVal = 5

        testSlider.on('change', function (evt) {
          expect(newSliderVal).toEqual(evt.value.newValue)
        })

        testSlider.slider('setValue', newSliderVal, true)
      })

      it("if triggerChangeEvent argument is false, the 'change' event is not triggered", function () {
        let changeEventTriggered = false
        const testSlider = $('#testSlider1').slider({
          value: 3
        })

        testSlider.on('change', function () {
          changeEventTriggered = true
        })
        testSlider.slider('setValue', 5, false)

        expect(changeEventTriggered).toEqual(false)
      })
    })
  })

  describe("'getValue()' tests", function () {
    it('returns the current value of the slider', function () {
      testSlider = $('#testSlider1').slider()

      const valueToSet = 5
      testSlider.slider('setValue', valueToSet)

      const sliderValue = testSlider.slider('getValue')
      expect(sliderValue).toBe(valueToSet)
    })
  })

  describe("'enable()' tests", function () {
    it('correctly enables a slider', function () {
      testSlider = $('#testSlider1').slider({
        enabled: false
      })
      testSlider.slider('enable')
      const isEnabled = testSlider.slider('isEnabled')
      expect(isEnabled).toBeTruthy()
    })
  })

  describe("'disable()' tests", function () {
    it('correctly disable a slider', function () {
      testSlider = $('#testSlider1').slider()
      testSlider.slider('disable')
      const isEnabled = testSlider.slider('isEnabled')
      expect(isEnabled).not.toBeTruthy()
    })
  })

  describe("'toggle()' tests", function () {
    it('correctly enables a disabled slider', function () {
      testSlider = $('#testSlider1').slider({
        enabled: false
      })
      testSlider.slider('toggle')
      const isEnabled = testSlider.slider('isEnabled')
      expect(isEnabled).toBeTruthy()
    })

    it('correctly disables an enabled slider', function () {
      testSlider = $('#testSlider1').slider()
      testSlider.slider('toggle')
      const isEnabled = testSlider.slider('isEnabled')
      expect(isEnabled).not.toBeTruthy()
    })
  })

  describe("'isEnabled()' tests", function () {
    it('returns true for an enabled slider', function () {
      testSlider = $('#testSlider1').slider({
        id: 'enabled',
        enabled: true
      })

      const isEnabled = testSlider.slider('isEnabled')
      const $slider = testSlider.siblings('#enabled')
      const hasDisabledClass = $slider.hasClass('slider') && $slider.hasClass('#enabled')

      expect(isEnabled).toBeTruthy()
      expect(hasDisabledClass).not.toBeTruthy()
    })

    it('returns false for a disabled slider', function () {
      testSlider = $('#testSlider1').slider({
        id: 'disabled',
        enabled: false
      })

      const isEnabled = testSlider.slider('isEnabled')
      const $slider = testSlider.siblings('#disabled')
      const hasDisabledClass = $slider.hasClass('slider') && $slider.hasClass('slider-disabled')

      expect(isEnabled).not.toBeTruthy()
      expect(hasDisabledClass).toBeTruthy()
    })
  })

  it('get attribute', function () {
    testSlider = $('#testSlider1').slider()

    const sliderMaxValue = testSlider.slider('getAttribute', 'max')
    expect(sliderMaxValue).toBe(10)
  })

  it('changes slider from basic to range', function () {
    testSlider = $('#makeRangeSlider').slider()
    testSlider.slider('setAttribute', 'range', true).slider('refresh')

    const isRangeSlider = $('#changeOrientationSlider').parent('div.slider').find('.slider-handle').last().hasClass('hide')
    expect(isRangeSlider).toBeFalsy()
  })

  it("setAttribute: changes the 'data-slider-orientation' property from horizontal to vertical", function () {
    testSlider = $('#changeOrientationSlider').slider({
      id: 'changeOrientationSliderElem'
    })
    testSlider.slider('setAttribute', 'orientation', 'vertical').slider('refresh')

    const $slider = $('#changeOrientationSliderElem')
    const orientationClassApplied = $slider.hasClass('slider-vertical')

    expect(orientationClassApplied).toBeTruthy()
  })

  it('relayout: if slider is not displayed on initialization and then displayed later on, relayout() will not adjust the margin-left of the tooltip', function () {
    // Setup
    testSlider = new Slider('#relayoutSliderInput', {
      id: 'relayoutSlider',
      min: 0,
      max: 10,
      value: 5
    })
    const mainTooltipDOMRef = document.querySelector('#relayoutSlider .tooltip-main')
    const relayoutSliderContainerDOMRef = document.querySelector('#relayoutSliderContainer')
    let tooltipMarginLeft
    // Main tooltip margin-left offset should not be set on slider intialization
    tooltipMarginLeft = parseFloat(mainTooltipDOMRef.style.marginLeft)
    expect(tooltipMarginLeft).toBeNaN()
    // Show slider and call relayout()
    relayoutSliderContainerDOMRef.style.display = 'block'
    testSlider.relayout()
    // Main tooltip margin-left offset should not be set after relayout() is called.
    tooltipMarginLeft = Math.abs(parseFloat(mainTooltipDOMRef.style.marginLeft))
    expect(tooltipMarginLeft).toBeNaN()
  })

  it('relayout: if slider is not displayed on initialization and then displayed later on, relayout() will re-adjust the tick label width', function () {
    // Setup
    testSlider = new Slider('#relayoutSliderInputTickLabels', {
      id: 'relayoutSliderTickLabels',
      min: 0,
      max: 10,
      ticks: [0, 5, 10],
      ticks_labels: ['low', 'mid', 'high'],
      value: 5
    })

    const $ticks = $('#relayoutSliderTickLabels').find('.slider-tick-label')

    // Tick-Width should be 0 on slider intialization
    let i, $tick
    for (i = 0; i < $ticks.length; i++) {
      $tick = $($ticks[i])
      expect(parseInt($tick.css('width'))).toBe(0)
    }

    // Show slider and call relayout()
    $('#relayoutSliderContainerTickLabels').css('display', 'block')
    testSlider.relayout()
    $('#relayoutSliderContainerTickLabels').css('display', 'none')

    // Tick-Width should re-adjust to be > 0
    for (i = 0; i < $ticks.length; i++) {
      $tick = $($ticks[i])
      expect(parseInt($tick.css('width'))).toBeGreaterThan(0)
    }
  })

  afterEach(function () {
    if (testSlider) {
      if (testSlider instanceof jQuery) { testSlider.slider('destroy') }
      if (testSlider instanceof Slider) { testSlider.destroy() }
      testSlider = null
    }
  })
})
