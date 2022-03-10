/*
	**********************

	Left/Right Track Tests

	**********************

	This spec has tests for checking that the widths of the left and right
	segments are the correct widths and colors, based on their CSS.
 */
describe('Low/High Track Tests', function () {
  const unstyledID = 'low-high-slider'
  const styledID = 'low-high-slider-styled'

  let testSlider

  describe('Single-value sliders, no styling', function () {
    const id = unstyledID

    beforeEach(function () {
      testSlider = $('#testSlider1').slider({
        id: id,
        min: 0,
        max: 10,
        value: 5
      })
    })

    it('low track width is zero', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')
      expect($(leftTrack).css('width')).toBe('0px')
    })

    it('high track width is 50%', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const trackWidth = rightTrack.parent().width()
      expect($(rightTrack).css('width')).toBe((trackWidth / 2) + 'px')
    })

    it('high track is transparent', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const rightColor = rightTrack.css('background-color')
      const isTransparent = rightColor.match(/rgba\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}, 0\)/)
      expect(isTransparent).toBeTruthy()
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.slider('destroy')
        testSlider = null
      }
    })
  })

  describe('Single-value sliders, with styling', function () {
    const id = styledID

    beforeEach(function () {
      testSlider = $('#testSlider1').slider({
        id: id,
        min: 0,
        max: 10,
        value: 5
      })
    })

    it('low track width is zero', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')
      expect($(leftTrack).css('width')).toBe('0px')
    })

    it('high track width is 50%', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const trackWidth = rightTrack.parent().width()
      expect($(rightTrack).css('width')).toBe((trackWidth / 2) + 'px')
    })

    it('high track is red', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const rightColor = rightTrack.css('background-color')
      expect(rightColor).toBe('rgb(255, 0, 0)')
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.slider('destroy')
        testSlider = null
      }
    })
  })

  describe('Range sliders, no styling', function () {
    const id = unstyledID
    const values = {
      min: 0,
      max: 10,
      values: [4, 6]
    }

    beforeEach(function () {
      testSlider = $('#testSlider1').slider({
        id: id,
        min: values.min,
        max: values.max,
        range: true,
        value: values.values
      })
    })

    it('low track width is correct', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')

      const trackWidth = leftTrack.parent().width()
      const expectedWidth = ((values.values[0] - values.min) / (values.max - values.min)) * trackWidth

      expect($(leftTrack).css('width')).toBe(expectedWidth + 'px')
    })

    it('high track width is correct', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const trackWidth = rightTrack.parent().width()

      const expectedWidth = ((values.max - values.values[1]) / (values.max - values.min)) * trackWidth

      expect($(rightTrack).css('width')).toBe(expectedWidth + 'px')
    })

    it('low track is transparent', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')
      const leftColor = leftTrack.css('background-color')
      const isTransparent = leftColor.match(/rgba\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}, 0\)/)
      expect(isTransparent).toBeTruthy()
    })

    it('high track is transparent', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const rightColor = rightTrack.css('background-color')
      const isTransparent = rightColor.match(/rgba\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}, 0\)/)
      expect(isTransparent).toBeTruthy()
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.slider('destroy')
        testSlider = null
      }
    })
  })

  describe('Range sliders, with styling', function () {
    const id = styledID
    const values = {
      min: 0,
      max: 10,
      values: [4, 6]
    }

    beforeEach(function () {
      testSlider = $('#testSlider1').slider({
        id: id,
        min: values.min,
        max: values.max,
        range: true,
        value: values.values
      })
    })

    it('low track width is correct', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')

      const trackWidth = leftTrack.parent().width()
      const expectedWidth = ((values.values[0] - values.min) / (values.max - values.min)) * trackWidth

      expect($(leftTrack).css('width')).toBe(expectedWidth + 'px')
    })

    it('high track width is correct', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const trackWidth = rightTrack.parent().width()

      const expectedWidth = ((values.max - values.values[1]) / (values.max - values.min)) * trackWidth

      expect($(rightTrack).css('width')).toBe(expectedWidth + 'px')
    })

    it('low track is green', function () {
      const leftTrack = $('#' + id + ' .slider-track-low')
      const leftColor = leftTrack.css('background-color')
      expect(leftColor).toBe('rgb(0, 255, 0)')
    })

    it('high track is red', function () {
      const rightTrack = $('#' + id + ' .slider-track-high')
      const rightColor = rightTrack.css('background-color')
      expect(rightColor).toBe('rgb(255, 0, 0)')
    })

    afterEach(function () {
      if (testSlider) {
        testSlider.slider('destroy')
        testSlider = null
      }
    })
  })
})
