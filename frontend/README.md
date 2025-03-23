# Earth Lens

A real-time emergency response dashboard built with Next.js, Firebase, and Google Maps.

<img width="1315" alt="image" src="https://github.com/user-attachments/assets/25dcb76f-cb5e-4db7-9944-4f48c2d218f3" />
An image from NASA Satellite showing the heat map from 1981. source: Google Earth Engine

## Features

- Real-time emergency ticket tracking
- Interactive map with emergency locations
- Call transcripts and case details
- Priority-based ticket management
- Service categorization (Fire, Ambulance, Police)

## Prerequisites

- Node.js 18 or higher
- Firebase account
- Google Maps API key

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Set up Firebase:

   - Create a new Firebase project
   - Enable Firestore Database
   - Copy your Firebase configuration to the `.env.local` file
   - Deploy Firestore security rules

5. Set up Google Maps:
   - Create a Google Cloud project
   - Enable Maps JavaScript API
   - Create API credentials
   - Copy your API key to the `.env.local` file

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Firestore Data Structure

Emergency tickets are stored in the `emergency_tickets` collection with the following structure:

```typescript
interface EmergencyTicket {
  ticket_id: string
  name: string
  location: string
  datetime: string
  status: string
  priority: string
  summary: string
  life_threatening: boolean
  breathing_issue: string
  fire_visibility: string
  smoke_visibility: string
  help_for_whom: string[]
  services_needed: string[]
  ticket_type: string
}
```

## Charts

Economic Impact Chart
Shows total damage and aid contribution over time
Values are in millions of USD
Uses a bar chart to compare damage vs aid for each year
Color-coded bars with a legend
Interactive tooltip showing exact values

Population Impact Chart
Shows a breakdown of affected populations over time
Uses a stacked bar chart to show:
Number of injured people
Number of homeless people
Number of affected people
Different colors for each category
Interactive tooltip showing values for each category

Deaths vs Economic Damage Scatter Plot
Shows the relationship between fatalities and economic damage
Each point represents a disaster
X-axis shows number of deaths
Y-axis shows damage in millions USD
Point size varies based on impact
Color matches the selected disaster category
Interactive tooltip showing:
Event name
Number of deaths
Economic damage
Disaster type

## License

MIT
