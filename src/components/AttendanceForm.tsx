"use client";

import React, { useState, useEffect } from "react";
import { Camera, MapPin, User, FileText, Info, Send, Loader2, Navigation, Trash2, Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500">
      <Loader2 className="animate-spin" />
    </div>
  ),
});

interface ConfigOption {
  value?: string;
  name?: string;
}

interface ConfigState {
  apkVersion: ConfigOption[];
  presenceType: ConfigOption[];
  workType: ConfigOption[];
}

export default function AttendanceForm() {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [options, setOptions] = useState<ConfigState>({
    apkVersion: [{ value: "2.0.0", name: "2.0.0" }],
    presenceType: [
      { value: "CI", name: "Check In" },
      { value: "CO", name: "Check Out" },
    ],
    workType: [
      { value: "wfo", name: "WFO" },
      { value: "wfh", name: "WFH" },
    ],
  });

  const defaultValue = {
    apkVersion: "2.0.0",
    employeeId: "",
    presenceType: "CI",
    latitude: "-6.1694068438218785",
    longitude: "106.83763796699102",
    workType: "wfc",
    information: "",
  };

  // Initialize theme from system or local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch configuration options
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const data = await response.json();

        console.log(data.data);
        console.log({
          apkVersion: data.data.apkVersion || [],
          presenceType: data.data.presenceType || [],
          workType: data.data.workType || [],
        });

        if (data) {
          setOptions({
            apkVersion: data.data.apkVersion || [],
            presenceType: data.data.presenceType || [],
            workType: data.data.workType || [],
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        // Optionally, handle error state or show a message
      }
    };
    fetchConfig();
  }, []); // Empty dependency array means this runs once on mount

  const [formData, setFormData] = useState(defaultValue);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Location error:", error);
        alert("Unable to retrieve your location");
        setLoadingLocation(false);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Please get your location first");
      return;
    }

    setSubmitLoading(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      console.log("Form Submitted", result);
      alert("Attendance Submitted Successfully!");

      // Reset form or redirect if needed
      setFormData((prev) => ({
        ...prev,
        information: "",
        employeeId: "",
      }));
      setImagePreview(null);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the form?")) {
      setFormData(defaultValue);
      setImagePreview(null);
    }
  };

  const updateLocation = (lat: string, lng: string) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passKey, setPassKey] = useState("");
  const [passKeyLoading, setPassKeyLoading] = useState(false);
  const [passKeyError, setPassKeyError] = useState("");

  const handlePassKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassKeyLoading(true);
    setPassKeyError("");

    console.log({ passKey });

    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passKey }),
      });

      const data = await response.json();

      console.log({ data });

      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setPassKeyError(data.error || "Invalid PassKey");
      }
    } catch (error) {
      setPassKeyError("Failed to validate PassKey");
    } finally {
      setPassKeyLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-neutral-900 text-white" : "bg-gray-100 text-slate-800"} flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
        <div className={`w-full max-w-sm ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-xl"} backdrop-blur-xl border rounded-3xl shadow-2xl p-8 animate-fade-in-up`}>
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-violet-600/20 text-violet-500 rounded-full flex items-center justify-center mb-4">
              <User size={32} />
            </div>
            <h2 className="text-2xl font-bold">Authentication</h2>
            <p className={`text-sm mt-2 ${darkMode ? "text-neutral-400" : "text-slate-500"}`}>Enter PassKey to access the attendance form</p>
          </div>

          <form onSubmit={handlePassKeySubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passKey}
                onChange={(e) => setPassKey(e.target.value)}
                placeholder="Enter Key Code"
                className={`w-full text-center text-2xl tracking-widest font-mono ${
                  darkMode ? "bg-neutral-800 text-white border-neutral-700" : "bg-gray-50 text-slate-800 border-gray-300"
                } border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all`}
              />
            </div>

            {passKeyError && <p className="text-red-500 text-sm text-center">{passKeyError}</p>}

            <button
              type="submit"
              disabled={passKeyLoading || !passKey}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-900/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {passKeyLoading ? <Loader2 size={20} className="animate-spin" /> : "Verify Access"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-neutral-900 text-white" : "bg-gray-100 text-slate-800"} flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
      <div
        className={`w-full max-w-md ${
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-xl"
        } backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 blur-2xl transform rotate-12 scale-150"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white tracking-wide">Attendance</h1>
            <p className="text-violet-200 text-sm mt-1">Please fill in your details</p>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="relative z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-white">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* APK Version */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">APK Version</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-violet-500 transition-colors">
                <Info size={18} />
              </div>
              <select
                name="apkVersion"
                value={formData.apkVersion}
                onChange={handleInputChange}
                className={`w-full ${
                  darkMode ? "bg-neutral-800 text-white border-neutral-700" : "bg-gray-50 text-slate-800 border-gray-300"
                } border rounded-xl py-3 pl-10 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all cursor-pointer font-mono text-sm`}
              >
                {options.apkVersion.map((version, idx) => (
                  <option key={idx} value={version.value}>
                    {version.name} {version.value === defaultValue.apkVersion && "(Current)"}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Employee ID */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Employee ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-violet-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                name="employeeId"
                placeholder="Ex: EMP-12345"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                className={`w-full ${
                  darkMode ? "bg-neutral-800 text-white border-neutral-700 placeholder:text-neutral-600" : "bg-gray-50 text-slate-800 border-gray-300 placeholder:text-gray-400"
                } border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all`}
              />
            </div>
          </div>

          {/* Presence Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Type of Presence</label>
            <div className="relative">
              <select
                name="presenceType"
                value={formData.presenceType}
                onChange={handleInputChange}
                className={`w-full ${
                  darkMode ? "bg-neutral-800 text-white border-neutral-700" : "bg-gray-50 text-slate-800 border-gray-300"
                } border rounded-xl py-3 pl-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all cursor-pointer`}
              >
                {options.presenceType.map((item, idx) => {
                  const val = item.name || ""; // Normalize
                  const name = item.name || val;
                  return (
                    <option key={idx} value={val}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Camera / Picture */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Photo Evidence</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl hover:border-violet-500/50 transition-colors ${
                darkMode ? "border-neutral-700 bg-neutral-800/30" : "border-gray-300 bg-gray-50"
              } group`}
            >
              <div className="space-y-1 text-center w-full">
                {imagePreview ? (
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden ring-2 ring-violet-500/50 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto h-12 w-12 text-neutral-500 group-hover:text-violet-400 transition-colors">
                      <Camera size={48} strokeWidth={1.5} />
                    </div>
                    <div className="flex text-sm text-neutral-400 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-violet-400 hover:text-violet-300 focus-within:outline-none">
                        <span>Take a photo</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" capture="user" className="sr-only" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-neutral-600">Tap to open camera</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Map & Location */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Location</label>

            {/* Leaflet Map with Draggable Marker */}
            <div className={`w-full h-48 ${darkMode ? "bg-neutral-800 border-neutral-700" : "bg-gray-200 border-gray-300"} rounded-xl relative overflow-hidden border z-0`}>
              {formData.latitude && formData.longitude ? (
                <MapComponent latitude={parseFloat(formData.latitude)} longitude={parseFloat(formData.longitude)} onLocationChange={updateLocation} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 flex-col gap-2">
                  <MapPin size={24} />
                  <span className="text-xs">Location not set</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-neutral-500 ml-1">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  id="latitude"
                  value={formData.latitude}
                  readOnly
                  placeholder="Lat"
                  className={`w-full ${
                    darkMode ? "bg-neutral-800/50 text-neutral-300 border-neutral-700" : "bg-gray-50 text-slate-600 border-gray-300"
                  } border rounded-lg py-2 px-3 text-sm focus:outline-none`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-neutral-500 ml-1">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  id="longitude"
                  value={formData.longitude}
                  readOnly
                  placeholder="Long"
                  className={`w-full ${
                    darkMode ? "bg-neutral-800/50 text-neutral-300 border-neutral-700" : "bg-gray-50 text-slate-600 border-gray-300"
                  } border rounded-lg py-2 px-3 text-sm focus:outline-none`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleLocationClick}
              disabled={loadingLocation}
              className={`w-full py-2.5 px-4 ${
                darkMode ? "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white" : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-slate-800"
              } text-sm font-medium rounded-xl border transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loadingLocation ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {loadingLocation ? "Getting location..." : "Get Current Location"}
            </button>
          </div>

          {/* Type of Work */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Type of Work</label>
            <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${darkMode ? "bg-neutral-800 border-neutral-700" : "bg-gray-200 border-gray-300"}`}>
              {options.workType.map((type, idx) => {
                const val = (type.value || type.name || "").toLowerCase();
                const label = type.name || "";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, workType: val }))}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      formData.workType === val
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                        : `${darkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-700/50" : "text-slate-500 hover:text-slate-800 hover:bg-gray-50"}`
                    }`}
                  >
                    {label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Information */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider ml-1">Information / Notes</label>
            <div className="relative group">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none text-neutral-500 group-focus-within:text-violet-500 transition-colors">
                <FileText size={18} />
              </div>
              <textarea
                name="information"
                value={formData.information}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional info..."
                className={`w-full ${
                  darkMode ? "bg-neutral-800 text-white border-neutral-700 placeholder:text-neutral-600" : "bg-gray-50 text-slate-800 border-gray-300 placeholder:text-gray-400"
                } border rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none text-sm`}
              />
            </div>
          </div>

          {/* Submit Button */}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleClear}
              className={`w-1/3 py-4 ${
                darkMode ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              } border font-semibold rounded-xl flex items-center justify-center gap-2 transform transition-all active:scale-[0.98]`}
            >
              <Trash2 size={18} />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-2/3 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-900/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>Submit</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
