import csv

input_file = "dialogue.csv"
output_file = "dialogue.txt"

blocks = []
current_entries = []

with open(input_file, newline="", encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)

    for row in reader:

        # Ensure row always has at least 3 columns
        while len(row) < 3:
            row.append("")

        character = row[0].strip()
        mood = row[1].strip()
        text = row[2].strip()

        # Empty row = start new dialogue block
        if character == "" and mood == "" and text == "":

            if current_entries:
                block = "(set: $dialoguetext to (a:\n"
                block += ",\n".join(current_entries)
                block += "\n))"

                blocks.append(block)
                current_entries = []

            continue

        # Escape quotation marks for Harlowe
        text = text.replace('"', '\\"')

        entry = f'''(dm:
"character","{character}",
"mood","{mood}",
"text","{text}")'''

        current_entries.append(entry)

# Add final block if needed
if current_entries:
    block = "(set: $dialoguetext to (a:\n"
    block += ",\n".join(current_entries)
    block += "\n))"

    blocks.append(block)

# Join blocks with blank lines between them
output = "\n\n".join(blocks)

with open(output_file, "w", encoding="utf-8") as outfile:
    outfile.write(output)

print("Done!")