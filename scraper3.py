import urllib.request
import re

try:
    req = urllib.request.Request('https://sathee.iitk.ac.in/sathee-jee/syllabus/physics/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = set(re.findall(r'href="(.*?)"', html))
    for l in links:
        if l.startswith('/'):
            print(l)
except Exception as e:
    print(e)
