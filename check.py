import re
import subprocess
import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<script type="text/babel"[^>]*>([\s\S]*?)</script>', content)
if m:
    with open('temp.js', 'w', encoding='utf-8') as f:
        f.write(m.group(1))
    
    result = subprocess.run(['npx.cmd', 'babel', 'temp.js', '--presets=@babel/preset-react'], capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR:")
        print(result.stderr)
        sys.exit(1)
    else:
        print("Parsed successfully!")
else:
    print("No script found")
