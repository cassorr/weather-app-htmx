# weather-app-htmx

## Deployed URL:
https://weather-app-12988.web.app/

## Disclaimer:
I was unable to get all my functions working, so I did implement dynamic HTMX features into the frontend where if the functions worked, the UI would be dynamic with the functions. But since they are not working, I created a mock city that shows what the data would look like in the UI if the app was fully functional. 

## Functions

### `fetchWeather`
Fetches current weather data from the Weatherstack API for a given city and returns it to the frontend.

**Method:** `GET`  
**URL Params:** `?city=CityName`  
**Example:** `/fetchWeather?city=Missoula`

---

### `addCityWeather`
Fetches weather data from Weatherstack and saves it as a document in the Firestore `cities` collection.

**Method:** `GET`  
**URL Params:** `?city=CityName`  
**Example:** `/addCityWeather?city=Missoula`

---

### `getCities`
Returns all city weather documents stored in the Firestore `cities` collection.

**Method:** `GET`  
**Example:** `/getCities`

---

### `getCityByName`
Returns a single city document by name (case-insensitive).

**Method:** `GET`  
**URL Params:** `?name=CityName`  
**Example:** `/getCityByName?name=Missoula`

---

## Security Considerations
The Weatherstack API key is stored using Firebase environment config `functions:config:set` to avoid exposing it in source code. This key is accessed securely at runtime and never embedded in frontend files or exposed to the client.
