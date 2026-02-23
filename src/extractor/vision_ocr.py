import base64
import os
from openai import OpenAI
from dotenv import load_dotenv
import pymupdf

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_text_with_vision_page(doc, page_num):
    """
    Extract text from a single page of an image-based PDF using OpenAI Vision API
    
    Args:
        doc: PyMuPDF document object
        page_num: Page number to extract (0-indexed)
    
    Returns:
        Extracted text from the page
    """
    try:
        page = doc[page_num]
        
        # Convert page to image with higher resolution for better OCR
        pix = page.get_pixmap(matrix=pymupdf.Matrix(2, 2))  # 2x zoom for better quality
        img_data = pix.tobytes("png")
        
        # Convert to base64
        base64_image = base64.b64encode(img_data).decode('utf-8')
        
        # Use OpenAI Vision API to extract text
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all text from this resume/CV page. Return only the extracted text, preserving structure. Include all information: name, contact details, education, experience, skills, certifications, etc."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}",
                                "detail": "high"  # Use high detail for better text recognition
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"❌ Error with Vision OCR for page {page_num + 1}: {e}")
        return ""


def extract_text_with_vision(pdf_path):
    """
    Extract text from entire image-based PDF using OpenAI Vision API
    (Legacy function for backward compatibility)
    """
    extracted_text = ""
    
    try:
        doc = pymupdf.open(pdf_path)
        
        for page_num in range(len(doc)):
            page_text = extract_text_with_vision_page(doc, page_num)
            extracted_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
        
        doc.close()
        return extracted_text
        
    except Exception as e:
        print(f"❌ Error with Vision OCR for {pdf_path}: {e}")
        return ""
