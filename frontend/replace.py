import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    content = content.replace("cyan-", "amber-")
    content = content.replace("cyan500", "amber500")
    
    # regex for 6, 182, 212 with any spaces
    content = re.sub(r'6,\s*182,\s*212', '245, 158, 11', content)
    # regex for 34, 211, 238
    content = re.sub(r'34,\s*211,\s*238', '251, 191, 36', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
print("Done")
