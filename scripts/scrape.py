import requests
import json
from datetime import datetime
import os

# Define the API endpoint and parameters
api_url = "https://www.federalregister.gov/api/v1/documents.json"
params = {
    "per_page": 1000,  # Number of results per page (max 1000)
    "order": "newest",  # Order by newest first
    "conditions[president][]": "donald-trump",  # Filter by President Donald J. Trump
    "conditions[type][]": ["PRESDOCU"],  # Include both executive orders and proclamations
    "conditions[presidential_document_type][]": ["executive_order", "proclamation"],
    "conditions[publication_date][gte]": "2025-01-19",
    "fields[]": [
        "presidential_document_number",
        "title",
        "publication_date",
        "html_url"
    ]
}

# Function to fetch documents from the Federal Register API
def fetch_documents():
    response = requests.get(api_url, params=params)
    response.raise_for_status()  # Raise an error for bad status codes
    return response.json()['results']

# Function to format the document data
def format_documents(documents):
    formatted_documents = []
    for doc in documents:
        formatted_doc = {
            "id": doc['presidential_document_number'],
            "title": doc['title'],
            "date": doc['publication_date'],
            "url": doc['html_url'],
            "status": "enacted",
            "challenges": []  # Placeholder for legal challenges
        }
        formatted_documents.append(formatted_doc)
    return formatted_documents

def load_existing_data():
    try:
        with open('src/data.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def merge_documents(new_docs, existing_docs):
    # Create a lookup of existing documents by ID
    existing_lookup = {doc['id']: doc for doc in existing_docs}
    
    # Merge new documents with existing ones
    merged = []
    seen_ids = set()
    
    # First add all new documents
    for doc in new_docs:
        doc_id = doc['id']
        seen_ids.add(doc_id)
        
        # If document exists, preserve its challenges
        if doc_id in existing_lookup:
            doc['challenges'] = existing_lookup[doc_id].get('challenges', [])
            doc['status'] = existing_lookup[doc_id].get('status', "enacted")
        
        merged.append(doc)
    
    # Add any existing documents that weren't in the new data
    for doc in existing_docs:
        if doc['id'] not in seen_ids:
            merged.append(doc)
    
    # Sort by date descending
    return sorted(merged, key=lambda x: x['date'], reverse=True)

def main():
    # Fetch new documents
    documents = fetch_documents()
    formatted_documents = format_documents(documents)
    
    # Load existing data
    existing_documents = load_existing_data()
    
    # Merge documents
    merged_documents = merge_documents(formatted_documents, existing_documents)
        
    # Save to src/data.json for the application
    os.makedirs('../src', exist_ok=True)
    with open('src/data.json', 'w', newline='') as f:
        json.dump(merged_documents, f, indent=2, ensure_ascii=False)
        f.write('\n')  # Add newline at end of file

    print(f"Saved {len(merged_documents)} documents to src/data.json.")

if __name__ == "__main__":
    main()
