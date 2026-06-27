import re

def remove_options():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # Remove NEET and JEE from the exams list
    code = code.replace("{ id: 'exam_jee', name: 'JEE', icon: 'fa-laptop-code' },", "")
    code = code.replace("{ id: 'exam_neet', name: 'NEET', icon: 'fa-user-doctor' },", "")

    # Remove checking batch if it exists in default or clat or anywhere
    # I'll just use regex to remove any batch object with name 'checking' (case insensitive)
    code = re.sub(r'\{[^}]*name:\s*[\'"](?i:checking)[\'"][^}]*\},?', '', code)

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("Options removed!")

remove_options()
