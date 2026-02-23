import os
import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError
from src.utils.helpers import get_google_credentials

def download_new_cvs():
    """
    Downloads new resumes from Google Drive.
    Raises exception with user-friendly message if OAuth is disabled or fails.
    """
    try:
        creds = get_google_credentials()
        service = build('drive', 'v3', credentials=creds)

        # Get it from the URL: https://drive.google.com/drive/folders/YOUR_FOLDER_ID
        folder_id = '1KqHr4l6-ICOSKyDunykQdSyGiAF2GeNb'  # <-- CHANGE THIS!
        
        # Use absolute path to ensure files go to the correct location
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        local_dir = os.path.join(base_dir, "data", "resumes")

        if not os.path.exists(local_dir):
            os.makedirs(local_dir)

        results = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="files(id, name)"
        ).execute()
        
        items = results.get('files', [])

        if not items:
            print("No files found in Google Drive folder.")
            return 0

        downloaded_count = 0
        for item in items:
            file_id = item['id']
            file_name = item['name']
            local_path = os.path.join(local_dir, file_name)

            if not os.path.exists(local_path):
                print(f"Downloading: {file_name}")
                request = service.files().get_media(fileId=file_id)
                with io.FileIO(local_path, 'wb') as fh:
                    downloader = MediaIoBaseDownload(fh, request)
                    done = False
                    while done is False:
                        status, done = downloader.next_chunk()
                downloaded_count += 1
        
        print(f"✅ Successfully downloaded {downloaded_count} new resume(s)")
        return downloaded_count
    
    except Exception as e:
        error_msg = str(e)
        
        if 'disabled_client' in error_msg:
            raise Exception(
                "❌ Google OAuth client is disabled.\n\n"
                "🔧 Fix by following these steps:\n"
                "1. Go to: https://console.cloud.google.com/\n"
                "2. Select project 'fast-kiln-486003-q6'\n"
                "3. Go to 'APIs & Services' > 'OAuth consent screen'\n"
                "4. Ensure app is published OR add your email to test users\n"
                "5. Go to 'Credentials' and verify OAuth 2.0 Client is enabled\n\n"
                "💡 Alternative: Use manual upload (Upload Resume button in UI)"
            )
        elif 'invalid_grant' in error_msg:
            raise Exception(
                "❌ Google authentication expired.\n"
                "Delete 'token.json' file and try again to re-authenticate."
            )
        else:
            raise Exception(f"Google Drive sync failed: {error_msg}")