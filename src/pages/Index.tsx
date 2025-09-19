// src/pages/Index.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CloudLightning,
  Search,
  MapPin,
  AlertTriangle,
  Droplets,
  Wind,
  Thermometer,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, Variants } from "framer-motion";
// import addNotification from "react-push-notification";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

// ---------- types ----------
interface OWMWeather {
  id?: number;
  main: string;
  description: string;
}

interface CurrentWeather {
  name: string;
  main: { temp: number; humidity: number; [k: string]: unknown };
  wind: { speed: number; [k: string]: unknown };
  weather: OWMWeather[];
  cod?: number | string;
  message?: string;
}

export interface ForecastListItem {
  dt_txt: string;
  main: { temp: number };
  weather: OWMWeather[];
}

export interface ForecastResponse {
  list: ForecastListItem[];
  cod?: number | string;
  message?: string;
}

export interface ErrorResponse {
  cod: number | string;
  message?: string;
}

// ---------- small config ----------
const CITIES = ["London", "Tokyo", "New York", "Accra", "Paris"] as const;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

// ---------- caches (generic) ----------
type CacheEntry<T> = { ts: number; data: T };
const weatherCache = new Map<string, CacheEntry<CurrentWeather>>();
const forecastCache = new Map<string, CacheEntry<ForecastResponse>>();

const now = () => Date.now();

function cachedGet<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (now() - entry.ts > CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return entry.data;
}
function cachedSet<T>(map: Map<string, CacheEntry<T>>, key: string, data: T) {
  map.set(key, { ts: now(), data });
}

// ---------- fetch helpers (safe) ----------
async function fetchCurrentWeather(
  city: string,
  signal?: AbortSignal
): Promise<CurrentWeather | ErrorResponse> {
  const key = city.toLowerCase();
  const cached = cachedGet(weatherCache, key);
  if (cached) return cached;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url, { signal });
  const json = (await res.json()) as CurrentWeather | ErrorResponse;
  if (res.ok) cachedSet(weatherCache, key, json as CurrentWeather);
  return json;
}

async function fetchForecast(
  city: string,
  signal?: AbortSignal
): Promise<ForecastResponse | ErrorResponse> {
  const key = city.toLowerCase();
  const cached = cachedGet(forecastCache, key);
  if (cached) return cached;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url, { signal });
  const json = (await res.json()) as ForecastResponse | ErrorResponse;
  if (res.ok) cachedSet(forecastCache, key, json as ForecastResponse);
  return json;
}

// ---------- debounce hook ----------
function useDebouncedValue<T>(value: T, delay = 2000) {
  const [debounced, setDebounced] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debounced;
}

// ---------- framer variants ----------
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
} as Variants;

const subtleBounce = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, type: "spring", stiffness: 120 },
  },
} as Variants;

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, type: "spring", stiffness: 120 },
  },
} as Variants;

// ---------- small components ----------
const SliderCard = React.memo(function SliderCard({
  city,
}: {
  city: CurrentWeather;
}) {
  return (
    <Card className="bg-white/8 backdrop-blur-md border-white/10 text-white">
      <CardContent className="p-4 text-center">
        <CardTitle className="text-lg">{city.name}</CardTitle>
        <p className="capitalize text-sm">
          {city.weather?.[0]?.description ?? "--"}
        </p>
        <p className="text-xl font-bold">
          {Math.round(city.main?.temp ?? 0)}°C
        </p>
      </CardContent>
    </Card>
  );
});

