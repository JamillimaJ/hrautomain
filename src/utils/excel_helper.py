import pandas as pd
import os

def export_to_excel(candidates, filename="top_candidates.xlsx"):
    # Ensure the output directory exists
    output_dir = "outputs/excel_reports"
    os.makedirs(output_dir, exist_ok=True)
    
    df = pd.DataFrame(candidates)
    save_path = os.path.join(output_dir, filename)
    
    # Save the file
    df.to_excel(save_path, index=False)
    print(f"✅ Excel report generated at: {save_path}")