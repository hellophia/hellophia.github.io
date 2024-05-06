import os
import langid

def detect_language(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
            language, _ = langid.classify(text)
            return language
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main(folder_path):
    files = os.listdir(folder_path)
    for file_name in files:
        if file_name.endswith('.txt'):
            file_path = os.path.join(folder_path, file_name)
            language = detect_language(file_path)
            if language:
                print(f"{file_name}: {language}")
       
# Replace 'folder_path' with the path to your folder containing the text files
folder_path = '/Users/sophiafoster-dimino/Downloads/The Rough Guide to Psychedelic Cumbia'
main(folder_path)