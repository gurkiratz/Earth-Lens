let map;
let infowindow;
let directionsRenderer;
let directionsService;
let originPlace = null;
let destinationPlace = null;

// Global array to store avoidance zones (red zones)
let avoidZones = [];

// ✅ Hardcoded API Key
const API_KEY = 'AIzaSyBXppFD6Rqw5sO6LcgnkiGXzTSreNRL-SY';

// Global variable for user's current location (default to SF)
let currentUserLocation = { latitude: 37.7749, longitude: -122.4194 };

// ✅ Load Google Maps API dynamically using the hardcoded key
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&libraries=places,geometry&callback=initMap`;
script.async = true;
script.defer = true;
document.head.appendChild(script);

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        // Update the global variable with the user's coordinates.
        currentUserLocation = { 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude 
        };
        map.setCenter(userLocation);
        map.setZoom(11);
      },
      () => console.warn("Geolocation failed or permission denied.")
    );
  }

  infowindow = new google.maps.InfoWindow();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  directionsService = new google.maps.DirectionsService();

  // ✅ Set up manual autocomplete using fetch (for origin and destination)
  setupAutocomplete("origin");
  setupAutocomplete("destination");

  // ✅ Add avoidance zone on map click
  map.addListener("click", (e) => {
    addAvoidanceZone(e.latLng);
  });
}

// Avoidance zone function – adds a red circle and stores the zone
function addAvoidanceZone(latLng) {
  const zone = {
    lat: latLng.lat(),
    lng: latLng.lng(),
    radius: 1000 // 1 km radius
  };
  avoidZones.push(zone);

  new google.maps.Circle({
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map: map,
    center: latLng,
    radius: zone.radius
  });
}

// Manual Autocomplete setup using fetch
function setupAutocomplete(inputId) {
  const input = document.getElementById(inputId);
  const dropdown = document.createElement("div");
  dropdown.classList.add("autocomplete-dropdown");
  input.parentNode.appendChild(dropdown);

  input.addEventListener("input", async () => {
    const value = input.value;
    if (value.length < 2) {
      dropdown.innerHTML = "";
      return;
    }

    const predictions = await getAutocompleteResults(value);
    dropdown.innerHTML = "";

    if (predictions && predictions.length) {
      predictions.forEach((prediction) => {
        const option = document.createElement("div");
        option.textContent = prediction.text.text;
        option.classList.add("autocomplete-item");
        option.addEventListener("click", () => {
          input.value = prediction.text.text;
          dropdown.innerHTML = "";

          // Get place details (and associated geometry) for the selected prediction.
          getPlaceDetails(prediction.placeId).then((place) => {
            if (place) {
              if (inputId === "origin") {
                originPlace = place.geometry.location;
              } else {
                destinationPlace = place.geometry.location;
              }
              console.log(`Set ${inputId} to:`, place.geometry.location);
            }
          });
        });
        dropdown.appendChild(option);
      });
    }
  });
}

// Get autocomplete suggestions (POST request)
async function getAutocompleteResults(input) {
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text"
      },
      body: JSON.stringify({
        input: input,
        locationBias: {
          circle: {
            center: {
              latitude: currentUserLocation.latitude,
              longitude: currentUserLocation.longitude
            },
            radius: 5000
          }
        }
      })
    });

    if (!response.ok) throw new Error(`Error fetching predictions: ${response.statusText}`);
    const data = await response.json();
    return data.suggestions.map((s) => s.placePrediction);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}

// Get place details using the new API, then retrieve geometry via Geocoding API
async function getPlaceDetails(placeId) {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?key=${API_KEY}`;
    console.log("Fetching Place Details from:", url);
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "id,displayName,formattedAddress"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Place Details response error:", response.status, response.statusText, errorText);
      throw new Error(`Failed to get place details: ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    console.log("Fetched place details:", data);

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.formattedAddress)}&key=${API_KEY}`;
    console.log("Fetching geocode from:", geocodeUrl);
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text();
      console.error("Geocoding response error:", geocodeResponse.status, geocodeResponse.statusText, errorText);
      throw new Error(`Failed to get geocode: ${geocodeResponse.statusText} - ${errorText}`);
    }
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
      throw new Error("No geocode results found");
    }
    data.geometry = { location: geocodeData.results[0].geometry.location };
    return data;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

