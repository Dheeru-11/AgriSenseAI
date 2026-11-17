
import { useState } from "react";

export default function WeatherAdvice() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkWeather() {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Find the city's coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city.trim()
        )}&count=1`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for the city.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results?.length) {
        throw new Error("City not found. Please check the spelling.");
      }

      const location = geoData.results[0];

      // Fetch current weather and today's rainfall forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=precipitation_sum&timezone=auto&forecast_days=1`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to retrieve weather information.");
      }

      const data = await weatherResponse.json();

      setWeather({
        city: location.name,
        country: location.country,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        dailyRainfall: data.daily.precipitation_sum[0],
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function getFarmingAdvice() {
    if (!weather) return [];

    const tips = [];

    if (weather.temperature >= 35) {
      tips.push(
        "High temperature: monitor crops for heat stress and check soil moisture."
      );
    } else if (weather.temperature <= 10) {
      tips.push(
        "Low temperature: protect sensitive crops from cold conditions."
      );
    } else {
      tips.push(
        "Temperature is moderate, but suitability depends on the crop."
      );
    }

    if (weather.humidity >= 80) {
      tips.push(
        "High humidity: inspect leaves for fungal disease symptoms."
      );
    }

    if (weather.dailyRainfall >= 5) {
      tips.push(
        "Rain is forecast today. Check soil moisture before irrigating."
      );
    } else {
      tips.push(
        "Little rain is forecast today. Check soil moisture before deciding to water."
      );
    }

    return tips;
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-3 text-2xl font-bold text-green-400">
        ☀️ Weather-Based Farming Advice
      </h2>

      <p className="mb-4 text-slate-400">
        Enter your city to check live weather and general farming advice.
      </p>

      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") checkWeather();
        }}
        placeholder="Enter your city (e.g. Kota)"
        className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white"
      />

      <button
        type="button"
        onClick={checkWeather}
        disabled={loading}
        className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Weather"}
      </button>

      {error && (
        <p className="mt-4 text-red-400">{error}</p>
      )}

      {weather && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-green-400">
            📍 {weather.city}, {weather.country}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-800 p-4">
              🌡️ Temperature: {weather.temperature}°C
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              💧 Humidity: {weather.humidity}%
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              🌧️ Current Precipitation: {weather.precipitation} mm
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              ☔ Today's Forecast Rainfall: {weather.dailyRainfall} mm
            </div>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
            <h4 className="mb-3 font-bold text-green-400">
              🌱 Farming Advice
            </h4>

            <ul className="list-disc space-y-2 pl-5 text-slate-300">
              {getFarmingAdvice().map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-slate-400">
            Weather forecasts and advice are informational.
            Check local field conditions before making farming decisions.
          </p>
        </div>
      )}
    </div>
  );
}
