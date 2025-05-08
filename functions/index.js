const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { onRequest } = require("firebase-functions/v1/https");

const WEATHERSTACK_API_KEY = functions.config().weatherstack.key;

// Fetch current weather for frontend
exports.fetchWeather = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");

    const city = req.query.city;
    if (!city) return res.status(400).send("City name is required");

    const url = `http://api.weatherstack.com/current?access_key=${WEATHERSTACK_API_KEY}&query=${encodeURIComponent(city)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Weatherstack error:", data.error.info);
            return res.status(500).json({ error: data.error.info });
        }

        return res.json(data);
    } catch (err) {
        console.error("Fetch error:", err);
        return res.status(500).send("Failed to fetch weather data");
    }
});

// Save weather data to Firestore
exports.addCityWeather = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");

    const cityName = req.query.city;
    if (!cityName) {
        return res.status(400).send("City name is required");
    }

    const url = `http://api.weatherstack.com/current?access_key=${WEATHERSTACK_API_KEY}&query=${encodeURIComponent(cityName)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Weather API error:", data.error);
            return res.status(500).send("Weather API error");
        }

        const cityDoc = {
            name: data.location.name?.toUpperCase() || "UNKNOWN",
            country: data.location.country || "",
            lat: data.location.lat?.toString() || "",
            lon: data.location.lon?.toString() || "",
            weather: {
                cloudcover: data.current.cloudcover ?? 0,
                condition: data.current.weather_descriptions?.[0] || "Unknown",
                feelslike: data.current.feelslike ?? 0,
                humidity: data.current.humidity ?? 0,
                icon: data.current.weather_icons?.[0] || "",
                is_day: data.current.is_day ?? "no",
                pressure: data.current.pressure ?? 0,
                temperature: data.current.temperature ?? 0,
                uv_index: data.current.uv_index ?? 0,
                visibility: data.current.visibility ?? 0,
                wind_speed: data.current.wind_speed ?? 0,
            }
        };

        console.log(`Saving to Firestore: cities/${cityDoc.name}`);
        const docRef = db.collection("cities").doc(); // auto-generated ID
        console.log("Firestore doc path:", docRef.path);
        await docRef.set(cityDoc);

        return res.status(200).send("Weather data saved!");
    } catch (error) {
        console.error("Failed to save city weather data:", error);
        return res.status(500).send("Failed to save weather data");
    }
});

// Return all cities
exports.getCities = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    try {
        const snapshot = await db.collection("cities").get();
        const cities = [];

        snapshot.forEach(doc => {
            cities.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(cities);
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        res.status(500).send("Error fetching cities");
    }
});

// Get a single city by name
exports.getCityByName = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    const name = req.query.name?.toUpperCase();
    if (!name) return res.status(400).send("City name is required");

    try {
        const snapshot = await db.collection("cities").where("name", "==", name).limit(1).get();
        if (snapshot.empty) return res.status(404).send("City not found");

        const doc = snapshot.docs[0];
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(500).send("Failed to fetch city");
    }
});
