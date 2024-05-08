import os
from unidecode import unidecode

def remove_accents(text):
    # Use unidecode to remove accents
    return unidecode(text)

def rename_files(folder_path):
    # Iterate through each file in the folder
    for filename in os.listdir(folder_path):
        # Check if the file is a .txt file
        if filename.endswith(".txt"):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                # Read the first two lines of the file
                line1 = file.readline().strip()
                line2 = file.readline().strip()
            
            # Remove accents and convert to lowercase
            line1 = remove_accents(line1).lower()
            line2 = remove_accents(line2).lower()

            # Generate the new filename based on the first two lines
            new_filename = f"{line1.replace(' ', '-')}_{line2.replace(' ', '-')}.txt"
            new_file_path = os.path.join(folder_path, new_filename)

            # Rename the file
            os.rename(file_path, new_file_path)

# Replace 'folder_path' with the path to your folder of .txt files
folder_path = '/Users/sophiafoster-dimino/Dropbox/github/hellophia/españolmix/letras/rename'
rename_files(folder_path)