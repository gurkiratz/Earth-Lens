import os
from google import genai
from google.genai import types

def get_sentiment_class(sentiment_text):
    # Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    # Replace 'path/to/your/credentials.json' with the actual path to your credentials file.
    # IMPORTANT: Ensure the file path is correct.
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gemini-genai-454500-216b12cc8cc0.json"

    client = genai.Client(
        vertexai=True,
        project="659678787868",
        location="us-central1",
    )

    text1 = types.Part.from_text(text=f"""Classify the following tweet into one of the following categories: ['Incident Report', 'Distress Call', 'Evacuation Warning', 'Fire Near Key Infrastructure', 'Roadblock or Escape Issue', 'Request for Emergency Help']. Text: {sentiment_text}""")

    model = "projects/659678787868/locations/us-central1/endpoints/2415940407037788160"
    contents = [
        types.Content(
            role="user",
            parts=[
                text1
            ]
        )
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        max_output_tokens=8192,
        response_modalities=["TEXT"],
        safety_settings=[types.SafetySetting(
            category="HARM_CATEGORY_HATE_SPEECH",
            threshold="OFF"
        ), types.SafetySetting(
            category="HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold="OFF"
        ), types.SafetySetting(
            category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold="OFF"
        ), types.SafetySetting(
            category="HARM_CATEGORY_HARASSMENT",
            threshold="OFF"
        )],
    )

    result = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        result += chunk.text
    return result

