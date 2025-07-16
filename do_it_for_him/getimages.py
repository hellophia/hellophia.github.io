from PIL import Image
import os
import json

img_dir = '/Users/sfd/Dropbox/github/hellophia/do_it_for_him/imgs'
output_file = 'images.json'

image_data = []

for filename in os.listdir(img_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
        path = os.path.join(img_dir, filename)
        with Image.open(path) as img:
            width, height = img.size
            ratio = width / height

            if 0.90 <= ratio <= 1.1:
                aspect = 'square'
            elif ratio > 1.1:
                aspect = 'landscape'
            else:
                aspect = 'portrait'

            image_data.append({
                'filename': filename,
                'width': width,
                'height': height,
                'aspect': aspect
            })

with open(output_file, 'w') as f:
    json.dump(image_data, f, indent=2)

print(f"Generated {output_file} with {len(image_data)} images.")
