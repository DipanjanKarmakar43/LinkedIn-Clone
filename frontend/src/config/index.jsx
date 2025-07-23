const { default: axios } = require("axios");

export const clientServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
