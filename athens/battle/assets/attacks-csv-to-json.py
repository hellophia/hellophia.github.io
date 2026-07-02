import json
import csv

INPUT_FILE = "attacks.csv"
OUTPUT_FILE = "attacks.json"


def convert(value):
    if value == "":
        return ""

    lower = value.lower()

    if lower == "true":
        return True

    if lower == "false":
        return False

    try:
        return int(value)
    except ValueError:
        pass

    try:
        return float(value)
    except ValueError:
        pass

    return value


attacks = []

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        attack = {}
        position = {}

        for key, value in row.items():

            if key == "x":
                position["x"] = convert(value)

            elif key == "y":
                position["y"] = convert(value)

            else:
                attack[key] = convert(value)

        attack["position"] = position
        attacks.append(attack)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(attacks, f, indent=4)

print(f"Wrote {OUTPUT_FILE}")