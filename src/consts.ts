// The different endpoints for various navigation values.
export const NAV_EXAMPLE_HOME: string = "example-home";
export const NAV_BOOKING: string = "booking";
export const NAV_CHECKIN: string = "checkin";

export const NAV_CHECKINCONFIRM: string = "checkin-confirm";
export const NAV_CHECKIN_CONFIRM_ADMIN: string = "admin-checkin-confirm";
export const NAV_CHECKIN_CONFIRM_ADMIN_LIST: string = "admin-checkin-confirm-list";
export const NAV_QR: string = "qr";
export const NAV_HOME: string = "home";
export const NAV_LOGIN: string = "login";
export const NAV_SIGNUP: string = "signup";
export const NAV_APP_TYPES: string = "app-types";
export const NAV_BARCODE_SCANNER: string = "barcode-scanner";
export const NAV_ADMIN_HOMEPAGE: string = "adminHomepage";
export const NAV_SET_THEME: string = "set-theme";

export const TOAST_TYPE_SUCCESS: number = 0;
export const TOAST_TYPE_ERROR: number = 1;
export const TOAST_TYPE_INFO: number = 2;
// export const TOAST_TYPE_WARNING: number = 3;

export const TOAST_TYPE_MAPPINGS = {
    0: "success",
    1: "error",
    2: "info",
}

export const APPOINTMENT_STATE_UNCONFIRMED : number = 0
export const APPOINTMENT_STATE_ACCEPTED    : number = 1;
export const APPOINTMENT_STATE_CONFIRMED   : number = 2;
export const APPOINTMENT_STATE_CANCELLED   : number = 3;
export const APPOINTMENT_STATE_COMPLETED   : number = 4;

export const FIREBASE_AUTH_ERROR_MESSAGES = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account exists with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-email": "Please enter your email first.",
    "auth/too-many-requests": "Too many reset attempts. Please try again later.",
};
