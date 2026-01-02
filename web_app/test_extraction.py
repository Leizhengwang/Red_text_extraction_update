import sys
import os
sys.path.append('.')

from app import extract_red_pdf_contents, extract_images_with_positions, create_word_document_with_positioned_images

def test_extraction():
    """Test the extraction process locally"""
    input_folder = r"c:\Users\LeiWang\OneDrive - American Bureau of Shipping\Desktop\subsection_extraction_app\input"
    
    pdf_files = [f for f in os.listdir(input_folder) if f.endswith('.pdf')]
    if not pdf_files:
        print("No PDF files found in input folder")
        return
    
    test_file = os.path.join(input_folder, pdf_files[0])
    print(f"Testing with file: {test_file}")
    
    # Read PDF data
    with open(test_file, 'rb') as f:
        pdf_data = f.read()
    
    print(f"PDF file size: {len(pdf_data)} bytes")
    
    # Extract red content
    print("\n" + "="*50)
    print("EXTRACTING RED CONTENT...")
    print("="*50)
    processed_pdf_data = extract_red_pdf_contents(pdf_data, pdf_files[0])
    
    print(f"Processed PDF size: {len(processed_pdf_data)} bytes")
    
    # Extract images
    print("\n" + "="*50)
    print("EXTRACTING IMAGES...")
    print("="*50)
    images = extract_images_with_positions(processed_pdf_data)
    
    # Create Word document
    print("\n" + "="*50)
    print("CREATING WORD DOCUMENT...")
    print("="*50)
    word_filename = f"test_output_{pdf_files[0].replace('.pdf', '.docx')}"
    word_path = os.path.join("output", word_filename)
    
    create_word_document_with_positioned_images(images, word_path)
    
    print(f"\nTest completed! Check the output file: {word_path}")

if __name__ == "__main__":
    test_extraction()