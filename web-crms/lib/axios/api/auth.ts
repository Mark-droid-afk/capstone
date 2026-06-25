import axios from "axios";

console.log("AUTH API URL:", process.env.NEXT_PUBLIC_ERP_AUTH_URL);
const apiAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ERP_AUTH_URL,
  withCredentials: true,
});

export { apiAuth };
