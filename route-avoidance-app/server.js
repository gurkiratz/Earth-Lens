const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

// ✅ Hardcoded API Key (Direct Assignment)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXppFD6Rqw5sO6LcgnkiGXzTSreNRL-SY';

app.use(express.json());
app.use(express.static('public'));

// ✅ Provide the API key to the frontend
app.get('/get_api_key', (req, res) => {
  res.json({ apiKey: GOOGLE_MAPS_API_KEY });
});

// ✅ Handle route calculation request
app.post('/get_route', async (req, res) => {
  const { origin, destination, avoid_zones } = req.body;

  try {
    let response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: origin,
        destination: destination,
        mode: 'driving',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found for the given addresses.");
    }

    let route = response.data.routes[0];
    let steps = route.legs[0].steps;
    let waypoints = [];

    // Haversine formula to calculate distance between coordinates
    function haversineDistance(lat1, lon1, lat2, lon2) {
      const toRad = (angle) => angle * Math.PI / 180;
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    for (let step of steps) {
      const endLocation = step.end_location;
      for (let zone of avoid_zones) {
        if (haversineDistance(endLocation.lat, endLocation.lng, zone.lat, zone.lng) < zone.radius) {
          waypoints.push(`${zone.lat},${zone.lng}`);
        }
      }
    }

    if (waypoints.length > 0) {
      waypoints = [...new Set(waypoints)];
      let newResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: origin,
          destination: destination,
          mode: 'driving',
          waypoints: waypoints.join('|'),
          key: GOOGLE_MAPS_API_KEY
        }
      });

      if (!newResponse.data.routes || newResponse.data.routes.length === 0) {
        throw new Error("No route found when adding avoidance waypoints.");
      }

      route = newResponse.data.routes[0];
    }

    res.json(route);
  } catch (error) {
    console.error("Error fetching route:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message || "Error fetching route" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
