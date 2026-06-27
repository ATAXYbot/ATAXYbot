import re

def fix_course_ref():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # Replace the course references
    code = code.replace('ssc-mts-recorded-course-new-hi', 'ssc-mts-crash-course')

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)
        
    print("Course reference updated!")

fix_course_ref()
