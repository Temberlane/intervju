import os
import sys
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
import pathlib
import re

def parse_response(text):
    """
    Parse text containing interview questions and their purposes.
    
    Questions are marked with $$ at start and end.
    Purposes are marked with && at start and end.
    
    Returns a list of tuples: [(question, purpose), ...]
    """
    # Extract all questions (text between $$ markers)
    questions = re.findall(r'\$\$(.*?)\$\$', text, re.DOTALL)
    
    # Extract all purposes (text between && markers)
    purposes = re.findall(r'&&(.*?)&&', text, re.DOTALL)
    
    # Create list of (question, purpose) tuples
    qa_pairs = []
    for i in range(min(len(questions), len(purposes))):
        qa_pairs.append((questions[i].strip(), purposes[i].strip()))
    
    return qa_pairs

def main():
    # Get arguments from command line
    resume_path = sys.argv[1] if len(sys.argv) > 1 else 'Resume.pdf'
    job_file_path = sys.argv[2] if len(sys.argv) > 2 else 'Ciena_Embedded_Software_Internship.txt'
    minutes = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    
    load_dotenv()
    
    client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))
    
    # Read files
    resume_path = pathlib.Path(resume_path)
    job_file = pathlib.Path(job_file_path)
    job_info = job_file.read_text()
    
    # FIND COMPANY VALUES AND WORKPLACE CULTURE IN A SEPARATE PROMPT
    culture_prompt = (
        "Using the attached job information provided in the text file, extract and summarize the company's values and workplace culture. "
        "Highlight any mentions of diversity, innovation, team collaboration, mentorship, ethical standards, and employee well-being. "
        "Present the response as a clear and concise list."
    )

    culture_response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=job_info.encode('utf-8'),
                mime_type='text/plain',
            ),
            culture_prompt
        ]
    )
    
    # Generate interview questions
    prompt = (
        f"Using the attached resume (in PDF format) and the job information provided in the text file, "
        f"generate a list of targeted interview questions that evaluate the candidate's technical expertise, "
        f"problem-solving abilities, and alignment with the role's responsibilities. "
        f"Try to evaluate the candidate's situational and behavioural awareness and how well "
        f"they can be expected to fit into the office's work environment and company's values. Take into account the company's culture and workplace environment which is described as the following : {culture_response.text}. Keep in mind that these questions are going to be used in an interview that will last roughly {minutes} many minutes. Make it so that the list can be comfortably read and answered within that time frame. "
        f"[RULES] For any parts in the response that are spoken need to be surrounded by $$ and ended by $$ as markers for the spoken questions. For any parts that highlight the purpose of a question, surround it with && and ended by &&. Do not use unnatural language such as \"()\" in your response. Do not use acronyms such as e.g or etc, but words like API for Application Programming Interface are ok."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=resume_path.read_bytes(),
                mime_type='application/pdf',
            ),
            types.Part.from_bytes(
                data=job_info.encode('utf-8'),
                mime_type='text/plain',
            ),
            prompt
        ]
    )
    
    # Get the parsed questions
    questions = parse_response(response.text)
    
    # Convert to a serializable format and print as JSON
    serializable_questions = []
    for q, p in questions:
        serializable_questions.append({"question": q, "purpose": p})
    
    print(json.dumps(serializable_questions))

if __name__ == "__main__":
    main()
