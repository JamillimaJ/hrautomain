# Data Folder Structure

## Folders

### 📁 `resumes/`
- **Purpose**: Stores resumes downloaded from Google Drive via the "Sync Drive" feature
- **Source**: Google Drive sync
- **Behavior**: Files are automatically deleted after analysis completes

### 📁 `local_upload/`
- **Purpose**: Stores resumes manually uploaded through the frontend upload interface
- **Source**: Manual file uploads from users
- **Behavior**: Files are automatically deleted after analysis completes

### 📁 `templates/`
- **Purpose**: Stores job description PDFs and appointment letter templates
- **Source**: Manual uploads and system templates
- **Behavior**: Persistent storage (files are NOT deleted)

## Workflow

1. **Upload Resumes:**
   - Via Google Drive Sync → saved to `resumes/`
   - Via Frontend Upload → saved to `local_upload/`

2. **Analyze Resumes:**
   - System scans BOTH `resumes/` and `local_upload/` folders
   - Processes all PDF files found in both locations
   - Analyzes against active job description
   - Creates candidate records in database

3. **Clean Up:**
   - After successful analysis, BOTH folders are emptied automatically
   - This prevents duplicate processing in next analysis
   - Database maintains all candidate information

## Important Notes

⚠️ **Do not manually store important files in `resumes/` or `local_upload/` folders** - they will be deleted during analysis!

✅ Use `templates/` folder for permanent storage of job descriptions and templates.
