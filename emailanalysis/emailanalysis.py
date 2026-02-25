import os
import csv
import time
import json
from openai import OpenAI
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# --- CONFIGURATION ---
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
TARGET_EMAIL = 'abirehsanevan@gmail.com'
CHECK_INTERVAL = 60  
CSV_FILENAME = 'ai_analyzed_emails.csv'
JSON_FILENAME = 'ai_analyzed_emails.json'


# OpenAI Client Setup - use API key from environment variable
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment. Please check your .env file and environment variables.")
client = OpenAI(api_key=OPENAI_API_KEY)

def analyze_with_ai(subject, body):
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an email analyzer. Respond only in valid JSON format."},
                {"role": "user", "content": f"""
                Analyze this email:
                Subject: {subject}
                Body: {body}

                Return JSON with these exact keys:
                "flag": "spam" or "not spam",
                "intention": "follow up", "scheduling", "transactional", "meeting", or "event",
                "type": "Office", "Personal", "Marketing", etc.,
                "summary": "one sentence summary",
                "importance_score": (integer 1-100)
                """}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "flag": "error", "intention": "error", "type": "error", 
            "summary": "AI analysis failed", "importance_score": 0
        }

def get_gmail_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=8080, login_hint=TARGET_EMAIL)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('gmail', 'v1', credentials=creds)

def extract_email_body(payload):
    """Extract email body from Gmail API payload"""
    import base64
    
    body = ""
    
    if 'parts' in payload:
        # Multipart message
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                if 'data' in part['body']:
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                    break
            elif part['mimeType'] == 'text/html' and not body:
                if 'data' in part['body']:
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
    else:
        # Simple message
        if 'data' in payload.get('body', {}):
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
    
    # If still no body, use snippet
    if not body:
        body = payload.get('snippet', '')
    
    return body

def automation_loop():
    service = get_gmail_service()
    processed_ids = set()

    # Initialization: Pre-load current IDs to skip them
    print("Initializing... Skipping current inbox.")
    initial_results = service.users().messages().list(userId='me', maxResults=20).execute()
    for m in initial_results.get('messages', []):
        processed_ids.add(m['id'])

    print(f"--- AI Automation Active (CSV + JSON) for {TARGET_EMAIL} ---")

    try:
        while True:
            print(f"[{time.strftime('%H:%M:%S')}] Waiting for new mail...")
            results = service.users().messages().list(userId='me', maxResults=10, includeSpamTrash=True).execute()
            messages = results.get('messages', [])
            
            new_data_objects = [] # For JSON
            new_csv_rows = []      # For CSV

            if messages:
                for msg in messages:
                    if msg['id'] not in processed_ids:
                        try:
                            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
                            headers = txt.get('payload', {}).get('headers', [])
                            
                            e_date = next((h['value'] for h in headers if h['name'] == 'Date'), 'N/A')
                            e_from = next((h['value'] for h in headers if h['name'] == 'From'), 'N/A')
                            e_subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'N/A')
                            e_snippet = txt.get('snippet', '')
                            e_body = extract_email_body(txt.get('payload', {}))

                            print(f" > Analyzing NEW Email: {e_subject}")
                            ai_data = analyze_with_ai(e_subject, e_body if e_body else e_snippet)

                            # Prepare Dictionary for JSON
                            email_obj = {
                                "Date": e_date,
                                "From": e_from,
                                "Subject": e_subject,
                                "Body": e_body if e_body else e_snippet,
                                "Flag": ai_data.get('flag'),
                                "Intention": ai_data.get('intention'),
                                "Type": ai_data.get('type'),
                                "Summary": ai_data.get('summary'),
                                "Score": ai_data.get('importance_score'),
                                "ID": msg['id']
                            }
                            new_data_objects.append(email_obj)

                            # Prepare List for CSV
                            new_csv_rows.append([
                                e_date, e_from, e_subject, 
                                ai_data.get('flag'), ai_data.get('intention'), 
                                ai_data.get('type'), ai_data.get('summary'), 
                                ai_data.get('importance_score'), msg['id']
                            ])
                            
                            processed_ids.add(msg['id'])
                        except Exception as e:
                            print(f"Error processing {msg['id']}: {e}")

                if new_data_objects:
                    # 1. Update CSV (Newest on Top)
                    existing_csv_data = []
                    if os.path.exists(CSV_FILENAME):
                        with open(CSV_FILENAME, mode='r', encoding='utf-8') as f:
                            reader = list(csv.reader(f))
                            if len(reader) > 1: existing_csv_data = reader[1:]

                    with open(CSV_FILENAME, mode='w', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        writer.writerow(['Date', 'From', 'Subject', 'Flag', 'Intention', 'Type', 'Summary', 'Score', 'ID'])
                        writer.writerows(new_csv_rows)
                        writer.writerows(existing_csv_data)

                    # 2. Update JSON (Newest on Top)
                    existing_json_data = []
                    if os.path.exists(JSON_FILENAME):
                        with open(JSON_FILENAME, 'r', encoding='utf-8') as f:
                            try:
                                existing_json_data = json.load(f)
                            except:
                                existing_json_data = []
                    
                    # Prepend new objects to the existing list
                    updated_json_data = new_data_objects + existing_json_data
                    with open(JSON_FILENAME, 'w', encoding='utf-8') as f:
                        json.dump(updated_json_data, f, indent=4)
                    
                    print(f"Success: Added {len(new_data_objects)} emails to {CSV_FILENAME} and {JSON_FILENAME}")
            
            time.sleep(CHECK_INTERVAL)

    except KeyboardInterrupt:
        print("\nStopping automation...")

if __name__ == '__main__':
    automation_loop()