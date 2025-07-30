import React, { useState } from 'react';
import {
  Cloud,
  CloudLightning,
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const Index = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === 200) {
        setWeatherData(data);
      } else {
        setWeatherData(null);
        alert("City not found!");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching data");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Floating Clouds and Lightning omitted for brevity, keep them from your original code */}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <CloudLightning className="text-yellow-400" size={48} />
            Nimbus
          </h1>
          <p className="text-blue-200 text-lg">Your ultimate weather companion</p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Weather Information</CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData ? (
                <div className="text-center py-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt="Weather Icon"
                    className="mx-auto"
                  />
                  <p className="text-xl font-bold">{weatherData.name}, {weatherData.sys.country}</p>
                  <p className="text-white/70">{weatherData.weather[0].description}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cloud size={80} className="mx-auto mb-4 text-blue-200 opacity-60" />
                  <p className="text-white/70 text-lg">
                    Enter a city name above to get weather information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Thermometer className="mx-auto mb-2 text-red-400" size={32} />
                <p className="text-sm text-white/70">Temperature</p>
                <p className="text-xl font-bold">
                  {weatherData ? `${weatherData.main.temp}°C` : '--°C'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Droplets className="mx-auto mb-2 text-blue-400" size={32} />
                <p className="text-sm text-white/70">Humidity</p>
                <p className="text-xl font-bold">
                  {weatherData ? `${weatherData.main.humidity}%` : '--%'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Wind className="mx-auto mb-2 text-green-400" size={32} />
                <p className="text-sm text-white/70">Wind Speed</p>
                <p className="text-xl font-bold">
                  {weatherData ? `${weatherData.wind.speed} km/h` : '-- km/h'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Eye className="mx-auto mb-2 text-purple-400" size={32} />
                <p className="text-sm text-white/70">Visibility</p>
                <p className="text-xl font-bold">
                  {weatherData ? `${weatherData.visibility / 1000} km` : '-- km'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-white/50 text-sm">Powered by OpenWeatherMap API</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
