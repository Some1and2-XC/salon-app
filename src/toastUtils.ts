import { Platform } from "react-native";
import Toast from "react-native-toast-message";

import {
    TOAST_TYPE_INFO,
    TOAST_TYPE_WARNING,
    TOAST_TYPE_SUCCESS,
    TOAST_TYPE_ERROR,
} from "./consts";

function mapToastType(type: number) {
    switch (type) {
        case TOAST_TYPE_SUCCESS:
            return "customSuccess";
        case TOAST_TYPE_WARNING:
            return "customWarning";
        case TOAST_TYPE_ERROR:
            return "customError";
        case TOAST_TYPE_INFO:
        default:
            return "customInfo";
    }
}

export function showAppToast(type: number, title: string, message: string) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
        return;
    }

    Toast.show({
        type: mapToastType(type),
        text1: title,
        text2: message,
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 60,
    });
}