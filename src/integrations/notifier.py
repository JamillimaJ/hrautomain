import smtplib
import os
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os

# Common carrier gateways for Email-to-SMS
SMS_GATEWAYS = [
    "txt.att.net",          # AT&T
    "vtext.com",            # Verizon
    "tmomail.net",          # T-Mobile
    "messaging.sprintpcs.com" # Sprint
]

def send_interview_email(recipient_email, candidate_name, date, time, location):
    msg = EmailMessage()
    msg['Subject'] = f"Interview Invitation - {candidate_name}"
    msg['From'] = os.getenv("EMAIL_USER")
    msg['To'] = recipient_email

    body = f"""
    Dear {candidate_name},

    We have reviewed your application and would like to invite you for an interview.

    Details:
    Date: {date}
    Time: {time}
    Location: {location}

    Please reply to this email to confirm your attendance.

    Best regards,
    Recruitment Team
    """
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
            smtp.send_message(msg)
        print(f"Email sent to: {recipient_email}")
    except Exception as e:
        print(f"Email error for {candidate_name}: {e}")


def send_appointment_letter_email(recipient_email, candidate_name, candidate_id, position_title, start_date, salary, department, probation_months, pdf_path=None):
    """
    Sends an appointment letter via email with PDF attachment
    
    Args:
        recipient_email: Candidate's email address
        candidate_name: Full name of candidate
        candidate_id: Candidate database ID
        position_title: Job position
        start_date: Joining date
        salary: Salary package
        department: Department name
        probation_months: Probation period in months
        pdf_path: Path to PDF attachment (optional)
    """
    
    # Create multipart message
    msg = MIMEMultipart('mixed')
    msg['Subject'] = f"Appointment Letter - {position_title} - Urmi Group"
    msg['From'] = os.getenv("EMAIL_USER")
    msg['To'] = recipient_email
    
    # Get current date
    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Email body with the exact template
    body = f"""Date: {current_date}

{candidate_name}
{position_title}

ID: {candidate_id}

Subject: Letter of Appointment

Dear {candidate_name},

Congratulations!

We are pleased to offer you the position of {position_title} at Urmi Group. Your appointment will be effective from your date of joining, which is scheduled for {start_date}.

You will be on a probationary period for {probation_months} months from your date of joining. Upon successful completion of your probation, your employment status will be reviewed for permanent confirmation based on your dedication and performance.

Your starting salary structure is as follows:
Basic Salary: {salary}

We trust that this appointment marks the beginning of a long, rewarding, and mutually beneficial journey with Urmi Group. We look forward to your commitment and success with us.


Sincerely,
Md. Kawcher Hossain
Head of Human Resources
Urmi Group
"""
    
    # Attach body as plain text
    msg.attach(MIMEText(body, 'plain'))
    
    # Attach PDF if provided
    if pdf_path and os.path.exists(pdf_path):
        try:
            with open(pdf_path, 'rb') as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                
                filename = f"Appointment_Letter_{candidate_name.replace(' ', '_')}.pdf"
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {filename}'
                )
                msg.attach(part)
                print(f"✅ PDF attached to email: {filename} (from {pdf_path})")
        except Exception as e:
            print(f"❌ Warning: Could not attach PDF: {e}")
    else:
        if pdf_path:
            print(f"❌ PDF file not found at: {pdf_path}")
        else:
            print(f"⚠️ No PDF path provided to email function")
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
            smtp.send_message(msg)
        print(f"Appointment letter sent to: {recipient_email}")
        return True
    except Exception as e:
        print(f"Appointment letter email error for {candidate_name}: {e}")
        return False


def send_free_sms(phone_number, candidate_name, date, time):
    """Sends a short text alert via Email-to-SMS gateways."""
    # Remove non-numeric characters from phone string
    clean_number = "".join(filter(str.isdigit, phone_number))
    
    user = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    for gateway in SMS_GATEWAYS:
        msg = EmailMessage()
        msg['From'] = user
        msg['To'] = f"{clean_number}@{gateway}"
        msg.set_content(f"Hi {candidate_name}, you are shortlisted! Interview on {date} at {time}. Check email for details.")

        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(user, password)
                smtp.send_message(msg)
        except:
            continue # Try next gateway if one fails
    print(f"SMS alert triggered for {candidate_name}")