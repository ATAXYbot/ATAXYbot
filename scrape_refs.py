import urllib.request
import re

req = urllib.request.Request('https://sathee.iitk.ac.in/', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    refs = set(re.findall(r'course_reference[:=][\'"]([^\'"]+)[\'"]', html))
    links = set(re.findall(r'href=[\'"]([^\'"]+course_reference[^\'"]+)[\'"]', html))
    print("Refs found in HTML:", refs)
    print("Links found in HTML:", links)
except Exception as e:
    print(e)
