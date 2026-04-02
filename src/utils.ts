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

// A utility function to check if a network request was successful.
// Usage:
// apiFetch("/foo")
//     .then(assertFetchSuccessful)
//     .then(/* do other stuff */)
//     .catch((error) => { /* Error handling stuff */ })
//     ;
export function assertFetchSuccessful(req) {
    // Throw error if failed
    if (!req.ok) throw new Error(`Network Request Failed! Status: ${req.status}`);
    // Return otherwise
    return req;
}
