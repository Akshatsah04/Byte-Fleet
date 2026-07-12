import api from "./api";

export const getVehicles = () => api.get("/vehicles");
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const createVehicle = (data) => api.post("/vehicles", data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);