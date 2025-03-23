import os
import logging
import uuid
import json
import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud import aiplatform

# Initialize logging
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
path_to_service_json = os.path.join(os.path.dirname(__file__), 'genai-genesis-301f1-382e6569b799.json')
cred = credentials.Certificate(path_to_service_json)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize Vertex AI
aiplatform.init(project='gemini-genai-454500', location='us-central1')  # Adjust project ID and location

# Function to push data to Firebase
def push_to_firebase(response):
    try:
        response["datetime"] = datetime.datetime.now().isoformat()
        response["status"] = "pending"
        response["ticket_id"] = "TICKET" + uuid.uuid4().hex

        # Save to Firebase Firestore
        doc_ref = db.collection('tickets').document(response['ticket_id'])
        print(response)
        doc_ref.set(response)
    except Exception as e:
        logger.error(f"Error saving data to Firebase: {e}")


# Function to classify and create a ticket based on the transcript
def classify_and_create_ticket(transcripts):
    try:
        # Create a chat prompt for Vertex AI
        chat_prompt = f"""
        Based on the provided transcript {str(transcripts)}, which is a communication between a victim and emergency services,
        produce the response in JSON format, to the best of your knowledge with the following keys:
        'name', 'priority', 'summary', 'services_needed' (ambulance, firebrigade), 'life_threatening', 'ticket_type' 
        (one of the following: fire, earthquake, flood, hurricane, landslide, disease), 'smoke_visibility', 'fire_visibility', 
        'breathing_issue', 'location', 'help_for_whom' (yourself, someone else).
        Just provide the JSON, I don’t need explanations or assumptions.
        """

        # Request completion from Vertex AI Chat model
        model = "projects/your-project-id/locations/us-central1/models/your-model-id"  # Replace with your model id

        response = aiplatform.gapic.PredictionServiceClient().predict(
            endpoint=model,
            instances=[{"content": chat_prompt}],
            parameters={"temperature": 0.5},
        )

        # Parse the response and clean it up
        response_text = response.predictions[0]
        response_text = response_text.strip()

        # Convert the response to JSON format and push it to Firebase
        push_to_firebase(json.loads(response_text))

    except Exception as e:
        logger.error(f"Error classifying and creating ticket: {e}")
        response = {
            "None": None
        }

