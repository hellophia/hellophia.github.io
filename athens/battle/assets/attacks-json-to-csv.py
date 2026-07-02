import json
import csv

INPUT_FILE = "attacks.json"
OUTPUT_FILE = "attacks.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# Build the complete set of field names
fieldnames = []

for attack in data:
    for key in attack.keys():
        if key == "position":
            if "x" not in fieldnames:
                fieldnames.append("x")
            if "y" not in fieldnames:
                fieldnames.append("y")
        elif key not in fieldnames:
            fieldnames.append(key)

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

    for attack in data:
        row = {}

        for key, value in attack.items():
            if key == "position":
                row["x"] = value.get("x")
                row["y"] = value.get("y")
            else:
                row[key] = value

        writer.writerow(row)

print(f"Wrote {OUTPUT_FILE}")