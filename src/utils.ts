import { auth } from "./firebaseConfig";

// Makes a fetch request specifically from the backend server.
export async function apiFetch(path: string, options: any = {}) {
  const token = await auth.currentUser?.getIdToken();

  return fetch(`${process.env.EXPO_PUBLIC_DATABASE_API_DOMAIN}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });
}

