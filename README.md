# FeatureMap

FeatureMap for PathDB

Upload TIL map data and interact with til/cancer/tissue probabilities on generated image.


Based on: <a href="https://mathbiol.github.io/tilmap/" target="blank">tilmap</a>


### Basic Flow

1. `tilmap()`
Firstly, check querystring parameters.
Input - CSV
Output - PNG to screen
Convert CSV to image and display image on screen.

2. `calcTILfun()`
Main function.
Calculate TIL, build dynamic interface.

3. `segment()`
Draw yellow (or magenta) line around the edges of nuclear material.

5. `transpire()`
Calculate transparency.

6. `canvasAlign()`
Make sure both canvases stay aligned with each other.
