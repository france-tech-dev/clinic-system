"use server";

import axios from "axios";
import { cookies } from "next/headers";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const authToken = cookieStore.get("auth_token")?.value;
    const xAccessToken = process.env.HOTSCOOL_X_ACCESS_TOKEN;

    if (accessToken) {
      config.headers["Access-Token"] = accessToken;
    }
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (xAccessToken) {
      config.headers["x-access-token"] = xAccessToken;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export const GET = async (url: string, returnRaw = false) => {
  const response = await apiClient.get(url);
  return returnRaw ? response : response.data;
};

export const POST = async (url: string, data: unknown, returnRaw = false) => {
  const response = await apiClient.post(url, data);
  return returnRaw ? response : response.data;
};

export const PUT = async (url: string, data: unknown, returnRaw = false) => {
  const response = await apiClient.put(url, data);
  return returnRaw ? response : response.data;
};

export const DELETE = async (url: string, returnRaw = false) => {
  const response = await apiClient.delete(url);
  return returnRaw ? response : response.data;
};