const ForecastCard = React.memo(function ForecastCard({
  day,
}: {
  day: ForecastListItem;
}) {
  const dateLabel = day?.dt_txt
    ? new Date(day.dt_txt).toLocaleDateString()
    : "--";
  const desc = day?.weather?.[0]?.description ?? "--";
  return (
    <motion.div
      variants={subtleBounce}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Card className="bg-white/8 backdrop-blur-md border-white/10 text-white">
        <CardContent className="p-4 text-center">
          <CardTitle className="text-md">{dateLabel}</CardTitle>
          <p className="capitalize text-sm">{desc}</p>
          <p className="text-xl font-bold">
            {Math.round(day?.main?.temp ?? 0)}°C
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// ---------- keyword sets (severe vs normal-bad) ----------
const SEVERE_KEYWORDS = [
  "hurricane",
  "tornado",
  "cyclone",
  "tsunami",
  "earthquake",
  "volcanic",
  "wildfire",
  "mudslide",
  "landslide",
  "flash flood",
  "flooding",
  "flood",
  "storm surge",
  "blizzard",
  "dust storm",
  "ice storm",
  "hailstorm",
] as const;

type AlertSeverity = "none" | "bad" | "severe";

function inferSeverityFromText(text: string): AlertSeverity {
  const t = text.toLowerCase();
  for (const k of SEVERE_KEYWORDS) {
    if (t.includes(k)) return "severe";
  }
  // reached here: it's an alert but not disaster-level
  return "bad";
}

// ---------- main component ----------
const Index: React.FC = () => {
  // state
  const [city, setCity] = useState<string>("");
  const debouncedCity = useDebouncedValue(city, 450);

  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<ForecastListItem[]>([]);
  const [citySearched, setCitySearched] = useState<boolean>(false);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  const [sliderData, setSliderData] = useState<CurrentWeather[]>([]);
  const [sliderLoading, setSliderLoading] = useState<boolean>(true);

  const [background, setBackground] = useState<string>(
    "from-slate-900 via-blue-900 to-slate-800"
  );

  // small animation enable to avoid blocking first paint
  const [animateEnabled, setAnimateEnabled] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimateEnabled(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // fetch slider (non-blocking)
  const fetchSlider = useCallback(async () => {
    setSliderLoading(true);
    try {
      const results = await Promise.all(
        CITIES.map((c) =>
          fetchCurrentWeather(c).catch((e) => {
            console.error("slider fetch error", c, e);
            return null;
          })
        )
      );
      // filter only successful CurrentWeather items
      const ok = results.filter(
        (r): r is CurrentWeather =>
          !!r && (r as CurrentWeather).name !== undefined
      );
      setSliderData(ok);
    } finally {
      setSliderLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlider();
  }, [fetchSlider]);

  // clothing suggestion
  const getClothingSuggestion = useCallback((data: CurrentWeather | null) => {
    if (!data) return "Enter a city to get clothing suggestions.";
    const temp = data.main?.temp ?? NaN;
    const condition = (data.weather?.[0]?.main ?? "").toLowerCase();
    if (condition.includes("rain")) return "Don't forget an umbrella!";
    if (temp > 30) return "It's hot. Wear light clothes and stay hydrated.";
    if (temp > 20) return "Warm weather. T-shirt and jeans are fine.";
    if (temp > 10) return "Cool weather. Consider a jacket or sweater.";
    if (temp > 0) return "Cold. Wear a coat and warm layers.";
    if (temp <= 0) return "Freezing! Bundle up with heavy winter wear.";
    return "Check current weather for suitable clothing.";
  }, []);

  // Weather alerts -> now returns { message, severity }
  const getWeatherAlerts = useCallback((data: CurrentWeather | null) => {
    if (!data) return [];
    const alerts: { message: string; severity: AlertSeverity }[] = [];
    const temp = data.main?.temp ?? NaN;
    const wind = data.wind?.speed ?? NaN;
    const condition = (data.weather?.[0]?.main ?? "").toLowerCase();

    // Base messages (keep your emojis)
    if (temp >= 35)
      alerts.push({
        message: "🔥 Heat alert: Stay indoors & hydrate.",
        severity: "bad",
      });
    if (temp <= 5)
      alerts.push({ message: "🥶 Cold alert: Dress warmly.", severity: "bad" });
    if (condition.includes("storm"))
      alerts.push({
        message: "⛈️ Storm warning: Avoid outdoor activities.",
        severity: "bad",
      });
    if (condition.includes("rain"))
      alerts.push({ message: "🌧️ Rain: carry an umbrella.", severity: "bad" });
    if (wind >= 50)
      alerts.push({
        message: "💨 High wind: be cautious outdoors.",
        severity: "bad",
      });

    // Elevate to severe if any severe keyword appears in the text
    for (let i = 0; i < alerts.length; i++) {
      const s = inferSeverityFromText(alerts[i].message);
      if (s === "severe") alerts[i] = { ...alerts[i], severity: "severe" };
    }

    // No alerts -> explicit green card
    if (alerts.length === 0)
      alerts.push({
        message: "✅ No severe weather alerts.",
        severity: "none",
      });
    return alerts;
  }, []);

  // shorthand type guard for error responses
  const isErrorResponse = (x: unknown): x is ErrorResponse => {
    return (
      typeof x === "object" &&
      x !== null &&
      "cod" in x &&
      Number((x as ErrorResponse).cod) !== 200
    );
  };

  // search effect (debounced) - uses AbortController and cached fetch helpers
  const ongoingSearchRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!debouncedCity || !debouncedCity.trim()) return;
    let cancelled = false;
    const controller = new AbortController();
    ongoingSearchRef.current?.abort();
    ongoingSearchRef.current = controller;

    const run = async () => {
      setLoadingSearch(true);
      try {
        const [w, f] = await Promise.all([
          fetchCurrentWeather(debouncedCity, controller.signal),
          fetchForecast(debouncedCity, controller.signal),
        ]);

        if (cancelled) return;

        // if API returned an error-like object, show alert and clear UI
        if (isErrorResponse(w)) {
          setWeatherData(null);
          setForecastData([]);
          // alert(w.message ?? "City not found");
          setCitySearched(true);
        } else if (isErrorResponse(f)) {
          setWeatherData(null);
          setForecastData([]);
          alert(f.message ?? "Forecast not available");
        } else {
          // w and f should be the expected types
          setWeatherData(w as CurrentWeather);
          // pushNotification();
          // set background theme quickly
          const weatherMain =
            (w as CurrentWeather).weather?.[0]?.main?.toLowerCase?.() ?? "";
          if (weatherMain.includes("clear"))
            setBackground("from-yellow-300 via-orange-400 to-pink-500");
          else if (weatherMain.includes("cloud"))
            setBackground("from-gray-600 via-gray-800 to-slate-900");
          else if (weatherMain.includes("rain"))
            setBackground("from-blue-800 via-gray-700 to-gray-900");
          else if (weatherMain.includes("snow"))
            setBackground("from-white via-blue-200 to-sky-300");
          else setBackground("from-slate-900 via-blue-900 to-slate-800");

          // pick daily entries (every ~8 items from 3-hour forecast)
          const daily: ForecastListItem[] = (
            (f as ForecastResponse).list ?? []
          ).filter((_, idx) => idx % 8 === 0);
          setForecastData(daily);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Search error", err);
          alert("Error fetching weather data");
        }
      } finally {
        if (!cancelled) setLoadingSearch(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      ongoingSearchRef.current?.abort();
      ongoingSearchRef.current = null;
    };
  }, [debouncedCity]);

  // search action (trim and let debounce trigger)
  const onSearchClick = useCallback(() => {
    setCity((c) => c.trim());
    // pushNotification();
  }, []);

  // derived alerts (memoized)
  const alerts = useMemo(
    () => (weatherData ? getWeatherAlerts(weatherData) : []),
    [weatherData, getWeatherAlerts]
  );

  console.log(alerts);

  useEffect(() => {
    const notificationHeader = alerts[0]?.message || "Weather Update";
    const notificationMessage = weatherData
      ? getClothingSuggestion(weatherData)
      : null;

    const pushNotification = () => {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
      }

      if (!notificationHeader || !notificationMessage) {
        console.log("Missing notification data, skipping...");
        return;
      }

      if (Notification.permission === "granted") {
        new Notification(notificationHeader, {
          body: notificationMessage,
          icon: "/icon.png",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(notificationHeader, {
              body: notificationMessage,
              icon: "/icon.png",
            });
          }
        });
      }
    };

    if (notificationHeader && notificationMessage) {
      pushNotification();
    }
  }, [alerts, weatherData, getClothingSuggestion]);

  // helper: class + icon per severity
  const alertVisual = (severity: AlertSeverity) => {
    if (severity === "none") {
      return {
        cls: "bg-alert-green text-white",
        icon: <CheckCircle size={20} className="mt-1" />,
      };
    }
    if (severity === "severe") {
      return {
        cls: "bg-alert-red text-white",
        icon: <AlertTriangle size={20} className="mt-1" />,
      };
    }
    // "bad"
    return {
      cls: "bg-alert-orange text-white",
      icon: <AlertTriangle size={20} className="mt-1" />,
    };
  };

  // ---------- render ----------
  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${background}`}
    >
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* header */}
        <motion.div
          className="text-center mb-8"
          initial="hidden"
          animate={animateEnabled ? "visible" : "hidden"}
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

        {/* search */}
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial="hidden"
          animate={animateEnabled ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin
                className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 text-muted-foreground text-white"
                size={20}
              />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                onKeyPress={(e) => e.key === "Enter" && onSearchClick()}
                className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            {/* <Button
              onClick={onSearchClick}
              disabled={loadingSearch}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Search size={18} />
            </Button> */}
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {alerts.length > 0 && weatherData && (
            <motion.div
              className="max-w-2xl mx-auto mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="space-y-2">
                {alerts.map((a, i) => {
                  const { cls, icon } = alertVisual(a.severity);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className={`rounded-xl shadow-xl p-3 flex items-start gap-3 ${cls}`}
                    >
                      {icon}
                      <div className="text-sm leading-snug">{a.message}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main cards: skeletons while loading; actual cards when weatherData present */}
        {loadingSearch ? (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white/6 backdrop-blur-md border-white/8"
              >
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-10 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {weatherData && (
              <motion.div
                key={weatherData.name}
                variants={subtleBounce}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid md:grid-cols-3 gap-4 mb-8"
              >
                {/* Current Weather */}
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="bg-white/8 backdrop-blur-md border-white/10 text-white">
                    <CardContent className="p-4 text-center">
                      <CardTitle>Current Weather</CardTitle>
                      <div className="mt-2">
                        <div className="text-xl font-semibold">
                          {weatherData.name}
                        </div>
                        <div className="capitalize text-sm">
                          {weatherData.weather?.[0]?.description ?? "--"}
                        </div>
                        <div className="text-2xl font-bold mt-2">
                          {Math.round(weatherData.main?.temp ?? 0)}°C
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Summary - iconified */}
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="bg-white/8 backdrop-blur-md border-white/10 text-white">
                    <CardContent className="p-4">
                      <CardTitle>Summary</CardTitle>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 items-center text-left">
                        <div className="flex items-center gap-2">
                          <Thermometer size={20} />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Temp
                            </div>
                            <div className="font-semibold">
                              {Math.round(weatherData.main?.temp ?? 0)}°C
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets size={20} />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Humidity
                            </div>
                            <div className="font-semibold">
                              {weatherData.main?.humidity ?? "--"}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind size={20} />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Wind
                            </div>
                            <div className="font-semibold">
                              {weatherData.wind?.speed ?? "--"} km/h
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Clothing suggestion */}
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="bg-white/8 backdrop-blur-md border-white/10 text-white">
                    <CardContent className="p-4 text-center">
                      <CardTitle>Style Forecast</CardTitle>
                      <div className="mt-4 text-sm">
                        {getClothingSuggestion(weatherData)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* 5-day forecast */}
        <div className="mb-12">
          {forecastData.length > 0 && (
            <h2 className="text-white text-2xl mb-4">5-Day Forecast</h2>
          )}

          {citySearched && forecastData?.length < 1 ? (
            <p className="text-center text-red-500">City could not be found</p>
          ) : forecastData.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {forecastData.map((d, i) => (
                <ForecastCard key={i} day={d} />
              ))}
            </motion.div>
          ) : loadingSearch ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-white/6 backdrop-blur-md">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-6 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-8 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-white/60">
              Search a city to see the 5-day forecast.
            </div>
          )}
        </div>

        {/* Global city slider */}
        <div className="mb-12">
          <h2 className="text-white text-2xl mb-4">Global City Weather</h2>

          {sliderLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="bg-white/6 backdrop-blur-md">
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-6 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-8 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {sliderData.map((c, i) => (
                <SliderCard key={i} city={c} />
              ))}
            </motion.div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/50 text-sm">Powered by OpenWeatherMap API</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
