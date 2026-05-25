import csv

input_file = "items.csv"
output_file = "items.txt"

entries = []

with open(input_file, newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:

        item = row["item"].strip()
        found = row["found"].strip().lower()
        hint = row["hint"].strip()
        image = row["image"].strip()

        # Convert true/false text into Harlowe booleans
        found_value = "true" if found == "true" else "false"

        # Escape quotation marks
        hint = hint.replace('"', '\\"')
        image = image.replace('"', '\\"')

        entry = f'''"{item}", (dm:
    "found", {found_value},
    "hint", "{hint}",
    "image", "{image}"
)'''

        entries.append(entry)

harlowe = "(set: $items to (dm:\n\n"
harlowe += ",\n\n".join(entries)
harlowe += "\n\n))"

with open(output_file, "w", encoding="utf-8") as outfile:
    outfile.write(harlowe)

print("Done!")