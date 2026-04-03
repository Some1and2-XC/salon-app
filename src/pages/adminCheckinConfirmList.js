import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Pressable,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";

import { NAV_CHECKIN_CONFIRM_ADMIN } from "../consts";
import { useTheme } from "../styles";
import { colorSchemeGreens } from "../colorScheme";
import { apiFetch } from "../utils";
import { AdminBackBar } from "../components/AdminBackBar";

export function AdminCheckinConfirmList({ navigation }) {
    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme =
        useTheme((state) => state.getScheme)() ?? colorSchemeGreens;
    const styles = useMemo(() => makeStyles(colorScheme), [colorScheme]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const res = await apiFetch("/appointments", { method: "GET" });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError("Could not load appointments.");
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const renderItem = ({ item }) => {
        const updated = item?.last_modified
            ? new Date(Number(item.last_modified)).toLocaleString()
            : "—";

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                ]}
                onPress={() =>
                    navigation.navigate(NAV_CHECKIN_CONFIRM_ADMIN, item)
                }
            >
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                        Appointment #{String(item?.uuid ?? item?.id ?? "—")}
                    </Text>
                    <Text style={styles.cardChevron}>→</Text>
                </View>
                <Text style={styles.cardMeta}>Updated {updated}</Text>
                <Text style={styles.cardHint}>Tap to review confirm / deny</Text>
            </Pressable>
        );
    };

    return (
        <View
            style={[
                commonUi.screen.screenInner,
                { backgroundColor: colorScheme.pageBackground },
            ]}
        >
            <FlatList
                data={items}
                keyExtractor={(item, index) =>
                    String(item?.uuid ?? item?.id ?? index)
                }
                renderItem={renderItem}
                ListHeaderComponent={
                    <View style={styles.headerBlock}>
                        <AdminBackBar navigation={navigation} />

                        <View style={styles.heroCard}>
                            <View style={styles.blobSoft} />
                            <Text style={styles.kicker}>Operations</Text>
                            <Text style={styles.title}>Check-in queue</Text>
                            <Text style={styles.subtitle}>
                                Select an appointment to open the confirmation
                                screen.
                            </Text>
                        </View>

                        {loading ? (
                            <View style={styles.loaderWrap}>
                                <ActivityIndicator
                                    size="large"
                                    color={colorScheme.textAccent}
                                />
                            </View>
                        ) : null}

                        {error ? (
                            <View style={styles.banner}>
                                <Text style={styles.bannerText}>{error}</Text>
                            </View>
                        ) : null}
                    </View>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyTitle}>No appointments</Text>
                            <Text style={styles.emptyText}>
                                When clients book or check in, their requests will
                                appear here.
                            </Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={[
                    commonUi.screen.pageMargins,
                    { paddingBottom: 28 },
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colorScheme.textAccent}
                    />
                }
            />
        </View>
    );
}

function makeStyles(colorScheme) {
    return StyleSheet.create({
        headerBlock: {
            marginBottom: 6,
        },
        heroCard: {
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 22,
            backgroundColor: colorScheme.accentTint,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderAccentSoft,
        },
        blobSoft: {
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colorScheme.accentBlob,
            right: -30,
            top: -20,
            opacity: 0.25,
        },
        kicker: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: colorScheme.textAccentSoft,
            marginBottom: 8,
            zIndex: 1,
        },
        title: {
            fontSize: 26,
            fontWeight: "800",
            color: colorScheme.textDarkest,
            marginBottom: 8,
            zIndex: 1,
        },
        subtitle: {
            fontSize: 14,
            lineHeight: 21,
            color: colorScheme.textSubtle,
            maxWidth: "95%",
            zIndex: 1,
        },
        loaderWrap: {
            paddingVertical: 20,
            alignItems: "center",
        },
        banner: {
            backgroundColor: colorScheme.panelBackground,
            borderRadius: 16,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
        },
        bannerText: {
            color: colorScheme.feedbackError,
            fontWeight: "600",
            textAlign: "center",
            fontSize: 14,
        },
        card: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            marginBottom: 12,
        },
        cardPressed: {
            opacity: 0.93,
            transform: [{ scale: 0.99 }],
        },
        cardTop: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: "800",
            color: colorScheme.textDark,
            flex: 1,
            paddingRight: 8,
        },
        cardChevron: {
            fontSize: 20,
            fontWeight: "700",
            color: colorScheme.textAccent,
        },
        cardMeta: {
            fontSize: 13,
            color: colorScheme.textMuted,
            marginBottom: 6,
        },
        cardHint: {
            fontSize: 12,
            fontWeight: "600",
            color: colorScheme.textLabel,
        },
        empty: {
            backgroundColor: colorScheme.whiteWarmCard,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: colorScheme.borderLight,
            alignItems: "center",
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: colorScheme.textDark,
            marginBottom: 8,
        },
        emptyText: {
            fontSize: 14,
            color: colorScheme.textMuted,
            textAlign: "center",
            lineHeight: 21,
        },
    });
}
