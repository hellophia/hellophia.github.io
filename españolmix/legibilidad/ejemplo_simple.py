import sys
from legibilidad import *

def analyze_text(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()

        # Call each function on the text and print the results
        fernandez_huerta_score = fernandez_huerta(text)
        szigriszt_pazos_score = szigriszt_pazos(text)
        mu_score = mu(text)

        print(f"Readability scores for {file_path}:")
        print(f"Fernandez Huerta: {fernandez_huerta_score}")
        print(f"Szigriszt Pazos: {szigriszt_pazos_score}")
        print(f"Mu: {mu_score}")

    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python ejemplo.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]

    analyze_text(file_path)