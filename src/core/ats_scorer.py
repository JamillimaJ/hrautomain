import json

def score_resume(jd_text, resume_text, client):
    """
    Analyzes a resume against a JD and extracts specific candidate details using LLM.
    """
    system_message = "You are a professional ATS (Applicant Tracking System) ranking engine specialized in technical recruitment."
    
    user_prompt = f"""
    Evaluate the following resume against the provided Job Description. 
    
    JOB DESCRIPTION:
    \"\"\"{jd_text}\"\"\"
    
    RESUME:
    \"\"\"{resume_text}\"\"\"
    
    Instructions:
    1. Score the candidate from 0-100 based on technical skills, experience level, and certifications.
    2. If a specific field like phone or email is not found, return 'Not Provided'.
    3. Ensure 'years_of_experience' is a concise string (e.g., '5 years').
    4. The 'verdict' must be 'Shortlist' ONLY if the score is 80 or higher.
    
    
    Output strictly as a JSON object with these EXACT keys:
    - candidate_name
    - email
    - phone
    - years_of_experience
    - score
    - fitness_reasoning
    - matching_skills
    - missing_skills
    - verdict
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0
        )
        # Parse the JSON response from the OpenAI choice
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error during AI scoring: {e}")
        return None