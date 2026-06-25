import axios from "axios";

const apiCrm = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ERP_CRM_URL,
  withCredentials: true,
});

export { apiCrm };