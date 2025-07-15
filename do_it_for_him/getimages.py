import os
import json
from PIL import Image

img_dir = '/Users/sfd/Dropbox/github/hellophia/do_it_for_him/imgs'
output_file = 'images.json'

image_data = []

for filename in os.listdir(img_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
        path = os.path.join(img_dir, filename)
        with Image.open(path) as img:
            width, height = img.size
            aspect = 'square' if abs(width - height) < 50 else 'landscape' if width > height else 'portrait'
            image_data.append({
                'filename': filename,
                'width': width,
                'height': height,
                'aspect': aspect
            })

with open(output_file, 'w') as f:
    json.dump(image_data, f, indent=2)

print(f"Generated {output_file} with {len(image_data)} images.")