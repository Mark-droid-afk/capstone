import axios from "axios";

const apiAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ERP_AUTH_URL ?? "",
    withCredentials: true,
});

const apiCrm = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ERP_CRM_URL ?? "",
    withCredentials: true,
});

export { apiAuth, apiCrm };