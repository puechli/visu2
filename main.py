import os
import json
import sys

def path_to_dict(path):
    d = {'name': os.path.basename(path)}
    if os.path.isdir(path):
        d['type'] = "directory"
        d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir(path)]
    else:
        d['type'] = "file"
    return d

f = open("output.json", "w")
f.write(json.dumps(path_to_dict(sys.argv[1]),  indent=4))
f.write(os.linesep)
f.close()
