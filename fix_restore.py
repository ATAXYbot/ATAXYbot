import re

def fix_restore():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # Replace the incorrect practice mode
    code = code.replace("setActivePracticeMode('bank');", "setActivePracticeMode('practice');")

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)

    print("State restore fixed!")

fix_restore()
