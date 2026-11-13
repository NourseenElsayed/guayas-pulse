import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

export const getHealth = () => api.get("/health");
export const getAreas = () => api.get("/areas");
export const getWaterSummary = () => api.get("/water/summary");
export const getTimeSeries = () => api.get("/water/timeseries");
export const getInundation = () => api.get("/inundation");
export const getValidation = () => api.get("/validation");

export default api;
