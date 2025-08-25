import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Laravel api.php
  withCredentials: true,
});

export default api;
