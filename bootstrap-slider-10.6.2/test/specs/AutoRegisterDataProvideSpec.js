describe('Auto register data-provide Tests', function () {
  it('checks that the autoregister Slider was automatically registerd', function () {
    const $el = $('#autoregisterSlider')

    const sliderInstancesExists = $el.siblings().is('.slider')
    expect(sliderInstancesExists).toBeTruthy()

    const sliderInstancesCount = $el.siblings('.slider').length
    expect(sliderInstancesCount).toEqual(1)
  })

  it('checks that the autoregistered Slider can be accessed', function () {
    const $el = $('#autoregisterSlider')

    expect($el.slider('getValue')).toBe(1)

    $el.slider('setValue', 2)

    expect($el.slider('getValue')).toBe(2)
  })
})
