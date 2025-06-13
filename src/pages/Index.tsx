
import React, { useState, useEffect } from 'react';
import { Cloud, CloudLightning, Search, MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    // This will be implemented when we add the API functionality
    console.log('Searching for weather in:', city);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Clouds */}
        <div className="absolute top-10 left-10 opacity-20 animate-pulse">
          <Cloud size={120} className="text-white" />
        </div>
        <div className="absolute top-32 right-20 opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>
          <Cloud size={80} className="text-blue-200" />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-25 animate-pulse" style={{ animationDelay: '2s' }}>
          <Cloud size={100} className="text-slate-200" />
        </div>
        <div className="absolute top-1/2 right-1/3 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <Cloud size={90} className="text-white" />
        </div>
        
        {/* Thunder Elements */}
        <div className="absolute top-20 right-1/4 opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <CloudLightning size={60} className="text-yellow-300" />
        </div>
        <div className="absolute bottom-60 right-10 opacity-25 animate-pulse" style={{ animationDelay: '3s' }}>
          <CloudLightning size={40} className="text-yellow-200" />
        </div>
        <div className="absolute top-1/3 left-1/3 opacity-20 animate-pulse" style={{ animationDelay: '2.5s' }}>
          <CloudLightning size={50} className="text-yellow-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <CloudLightning className="text-yellow-400" size={48} />
            Nimbus
          </h1>
          <p className="text-blue-200 text-lg">Your ultimate weather companion</p>
        </div>

        {/* Search Section */}
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

        {/* Weather Display - Placeholder for now */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Weather Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Cloud size={80} className="mx-auto mb-4 text-blue-200 opacity-60" />
                <p className="text-white/70 text-lg">
                  Enter a city name above to get weather information
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weather Details Cards - Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Thermometer className="mx-auto mb-2 text-red-400" size={32} />
                <p className="text-sm text-white/70">Temperature</p>
                <p className="text-xl font-bold">--°C</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Droplets className="mx-auto mb-2 text-blue-400" size={32} />
                <p className="text-sm text-white/70">Humidity</p>
                <p className="text-xl font-bold">--%</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Wind className="mx-auto mb-2 text-green-400" size={32} />
                <p className="text-sm text-white/70">Wind Speed</p>
                <p className="text-xl font-bold">-- km/h</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <Eye className="mx-auto mb-2 text-purple-400" size={32} />
                <p className="text-sm text-white/70">Visibility</p>
                <p className="text-xl font-bold">-- km</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/50 text-sm">
            Powered by Openweathermap API
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
