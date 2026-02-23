import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_google_credentials():
    creds = None
    
    # This gets the directory where main.py is located
    # (The root of your hr-automation-system folder)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    creds_path = os.path.join(base_dir, 'credentials.json')
    token_path = os.path.join(base_dir, 'token.json')

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(creds_path):
                raise FileNotFoundError(f"Missing credentials.json at: {creds_path}")
            
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            # Try different ports if one is in use
            ports_to_try = [8090, 8091, 8092, 9000, 9001]
            creds = None
            
            for port in ports_to_try:
                try:
                    creds = flow.run_local_server(port=port)
                    break
                except OSError as e:
                    if 'Address already in use' in str(e) and port != ports_to_try[-1]:
                        continue  # Try next port
                    else:
                        raise  # Re-raise if it's not address in use or last port
            
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
            
    return creds