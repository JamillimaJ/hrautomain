# HR Automation System 🤖

An intelligent full-stack recruitment automation system with Django REST backend and modern web frontend that streamlines candidate screening using AI-powered resume analysis, automated scoring, and multi-channel notifications.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Workflow](#workflow)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Google Drive OAuth Setup](#google-drive-oauth-setup)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This HR Automation System combines a **Django REST Framework backend** with a **modern web frontend** to automate the entire recruitment workflow from resume collection to candidate notification.

**Key Capabilities:**
- ✅ Full-stack web application (Django + HTML/CSS/JS)
- ✅ AI-powered resume analysis using OpenAI GPT-4o-mini
- ✅ Automatic resume ingestion from Google Drive or manual upload
- ✅ RESTful API for all operations
- ✅ Real-time dashboard with statistics
- ✅ SQLite database for candidate records
- ✅ Django admin panel for management
- ✅ Intelligent skill matching and gap analysis
- ✅ Configurable scoring thresholds
- ✅ Multi-channel notifications (Email & WhatsApp)
- ✅ Excel report generation with analytics

---

## ✨ Features

### 1. **Full-Stack Web Application**
- Modern, responsive web interface
- Django REST Framework backend with SQLite database
- RESTful API for all operations
- Real-time dashboard with analytics
- Django admin panel for management
- CORS-enabled for frontend-backend communication

### 2. **Resume Collection**
- **Google Drive Sync**: Automatic download from specified folder (OAuth)
- **Manual Upload**: Drag & drop interface for PDF files
- **Batch Processing**: Handle multiple resumes at once
- Local storage in `data/resumes/`

### 3. **AI-Powered ATS Scoring**
- OpenAI GPT-4o-mini for intelligent analysis
- Scores candidates 0-100 based on:
  - Technical skills alignment
  - Years of experience
  - Relevant certifications
  - Domain expertise
- Extracts structured data:
  - Name, Email, Phone
  - Experience years
  - Matching & missing skills
  - Fitness reasoning

### 4. **Smart Candidate Management**
- Configurable score threshold (default: 80%)
- Automated shortlisting
- Search and filter capabilities
- Detailed candidate profiles
- Status tracking (Shortlisted/Rejected)

### 5. **Multi-Channel Notifications**
- **Email**: Professional invitations via Gmail SMTP
- **WhatsApp**: Instant messages via PyWhatKit
- Personalized content with interview details
- Bulk notification support
- Individual notification option

### 6. **Reporting & Analytics**
- Excel export of shortlisted candidates
- Timestamped reports in `outputs/excel_reports/`
- Dashboard statistics (total, shortlisted, avg score)
- Analysis job history
- Comprehensive candidate metrics

---

## 🛠 Technology Stack

### **Core Technologies**
| Technology | Purpose |
|------------|---------|
| **Python 3.x** | Primary language |
| **Django 4.2+** | Web framework |
| **Django REST Framework** | API development |
| **SQLite** | Database |
| **OpenAI API** | AI resume analysis |
| **Google Drive API** | Cloud storage sync |
| **PyMuPDF** | PDF processing |
| **Pandas** | Data handling & Excel |
| **HTML5/CSS3/JS** | Frontend UI |

### **Key Dependencies**
```txt
# Backend
Django==4.2.26
djangorestframework==3.16.1
django-cors-headers==4.9.0

# AI & Document Processing
openai==1.106.1
pymupdf==1.26.6
python-magic==0.4.27
pypdf==6.3.0
python-docx==1.2.0

# Data Handling
pandas==2.3.1
openpyxl==3.1.5
numpy==2.2.6
pillow==11.3.0

# Integrations
google-api-python-client==2.187.0
google-auth==2.40.3
google-auth-httplib2==0.2.1
google-auth-oauthlib==1.2.4
pywhatkit==5.4

# Utilities
python-dotenv==1.1.1
requests==2.32.5
beautifulsoup4==4.13.5
```

### **External Services**
- **OpenAI GPT-4o-mini**: Resume scoring
- **Google Drive API**: Resume storage
- **Gmail SMTP**: Email delivery
- **WhatsApp Web**: Messaging (PyWhatKit)

---

## 📁 Project Structure

```
Hrautomation-main/
├── backend/                    # Django REST Framework
│   ├── manage.py              # Django CLI
│   ├── app/                   # Project config (renamed from 'backend')
│   │   ├── settings.py        # Django settings, CORS, DB
│   │   ├── urls.py            # Main routing
│   │   ├── wsgi.py            # WSGI entry point
│   │   └── asgi.py            # ASGI entry point
│   └── api/                   # REST API app
│       ├── models.py          # Candidate, JobDescription, AnalysisJob
│       ├── views.py           # API endpoints
│       ├── serializers.py     # DRF serializers
│       ├── urls.py            # API routing
│       └── admin.py           # Admin config
│
├── frontend/                   # Web UI
│   ├── index.html             # Single-page app
│   ├── css/
│   │   └── styles.css         # Responsive styling
│   └── js/
│       └── app.js             # Frontend logic & API calls
│
├── src/                        # Core modules
│   ├── core/
│   │   ├── ats_scorer.py      # AI scoring engine
│   │   └── jd_generator.py   # (Future: JD generation)
│   ├── extractor/
│   │   ├── pdf_reader.py      # PDF text extraction
│   │   └── vision_ocr.py      # (Future: OCR)
│   ├── integrations/
│   │   ├── drive_ingestor.py  # Google Drive sync
│   │   ├── notifier.py        # Email & WhatsApp
│   │   ├── facebook.py        # (Future)
│   │   └── linkedin.py        # (Future)
│   └── utils/
│       ├── helpers.py         # Google Auth helpers
│       └── excel_helper.py    # Excel export
│
├── data/
│   ├── resumes/               # Resume storage
│   └── templates/
│       └── hiring_post.pdf    # Job description
│
├── outputs/
│   └── excel_reports/         # Generated reports
│
├── .env                        # Environment variables
├── credentials.json            # Google OAuth (optional)
├── token.json                  # OAuth token (auto-generated)
├── requirements.txt            # Python dependencies
├── db.sqlite3                  # SQLite database
├── start.sh                    # Startup script
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)

```bash
chmod +x start.sh
./start.sh
```

This starts both backend (port 8000) and opens the frontend.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python -m http.server 3000
# Then open http://localhost:3000
```

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/ (username/password required)

---

## 📚 Installation Guide

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- OpenAI API key (required)
- Gmail account with App Password (for notifications)
- Google Cloud Project with Drive API (optional, for Drive sync)

### Step-by-Step Setup

#### 1. Navigate to Project
```bash
cd /path/to/Hrautomation-main
```

#### 2. Create Virtual Environment (Optional but Recommended)
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Setup Database
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 5. Create Admin User
```bash
python manage.py createsuperuser
# Follow prompts to set username and password
```

#### 6. Configure Environment Variables

Create/edit `.env` file in project root:
```env
# REQUIRED: OpenAI API Key
OPENAI_API_KEY=sk-proj-your_actual_key_here

# REQUIRED: Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Optional: Suppress pygame messages
PYGAME_HIDE_SUPPORT_PROMPT=1
```

#### 7. Add Job Description
Place your job posting PDF at:
```
data/templates/hiring_post.pdf
```

#### 8. Start the System
```bash
# From project root
./start.sh

# OR manually:
cd backend && python manage.py runserver &
cd frontend && python -m http.server 3000 &
```

---

## ⚙️ Configuration

### Environment Variables (.env file)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | `sk-proj-...` |
| `EMAIL_USER` | Gmail address | ✅ Yes | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | ✅ Yes | `abcd efgh ijkl mnop` |
| `PYGAME_HIDE_SUPPORT_PROMPT` | Suppress pygame logs | ⚪ Optional | `1` |

### Getting Required Credentials

#### OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key (starts with `sk-proj-`)
4. Paste in `.env` file
5. **Important**: Restart backend server after updating!

#### Gmail App Password
1. Enable 2-Factor Authentication on your Google account
2. Visit: https://myaccount.google.com/apppasswords
3. Select app: "Mail"
4. Select device: "Other" → Type "HR Automation"
5. Click "Generate"
6. Copy 16-character password (remove spaces)
7. Paste in `.env` as `EMAIL_PASS`

#### Google Drive (Optional - for auto-sync)
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create project or select existing
3. Enable "Google Drive API"
4. Create OAuth 2.0 credentials (Desktop app)
5. Download `credentials.json` to project root
6. Update `folder_id` in `src/integrations/drive_ingestor.py`

**Get Folder ID from URL:**
```
https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
```

### Application Settings

#### Scoring Threshold
Edit `backend/api/views.py` in `analyze_resumes()` function:
```python
if result and result.get('score', 0) >= 80:  # Change 80 to desired threshold
    # Candidate shortlisted
```

#### Interview Details
Configure in frontend Notifications page, or set defaults in `backend/api/views.py`.

---

## 🔄 Workflow

### Complete Process Flow

```
┌────────────────────────────────────────────────────────────┐
│  STEP 1: Resume Collection                                 │
│  • Method A: Sync from Google Drive (OAuth)                │
│  • Method B: Manual upload via web interface               │
│  • Resumes saved to data/resumes/                          │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  STEP 2: Document Processing                               │
│  • Extract text from Job Description PDF                   │
│  • Extract text from each resume PDF                       │
│  • Validate file formats                                   │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  STEP 3: AI Analysis (OpenAI GPT-4o-mini)                  │
│  For each resume:                                          │
│    → Send JD + Resume text to OpenAI                       │
│    → Receive structured JSON:                              │
│      • ATS Score (0-100)                                   │
│      • Candidate details (name, email, phone)              │
│      • Skills analysis (matching/missing)                  │
│      • Experience years                                    │
│      • Fitness reasoning                                   │
│    → Store in database (Candidate model)                   │
│    → Filter by score >= 80                                 │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  STEP 4: Results & Reporting                               │
│  • Display shortlisted candidates on dashboard             │
│  • Generate Excel report (shortlist_YYYYMMDD.xlsx)        │
│  • Save to outputs/excel_reports/                          │
│  • Update AnalysisJob statistics                           │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│  STEP 5: Notifications (Optional)                          │
│  • Configure interview (date/time/location)                │
│  • Select candidates to notify                             │
│  • Send email invitations (Gmail SMTP)                     │
│  • Send WhatsApp messages (PyWhatKit)                      │
│  • Log all notifications                                   │
└────────────────────────────────────────────────────────────┘
```

### System Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (HTML/CSS/JS) - Port 3000         │
│  • Dashboard                                 │
│  • Candidates List                           │
│  • Analysis Page                             │
│  • Notifications                             │
└────────────┬────────────────────────────────┘
             │ HTTP/Fetch API
             ▼
┌─────────────────────────────────────────────┐
│  Django REST API - Port 8000                │
│  • /api/dashboard-stats/                     │
│  • /api/candidates/                          │
│  • /api/analyze-resumes/                     │
│  • /api/send-notifications/                  │
└────────────┬────────────────────────────────┘
             │ Django ORM
             ▼
┌─────────────────────────────────────────────┐
│  SQLite Database (db.sqlite3)               │
│  • Candidate                                 │
│  • JobDescription                            │
│  • AnalysisJob                               │
└─────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Core Python Modules (src/)                 │
│  • ats_scorer.py (OpenAI integration)        │
│  • pdf_reader.py (Text extraction)           │
│  • drive_ingestor.py (Google Drive)          │
│  • notifier.py (Email & WhatsApp)            │
└────────────┬────────────────────────────────┘
             │ API Calls
             ▼
┌─────────────────────────────────────────────┐
│  External Services                           │
│  • OpenAI API (GPT-4o-mini)                  │
│  • Google Drive API                          │
│  • Gmail SMTP                                │
│  • WhatsApp Web (PyWhatKit)                  │
└─────────────────────────────────────────────┘
```

---

## 🌐 API Endpoints

### Dashboard
- `GET /api/dashboard-stats/`
  - Returns: Total candidates, shortlisted count, average score, recent analysis jobs

### Candidates
- `GET /api/candidates/` - List all candidates
- `GET /api/candidates/{id}/` - Get specific candidate details
- `GET /api/candidates/shortlisted/` - Get candidates with score >= 80
- `GET /api/candidates/statistics/` - Get candidate statistics
- `POST /api/candidates/{id}/send_notification/` - Send notification to one candidate

### Analysis
- `POST /api/sync-drive/` - Sync resumes from Google Drive
- `POST /api/upload-resume/` - Upload resume file
  - Content-Type: `multipart/form-data`
  - Field: `file` (PDF)
- `POST /api/analyze-resumes/` - Analyze all resumes in data/resumes/
- `GET /api/analysis-jobs/` - List all analysis jobs
- `GET /api/analysis-jobs/latest/` - Get latest analysis job with results

### Notifications
- `POST /api/send-notifications/`
  - Body: `{ "candidate_ids": [1,2,3], "date": "...", "time": "...", "location": "..." }`
  - Sends Email + WhatsApp to selected candidates

### Job Descriptions
- `GET /api/job-descriptions/` - List job descriptions
- `GET /api/job-descriptions/{id}/` - Get specific job description

---

## 💻 Usage Guide

### Web Interface Usage

#### 1. Dashboard Page
**Access**: http://localhost:3000

**Features**:
- View real-time statistics (total candidates, shortlisted, avg score)
- See recent analysis jobs with timestamps
- Quick navigation to other sections

#### 2. Candidates Page
**Features**:
- Browse all analyzed candidates
- **Search**: By name or email
- **Filter**: All / Shortlisted / Rejected
- **Sort**: By score (high to low)
- **View Details**: Click candidate card for full profile
- **Send Notification**: Individual email/WhatsApp

#### 3. Analyze Resumes Page

**Option A: Sync from Google Drive**
1. Click "Sync Drive" button
2. Authenticate with Google (first time only - OAuth consent)
3. System automatically downloads new resumes
4. Files saved to `data/resumes/`

**Option B: Manual Upload**
1. Go to "Upload Resume" section
2. Drag & drop PDF files or click "Select Files"
3. Upload single or multiple resumes
4. Instant upload feedback

**Start Analysis**:
1. Ensure resumes are in `data/resumes/`
2. Click "Start Analysis" button
3. Wait for processing (progress indicator shown)
4. Results automatically appear in Candidates page
5. Excel report generated in `outputs/excel_reports/`

#### 4. Notifications Page
1. **Configure Interview Details**:
   - Date (e.g., "March 15, 2026")
   - Time (e.g., "10:30 AM")
   - Location (e.g., "Zoom: https://zoom.us/j/123456789")
2. **Select Candidates**: Choose from shortlisted list
3. **Send**: Click "Send Notifications" button
4. System dispatches:
   - Professional email via Gmail
   - WhatsApp message (if phone provided)
5. Confirmation shown for each sent message

#### 5. Settings Page
- View API configuration status (OpenAI, Email, Google Drive)
- Check file paths
- System information

### Django Admin Panel

**Access**: http://localhost:8000/admin/

**Login**: Use superuser credentials created during setup

**Features**:
- Full CRUD operations on all models
- Manage candidates manually
- Edit job descriptions
- View analysis job history
- User management
- Bulk actions

### Terminal/CLI Usage (Legacy)

You can still use the original Python script:
```bash
python main.py
```

This runs the complete workflow without the web interface:
1. Syncs from Google Drive
2. Analyzes all resumes
3. Generates Excel report
4. Prompts to send notifications

---

## 🔐 Google Drive OAuth Setup

### Problem: "disabled_client" Error

If you see:
```
disabled_client: The OAuth client was disabled.
```

### Solution 1: Fix OAuth Credentials

#### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with the Google account that created the project
3. Select your project

#### Step 2: Check OAuth Consent Screen
1. Navigate to **APIs & Services** → **OAuth consent screen**

**If app is in Testing Mode**:
- Click "ADD USERS"
- Add your Gmail address
- Save changes

**Or Publish the App**:
- Click "PUBLISH APP"
- Confirm (fine for personal use)

#### Step 3: Verify Credentials
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID
3. Ensure it's **not disabled**
4. If disabled, click and enable

#### Step 4: Enable Drive API
1. Go to **APIs & Services** → **Library**
2. Search "Google Drive API"
3. Click "Enable" if not already enabled

#### Step 5: Re-authenticate
```bash
rm token.json
# Next Drive sync will prompt for authentication
```

### Solution 2: Create New OAuth Credentials

If above doesn't work:

1. **Create New Project** in Google Cloud Console
2. **Enable Google Drive API**
3. **Configure OAuth Consent**:
   - External app type
   - Add your email as test user
   - Add scope: `../auth/drive.readonly`
4. **Create Credentials**:
   - Type: OAuth 2.0 Client ID
   - Application type: Desktop app
5. **Download JSON** and rename to `credentials.json`
6. Replace existing file in project root
7. Delete `token.json`
8. Try sync again

### Solution 3: Use Manual Upload (Quick Alternative)

If you don't need Google Drive sync:

1. Open http://localhost:3000
2. Go to "Analyze Resumes" page
3. Use "Upload Resume" section
4. Drag & drop your PDF files
5. Click "Start Analysis"

This works without any Google OAuth! ✅

### Verify Drive Sync Works

```bash
# Delete old token
rm token.json

# Test sync
python -c "from src.integrations.drive_ingestor import download_new_cvs; download_new_cvs()"
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Server Won't Start
```bash
cd backend
python manage.py migrate
python manage.py runserver
```

#### Database Errors
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

#### Import Errors / Module Not Found
```bash
pip install -r requirements.txt
```

### API Issues

#### CORS Errors
- Verify backend runs on `http://localhost:8000`
- Check `CORS_ALLOW_ALL_ORIGINS = True` in `backend/app/settings.py`
- Restart backend server

#### API Connection Failed
- Confirm backend server is running
- Check `API_BASE_URL` in `frontend/js/app.js` matches backend URL
- Open browser DevTools → Network tab to see failed requests

### OpenAI API Issues

#### 401 Error: Incorrect API Key
```bash
# 1. Get valid key from https://platform.openai.com/api-keys
# 2. Update .env file:
OPENAI_API_KEY=sk-proj-your_new_key_here
# 3. IMPORTANT: Restart backend server!
cd backend
pkill -f "python manage.py runserver"
python manage.py runserver
```

#### Analysis Returns 0 Candidates
- Check OpenAI API key is valid
- Verify `.env` file has no quotes around key
- Ensure job description PDF exists at `data/templates/hiring_post.pdf`
- Check backend logs for errors
- Test API key:
  ```bash
  python -c "from openai import OpenAI; import os; from dotenv import load_dotenv; load_dotenv(); client = OpenAI(api_key=os.getenv('OPENAI_API_KEY')); print(client.models.list())"
  ```

### Google Drive Issues

#### OAuth Errors
- See [Google Drive OAuth Setup](#google-drive-oauth-setup) section
- Alternative: Use manual upload

#### Folder Not Found
- Update `folder_id` in `src/integrations/drive_ingestor.py`
- Get ID from Drive URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`

#### "invalid_grant" Error
```bash
rm token.json
# Re-authenticate on next sync
```

### Email Issues

#### Email Not Sending
- Enable 2-Factor Authentication on Gmail
- Generate App Password (not regular password)
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Check firewall/antivirus isn't blocking port 465

#### SMTP Authentication Failed
```bash
# Test email credentials
python -c "
import smtplib
import os
from dotenv import load_dotenv
load_dotenv()
server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
server.login(os.getenv('EMAIL_USER'), os.getenv('EMAIL_PASS'))
print('Email auth successful!')
server.quit()
"
```

### WhatsApp Issues

#### WhatsApp Not Sending
- Ensure Chrome browser is installed
- First-time: Scan QR code to authenticate WhatsApp Web
- Check phone number format includes country code (e.g., +1234567890)
- Close other WhatsApp Web sessions

#### "PyWhatKit" Errors
```bash
pip install --upgrade pywhatkit
```

### Frontend Issues

#### Page Not Loading
- Check frontend server is running on port 3000
- Try different port: `python -m http.server 8080`
- Open browser console (F12) for errors

#### Blank Dashboard / No Data
- Verify backend is running and accessible
- Check browser console for CORS errors
- Analyze some resumes first to populate data

### General Debugging

#### Check Logs
```bash
# Backend logs
tail -f backend.log

# Or check terminal where backend runs
```

#### Restart Everything
```bash
# Kill servers
pkill -f "python manage.py runserver"
pkill -f "python -m http.server"

# Restart
./start.sh
```

#### Reset Database
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## 📊 Output Files

### Excel Reports
**Location**: `outputs/excel_reports/shortlist_YYYYMMDD_HHMM.xlsx`

**Columns**:
- `candidate_name`
- `email`
- `phone`
- `years_of_experience`
- `score` (0-100)
- `fitness_reasoning`
- `matching_skills`
- `missing_skills`
- `verdict` ("Shortlist" or "Reject")

### WhatsApp Log
**Location**: `PyWhatKit_DB.txt`

Logs all sent WhatsApp messages with timestamps.

### Database
**Location**: `db.sqlite3`

Contains all candidate data, job descriptions, and analysis job history.

---

## 🔒 Security Notes

- ⚠️ **Never commit** `.env`, `credentials.json`, or `token.json` to version control
- Use Gmail App Passwords instead of account passwords
- Rotate API keys regularly
- Limit Google Drive folder access to necessary files only
- Set `DEBUG = False` in production
- Use environment variables for all secrets
- Enable HTTPS in production

---

## 🚧 Future Enhancements

Based on placeholder files:

- **JD Generator** (`jd_generator.py`): Auto-generate job descriptions using AI
- **Vision OCR** (`vision_ocr.py`): Process image-based or scanned resumes
- **LinkedIn Integration** (`linkedin.py`): Auto-post job openings
- **Facebook Integration** (`facebook.py`): Social media recruitment
- **SMS Notifications**: Add carrier gateway support
- **PostgreSQL Support**: For production deployments
- **Docker Containerization**: Easy deployment
- **CI/CD Pipeline**: Automated testing and deployment

---

## 📄 License

This project is for internal HR automation purposes.

---

## 👥 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Configuration](#configuration) guide
3. Verify all environment variables are set correctly
4. Check backend logs for detailed error messages

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Start system
./start.sh

# Backend only
cd backend && python manage.py runserver

# Frontend only
cd frontend && python -m http.server 3000

# Create admin user
cd backend && python manage.py createsuperuser

# Reset database
cd backend && rm db.sqlite3 && python manage.py migrate

# Test OpenAI API
python -c "from openai import OpenAI; import os; from dotenv import load_dotenv; load_dotenv(); client = OpenAI(api_key=os.getenv('OPENAI_API_KEY')); print('API key valid!' if client.models.list() else 'Invalid')"

# Install/update dependencies
pip install -r requirements.txt
```

### Important URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/
- OpenAI Dashboard: https://platform.openai.com/
- Google Cloud Console: https://console.cloud.google.com/

---

**Built with ❤️ for smarter hiring**
