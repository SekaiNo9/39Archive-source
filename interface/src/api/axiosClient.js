import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi chung
    if (error.response) {
      // Lỗi từ server
      alert(error.response.data?.message || "Có lỗi xảy ra!");
    } else if (error.request) {
      alert("Không thể kết nối tới máy chủ!");
    } else {
      alert("Lỗi không xác định!");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;