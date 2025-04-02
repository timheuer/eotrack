import json
import re
import os

# Get the script directory and construct absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(os.path.dirname(script_dir), 'src', 'data.json')

# Read the data file preserving line endings
with open(data_path, 'r', newline='') as f:
    content = f.read()
    data = json.loads(content)

# Function to extract docket ID from URL
def extract_docket_id(url):
    match = re.search(r'/docket/(\d+)/', url)
    return match.group(1) if match else None

# Process each item
for item in data:
    if 'challenges' in item:
        for challenge in item['challenges']:
            if 'url' in challenge:
                docket_id = extract_docket_id(challenge['url'])
                if docket_id:
                    challenge['docketId'] = docket_id

# Write back the file preserving formatting
with open(data_path, 'w', newline='') as f:
    # Detect if the original content ended with a newline
    ends_with_newline = content.endswith('\n')
    # Use json.dumps with indent=2 for consistent formatting
    json_str = json.dumps(data, indent=2)
    # Preserve the original EOF newline state
    if ends_with_newline and not json_str.endswith('\n'):
        json_str += '\n'
    f.write(json_str)