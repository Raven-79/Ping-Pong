import { Store, updateStore } from "../../lib/store.js";

export const BACKEND_URL = "https://localhost:8443";

export let userId = 0;

async function logoutUser() {
  await fetch(`${BACKEND_URL}/auth/api/logout`, {
    method: "POST",
  });
  localStorage.removeItem("access_token");

  updateStore({ userData: null });
}

export async function refresh() {
  const response = await fetch(`${BACKEND_URL}/auth/api/token/refresh/`, {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    const accessToken = data.access;
    localStorage.setItem("access_token", accessToken);
    return accessToken;
  } else {
    const resp = await response.json().catch(() => {});
    if (resp.detail === "2FA verification required") {
      updateStore({
        needs_2fa: true,
      });
      return null;
    }
    await logoutUser();
    return null;
  }
}

export async function myFetch(endpoint, options = {}) {
  let accessToken = localStorage.getItem("access_token");
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let response = await fetch(endpoint, options);
  if (response.status !== 401) return response;

  accessToken = await refresh();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  response = await fetch(endpoint, options);
  return response;
}

export async function get_valid_access_token() {
  const endpoint = "manage/profile/";
  const response = await myFetch(`${BACKEND_URL}/${endpoint}`);
  if (response.ok) {
    return localStorage.getItem("access_token");
  }
  return null;
}
