# Import required modules
import json

import numpy as np
import pandas as pd
from sklearn import preprocessing


def normalizer(data):
    dat1 = data[
        ['case_id', 'image_width', 'image_height', 'patch_x', 'patch_y', 'patch_width', 'patch_height', 'nuclei_ratio',
         'nuclei_average_area', 'nuclei_average_perimeter']]

    cols = list(dat1.columns)

    dat2 = dat1[cols[8:]]
    vals = dat2.values  # returns a numpy array
    min_max_scaler = preprocessing.MinMaxScaler()
    x_scaled = min_max_scaler.fit_transform(vals)
    dat2 = pd.DataFrame(x_scaled)
    dat2.columns = ['nuclei_average_area', 'nuclei_average_perimeter']

    dat1 = dat1.drop(['nuclei_average_area', 'nuclei_average_perimeter'], axis=1)

    df_normalized = pd.concat([dat1, dat2], axis=1)
    # x = df_normalized.describe()
    # print(df_normalized)
    return df_normalized


def main():
    filename = 'patch_level_radiomics_feature_TCGA-AO-A0J4-01Z-00-DX1.csv'
    data = pd.read_csv(filename)
    df = normalizer(data)
    obj = create_json(df)
    write_csv(df, obj)
    print('Done')


def write_csv(df, obj):
    output = 'output.csv'
    with open(output, 'w') as f:
        f.write(json.dumps(obj) + '\n')
        f.write('i,j,Nuclear Ratio,Cancer,Tissue,Nuclear Avg Area,Nuclear Avg Perimeter\n')

    cols = list(df.columns)
    modified = df[cols[3:5] + cols[7:]]
    modified = modified.sort_values(['patch_x', 'patch_y'], ascending=[1, 1])
    modified['i'] = modified['patch_x'] / df['patch_width']
    modified['j'] = modified['patch_y'] / df['patch_height']
    modified['a'] = modified['nuclei_ratio'] * 255
    modified['b'] = modified['nuclei_average_area'] * 255
    modified['c'] = modified['nuclei_average_perimeter'] * 255

    modified.i = np.ceil(modified.i).astype(int)
    modified.j = np.ceil(modified.j).astype(int)
    modified.a = np.ceil(modified.a).astype(int)
    modified.b = np.ceil(modified.b).astype(int)
    modified.c = np.ceil(modified.c).astype(int)

    modified.drop("nuclei_ratio", axis=1, inplace=True)
    modified = modified.rename(index=str, columns={"a": "Nuclear Ratio"})

    modified.drop("nuclei_average_area", axis=1, inplace=True)
    modified = modified.rename(index=str, columns={"b": "Nuclear Avg Area"})

    modified.drop("nuclei_average_perimeter", axis=1, inplace=True)
    modified = modified.rename(index=str, columns={"c": "Nuclear Avg Perimeter"})

    cols = list(modified.columns)
    modified = modified[cols[2:]]  # drop patch_x, patch_y
    modified.insert(3, "Cancer", 0)
    modified.insert(4, "Tissue", 0)

    modified.loc[modified['Nuclear Ratio'] > 0, ['Tissue']] = ['255']

    with open(output, 'a') as f:
        modified.to_csv(f, mode='a', header=False, index=False)


def create_json(df):
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

    return obj


if __name__ == "__main__":
    main()
