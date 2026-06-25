import axios from "axios";

const apiPos = axios.create({
    baseURL: process.env.NEXT_PUBLIC_POS_API_URL ?? "http://localhost:5005",
    headers: {
        "X-Customer-Id": "1"
    }
});

export default apiPos;
