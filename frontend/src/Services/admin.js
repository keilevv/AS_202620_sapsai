import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;
const adminService = {
  getAdminclassifications(
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    accessToken
  ) {
    return axios.get(`${apiUrl}/admin/classifications`, {
      params: { page, limit, sortBy, sortOrder, ...filters },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getAdminUsers(page, limit, sortBy, sortOrder, filters, accessToken) {
    return axios.get(`${apiUrl}/admin/users`, {
      params: { page, limit, sortBy, sortOrder, ...filters },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getAdminClassification(id, accessToken) {
    return axios.get(`${apiUrl}/admin/classification/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  updateAdminClassification(id, data, accessToken) {
    return axios.put(`${apiUrl}/admin/classification/${id}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  deleteAdminClassification(id, accessToken) {
    return axios.delete(`${apiUrl}/admin/classification/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getAdminUser(id, accessToken) {
    return axios.get(`${apiUrl}/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  updateUserAdmin(id, data, accessToken) {
    return axios.put(`${apiUrl}/admin/user/${id}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  deleteAdminUser(id, accessToken) {
    return axios.delete(`${apiUrl}/admin/user/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
export default adminService;
