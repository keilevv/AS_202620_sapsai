import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;
const speciesService = {
  getSpecies(page, limit, sortBy, sortOrder, filters, accessToken) {
    return axios.get(`${apiUrl}/species`, {
      params: { page, limit, sortBy, sortOrder, ...filters },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  createSpecies(data, accessToken) {
    return axios.post(`${apiUrl}/species`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  updateSpecies(id, data, accessToken) {
    return axios.patch(`${apiUrl}/species/admin/${id}/update`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  deleteSpecies(id, accessToken) {
    return axios.delete(`${apiUrl}/species/admin/${id}/delete`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
export default speciesService;
