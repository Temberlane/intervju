import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import pathlib
import httpx

load_dotenv()

client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))

# Retrieve and encode the PDF byte
resume_path = pathlib.Path('Resume.pdf')
# Read the job info text file
job_file = pathlib.Path('Ciena_Embedded_Software_Internship.txt')
job_info = job_file.read_text()

# FIND COMPANY VALUES AND WORKPLACE CULTURE IN A SEPERATE PROMPT
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
minutes = 30
print(culture_response.text)
prompt = (
    "Using the attached resume (in PDF format) and the job information provided in the text file, "
    "generate a list of targeted interview questions that evaluate the candidate's technical expertise, "
    "problem-solving abilities, and alignment with the role's responsibilities. "
    "Try to evaluate the candidate's situational and behavioural awareness and how well "
    "they can be expected to fit into the office's work environment and company's values. Take into account the company's culture and workplace environment which is described as the following : {culture_response.text}. Keep in mind that these questions are going to be used in an interview that will last roughly {minutes} many minutes. Make it so that the list can be comfortably read and answered within that time frame." \
    "[RULES] For any parts in the reponse that are spoken need to be surrounded by $$ and endded by $$ as markers for the spoken questions."
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
print(response.text)
