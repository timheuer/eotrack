import sys
import subprocess
from pathlib import Path
from os import environ

def ensure_requirements():
    try:
        import requests
    except ImportError:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        import requests
    return requests

def get_docket_latest_entry_date(requests, docket_id):
    """
    Get the latest docket entry date for a given docket ID from CourtListener API
    Returns the date in UTC format or None if not found
    """
    # Explicitly get from process environment
    api_key = environ.get('CL_API_KEY')
    if not api_key:
        print("Error: CL_API_KEY environment variable is not set in the process environment")
        return None
        
    url = f"https://www.courtlistener.com/api/rest/v3/dockets/{docket_id}/"
    headers = {
        'Authorization': f'Token {api_key}',
        'User-Agent': 'EOTrack/1.0'
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('date_last_filing'):
                # Convert to UTC format
                from datetime import datetime
                date_obj = datetime.strptime(data['date_last_filing'], '%Y-%m-%d')
                return date_obj.strftime('%Y-%m-%dT%H:%M:%SZ')
        else:
            print(f"HTTP {response.status_code} for docket {docket_id}: {response.text}")
    except Exception as e:
        print(f"Error fetching docket {docket_id}: {str(e)}")
    
    return None

def update_data_with_latest_docket_dates():
    import json
    requests = ensure_requirements()
    
    # Check environment variable from process
    if 'CL_API_KEY' not in environ:
        print("Error: CL_API_KEY environment variable must be set in the process environment to access the CourtListener API")
        print("Please set this environment variable with your API key and try again")
        sys.exit(1)
    
    # Get the script directory
    script_dir = Path(__file__).parent.parent
    data_file = script_dir / 'src' / 'data.json'
    
    print(f"Reading data from {data_file}")
    
    # Read the current data
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Track if we made any updates
    updates_made = False
    total_dockets = 0
    updated_dockets = 0
    
    # Process each item
    for item in data:
        if item.get('challenges'):
            for challenge in item['challenges']:
                if challenge.get('docketId'):
                    total_dockets += 1
                    print(f"Processing docket {challenge['docketId']}...")
                    latest_date = get_docket_latest_entry_date(requests, challenge['docketId'])
                    if latest_date:
                        challenge['lastUpdated'] = latest_date
                        updated_dockets += 1
                        updates_made = True
                        print(f"Updated docket {challenge['docketId']} with date {latest_date}")
    
    print(f"\nProcessed {total_dockets} dockets, updated {updated_dockets}")
    
    # Save the updated data if changes were made
    if updates_made:
        print("\nSaving changes...")
        # Detect the line ending style of the original file
        with open(data_file, 'rb') as f:
            content = f.read()
            if b'\r\n' in content:
                line_ending = '\r\n'
            else:
                line_ending = '\n'
        
        # Write back with the same line endings
        with open(data_file, 'w', encoding='utf-8', newline='') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write(line_ending)  # Add final newline
        print("Changes saved successfully!")
    else:
        print("\nNo updates were needed.")

if __name__ == '__main__':
    update_data_with_latest_docket_dates()