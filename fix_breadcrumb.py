import re

def fix_breadcrumb():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # Replace the broken breadcrumb logic
    bad_breadcrumb = "{activeSatheeChapter ? activeSatheeChapter.name : activeSatheeSubject ? activeSatheeSubject.name : activeSatheeBatch ? activeSatheeBatch.name : activeSatheeExam ? activeSatheeExam.name : 'All Exams (SATHEE)'}"
    good_breadcrumb = "{activeSatheeBatch ? activeSatheeBatch.name : activeSatheeExam ? activeSatheeExam.name : 'All Exams (SATHEE)'}"

    code = code.replace(bad_breadcrumb, good_breadcrumb)

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)

    print("Breadcrumb fixed!")

fix_breadcrumb()
