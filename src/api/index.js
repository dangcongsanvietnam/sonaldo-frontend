import axios from "axios";

const BASE_URL = axios.create({
  baseURL: "http://14.225.253.35:8080/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default BASE_URL;
