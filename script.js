const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY = "41435d88bf96f1592680eeb5f302ea69";

// Function to create a weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    const temperature = (weatherItem.main.temp - 273.15).toFixed(2);
    const date = weatherItem.dt_txt.split(" ")[0];
    const iconUrl = `http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}`;
    const description = weatherItem.weather[0].description;

    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} ${weatherItem.dt_txt}</h2>
                <h4>Temperature: ${temperature}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="${iconUrl}@4x.png" alt="weather-icon">
                <h4>${description}</h4>
            </div>
        `;
    } else {
        return `
            <li class="card">
                <h2>${date}</h2>
                <img src="${iconUrl}@2x.png" alt="weather-icon">
                <h4>Temp: ${temperature}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>
        `;
    }
}

// Function to get weather details
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Weather API error: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data.list || data.list.length === 0) {
                throw new Error("No weather data available.");
            }

            const uniqueForecastDays = new Set();
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).toDateString(); // Get a readable date string
                if (!uniqueForecastDays.has(forecastDate)) {
                    uniqueForecastDays.add(forecastDate);
                    return true; // Include this forecast in the result
                }
                return false; // Exclude this forecast
            });

            cityInput.value = "";
            weatherCardDiv.innerHTML = ""; // Clear previous weather cards
            currentWeatherDiv.innerHTML = ""; // Clear previous weather cards

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(error => {
            alert(`An error occurred while fetching the weather details: ${error.message}`);
        });
}

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert("City name is empty.");
        return; // Exit the function if the city name is empty
    }

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.length) {
                throw new Error(`No coordinates found for ${cityName}`);
            }
            const { lat, lon } = data[0];
            getWeatherDetails(cityName, lat, lon);
        })
        .catch(error => {
            alert(`An error occurred while fetching the coordinates: ${error.message}`);
        });
}

searchButton.addEventListener("click", getCityCoordinates);
