import React, { useState, useEffect } from "react";
import { CloudLightning, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const cities = ["London", "Tokyo", "New York", "Accra", "Paris"];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

import type { Variants } from "framer-motion";

const bounce: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: [1, 1.05, 0.98, 1],
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const Index = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sliderData, setSliderData] = useState([]);
  const [background, setBackground] = useState(
    "from-slate-900 via-blue-900 to-slate-800"
  );

  const getClothingSuggestion = (data) => {
    if (!data) return "Enter a city to get clothing suggestions.";
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();

    if (condition.includes("rain")) return "Don't forget an umbrella!";
    if (temp > 30) return "It's hot. Wear light clothes and stay hydrated.";
    if (temp > 20) return "Warm weather. T-shirt and jeans are fine.";
    if (temp > 10) return "Cool weather. Consider a jacket or sweater.";
    if (temp > 0) return "Cold. Wear a coat and warm layers.";
    if (temp <= 0) return "Freezing! Bundle up with heavy winter wear.";

    return "Check current weather for suitable clothing.";
  };

  const getAISummary = (data) => {
    if (!data) return "Enter a city to get an AI-style weather summary.";
    const { name, main, weather, wind } = data;
    const description = weather[0].description;
    const temp = main.temp;
    const humidity = main.humidity;
    const windSpeed = wind.speed;

    return `Today in ${name}, expect ${description} with a temperature around ${temp}°C. Humidity stands at ${humidity}%, and wind speeds could reach ${windSpeed} km/h.`;
  };

  const getBackgroundTheme = (data) => {
    if (!data) return "from-slate-900 via-blue-900 to-slate-800";
    const weather = data.weather[0].main.toLowerCase();
    if (weather.includes("clear"))
      return "from-yellow-300 via-orange-400 to-pink-500";
    if (weather.includes("cloud"))
      return "from-gray-600 via-gray-800 to-slate-900";
    if (weather.includes("rain"))
      return "from-blue-800 via-gray-700 to-gray-900";
    if (weather.includes("snow")) return "from-white via-blue-200 to-sky-300";
    return "from-slate-900 via-blue-900 to-slate-800";
  };

  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        ),
      ]);
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      if (weatherData.cod === 200 && forecastData.cod === "200") {
        setWeatherData(null);
        setForecastData([]);
        setTimeout(() => {
          setWeatherData(weatherData);
          setBackground(getBackgroundTheme(weatherData));
          const dailyForecasts = forecastData.list.filter(
            (_, idx) => idx % 8 === 0
          );
          setForecastData(dailyForecasts);
        }, 100);
      } else {
        setWeatherData(null);
        setForecastData([]);
        alert("City not found!");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching data");
    }
    setLoading(false);
  };

  const fetchSliderData = async () => {
    const promises = cities.map(async (city) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        return await res.json();
      } catch (err) {
        console.error("Error fetching city slider data:", err);
        return null;
      }
    });
    const results = await Promise.all(promises);
    setSliderData(results.filter(Boolean));
  };

  useEffect(() => {
    fetchSliderData();
  }, []);

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${background}`}
    >
      <div className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence>
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <CloudLightning className="text-yellow-400" size={48} />
              Nimbus
            </h1>
            <p className="text-blue-200 text-lg">
              Your ultimate weather companion
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="max-w-md mx-auto mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Search size={20} />
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {weatherData && (
            <motion.div
              key={weatherData.name}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={bounce}
              className="grid md:grid-cols-3 gap-4 mb-8"
            >
              {["Current Weather", "Summary", "Style Forecast"].map(
                (title, i) => (
                  <motion.div
                    key={i}
                    variants={cardVariant}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                      <CardContent className="p-4 text-center">
                        <CardTitle>{title}</CardTitle>
                        <p>
                          {title === "Current Weather" && (
                            <>
                              <span className="text-xl">
                                {weatherData.name}
                              </span>
                              <br />
                              <span className="capitalize">
                                {weatherData.weather[0].description}
                              </span>
                              <br />
                              <span className="text-2xl font-bold">
                                {weatherData.main.temp}°C
                              </span>
                            </>
                          )}
                          {title === "Summary" && (
                            <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-3 justify-items-center mt-4">
                              <div className="flex items-center gap-2">
                                <CloudLightning className="text-yellow-400" />
                                <span>
                                  {weatherData.weather[0].description}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💧</span>
                                <span>
                                  Humidity: {weatherData.main.humidity}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💨</span>
                                <span>Wind: {weatherData.wind.speed} km/h</span>
                              </div>
                            </div>
                          )}
                          {title === "Style Forecast" &&
                            getClothingSuggestion(weatherData)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {forecastData.length > 0 && (
          <motion.div
            className="mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-white text-2xl mb-4">5-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {forecastData.map((day, index) => (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white"
                >
                  <CardContent className="p-4 text-center">
                    <CardTitle>
                      {new Date(day.dt_txt).toLocaleDateString()}
                    </CardTitle>
                    <p className="capitalize">{day.weather[0].description}</p>
                    <p className="text-xl font-bold">{day.main.temp}°C</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {sliderData.length > 0 && (
          <motion.div
            className="mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h2 className="text-white text-2xl mb-4">Global City Weather</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sliderData.map((cityData, idx) => (
                <Card
                  key={idx}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white"
                >
                  <CardContent className="p-4 text-center">
                    <CardTitle>{cityData.name}</CardTitle>
                    <p className="capitalize">
                      {cityData.weather[0].description}
                    </p>
                    <p className="text-xl font-bold">{cityData.main.temp}°C</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        <div className="text-center mt-12">
          <p className="text-white/50 text-sm">Powered by OpenWeatherMap API</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
