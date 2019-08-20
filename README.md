# FeatureMap

## FeatureMap for PathDB

Upload TIL map data and interact with feature probabilities on generated map image.


Based on: <a href="https://mathbiol.github.io/tilmap/" target="blank">tilmap</a>


### Input data format

```
{
    "metadata": {
        "img_width": number,
        "img_height": number,
        "png_w": number,
        "png_h": number,
        "patch_w": number,
        "patch_h": number
    },
    "data": {
        "locations": {
            "i": [list of 'i' (aka 'x' coordinates)],
            "j": [list of 'j' (aka 'y' coordinates)]
        },
        "features": {
            "TIL": [ list of feature data corresponding to i,j (see above) ],
            "Cancer": [ list of feature data corresponding to i,j (see above) ],
            "Tissue": [ list of feature data corresponding to i,j (see above) ]
        }
    }
}
```


## For developers
### Basic Flow

1. `tilmap()`
Firstly, check querystring parameters.<br>
Input - CSV<br>
Output - PNG to screen<br>
Convert CSV to image and display image on screen.

2. `calcTILfun()`<br>
Main function.<br>
Calculate TIL, build dynamic interface.

3. `segment()`<br>
Draw yellow (or magenta) line around the edges of nuclear material.

5. `transpire()`<br>
Calculate transparency.

6. `canvasAlign()`<br>
Make sure both canvases stay aligned with each other.
