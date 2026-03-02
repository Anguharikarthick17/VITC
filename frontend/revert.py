import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    content = content.replace("amber-", "cyan-")
    content = content.replace("amber500", "cyan500")
    
    content = re.sub(r'245,\s*158,\s*11', '6, 182, 212', content)
    content = re.sub(r'251,\s*191,\s*36', '34, 211, 238', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Reverted {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
print("Done")
