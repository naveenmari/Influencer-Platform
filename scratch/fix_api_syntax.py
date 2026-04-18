import os
import re

root_dir = r"c:\Users\NaveenMari\Downloads\DBMS\react_frontend\src"

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the broken pattern: `${API_URL}/some/path', 
    # and replace the trailing ' with `
    # Note: We look for ${API_URL} followed by any non-whitespace, ending with '
    pattern = r"(\${API_URL}[^\s'\"`]+)'"
    
    if re.search(pattern, content):
        print(f"Fixing {os.path.basename(file_path)}...")
        new_content = re.sub(pattern, r"\1`", content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            fix_file(os.path.join(root, file))

print("Fixing complete.")
