import urllib.request
import re

try:
    req = urllib.request.Request('https://sathee.iitk.ac.in/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    scripts = re.findall(r'src="(.*?\.js)"', html)
    print("Scripts:", scripts)
    
    # Try finding API URLs in the main JS files
    for js_path in scripts:
        if not js_path.startswith('http'):
            js_path = 'https://sathee.iitk.ac.in' + js_path
        try:
            req_js = urllib.request.Request(js_path, headers={'User-Agent': 'Mozilla/5.0'})
            js = urllib.request.urlopen(req_js).read().decode('utf-8')
            apis = re.findall(r'https://[^"\']*?api[^"\']*', js)
            if apis:
                print(f"APIs in {js_path}:")
                for api in set(apis):
                    print("  ", api)
        except Exception as e:
            print(f"Error reading {js_path}: {e}")
            
except Exception as e:
    print("Error:", e)
