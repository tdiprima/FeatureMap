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
    # grab the image dimensions
    h = png.shape[0]
    w = png.shape[1]
    print('row, column:', h, w)  # row, column

    if not os.path.exists(os.path.join(svs_fol, slide_ID + slide_ext)):
        print('File not found: ', os.path.join(svs_fol, slide_ID + slide_ext))
        continue

    # Get patch size
    pw_20X = 100
    oslide = openslide.OpenSlide(os.path.join(svs_fol, slide_ID + slide_ext))
    if openslide.PROPERTY_NAME_MPP_X in oslide.properties:
        mag = 10.0 / float(oslide.properties[openslide.PROPERTY_NAME_MPP_X])
    elif "XResolution" in oslide.properties:
        mag = 10.0 / float(oslide.properties["XResolution"])
    else:
        mag = 10.0 / float(0.254)
    pw = pw_20X * mag / 20.0
    print('pw', str(pw))

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
            w) + ', "png_h":' + str(h) + ', "patch_w":' + str(pw) + ', "patch_h":' + str(pw) + '}'
        feature_writer.writerow([a_string])

        # HEADER
        # TIL, Cancer, and Tissue
        feature_writer.writerow(['i', 'j', 'TIL', 'Cancer', 'Tissue'])  # i = x = png_width; j = y = png_height
        # TIL, Necrosis, and Tissue
        # feature_writer.writerow(['i', 'j', 'TIL', 'Necrosis', 'Tissue'])  # i = x = png_width; j = y = png_height

        # loop over the image, pixel by pixel
        for x in range(0, w):
            for y in range(0, h):
                # opencv is bgr
                feature_writer.writerow([x, y, png[y, x][2], png[y, x][1], png[y, x][0]])

    f.close()

print('Done.')
