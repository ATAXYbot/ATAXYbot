import re

def fix_403_error():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # The WAF on SATHEE is blocking the "redirect" query string.
    # We must replace the generateSatheeLink logic to just use the safe base URL,
    # otherwise users will keep getting 403 Access Denied.

    new_link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            // SATHEE's Web Application Firewall (WAF) strictly blocks custom URL parameters
                                            // like "redirect=" (giving a 403 Access Denied error) to prevent security vulnerabilities.
                                            // Thus, we must route users safely to the main SATHEE application where they can resume.
                                            return `https://sathee.iitk.ac.in/`;
                                        };
"""
    
    # We find the old generateSatheeLink block and replace it
    start_gen = code.find('const generateSatheeLink = (item, type) => {')
    if start_gen != -1:
        end_gen = code.find('};', start_gen) + 2
        code = code[:start_gen] + new_link_generator.strip() + code[end_gen:]

        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("403 Fix Applied.")
    else:
        print("Could not find generateSatheeLink.")

fix_403_error()
