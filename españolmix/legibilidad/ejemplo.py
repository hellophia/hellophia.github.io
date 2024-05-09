import os
from legibilidad import *

def get_readability_category(score):
    if score < 14.29:
        return "muy difícil"
    elif score < 28.57:
        return "difícil"
    elif score < 42.86:
        return "bastante difícil"
    elif score < 57.14:
        return "normal"
    elif score < 71.43:
        return "bastante fácil"
    elif score < 85.71:
        return "fácil"
    else:
        return "muy fácil"

def analyze_text(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()

        fernandez_huerta_score = fernandez_huerta(text)
        szigriszt_pazos_score = szigriszt_pazos(text)
        mu_score = mu(text)

        readability_category = get_readability_category(mu_score)

        return fernandez_huerta_score, szigriszt_pazos_score, mu_score, readability_category

    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return None, None, None, None
    except Exception as e:
        print(f"Error analyzing file {file_path}: {e}")
        return None, None, None, None

def analyze_folder(folder_path, output_file):
    with open(output_file, 'w', encoding='utf-8') as txtfile:
        txtfile.write("File Name\tFernandez Huerta Score\tSzigriszt Pazos Score\tMu Score\tReadability Category\n")

        for filename in os.listdir(folder_path):
            if filename.endswith(".txt"):
                file_path = os.path.join(folder_path, filename)
                fernandez_huerta_score, szigriszt_pazos_score, mu_score, readability_category = analyze_text(file_path)
                if fernandez_huerta_score is not None:
                    txtfile.write(f"{filename}\t{fernandez_huerta_score:.2f}\t{szigriszt_pazos_score:.2f}\t{mu_score:.2f}\t{readability_category}\n")

if __name__ == "__main__":
    folder_path = input("Enter the path to the folder of .txt files: ")
    output_file = "output.txt"

    analyze_folder(folder_path, output_file)
    print("Analysis completed. Results written to", output_file)