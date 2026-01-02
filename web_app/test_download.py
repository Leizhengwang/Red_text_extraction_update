import requests
import os

def test_download_routes():
    """Test the download functionality"""
    base_url = "http://127.0.0.1:5000"
    
    print("Testing download routes...")
    
    # Test the test_download route
    try:
        response = requests.get(f"{base_url}/test_download")
        print(f"Test download status: {response.status_code}")
        if response.status_code == 200:
            print("Test download works!")
            print(f"Content length: {len(response.content)}")
        else:
            print(f"Test download failed: {response.text}")
    except Exception as e:
        print(f"Error testing download: {e}")
    
    # Check output folder
    output_folder = "output"
    if os.path.exists(output_folder):
        files = os.listdir(output_folder)
        print(f"\nFiles in output folder: {len(files)}")
        for f in files:
            file_path = os.path.join(output_folder, f)
            size = os.path.getsize(file_path)
            print(f"  - {f} ({size} bytes)")
            
            # Test download of this specific file
            try:
                response = requests.get(f"{base_url}/download/{f}")
                print(f"    Download status: {response.status_code}")
                if response.status_code != 200:
                    print(f"    Error: {response.text}")
            except Exception as e:
                print(f"    Error: {e}")
    else:
        print("Output folder doesn't exist")

if __name__ == "__main__":
    test_download_routes()