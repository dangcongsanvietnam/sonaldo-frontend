import axios from "axios";

const BASE_URL = axios.create({
  baseURL: "https://sonaldo14.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default BASE_URL;
