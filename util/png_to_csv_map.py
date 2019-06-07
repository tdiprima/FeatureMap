# About the input data (the png files):
# Cancer maps are done on 350 X 350 wsi patches (40X).
# TIL maps are done on 200 x 200 patches (40X).
# Then we partition the 350x350 into 200x200 and assign new label for each
# 200x200 cancer patch, then combine them with TIL map.
# If the mag is 20X, the patch should be 175 instead of 350.
# If patch width and height do not divide evenly into slide width and height,
# we ignore the remainder, since it is likely to be glass.
import csv
import os

import cv2
import openslide

png_fol = './input'
out_fol = './output'
svs_fol = './svs'
slide_ext = '.svs'

# Iterate through pngs in input folder
fns = [f for f in os.listdir(png_fol) if '.png' in f]
for ind, fn in enumerate(fns):
    print(ind, fn)
    slide_ID = fn.split('.png')[0]  # get base name
    png = cv2.imread(png_fol + '/' + fn, cv2.IMREAD_COLOR)  # Loads a color image.
    # grab the image dimensions (row, column)
    h_png = png.shape[0]
    w_png = png.shape[1]

    if not os.path.exists(os.path.join(svs_fol, slide_ID + slide_ext)):
        print('File not found: ', os.path.join(svs_fol, slide_ID + slide_ext))
        continue

    # Get patch size
    oslide = openslide.OpenSlide(os.path.join(svs_fol, slide_ID + slide_ext))
    '''
    There is no information about the patch width/height from the png files. The width/height can be computed given the width/height of the WSI.
    Let's say the width of the WSI is w_wsi, the width of the png is w_png, then the patch width is w_wsi/w_png.
    '''
    w_wsi, h_wsi = oslide.dimensions
    w_patch = w_wsi / w_png
    h_patch = h_wsi / h_png
    print(str(w_patch), str(h_patch))

    # Get image width and height
    img_width = oslide.dimensions[0]
    img_height = oslide.dimensions[1]
    res_file = os.path.join(out_fol, slide_ID + '.csv')
    print('OUT: ' + res_file)
    if os.path.exists(res_file): continue
    # print(ind, fn)

    # Write CSV file from input image pixels
    with open(res_file, mode='w') as f:
        feature_writer = csv.writer(f, delimiter=',', quotechar='"')

        # METADATA
        a_string = '{"img_width":' + str(img_width) + ', "img_height":' + str(img_height) + ', "png_w":' + str(
            w_png) + ', "png_h":' + str(h_png) + ', "patch_w":' + str(w_patch) + ', "patch_h":' + str(h_patch) + '}'
        feature_writer.writerow([a_string])

        # HEADER
        # TIL, Cancer, and Tissue
        feature_writer.writerow(['i', 'j', 'TIL', 'Cancer', 'Tissue'])  # i = x = png_width; j = y = png_height
        # TIL, Necrosis, and Tissue
        # feature_writer.writerow(['i', 'j', 'TIL', 'Necrosis', 'Tissue'])  # i = x = png_width; j = y = png_height

        # loop over the image, pixel by pixel
        for x in range(0, w_png):
            for y in range(0, h_png):
                # opencv is bgr
                feature_writer.writerow([x, y, png[y, x][2], png[y, x][1], png[y, x][0]])

    f.close()

print('Done.')
