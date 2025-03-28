# Earth Lens

A real-time emergency response dashboard built with Next.js, Firebase, Google Maps and a lot of AI. 

Winner of the United Nations & One Degree Cooler Best Climate Change & Sustainability AI Hack at GenAI Genesis 2025!

## Try it out
https://earth-lens.vercel.app

[34.55.60.112](http://34.55.60.112:8000/)


## Inspiration
The inspiration for EarthLens came from the frequent natural disasters (forest fires) experienced in Los Angeles, in past few months and the urgent need for sustainable climate change control. Witnessing the devastating impact of these events on communities, we aimed to create a tool that could help predict and mitigate disasters, ultimately saving lives and promoting long-term environmental sustainability.

## What it does
EarthLens provides users with a comprehensive view of natural disasters by leveraging real-time data and advanced AI models. It monitors distress calls and tweets, analyzes historical and current data from multiple sources, and predicts future disasters. The platform offers route avoidance to help users safely reach shelters and educates them about sustainable climate change control. By empowering users with critical information, EarthLens aims to mitigate the impact of natural disasters and promote long-term environmental sustainability.

## How we built it
EarthLens was built using a combination of modern web technologies and cloud services. The frontend is developed with Next.js for server-side rendering and React for building interactive user interfaces. Firestore is used for real-time database and authentication services. Google Maps API is integrated for geolocation and route planning features.

For data analysis and disaster prediction, we leveraged Google NotebookLM RAG to analyze over 50 years of data from various sources, including satellite images from NASA DAYMET_V4, NOAA CFSV2, Copernicus Atmosphere Monitoring, weather reports, and historical disaster records. Vision AI is used for satellite image analysis, and the outcomes are combined with Gemini 2.0 Flash thinking for advanced reasoning.

We utilized Gemini Vision for processing and analyzing satellite images to detect patterns and anomalies that could indicate potential natural disasters. This visual data is crucial for understanding the geographical and environmental factors contributing to disasters.

Gemini 2.0 Flash (chat and agent) was integrated to provide real-time interaction and data fetching capabilities. The chat functionality allows users to query the system for specific information about disaster predictions and safety recommendations. The agent component continuously monitors various data sources, including news, weather updates, and social media, to provide up-to-date information and predictions.

Gemini 2.0 Flash thinking, which incorporates responsible AI principles, ensures that the AI models used for disaster prediction and route planning are fair, transparent, and unbiased. This responsible AI approach helps in making ethical decisions and providing reliable recommendations to users.

The entire infrastructure is highly scalable and decoupled, deployed over Google Cloud to ensure reliability and performance. This setup allows EarthLens to handle large volumes of real-time data and provide accurate disaster predictions and route avoidance recommendations.


### Sources

Disasters Dataset: https://public.emdat.be/data

Satellite Images: [Google Earth Engine](https://earthengine.google.com/) and [Sentinel-2](https://console.cloud.google.com/marketplace/product/esa-public-data/sentinel2)

## Features
- Real-time highly scalable monitoring of distress calls and tweets, with priority re-ranking using responsible ai models provided by Google Gemini
- Google NotebookLM RAG powered algorithm to analyze over 50 years of data from 3 satellites, weather, news from USA, disaster record to find parameter and indicators responsible for disaster
- Agents to fetch real time data from news sources, weather, satellite image analysis, using vision AI, and combining the outcomes with Gemini 2.0 Flash thinking for advanced reasoning, disaster prediction & mitigation
- Highly scalable, and decoupled infrastructure, all deployed over Google Cloud
- Reliable Disaster prediction agent, that analyze today's data to comment on probability of disaster after 6 months
- Route avoidance for Users, to avoid route that have disaster to safely reach shelters
- Education about sustainable climate change control, keeping in mind the long term impact

## Challenges we ran into
One of the main challenges we faced was integrating and processing large volumes of real-time data from various sources, including satellite images, weather reports, and social media. Ensuring the accuracy and reliability of disaster predictions while maintaining system performance was also a significant challenge. Additionally, implementing responsible AI principles to ensure fairness, transparency, and unbiased decision-making required careful consideration and testing.

## Accomplishments that we're proud of
We are proud of successfully developing a highly scalable and decoupled infrastructure that can handle large volumes of real-time data and provide accurate disaster predictions. Integrating advanced AI models, such as Gemini Vision and Gemini 2.0 Flash, allowed us to create a comprehensive and reliable disaster prediction platform. We are also proud of our responsible AI approach, which ensures ethical decision-making and reliable recommendations for users.

## What we learned
Throughout the development of EarthLens, we learned the importance of leveraging advanced AI models and cloud services to handle large-scale data analysis and disaster prediction. We also gained valuable insights into implementing responsible AI principles to ensure fairness and transparency in our predictions and recommendations. Additionally, we learned the significance of real-time data processing and the challenges associated with integrating multiple data sources.

## What's next for EarthLens
In the future, we plan to enhance EarthLens by incorporating additional data sources and improving the accuracy of our disaster predictions. We aim to expand our platform to cover more geographical regions and provide more detailed and localized disaster information. Additionally, we plan to develop more advanced features, such as personalized disaster alerts and recommendations, to further empower users and promote long-term environmental sustainability.
