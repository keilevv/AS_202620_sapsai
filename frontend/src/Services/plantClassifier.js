import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;
const plantClassifierService = {
  uploadImage(formData, accessToken) {
    return axios.post(`${apiUrl}/plant-classifier/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
  getClassifications(page, limit, sortBy, sortOrder, filters, accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/classifications`, {
      params: { page, limit, sortBy, sortOrder, ...filters },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getUpload(id, accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/upload/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  updateClassification(id, data, accessToken) {
    return axios.patch(
      `${apiUrl}/plant-classifier/classifications/${id}`,
      data,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  },
  listModels(accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/models`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getModelVersions(model, accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/models/${model}/versions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getModelVersionInfo(model, version, accessToken) {
    return axios.get(
      `${apiUrl}/plant-classifier/models/${model}/versions/${version}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },
  restoreModelVersion(model, version, accessToken) {
    return axios.post(
      `${apiUrl}/plant-classifier/models/${model}/versions/${version}/restore`,
      undefined,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },
  retrainModel(model, accessToken) {
    return axios.post(
      `${apiUrl}/plant-classifier/retrain/${model}`,
      undefined,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },
  getTrainingStatus(model, accessToken) {
    return axios.get(
      `${apiUrl}/plant-classifier/retrain/${model}/status`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  },
  getRetrainPreview(model, accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/retrain/preview`, {
      params: { model },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
  getMetrics(model, accessToken) {
    return axios.get(`${apiUrl}/plant-classifier/retrain/${model}/metrics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
export default plantClassifierService;
