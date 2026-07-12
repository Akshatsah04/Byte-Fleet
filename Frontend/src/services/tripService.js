import api from "./api";

export const getTrips = () => api.get("/trips");
export const getTripById = (id) => api.get(`/trips/${id}`);
export const createTrip = (data) => api.post("/trips", data);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);