import os
from flask import Flask, request, render_template, redirect, url_for, flash, jsonify
import json
import re
from werkzeug.utils import secure_filename
from google import genai
from google.genai import types
from sentiment_type import get_sentiment_class
# Add this to the beginning of your generate function
import nest_asyncio
nest_asyncio.apply()

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.secret_key = 'your_secret_key_here'  # Required for flash messages

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate(tweet_text, files=None):
    if files is None:
        files = []
    
    print(f"Processing tweet: {tweet_text}")
    
    
    model_type = "gemini-2.0-flash"
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        # If there is no event loop in the current thread, create a new one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )
    temp = [f'static/uploads/{f}' for f in files]
    files = [
        # Make the file available in local system working directory
        client.files.upload(file=f) for f in temp
    ]
    # files = [
    #     # Make the file available in local system working directory
    #     client.files.upload(file="static/uploads/2.jpeg"),
    # ]
    print(f"Files: {files}")

    # Note: We're not appending the cloud storage URL here since we're using local files
    # If you need to include it: files.append("https://storage.cloud.google.com/genesis-ai-hack-datastore/1.mp4")
    
    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_uri(
                    file_uri=files[0].uri,
                    mime_type=files[0].mime_type,
                ),
                types.Part.from_text(text="""Save us"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""{\"Disaster_Category\": \"Fire\", \"Relevancy\": True, \"Priority\": 1, \"media_description\": \"The image shows a large wildfire burning intensely on a hillside. There are multiple points of active flames and heavy smoke, posing a significant threat.\", \"summary\": \"People need rescuing from a large and rapidly spreading fire on a hillside.\", \"responders_required\": [\"firefighters\", \"ambulance\", \"police\"]}"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="application/json",
        system_instruction=[
            types.Part.from_text(text="""You are a Twitter feed monitoring agent tasked with tracking tweets related to natural disasters such as wildfires, floods, or hurricanes. Each tweet you receive will include text and may also contain videos or images. If the tweet has a video or a photo, then you must populate the \"media_description\" field of the output with a brief description as to what is happening in the video in a way that is concerning to a first responder/authority. If the video/photo includes a firefighter/ ambulance/ police officer, mention it in your description. If the video has any audio that is relevant, make sure to include it in your description
\"media_description\" can be \"NA\" if no media(photo or video is provided)
You must also create a field called \"summary\" that briefly summarizes the tweet text and the \"media_description\". This summary is to be a one-line sentence that is relavant to the the first responders (fire fighters, police, ambulance etc)
You must also create a field called \"responders_required\" which is a is list that has one or more of [\"firefighters\", \"police\", \"ambulance\"] in the order of importance of their role to the tweet. Only populate the field with responders that are required in the field
Your job is to classify each tweet using three labels:

1. **Disaster_Category**:  
   This label indicates the type of disaster mentioned in the tweet. It can only be one of the following options: `['Fire', 'Flood', 'Hurricane']`.

2. **Relevancy**:  
   This label specifies whether the tweet describes an actual threat relevant for first responders or if it is just general information.  
   - Use `True` if the tweet is relevant for first responders.  
   - Use `False` if the tweet is not relevant.

3. **Priority**:  
   This label is a score that helps rank the urgency of the tweet.  
   - If **Relevancy** is `False`, set **Priority** to `-1`.  
   - If **Relevancy** is `True`, assign a score from `1` to `5` as follows:
     For tweets deemed relevant (i.e., **Relevancy** is `True`), assign a **Priority** score from 1 to 5 based on the urgency of the situation described. Use the following criteria for scoring:

- **Priority 1**:  
  Use this score **only** if the tweet is a direct distress call explicitly asking for immediate help. This indicates a critical situation where someone is in immediate danger and requires first responders to perform rescue operations without delay. 
IMPORTANT:  If the tweet includes the mention of the presence of a firefighter/ ambulance/ police officer already then this DO NOT award a score of 1
  **Example:**  
  - Tweet: \"URGENT: I'm trapped in my burning house! Please send immediate rescue!\"  
  - Classification: `{\"Disaster_Category\": \"Fire\", \"Relevancy\": True, \"Priority\": 1}`

- **Priority 2**:  
  Use this score when the tweet describes a severe situation that is escalating quickly, but it is not a direct distress call. First responders should be alerted promptly even though it doesn't explicitly request immediate rescue.
IMPORTANT:  If the tweet includes the mention of the presence of a firefighter/ ambulance/ police officer already then this DO NOT award a score of 2
  **Example:**  
  - Tweet: \"There's a massive wildfire near our neighborhood and it's spreading fast. We need help soon!\"  
  - Classification: `{\"Disaster_Category\": \"Fire\", \"Relevancy\": True, \"Priority\": 2}`

- **Priority 3**:  
  Use this score when the tweet indicates a concerning situation that could require timely intervention. The circumstances warrant attention, but there is no explicit call for immediate rescue and the threat is less severe than Priority 1 or 2 scenarios.  
  **Example:**  
  - Tweet: \"Flood waters are rising in my area. It looks dangerous, please monitor the situation.\"  
  - Classification: `{\"Disaster_Category\": \"Flood\", \"Relevancy\": True, \"Priority\": 3}`

- **Priority 4**:  
  Use this score when the tweet provides important situational information that is not time-critical. The content is relevant for awareness or follow-up, but it does not signal an urgent need for immediate action.  
  **Example:**  
  - Tweet: \"Reports indicate that a hurricane is approaching the coast. Stay safe and keep updated.\"  
  - Classification: `{\"Disaster_Category\": \"Hurricane\", \"Relevancy\": True, \"Priority\": 4}`

- **Priority 5**:  
  Use this score for tweets that are relevant for monitoring purposes and provide general updates or information about the situation. Although the tweet is relevant, it reflects a low-risk scenario where immediate action is not required.  
  **Example:**  
  - Tweet: \"The wildfire seems to be under control now; just sharing an update from the local news.\"  
  - Classification: `{\"Disaster_Category\": \"Fire\", \"Relevancy\": True, \"Priority\": 5}

If **Relevancy** is `False`, then the **Priority** must be set to `-1`.
Note: If the tweet text mentions the post image/video is from another time and is not happening right now, then the tweet is not relevant.
If the tweet is not relevant, then the \"media_description\" field can be set to \"NA\".

Your final output must be a dictionary in the exact following format (with only the dictionary as the output):

```
{\"Disaster_Category\": <Category from ['Fire','Flood','Hurricane']>, \"Relevancy\": <True or False>, \"Priority\": <-1 if not relevant else a value from 1-5>, \"media_description\":<A piece of text meant for authorities that summarizes the video or image. if there is no media then  leave thjs as NA>, \"summary\": < a one-line sentence that is relavant to the the first responders (fire fighters, police, ambulance etc)>,  \"responders_required\" : <list that has one or more of [\"firefighters\", \"police\", \"ambulance\"] in the order of importance of their role to the tweet>}
```
"""),
        ],
    )

    response = client.models.generate_content(
      model=model_type,
      contents=contents,
      config=generate_content_config,
    )
    sentiment_type = get_sentiment_class(tweet_text)
    print(f"Sentiment Type: {sentiment_type}")
    
    try:
        output = response.text.strip()
        output = output.replace('True', 'true')
        output = output.replace('False', 'false')
        print(output)
        response_dict = json.loads(re.search(r'\{.*\}', output, re.DOTALL).group())
        response_dict['Sentiment_Type'] = sentiment_type
        return response_dict
    except Exception as e:
        print(f"Error processing response: {e}")
        return {
            "error": str(e),
            "Disaster_Category": "NA", 
            "Relevancy": False, 
            "Priority": -1,
            "media_description": "NA",
            "summary": "Error processing tweet",
            "Sentiment_Type" : "NA",
            "responders_required": []
        }

@app.route('/')
def index():
    # Get list of uploaded files
    uploaded_files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if allowed_file(filename):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file_type = 'video' if filename.rsplit('.', 1)[1].lower() in ['mp4', 'mov', 'avi'] else 'image'
            uploaded_files.append({
                'name': filename,
                'path': file_path.replace('\\', '/'),
                'type': file_type
            })
    
    return render_template('index.html', uploaded_files=uploaded_files)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        flash(f'File {filename} uploaded successfully')
    else:
        flash('Invalid file type')
    
    return redirect(url_for('index'))

@app.route('/process_tweet', methods=['POST'])
def process_tweet():
    tweet_text = request.form.get('tweet_text', '')
    selected_file = request.form.get('selected_file', '')
    
    files = []
    if selected_file:
        files.append(selected_file)
    
    result = generate(tweet_text, files)
    
    return render_template('result.html', result=result, tweet_text=tweet_text, selected_file=selected_file)

if __name__ == '__main__':
    app.run(debug=True)
