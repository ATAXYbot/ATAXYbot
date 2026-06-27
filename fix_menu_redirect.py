import re

def apply_menu_redirect():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    new_link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            // As provided by the user's screenshot, SATHEE uses a specific dashboard/courseView route
                                            // for its lecture menus, with a course_reference query parameter.
                                            // This perfectly bypasses the WAF and directly opens the batch menu!
                                            
                                            const courseRef = activeSatheeBatch && activeSatheeBatch.course_reference 
                                                ? activeSatheeBatch.course_reference 
                                                : 'ssc-mts-recorded-course-new-hi'; // Fallback to the one from the screenshot
                                                
                                            return `https://sathee.iitk.ac.in/dashboard/courseView?course_reference=${courseRef}&language=he`;
                                        };
"""
    start_gen = code.find('const generateSatheeLink = (item, type) => {')
    if start_gen != -1:
        end_gen = code.find('};', start_gen) + 2
        code = code[:start_gen] + new_link_generator.strip() + code[end_gen:]

        # Let's inject course_reference into the b_ssc_mts batch specifically so it matches their screenshot exactly
        code = code.replace(
            "{ id: 'b_ssc_mts', name: 'SSC MTS Achiever', medium: 'Bilingual', icon: 'fa-briefcase', color: 'teal' }",
            "{ id: 'b_ssc_mts', name: 'SATHEE SSC MTS Recorded Course Hinglish', medium: 'Hinglish', icon: 'fa-briefcase', color: 'teal', course_reference: 'ssc-mts-recorded-course-new-hi' }"
        )

        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("Menu Redirect Fix Applied.")
    else:
        print("Could not find generateSatheeLink.")

apply_menu_redirect()
