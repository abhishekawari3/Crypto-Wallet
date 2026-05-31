export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8787");
let authToken = null;

export function getToken() {
  return authToken;
}

export function setToken(token) {
  authToken = token;
}

export function clearToken() {
  authToken = null;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: "Server returned an invalid response" };
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
