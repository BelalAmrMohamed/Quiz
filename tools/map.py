import os

# Settings
IGNORE_NAMES = ['node_modules', '.git', 'Exams', 'Context Map.txt', '.DS_Store']
IGNORE_EXT = ['.pyc', '.tmp'] # Add extensions to ignore here

def generate_tree():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    output_file = os.path.join(parent_dir, "Context Map.txt")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"{os.path.basename(parent_dir)}/\n")
        
        def walk_dir(current_path, prefix=""):
            # Get all items and filter them
            all_items = [i for i in os.listdir(current_path) if i not in IGNORE_NAMES and not i.startswith('.')]
            all_items = [i for i in all_items if not any(i.endswith(ext) for ext in IGNORE_EXT)]
            
            # Split into files and folders
            files = sorted([i for i in all_items if os.path.isfile(os.path.join(current_path, i))])
            dirs = sorted([i for i in all_items if os.path.isdir(os.path.join(current_path, i))])
            
            # Combine: Files first, then Folders
            sorted_items = files + dirs
            
            for i, item in enumerate(sorted_items):
                is_last = (i == len(sorted_items) - 1)
                connector = "└── " if is_last else "├── "
                path = os.path.join(current_path, item)
                
                if os.path.isdir(path):
                    f.write(f"{prefix}{connector}{item}/\n")
                    new_prefix = prefix + ("    " if is_last else "│   ")
                    walk_dir(path, new_prefix)
                else:
                    f.write(f"{prefix}{connector}{item}\n")

        walk_dir(parent_dir)

if __name__ == "__main__":
    generate_tree()
    print("Done! Check 'Context Map.txt' in your main folder.")