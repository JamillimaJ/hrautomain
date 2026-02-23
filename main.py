import os
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

# Importing custom modules
from src.integrations.drive_ingestor import download_new_cvs
from src.extractor.pdf_reader import extract_text
from src.core.ats_scorer import score_resume
from src.integrations.notifier import send_interview_email

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run_hr_pipeline():
    print("--- Starting HR Automation System ---")

    # 1. Sync from Google Drive
    print("Step 1: Fetching applications from Drive...")
    try:
        download_new_cvs()
    except Exception as e:
        print(f"Sync failed: {e}")

    # 2. Setup Paths
    jd_path = "data/templates/hiring_post.pdf"
    resume_folder = "data/resumes"
    report_name = f"shortlist_{pd.Timestamp.now().strftime('%Y%m%d_%H%M')}.xlsx"
    output_path = os.path.join("outputs/excel_reports", report_name)
    
    if not os.path.exists(jd_path):
        print(f"Error: JD file not found at {jd_path}")
        return

    # 3. Process Resumes
    jd_text = extract_text(jd_path)
    shortlisted = []

    print("Step 2: Analyzing resumes...")
    if not os.path.exists(resume_folder) or not os.listdir(resume_folder):
        print("No resumes found to process.")
        return

    for file in os.listdir(resume_folder):
        if file.lower().endswith(".pdf"):
            print(f"Processing: {file}")
            resume_text = extract_text(os.path.join(resume_folder, file))
            result = score_resume(jd_text, resume_text, client)
            
            if result and result.get('score', 0) >= 80:
                print(f"Match found: {result['candidate_name']} ({result['score']}%)")
                shortlisted.append(result)

    # 4. Export and Notify
    if shortlisted:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df = pd.DataFrame(shortlisted)
        df.to_excel(output_path, index=False)
        print(f"Step 3: Report saved to {output_path}")

        top_candidates = sorted(shortlisted, key=lambda x: x['score'], reverse=True)[:10]
        
        print(f"\nIdentified {len(top_candidates)} top candidates.")
        confirm = input("Send interview invitations via Email? (y/n): ")
        
        if confirm.lower() == 'y':
            date = "February 15, 2026"
            time = "10:30 AM"
            location = "Virtual Zoom Meeting"

            for candidate in top_candidates:
                name = candidate.get('candidate_name')
                email = candidate.get('email')

                if email and email != "Not Provided":
                    send_interview_email(email, name, date, time, location)
        else:
            print("Notifications skipped.")
    else:
        print("Final Result: No candidates met the 80% threshold.")

if __name__ == "__main__":
    run_hr_pipeline()