// New function to find the nearest hospital
async function findNearestHospital(lat, lng) {
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.location"
      },
      body: JSON.stringify({
        includedTypes: ["hospital"], // Search for hospitals
        maxResultCount: 1, // Only need the closest one
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: 50000 // 50 km max radius
          }
        }
      })
    });

    if (!response.ok) throw new Error(`Nearby Search failed: ${response.statusText}`);
    const data = await response.json();

    if (data.places && data.places.length > 0) {
      const hospital = data.places[0];
      console.log("Nearest hospital found:", hospital.displayName.text);
      return new google.maps.LatLng(hospital.location.latitude, hospital.location.longitude);
    } else {
      throw new Error("No hospitals found within 50 km.");
    }
  } catch (error) {
    console.error("Error finding nearest hospital:", error);
    return null;
  }
}

// Helper: Calculate the distance (in meters) from a point to a line segment
function distanceFromPointToSegment(point, segStart, segEnd) {
  const A = google.maps.geometry.spherical.computeDistanceBetween(segStart, point);
  const B = google.maps.geometry.spherical.computeDistanceBetween(segStart, segEnd);
  const C = google.maps.geometry.spherical.computeDistanceBetween(point, segEnd);
  if (B === 0) return A;
  const projection = Math.max(0, Math.min(1, (A * A - C * C + B * B) / (2 * B * B)));
  const closestPoint = google.maps.geometry.spherical.interpolate(segStart, segEnd, projection);
  return google.maps.geometry.spherical.computeDistanceBetween(point, closestPoint);
}

// Helper: Check if the decoded route path is within (zone.radius + 100m) of a zone center
function routeIntersectsZone(decodedPath, zone) {
  const zoneCenter = new google.maps.LatLng(zone.lat, zone.lng);
  for (let i = 0; i < decodedPath.length - 1; i++) {
    const p1 = decodedPath[i];
    const p2 = decodedPath[i + 1];
    const distance = distanceFromPointToSegment(zoneCenter, p1, p2);
    if (distance < (zone.radius + 100)) { // 100m buffer outside the zone
      return true;
    }
  }
  return false;
}

// Helper: Compute a detour waypoint given a zone and a reference point (e.g., midpoint of the route)
function computeDetourWaypoint(zone, referencePoint) {
  const zoneCenter = { lat: zone.lat, lng: zone.lng };
  const dx = referencePoint.lat() - zoneCenter.lat;
  const dy = referencePoint.lng() - zoneCenter.lng;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d === 0) {
    // Arbitrarily choose a direction if reference equals zone center
    return new google.maps.LatLng(zone.lat + (zone.radius + 100) / 111111, zone.lng);
  }
  // Normalize and compute detour waypoint 100 m outside the zone boundary.
  const factorLat = (zone.radius + 100) / 111111;
  const factorLng = (zone.radius + 100) / (111111 * Math.cos(zone.lat * Math.PI / 180));
  return new google.maps.LatLng(zone.lat + (dx / d) * factorLat, zone.lng + (dy / d) * factorLng);
}

