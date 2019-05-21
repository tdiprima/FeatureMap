#!/usr/bin/env python

import json
import os

import numpy as np
import pandas as pd


def create_csv(input, output, red, r_name, green, g_name):
    # Read CSV
    df = pd.read_csv(input)

    # Create first row JSON
    imw = df['image_width'].iloc[0]
    imh = df['image_height'].iloc[0]
    pw = df['patch_width'].iloc[0]
    ph = df['patch_height'].iloc[0]

    obj = {"img_width": str(imw),
           "img_height": str(imh),
           "patch_w": str(pw),
           "patch_h": str(ph),
           "png_w": str(np.ceil(imw / pw).astype(int)),
           "png_h": str(np.ceil(imh / ph).astype(int))}

    blue = 'Tissue'

    # Write first row JSON
    with open(output, 'w') as f:
        f.write(json.dumps(obj) + '\n')
        f.write('i,j,' + r_name + ',' + g_name + ',Tissue\n')

    x = 'patch_x'
    y = 'patch_y'

    # Columns
    modified = df[[x, y, red, green]]

    # Sort
    modified = modified.sort_values([x, y], ascending=[1, 1])

    # Clean
    modified.loc[modified[green] == 'None', [green]] = [0]
    modified[green] = pd.to_numeric(modified[green])

    # Adjust for PNG
    modified['i'] = modified[x] / pw
    modified['j'] = modified[y] / ph
    modified['r'] = modified[red] * 255  # normalize 0:1 to 0:255
    modified['g'] = modified[green] * 255  # normalize 0:1 to 0:255

    # Round up
    modified.i = np.ceil(modified.i).astype(int)
    modified.j = np.ceil(modified.j).astype(int)
    modified.r = np.ceil(modified.r).astype(int)
    modified.g = np.ceil(modified.g).astype(int)

    # Tissue
    modified[blue] = 0
    modified.loc[modified[red] > 0, [blue]] = ['255']

    # Columns
    modified = modified[['i', 'j', 'r', 'g', blue]]

    # Nice name
    modified = modified.rename(index=str, columns={"r": r_name})
    modified = modified.rename(index=str, columns={"g": g_name})

    # Write
    with open(output, 'a') as f:
        modified.to_csv(f, mode='a', header=False, index=False)


def do_one_feature(input, output):
    df = pd.read_csv(input)

    imw = df['image_width'].iloc[0]
    imh = df['image_height'].iloc[0]
    pw = df['patch_width'].iloc[0]
    ph = df['patch_height'].iloc[0]

    obj = {"img_width": str(imw),
           "img_height": str(imh),
           "patch_w": str(pw),
           "patch_h": str(ph),
           "png_w": str(np.ceil(imw / pw).astype(int)),
           "png_h": str(np.ceil(imh / ph).astype(int))}

    # print(obj)

    with open(output, 'w') as f:
        f.write(json.dumps(obj) + '\n')
        f.write('i,j,Nuclear Ratio,Cancer,Tissue\n')

    cols = list(df.columns)
    modified = df[cols[5:7] + cols[11:12]]
    modified = modified.sort_values(['patch_x', 'patch_y'], ascending=[1, 1])
    modified['i'] = modified['patch_x'] / df['patch_width']
    modified['j'] = modified['patch_y'] / df['patch_height']
    modified['n'] = modified['nuclei_ratio'] * 255

    modified.i = np.ceil(modified.i).astype(int)
    modified.j = np.ceil(modified.j).astype(int)
    modified.n = np.ceil(modified.n).astype(int)

    modified.drop("nuclei_ratio", axis=1, inplace=True)
    modified = modified.rename(index=str, columns={"n": "Nuclear Ratio"})

    cols = list(modified.columns)
    modified = modified[cols[2:]]
    modified['Cancer'] = 0
    modified['Tissue'] = 0
    modified.loc[modified['Nuclear Ratio'] > 0, ['Tissue']] = ['255']

    # print(modified)

    # modified.to_csv(output, index=False)
    with open(output, 'a') as f:
        modified.to_csv(f, mode='a', header=False, index=False)


def process_dir():
    # Do for all files in directory:
    cwd = os.getcwd()
    for filename in os.listdir(cwd):
        if filename.endswith(".csv"):
            red = 'nuclei_ratio'
            r_name = 'Nuclear Ratio'
            green = 'fg_glcm_Correlation'
            g_name = 'Fg Glcm Correlation'
            create_csv(os.path.join(cwd, filename), os.path.join(cwd, filename + '.1'), red, r_name, green, g_name)
            # do_one_feature(os.path.join(cwd, filename), filename + '.1')


def process_one():
    # Process one file:
    red = 'nuclei_ratio'
    r_name = 'Nuclear Ratio'
    green = 'fg_glcm_Correlation'
    g_name = 'Fg Glcm Correlation'
    create_csv('input.csv', red + '_' + green + '.csv', red, r_name, green, g_name)
