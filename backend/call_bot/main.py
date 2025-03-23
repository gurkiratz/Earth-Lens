import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse
from twilio.twiml.voice_response import VoiceResponse, Connect
import logging
from dotenv import load_dotenv
from google import genai
from google.genai.types import LiveConnectConfig, Modality, HttpOptions

# Load environment variables
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
PORT = int(os.getenv('PORT', 5050))

# Set up logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if not GEMINI_API_KEY:
    raise ValueError('Missing the Gemini API key. Please set it in the .env file.')

# FastAPI app setup
app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def index_page():
    return "<html><body><h1>Twilio Media Stream Server is running!</h1></body></html>"

@app.api_route("/incoming-call", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    """Handle incoming call and return TwiML response to connect to Media Stream."""
    logger.info("Received incoming call request from: %s", request.client.host)
    response = VoiceResponse()
    host = request.url.hostname
    connect = Connect()
    connect.stream(url=f'wss://{host}/media-stream')
    response.append(connect)
    logger.info("Successfully created the TwiML response")
    return HTMLResponse(content=str(response), media_type="application/xml")

@app.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections between Twilio and Gemini."""
    print("Client connected")
    await websocket.accept()

    # Initialize GenAI client
    client = genai.Client(http_options=HttpOptions(api_version="v1beta1"))
    model_id = "gemini-2.0-flash-exp"

    async with client.aio.live.connect(
        model=model_id,
        config=LiveConnectConfig(response_modalities=[Modality.TEXT]),
    ) as session:
        transcripts = []

        async def receive_from_twilio():
            """Receive audio data from Twilio and send it to Gemini."""
            try:
                async for message in websocket.iter_text():
                    data = json.loads(message)
                    if data['event'] == 'media':
                        audio_data = data['media']['payload']
                        # Send audio data to Gemini for processing
                        await session.send(input=audio_data, end_of_turn=False)
                    elif data['event'] == 'start':
                        print(f"Incoming stream has started")

                    elif data['event'] == 'stop':
                        print("Stream has stopped.")
                        await session.send(input="", end_of_turn=True)
                        save_transcript(transcripts)

            except WebSocketDisconnect:
                print("Client disconnected.")

        async def send_to_gemini():
            """Receive response from Gemini and send text response back to Twilio."""
            try:
                async for message in session.receive():
                    if message.text:
                        transcripts.append({'role': 'AI', 'text': message.text})
                        print(f"Gemini AI: {message.text}")
                        # Send the response text back to Twilio
                        await websocket.send_json({
                            "event": "media",
                            "streamSid": "example_stream_sid",  # Replace with actual stream sid
                            "media": {
                                "payload": message.text  # Gemini's text response
                            }
                        })
            except Exception as e:
                print(f"Error in send_to_gemini: {e}")

        await asyncio.gather(receive_from_twilio(), send_to_gemini())

def save_transcript(transcripts):
    """Save the transcript to a file or database"""
    with open(f"transcript_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.txt", 'w') as f:
        for entry in transcripts:
            f.write(f"{entry['role']}: {entry['text']}\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
