import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // luôn gửi kèm cookie
});

export default axiosInstance;
