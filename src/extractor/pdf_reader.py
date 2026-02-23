import pymupdf 
from .vision_ocr import extract_text_with_vision_page

def extract_text(pdf_path):
    """
    Extracts text from a PDF file. Handles both text-based and image-based PDFs.
    - Tries text extraction first (fast and free)
    - Falls back to OCR for pages with minimal/no text (image-based pages)
    - Supports mixed PDFs (some pages text, some images)
    """
    full_text = ""
    
    try:
        doc = pymupdf.open(pdf_path)
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc[page_num]
            page_text = page.get_text().strip()
            
            # Check if page has sufficient text (>200 chars indicates proper text-based page)
            # This threshold helps distinguish between:
            # - Text PDFs with full content (use extracted text)
            # - Image PDFs with minimal metadata (use OCR)
            if len(page_text) > 200:
                # Text-based page with substantial content - use extracted text
                full_text += f"\n{page_text}\n"
            else:
                # Image-based page or minimal text - use OCR
                print(f"   📷 Page {page_num + 1}/{total_pages}: Using OCR (image-based or minimal text)")
                ocr_text = extract_text_with_vision_page(doc, page_num)
                full_text += f"\n{ocr_text}\n"
        
        doc.close()
        
        # Final check: if entire PDF yielded minimal text, it might have failed
        if len(full_text.strip()) < 100:
            print(f"⚠️  Minimal text extracted from {pdf_path}. This might be an issue.")
            
    except Exception as e:
        print(f"❌ Error reading {pdf_path}: {e}")
    
    return full_text