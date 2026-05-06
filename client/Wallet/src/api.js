export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8787");
const TOKEN_KEY = "nexa-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Auth still updates in memory; persistence is best effort.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
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
