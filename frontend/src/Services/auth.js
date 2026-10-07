import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
const authService = {
  localLogin(email, password) {
    return axios.post(`${apiUrl}/auth/login`, {
      email,
      password,
    });
  },

  googleLogin() {
    return (window.location.href = `${apiUrl}/auth/google`);
  },

  logout() {
    return axios.get(`${apiUrl}/auth/logout`);
  },

  isAuthenticated() {
    return axios.get(`${apiUrl}/auth/me`);
  },

  localRegister(fullName, password, email, phone) {
    return axios.post(`${apiUrl}/auth/register`, {
      fullName,
      email,
      password,
      phone,
    });
  },
};
export default authService;