// Updated Route calculation function using new Routes API with avoidance logic
async function calculateRoute() {
  if (!originPlace) {
    alert("Please select an origin.");
    return;
  }

  const originLat = typeof originPlace.lat === 'function' ? originPlace.lat() : originPlace.lat;
  const originLng = typeof originPlace.lng === 'function' ? originPlace.lng() : originPlace.lng;

  // Automatically set destination to the nearest hospital
  destinationPlace = await findNearestHospital(originLat, originLng);
  if (!destinationPlace) {
    alert("Could not find a hospital within 50 km of the origin.");
    return;
  }

  const originLatLng = new google.maps.LatLng(originLat, originLng);
  const destLatLng = destinationPlace;

  // Check if start/end points are in zones with buffer
  const MIN_BUFFER = 200; // Minimum buffer in meters beyond zone radius
  for (const zone of avoidZones) {
    const zoneCenter = new google.maps.LatLng(zone.lat, zone.lng);
    const safeDistance = zone.radius + MIN_BUFFER;
    if (google.maps.geometry.spherical.computeDistanceBetween(originLatLng, zoneCenter) < safeDistance) {
      alert(`Origin is within ${safeDistance}m of an avoidance zone.`);
      return;
    }
    if (google.maps.geometry.spherical.computeDistanceBetween(destLatLng, zoneCenter) < safeDistance) {
      alert(`Destination is within ${safeDistance}m of an avoidance zone.`);
      return;
    }
  }

  const MAX_ITERATIONS = 10;
  let iteration = 0;
  let waypoints = [];

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    
    const requestBody = {
      origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
      destination: { location: { latLng: { latitude: destLatLng.lat(), longitude: destLatLng.lng() } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      intermediates: waypoints.length > 0 ? waypoints : undefined,
      computeAlternativeRoutes: true,
      polylineQuality: "HIGH_QUALITY"
    };

    try {
      const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`Route computation failed: ${response.statusText}`);
      
      const data = await response.json();
      if (!data.routes?.length) throw new Error("No routes found");

      for (const route of data.routes) {
        const decodedPath = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
        if (!hasZoneIntersection(decodedPath, MIN_BUFFER)) {
          displayRoute(route);
          return;
        }
      }

      // No safe route found, generate new waypoints
      const primaryRoute = data.routes[0];
      const decodedPath = google.maps.geometry.encoding.decodePath(primaryRoute.polyline.encodedPolyline);
      waypoints = generateAvoidanceWaypoints(decodedPath, MIN_BUFFER, originLatLng); // Pass originLatLng here

      if (iteration === MAX_ITERATIONS) {
        alert("No route found that completely avoids all zones by " + 
              (MIN_BUFFER + avoidZones[0].radius) + " meters.");
        return;
      }

    } catch (error) {
      console.error("Route calculation error:", error);
      alert("Failed to calculate route: " + error.message);
      return;
    }
  }
}

function hasZoneIntersection(decodedPath, buffer) {
  for (const zone of avoidZones) {
    const zoneCenter = new google.maps.LatLng(zone.lat, zone.lng);
    const safeDistance = zone.radius + buffer;
    
    for (let i = 0; i < decodedPath.length - 1; i++) {
      const distance = distanceFromPointToSegment(zoneCenter, decodedPath[i], decodedPath[i + 1]);
      if (distance < safeDistance) {
        return true;
      }
    }
  }
  return false;
}

function generateAvoidanceWaypoints(decodedPath, buffer, originLatLng) {
  const waypoints = [];
  const pathLength = decodedPath.length;
  
  for (const zone of avoidZones) {
    const zoneCenter = new google.maps.LatLng(zone.lat, zone.lng);
    const safeDistance = (zone.radius + buffer) / 111111; // Convert to degrees
    
    let minDistance = Infinity;
    let closestIdx = 0;
    for (let i = 0; i < pathLength - 1; i++) {
      const dist = distanceFromPointToSegment(zoneCenter, decodedPath[i], decodedPath[i + 1]);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    if (minDistance < (zone.radius + buffer)) {
      const segmentStart = decodedPath[closestIdx];
      const segmentEnd = decodedPath[closestIdx + 1];
      const heading = google.maps.geometry.spherical.computeHeading(segmentStart, segmentEnd);
      
      const detour1 = google.maps.geometry.spherical.computeOffset(
        zoneCenter,
        safeDistance * 1.2,
        heading + 90
      );
      const detour2 = google.maps.geometry.spherical.computeOffset(
        zoneCenter,
        safeDistance * 1.2,
        heading - 90
      );

      waypoints.push({
        location: { latLng: { latitude: detour1.lat(), longitude: detour1.lng() } }
      });
      waypoints.push({
        location: { latLng: { latitude: detour2.lat(), longitude: detour2.lng() } }
      });
    }
  }
  
  waypoints.sort((a, b) => {
    const distA = google.maps.geometry.spherical.computeDistanceBetween(
      originLatLng, // Use the passed originLatLng
      new google.maps.LatLng(a.location.latLng.latitude, a.location.latLng.longitude)
    );
    const distB = google.maps.geometry.spherical.computeDistanceBetween(
      originLatLng,
      new google.maps.LatLng(b.location.latLng.latitude, b.location.latLng.longitude)
    );
    return distA - distB;
  });

  return waypoints.slice(0, 8); // Respect API waypoint limit
}

function displayRoute(route) {
  const polyline = new google.maps.Polyline({
    path: google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline),
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  });
  polyline.setMap(map);
  map.fitBounds(getRouteBounds(polyline.getPath()));
}

function getRouteBounds(path) {
  const bounds = new google.maps.LatLngBounds();
  path.forEach(point => bounds.extend(point));
  return bounds;
}