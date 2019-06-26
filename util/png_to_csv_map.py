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


def get_patch_size(slide_ID):
    pw_20X = 100
    slide = openslide.OpenSlide(os.path.join(svs_fol, slide_ID + slide_ext))
    w_wsi, h_wsi = slide.dimensions
    magx = mag_x(slide)
    magy = mag_y(slide)
    w_patch = pw_20X * magx / 20.0
    h_patch = pw_20X * magy / 20.0
    return w_wsi, h_wsi, w_patch, h_patch


def mag_x(slide):
    if openslide.PROPERTY_NAME_MPP_X in slide.properties:
        mag = 10.0 / float(slide.properties[openslide.PROPERTY_NAME_MPP_X])
    elif "XResolution" in slide.properties:
        mag = 10.0 / float(slide.properties["XResolution"])
    else:
        mag = 10.0 / float(0.254)
    return mag


def mag_y(slide):
    if openslide.PROPERTY_NAME_MPP_Y in slide.properties:
        mag = 10.0 / float(slide.properties[openslide.PROPERTY_NAME_MPP_Y])
    elif "YResolution" in slide.properties:
        mag = 10.0 / float(slide.properties["YResolution"])
    else:
        mag = 10.0 / float(0.254)
    return mag


def get_patch_size2(slide_ID):
    slide = openslide.OpenSlide(os.path.join(svs_fol, slide_ID + slide_ext))
    w_wsi = slide.dimensions[0]
    h_wsi = slide.dimensions[1]

    if mag_x(slide) >= 40:
        w_patch = 200
        h_patch = 200
    else:
        w_patch = 100
        h_patch = 100
    return w_wsi, h_wsi, w_patch, h_patch


def get_patch_size1(slide_ID, w_png, h_png):
    slide = openslide.OpenSlide(os.path.join(svs_fol, slide_ID + slide_ext))
    '''
    There is no information about the patch width/height from the png files.
    The width/height can be computed given the width/height of the WSI.
    Let's say the width of the WSI is w_wsi, the width of the png is w_png, then
    the patch width is w_wsi/w_png.
    '''
    w_wsi, h_wsi = slide.dimensions
    w_patch = w_wsi / float(w_png)
    h_patch = h_wsi / float(h_png)
    return w_wsi, h_wsi, w_patch, h_patch


def main():
    # Iterate through pngs in input folder
    fns = [f for f in os.listdir(png_fol) if '.png' in f]
    for ind, fn in enumerate(fns):
        slide_ID = fn.split('.png')[0]  # get base name
        png = cv2.imread(png_fol + '/' + fn, cv2.IMREAD_COLOR)  # Loads a color image.
        # grab the image dimensions (row, column)
        h_png = png.shape[0]
        w_png = png.shape[1]

        if not os.path.exists(os.path.join(svs_fol, slide_ID + slide_ext)):
            print('File not found: ', os.path.join(svs_fol, slide_ID + slide_ext))
            continue

        w_wsi, h_wsi, w_patch, h_patch = get_patch_size(slide_ID)
        # print(w_wsi, w_png, "|", h_wsi, h_png)

        res_file = os.path.join(out_fol, slide_ID + '.csv')
        print('OUT: ' + res_file)
        if os.path.exists(res_file):
            continue
        print(ind, fn)

        # Write CSV file from input image pixels
        with open(res_file, mode='w') as f:
            feature_writer = csv.writer(f, delimiter=',', quotechar='"')

            # METADATA
            a_string = '{"img_width":' + str(w_wsi) + ', "img_height":' + str(h_wsi) + ', "png_w":' + str(
                w_png) + ', "png_h":' + str(h_png) + ', "patch_w":' + str(int(w_patch)) + ', "patch_h":' + str(
                int(h_patch)) + '}'
            feature_writer.writerow([a_string])

            # HEADER
            # TIL, Cancer, and Tissue
            feature_writer.writerow(['i', 'j', 'TIL', 'Cancer', 'Tissue'])  # i = x = png_width; j = y = png_height
            # TIL, Necrosis, and Tissue
            # feature_writer.writerow(['i', 'j', 'TIL', 'Necrosis', 'Tissue'])  # i = x = png_width; j = y = png_height

            # loop over the image, pixel by pixel
            for x in range(0, w_png):
                for y in range(0, h_png):
                    if not (png[y, x][0] == 0 and png[y, x][1] == 0 and png[y, x][2] == 0):
                        # OpenCV is bgr
                        feature_writer.writerow([x, y, png[y, x][2], png[y, x][1], png[y, x][0]])

        f.close()
    print('Done.')


if __name__ == "__main__":
    main()
