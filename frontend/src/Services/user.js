import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
const authService = {
  getUser(userId, accessToken) {
    return axios.get(`${apiUrl}/users/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  updateUser(userId, data, accessToken) {
    return axios.patch(`${apiUrl}/users/${userId}/update`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
export default authService;
