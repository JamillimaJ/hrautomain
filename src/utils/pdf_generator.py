"""
PDF Appointment Letter Generator
Generates customized appointment letters from template
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from PyPDF2 import PdfReader, PdfWriter
from datetime import datetime
import os
import io


def generate_appointment_letter(
    candidate_name,
    candidate_id,
    position,
    joining_date,
    probation_months,
    basic_salary,
    output_path,
    template_path="data/templates/appointment.pdf"
):
    """
    Generate a PDF appointment letter with candidate details using template
    
    Args:
        candidate_name (str): Full name of the candidate
        candidate_id (int): Candidate database ID
        position (str): Job position/title
        joining_date (str): Date of joining
        probation_months (int): Probation period in months
        basic_salary (str): Salary amount
        output_path (str): Path where PDF will be saved
        template_path (str): Path to the PDF template
    
    Returns:
        str: Path to generated PDF file
    """
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Get current date
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Create a canvas in memory to overlay text
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    # Register and set Times New Roman font
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    # Try to register Times New Roman, fallback to Times-Roman if not available
    try:
        can.setFont("Times-Roman", 11)
        times_font = "Times-Roman"
        times_bold = "Times-Bold"
    except:
        can.setFont("Helvetica", 11)
        times_font = "Helvetica"
        times_bold = "Helvetica-Bold"
    
    # Position coordinates (adjust these based on your template layout)
    # These positions are approximate - you may need to fine-tune them
    
    # Date at top
    can.setFont(times_font, 11)
    can.drawString(72, 720, f"Date: {current_date}")
    
    # Candidate info
    can.setFont(times_bold, 11)
    can.drawString(72, 680, candidate_name)
    can.drawString(72, 665, position)
    
    can.setFont(times_font, 11)
    can.drawString(72, 645, f"ID: {candidate_id}")
    
    # Subject
    can.setFont(times_bold, 11)
    can.drawString(72, 610, "Subject: Letter of Appointment")
    
    # Body - Salutation
    can.setFont(times_font, 11)
    can.drawString(72, 580, f"Dear {candidate_name},")
    
    # Congratulations
    can.setFont(times_bold, 11)
    can.drawString(72, 555, "Congratulations!")
    
    # Paragraph 1
    can.setFont(times_font, 11)
    text1_line1 = f"We are pleased to offer you the position of {position} at Urmi Group."
    text1_line2 = f"Your appointment will be effective from your date of joining, which is scheduled for {joining_date}."
    can.drawString(72, 530, text1_line1)
    can.drawString(72, 515, text1_line2)
    
    # Paragraph 2
    text2_line1 = f"You will be on a probationary period for {probation_months} months from your date of joining."
    text2_line2 = "Upon successful completion of your probation, your employment status will be reviewed for"
    text2_line3 = "permanent confirmation based on your dedication and performance."
    can.drawString(72, 485, text2_line1)
    can.drawString(72, 470, text2_line2)
    can.drawString(72, 455, text2_line3)
    
    # Salary structure
    can.drawString(72, 425, "Your starting salary structure is as follows:")
    can.setFont(times_bold, 11)
    can.drawString(72, 410, f"Basic Salary: {basic_salary}")
    
    # Paragraph 3
    can.setFont(times_font, 11)
    text3_line1 = "We trust that this appointment marks the beginning of a long, rewarding, and mutually beneficial"
    text3_line2 = "journey with Urmi Group. We look forward to your commitment and success with us."
    can.drawString(72, 380, text3_line1)
    can.drawString(72, 365, text3_line2)
    
    # Signature
    can.drawString(72, 320, "Sincerely,")
    can.setFont(times_bold, 11)
    can.drawString(72, 295, "Md. Kawcher Hossain")
    can.setFont(times_font, 11)
    can.drawString(72, 280, "Head of Human Resources")
    can.setFont(times_bold, 11)
    can.drawString(72, 265, "Urmi Group")
    
    can.save()
    
    # Move to the beginning of the BytesIO buffer
    packet.seek(0)
    
    # Check if template exists
    if os.path.exists(template_path):
        try:
            # Read the template PDF
            template_pdf = PdfReader(template_path)
            overlay_pdf = PdfReader(packet)
            
            # Create a PDF writer
            output = PdfWriter()
            
            # Merge the overlay with the template
            page = template_pdf.pages[0]
            page.merge_page(overlay_pdf.pages[0])
            output.add_page(page)
            
            # Write to output file
            with open(output_path, "wb") as output_stream:
                output.write(output_stream)
            
            print(f"✅ PDF generated with template: {output_path}")
        except Exception as e:
            print(f"❌ Error merging with template: {e}")
            # Fallback: create without template
            with open(output_path, "wb") as output_stream:
                output_stream.write(packet.getvalue())
            print(f"⚠️ PDF created without template background")
    else:
        # If template doesn't exist, create PDF without template
        print(f"❌ Warning: Template not found at {template_path}")
        with open(output_path, "wb") as output_stream:
            output_stream.write(packet.getvalue())
        print(f"⚠️ PDF created without template: {output_path}")
    
    return output_path


def test_generate_letter():
    """Test function to generate a sample letter"""
    output = generate_appointment_letter(
        candidate_name="John Doe",
        candidate_id=123,
        position="Senior Software Engineer",
        joining_date="March 1, 2026",
        probation_months=3,
        basic_salary="$80,000 per annum",
        output_path="outputs/appointment_letters/test_appointment.pdf"
    )
    print(f"Test letter generated at: {output}")


if __name__ == "__main__":
    test_generate_letter()
