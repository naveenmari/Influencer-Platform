import os
import re

root_dir = r"c:\Users\NaveenMari\Downloads\DBMS\react_frontend\src"
target_string = "http://localhost:5000"

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Don't modify the config.js itself
    if "config.js" in file_path:
        return

    if target_string in content:
        print(f"Updating {os.path.basename(file_path)}...")
        
        # Add import if missing
        import_stmt = "import { API_URL } from '../config';"
        # Adjust relative path based on directory depth
        rel_path = "../config"
        if "pages" in file_path:
            rel_path = "../config"
        elif "components" in file_path:
            if "\\" in file_path.split("components")[1].strip("\\"):
                rel_path = "../../config"
            else:
                rel_path = "../config"
        elif "context" in file_path:
            rel_path = "../config"
            
        import_stmt = f"import {{ API_URL }} from '{rel_path}';"
        
        # Ensure only one import
        if "import { API_URL }" not in content:
            # Insert after the last import line or at the top
            lines = content.split('\n')
            last_import_index = -1
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import_index = i
            
            if last_import_index != -1:
                lines.insert(last_import_index + 1, import_stmt)
            else:
                lines.insert(0, import_stmt)
                
            content = '\n'.join(lines)

        # Replace URL
        # We replace "http://localhost:5000" with ${API_URL} inside template literals or API_URL elsewhere
        # Simple string replacement for most cases where fetch is used
        content = content.replace(f"'{target_string}", "`${API_URL}")
        content = content.replace(f'"{target_string}', '`${API_URL}')
        # Handle the trailing backtick if it was a simple string
        # Actually it's safer to just replace the literal string
        content = content.replace(target_string, "${API_URL}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            process_file(os.path.join(root, file))

print("Replacement complete.")
