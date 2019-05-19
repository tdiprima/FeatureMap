#!/usr/bin/env python

import os
import numpy as np
import pandas as pd
import json


def create_csv(input, output):
    df = pd.read_csv(input)

    obj = {"img_width": df['image_width'].iloc[0],
           "img_height": df['image_height'].iloc[0],
           "patch_w": df['patch_width'].iloc[0],
           "patch_h": df['patch_height'].iloc[0],
           "png_w": df['image_width'].iloc[0] / df['patch_width'].iloc[0],
           "png_h": df['image_height'].iloc[0] / df['patch_height'].iloc[0]}

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
    modified['Tissue'] = 255
    # print(modified)
    # modified.to_csv(output, index=False)
    with open(output, 'a') as f:
        modified.to_csv(f, mode='a', header=False, index=False)


cwd = os.getcwd()
for filename in os.listdir(cwd):
    if filename.endswith(".csv"):
        create_csv(os.path.join(cwd, filename), filename + '.1')
