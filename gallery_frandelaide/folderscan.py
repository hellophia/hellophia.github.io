import os
import re
import random

def generate_html_for_images(folder_path):
    # Get list of image files in the specified folder
    image_files = [f for f in os.listdir(folder_path) if f.endswith(('png', 'jpg', 'jpeg', 'gif'))]

    # Shuffle the list of image files
    random.shuffle(image_files)

    # Initialize HTML content
    html_content = '<ul>\n'

    for image_file in image_files:
        # Extract the base name without extension
        base_name = os.path.splitext(image_file)[0]
        
        # Extract the relevant part for the tooltip (e.g., 'adelaide' from 'adelaide01')
        match = re.match(r'([a-zA-Z]+)', base_name)
        if match:
            tooltip_text = match.group(1).capitalize()
            class_name = match.group(1).lower()
        else:
            tooltip_text = 'Unknown'
            class_name = 'unknown'

        # Add the list item with image and tooltip span, including the 'img/' path
        html_content += f'  <li><img src="img/{image_file}"><span class="tooltiptext {class_name}">{tooltip_text}</span></li>\n'

    html_content += '</ul>'

    return html_content

def save_html_to_file(html_content, output_file):
    with open(output_file, 'w') as file:
        file.write(html_content)

# Set the folder path and output HTML file path
folder_path = '/Users/sophiafoster-dimino/Dropbox/github/hellophia/gallery_frandelaide/img'
output_file = 'output.txt'

# Generate the HTML content
html_content = generate_html_for_images(folder_path)

# Save the HTML content to a file
save_html_to_file(html_content, output_file)

print(f'HTML content has been generated and saved to {output_file}')