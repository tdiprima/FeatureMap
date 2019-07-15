import csv
import json
import sys

import pandas as pd
from time import perf_counter


def get_metadata(filename):
    my_obj = {}
    try:
        # Get first line (metadata)
        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            # Each row is a list
            for row in csv_reader:
                # Get the metadata
                if line_count == 0:
                    line_count += 1
                    x = json.loads(row[0])
                    my_obj["metadata"] = x
        csv_file.close()
    except FileNotFoundError as e:
        print(filename, ":", e.strerror)
        exit(1)
    except:
        print("Unexpected error:", sys.exc_info()[0])
        raise
    # print(my_obj["metadata"])
    return my_obj


def get_data(filename):
    my_obj = {
        "data": {
            "locations": {
                "i": [],
                "j": []
            },
            "features": {
            }
        }
    }
    df = pd.read_csv(filename, skiprows=[0])  # Skipping metadata row
    n_rows, n_columns = df.shape
    my_obj["data"]["locations"]["i"] = df["i"].tolist()  # Get column data
    my_obj["data"]["locations"]["j"] = df["j"].tolist()

    for x in range(2, n_columns):  # Skipping i, j columns
        # Save feature data to our dictionary
        my_obj["data"]["features"][df.columns[x]] = df[df.columns[x]].tolist()

    return my_obj


def save_file(filename, data1, data2):
    final_obj = {}
    final_obj.update(data1)
    final_obj.update(data2)
    json_str = json.dumps(final_obj)
    f = open(filename, "w")
    f.write(json_str)
    f.close()


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print('File name is...?')
        exit(1)

    start_clock = perf_counter()
    f = sys.argv[1]
    meta = get_metadata(f)
    data = get_data(f)
    save_file(f.replace("csv", "json"), meta, data)
    duration = perf_counter() - start_clock
    print(duration)
