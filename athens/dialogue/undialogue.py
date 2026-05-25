import re
import csv

input_file = "dialogue.txt"
output_file = "dialogue.csv"

with open(input_file, "r", encoding="utf-8") as infile:
    content = infile.read()

pattern = re.compile(
    r'\(dm:\s*'
    r'"character","(.*?)",\s*'
    r'"mood","(.*?)",\s*'
    r'"text","(.*?)"\s*'
    r'\)',
    re.DOTALL
)

matches = pattern.findall(content)

with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)

    for character, mood, text in matches:

        text = text.replace('\\"', '"')

        writer.writerow([character, mood, text])

print("Done!")