import axios from "axios";

console.log("AUTH API URL:", process.env.NEXT_PUBLIC_ERP_AUTH_URL);

const apiAuth = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default apiAuth;