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

import Toast from "react-native-toast-message";
import { TOAST_TYPE_MAPPINGS } from "./consts";

// Creates a toast message.
export function showAppToast(type: number, title: string, message: string) {

    const toastType = TOAST_TYPE_MAPPINGS[type] ?? "info";

    Toast.show({
        type: toastType,
        text1: title,
        text2: message,
    });
}
