import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const researchCompany = async (company) => {
  const response = await api.post("/research", { company });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/report/${id}`);
  return response.data;
};

export const getPDFUrl = (id) => {
  return `${API_BASE}/report/${id}/pdf`;
};

export default {
  researchCompany,
  getHistory,
  getReportById,
  getPDFUrl,
};
