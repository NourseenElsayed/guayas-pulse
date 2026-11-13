import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" }
});

export const getHealth = () => api.get("/health");
export const getAreas = () => api.get("/areas");
export const getAcquisitions = () => api.get("/acquisitions");
export const getWaterSummary = () => api.get("/water/summary");
export const getTimeSeries = () => api.get("/water/timeseries");
export const getChangeComparison = () => api.get("/change/compare");
export const getInundation = () => api.get("/inundation");
export const getRainfall = () => api.get("/environment/rainfall");
export const getValidation = () => api.get("/validation");
export const getNotifications = () => api.get("/notifications");
export const getNotificationSettings = () => api.get("/notifications/settings");

export const askAI = (question) =>
  api.post("/ai/ask", { question });

export const updateNotificationSettings = (settings) =>
  api.put("/notifications/settings", settings);

export default api;
