/**
 * Central icon module — wraps FontAwesome5 (Expo) so names/sizes stay in one place.
 * Web note: use these components, not <i class="fa-solid ..."> (DOM-only; not valid in RN).
 */
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";

/** Dynamic FA5 icon by kebab-case name (e.g. admin menu rows). */
export function AppIcon({ name, size = 16, color, style, ...rest }) {
    return (
        <FontAwesome5
            name={name}
            size={size}
            color={color}
            style={style}
            {...rest}
        />
    );
}

export function IconArrowLeft(props) {
    return <FontAwesome5 name="arrow-left" {...props} />;
}

export function IconBarcode(props) {
    return <FontAwesome5 name="barcode" {...props} />;
}

export function IconCalendarCheck(props) {
    return <FontAwesome5 name="calendar-check" {...props} />;
}

export function IconCheck(props) {
    return <FontAwesome5 name="check" {...props} />;
}

export function IconCheckDouble(props) {
    return <FontAwesome5 name="check-double" {...props} />;
}

export function IconChevronDown(props) {
    return <FontAwesome5 name="chevron-down" {...props} />;
}

export function IconChevronRight(props) {
    return <FontAwesome5 name="chevron-right" {...props} />;
}

export function IconClipboardCheck(props) {
    return <FontAwesome5 name="clipboard-check" {...props} />;
}

export function IconClock(props) {
    return <FontAwesome5 name="clock" {...props} />;
}

export function IconLayerGroup(props) {
    return <FontAwesome5 name="layer-group" {...props} />;
}

export function IconListUl(props) {
    return <FontAwesome5 name="list-ul" {...props} />;
}

export function IconMinus(props) {
    return <FontAwesome5 name="minus" {...props} />;
}

export function IconPalette(props) {
    return <FontAwesome5 name="palette" {...props} />;
}

export function IconPlus(props) {
    return <FontAwesome5 name="plus" {...props} />;
}

export function IconQrcode(props) {
    return <FontAwesome5 name="qrcode" {...props} />;
}

export function IconTimes(props) {
    return <FontAwesome5 name="times" {...props} />;
}

export function IconTrashAlt(props) {
    return <FontAwesome5 name="trash-alt" {...props} />;
}

export function IconUserMinus(props) {
    return <FontAwesome5 name="user-minus" {...props} />;
}

export function IconUserPlus(props) {
    return <FontAwesome5 name="user-plus" {...props} />;
}

export function IconUsers(props) {
    return <FontAwesome5 name="users" {...props} />;
}
