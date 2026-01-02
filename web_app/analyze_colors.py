import fitz
import sys
import os

def analyze_pdf_colors(pdf_path):
    """Analyze colors in a PDF file to help debug red text detection"""
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} not found")
        return
    
    doc = fitz.open(pdf_path)
    print(f"Analyzing PDF: {pdf_path}")
    print(f"Pages: {doc.page_count}")
    print("-" * 50)
    
    color_counts = {}
    text_samples = {}
    
    for page_num in range(min(10, doc.page_count)):  # Check first 10 pages
        print(f"\nPage {page_num + 1}:")
        text_blocks = doc[page_num].get_text("dict", flags=fitz.TEXTFLAGS_TEXT)["blocks"]
        
        for block in text_blocks:
            if 'lines' not in block:
                continue
                
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if not text:
                        continue
                        
                    color = fitz.sRGB_to_rgb(span["color"])
                    font_name = span.get("font", "")
                    font_size = span.get("size", 0)
                    
                    # Count colors
                    if color in color_counts:
                        color_counts[color] += 1
                    else:
                        color_counts[color] = 1
                        text_samples[color] = text[:30] + ("..." if len(text) > 30 else "")
                    
                    # Print details for potentially red colors
                    if color[0] > 150 or "red" in str(color).lower():
                        print(f"  Potential red: '{text[:30]}' - Color: {color}, Font: {font_name}, Size: {font_size}")
    
    print("\n" + "="*50)
    print("COLOR SUMMARY:")
    print("="*50)
    
    for color, count in sorted(color_counts.items(), key=lambda x: x[1], reverse=True):
        sample_text = text_samples[color]
        is_red = color[0] > 150 and color[1] < 100 and color[2] < 100
        red_indicator = " <-- POTENTIALLY RED!" if is_red else ""
        print(f"Color {color}: {count} occurrences{red_indicator}")
        print(f"  Sample text: '{sample_text}'")
        print()
    
    doc.close()

if __name__ == "__main__":
    # Test with files from input folder
    input_folder = r"c:\Users\LeiWang\OneDrive - American Bureau of Shipping\Desktop\subsection_extraction_app\input"
    
    if os.path.exists(input_folder):
        pdf_files = [f for f in os.listdir(input_folder) if f.endswith('.pdf')]
        if pdf_files:
            # Analyze the first PDF file
            test_file = os.path.join(input_folder, pdf_files[0])
            analyze_pdf_colors(test_file)
        else:
            print("No PDF files found in input folder")
    else:
        print("Input folder not found")