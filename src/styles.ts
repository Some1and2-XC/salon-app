import { StyleSheet, Platform } from 'react-native';
import { colorScheme, colorSchemeGreens, COLOR_SCHEME_BROWN, COLOR_SCHEME_GREENS, MAP_COLOR_SCHEME } from "./colorScheme";

import { create } from "zustand";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const sty = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white"
    },

    containerCentered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    h1: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 12
    },

    h2: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10
    },

    text: {
        fontSize: 16,
        color: "black",
    },

    textBold: {
        fontWeight: 800,
    },

    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6
    }

});

export function useCommonUi(scheme) {

    return {
        screen: {
            safeArea: {
                flex: 1,
                // Fixed broken scrolling on web
                ...(Platform.OS === "web" && {
                    height: "100vh",
                    overflow: "auto"
                })
            },
            pageMargins: {
                padding: 14,
            },
            pageInnerGaps: {
                gap: 14,
            },
            scrollViewWeb: {
                minHeight: 0,
            },
            scrollContent: {
                flexGrow: 1,
                paddingBottom: 18,
            },
            pageWrapNarrow: {
                flex: 1,
                paddingHorizontal: 14,
                paddingTop: 10,
                paddingBottom: 10,
            },
            pageWrapWide: {
                flex: 1,
                paddingHorizontal: 16,
            },
            screenInner: {
                flex: 1,
                minHeight: "100%",
            },
            centerWrap: {
                flex: 1,
                justifyContent: "center",
            },
            keyboardWrap: {
                flex: 1,
            },
        },
        auth: {
            salonTitle: {
                fontSize: 34,
                fontWeight: "800",
                textAlign: "center",
                color: scheme.textDefault,
                marginBottom: 28,
                letterSpacing: 1,
            },
            formCard: {
                backgroundColor: scheme.whiteWarmCard,
                borderRadius: 26,
                padding: 20,
                borderWidth: 1,
                borderColor: scheme.borderLight,
            },
            formTitle: {
                fontSize: 22,
                fontWeight: "800",
                color: scheme.textDark,
                marginBottom: 6,
            },
            formDescription: {
                fontSize: 13.5,
                color: scheme.textMuted,
                marginBottom: 16,
            },
            inputGroup: {
                marginBottom: 14,
            },
            inputLabel: {
                fontSize: 12,
                fontWeight: "700",
                color: scheme.textLabel,
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.8,
            },
            input: {
                backgroundColor: scheme.panelBackground,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: scheme.borderLightAlt,
                fontSize: 15,
                fontWeight: "600",
                color: scheme.textDefault,
            },
            feedbackText: {
                marginTop: 2,
                marginBottom: 10,
                fontSize: 13,
                fontWeight: "700",
            },
            feedbackError: {
                color: scheme.feedbackError,
            },
            feedbackSuccess: {
                color: scheme.feedbackSuccess,
            },
            primaryButton: {
                backgroundColor: scheme.darkSurface,
                borderRadius: 24,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 6,
            },
            primaryButtonText: {
                color: scheme.whiteWarm,
                fontSize: 15,
                fontWeight: "800",
            },
            heroButton: {
                zIndex: 2,
                alignSelf: "stretch",
                width: "100%",
            },
            emptyButton: {
                marginTop: 4,
            },
            dividerWrap: {
                flexDirection: "row",
                alignItems: "center",
                marginTop: 18,
                marginBottom: 16,
            },
            dividerLine: {
                flex: 1,
                height: 1,
                backgroundColor: scheme.borderMuted,
            },
            dividerText: {
                marginHorizontal: 12,
                fontSize: 12,
                fontWeight: "700",
                color: scheme.textLabel,
                letterSpacing: 0.8,
            },
            cardPressed: {
                opacity: 0.9,
                transform: [{ scale: 0.98 }],
            },
            inlineCtaButton: {
                backgroundColor: scheme.accentButton,
                borderRadius: 999,
                padding: 14,
                alignItems: "center",
                justifyContent: "center",
            },
            inlineCtaButtonText: {
                fontSize: 14,
                fontWeight: "800",
                color: scheme.textDefault,
            },
            inlineCtaPromptText: {
                fontSize: 14,
                color: scheme.textSubtle,
                marginBottom: 10,
            },
        },
        card: {
            // Accent tint header card used in admin screens
            accentCard: {
                position: "relative",
                overflow: "hidden",
                borderRadius: 28,
                paddingHorizontal: 20,
                paddingVertical: 20,
                backgroundColor: scheme.accentTint,
                borderWidth: 1,
                borderColor: scheme.borderAccentSoft,
            },
            accentCardBlob: {
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: scheme.accentBlob,
                right: -30,
                top: -20,
                opacity: 0.25,
            },
            kicker: {
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: scheme.textAccentSoft,
                marginBottom: 8,
            },
            cardTitle: {
                fontSize: 26,
                fontWeight: "800",
                color: scheme.textDarkest,
                marginBottom: 8,
            },
            cardSubtitle: {
                fontSize: 14,
                lineHeight: 21,
                color: scheme.textSubtle,
            },
            // White warm content card
            pageCard: {
                backgroundColor: scheme.whiteWarmCard,
                borderRadius: 26,
                padding: 18,
                borderWidth: 1,
                borderColor: scheme.borderLight,
            },
            // Press states
            pressed: {
                opacity: 0.92,
                transform: [{ scale: 0.99 }],
            },
            cardPressed: {
                opacity: 0.93,
                transform: [{ scale: 0.985 }],
            },
            // Primary dark surface action card
            primaryActionCard: {
                position: "relative",
                overflow: "hidden",
                backgroundColor: scheme.darkSurface,
                borderRadius: 28,
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 18,
                minHeight: 205,
                width: "100%",
            },
            cardGlow: {
                position: "absolute",
                width: 170,
                height: 170,
                borderRadius: 85,
                backgroundColor: scheme.accentGlow,
                top: -40,
                right: -30,
                opacity: 0.13,
            },
            cardHeaderRow: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
            },
            iconWrapLarge: {
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: scheme.overlayWhiteSoft,
                alignItems: "center",
                justifyContent: "center",
            },
            iconLarge: {
                fontSize: 22,
                color: scheme.accentHighlight,
            },
            pillDark: {
                backgroundColor: scheme.overlayAccentSoft,
                borderRadius: 999,
                paddingHorizontal: 11,
                paddingVertical: 7,
            },
            pillDarkText: {
                color: scheme.accentHighlight,
                fontSize: 12,
                fontWeight: "700",
            },
            primaryTitle: {
                fontSize: 26,
                lineHeight: 31,
                fontWeight: "800",
                color: scheme.whiteWarm,
                marginBottom: 9,
                maxWidth: "82%",
            },
            primaryDescription: {
                fontSize: 14,
                lineHeight: 21,
                color: scheme.textOnDark,
                maxWidth: "94%",
                marginBottom: 18,
            },
            primaryFooter: {
                marginTop: "auto",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            },
            primaryFooterText: {
                color: scheme.whiteWarm,
                fontWeight: "700",
                fontSize: 14.5,
            },
            primaryArrow: {
                color: scheme.accentHighlight,
                fontSize: 22,
                fontWeight: "700",
            },
            // Secondary white warm action card
            secondaryActionCard: {
                backgroundColor: scheme.whiteWarmCard,
                borderRadius: 28,
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 18,
                minHeight: 150,
                borderWidth: 1,
                borderColor: scheme.borderLight,
                width: "100%",
            },
            smallTopRow: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
            },
            iconWrapSmall: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: scheme.panelBackgroundAlt,
                alignItems: "center",
                justifyContent: "center",
            },
            iconSmall: {
                fontSize: 18,
                color: scheme.textAccentSoft,
            },
            cornerText: {
                fontSize: 12,
                fontWeight: "700",
                color: scheme.textLabel,
            },
            secondaryTitle: {
                fontSize: 22,
                lineHeight: 26,
                fontWeight: "800",
                color: scheme.textDark,
                marginBottom: 6,
            },
            secondaryDescription: {
                fontSize: 13.5,
                lineHeight: 20,
                color: scheme.textMuted,
                maxWidth: "92%",
            },
        },
        modal: {
            overlay: {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 18,
                backgroundColor: scheme.overlayDarkSoft,
            },
            backdrop: {
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
            card: {
                width: "100%",
                maxWidth: 430,
                maxHeight: "70%",
                backgroundColor: scheme.whiteWarmCard,
                borderRadius: 28,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 14,
                borderWidth: 1,
                borderColor: scheme.borderLight,
            },
            header: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
            },
            title: {
                fontSize: 18,
                fontWeight: "800",
                color: scheme.textDarkest,
            },
            closeButton: {
                paddingHorizontal: 6,
                paddingVertical: 2,
            },
            closeText: {
                fontSize: 18,
                fontWeight: "800",
                color: scheme.textAccentSoft,
            },
            list: {
                maxHeight: 420,
            },
            listContent: {
                paddingBottom: 8,
            },
            optionRow: {
                backgroundColor: scheme.panelBackground,
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: scheme.borderLightAlt,
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            },
            optionRowSelected: {
                backgroundColor: scheme.accentTint,
                borderColor: scheme.textAccent,
            },
            optionRowPressed: {
                opacity: 0.92,
                transform: [{ scale: 0.99 }],
            },
            optionTextWrap: {
                flex: 1,
                paddingRight: 12,
            },
            optionLabel: {
                fontSize: 15,
                fontWeight: "700",
                color: scheme.textDefault,
            },
            optionLabelSelected: {
                color: scheme.textDarkest,
            },
            optionSubLabel: {
                marginTop: 4,
                fontSize: 12,
                color: scheme.textAccentSoft,
                fontWeight: "600",
            },
            optionSubLabelSelected: {
                color: scheme.textAccent,
            },
            optionCheck: {
                fontSize: 18,
                fontWeight: "800",
                color: scheme.textAccent,
            },
            emptyText: {
                fontSize: 14,
                color: scheme.textMuted,
                textAlign: "center",
                paddingVertical: 22,
            },
        },
        form: {
            selectButton: {
                backgroundColor: scheme.panelBackground,
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 15,
                borderWidth: 1,
                borderColor: scheme.borderLightAlt,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            },
            selectButtonDisabled: {
                opacity: 0.6,
            },
            selectValue: {
                flex: 1,
                fontSize: 15,
                fontWeight: "700",
                color: scheme.textDefault,
                paddingRight: 10,
            },
            selectValueMuted: {
                color: scheme.textLabel,
            },
            selectChevron: {
                fontSize: 24,
                color: scheme.textAccentSoft,
                marginTop: -2,
            },
        },
        hero: {
            heroCard: {
                position: "relative",
                overflow: "hidden",
                borderRadius: 28,
                paddingHorizontal: 20,
                paddingTop: 24,
                paddingBottom: 32,
                backgroundColor: scheme.accentTint,
                marginBottom: 14,
                justifyContent: "space-between",
                width: "100%",
            },
            heroTopRow: {
                zIndex: 2,
            },
            heroTextBlock: {
                zIndex: 2,
                marginTop: 8,
                marginBottom: 18,
            },
            heroFadeWrap: {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -2,
                alignItems: "center",
            },
            heroFadeMain: {
                width: "84%",
                height: 26,
                backgroundColor: scheme.panelBackground,
                borderTopLeftRadius: 100,
                borderTopRightRadius: 100,
                opacity: 0.72,
            },
            heroFadeSmall: {
                width: "56%",
                height: 14,
                backgroundColor: scheme.panelBackground,
                marginTop: -4,
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
                opacity: 0.95,
            },
            blobOne: {
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: scheme.accentBlob,
                right: -55,
                top: -45,
                opacity: 0.35,
            },
            blobTwo: {
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: scheme.accentCream,
                right: 48,
                bottom: -42,
                opacity: 0.95,
            },
            blobThree: {
                position: "absolute",
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: scheme.accentBlobStrong,
                top: 102,
                opacity: 0.12,
            },
            kicker: {
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.7,
                textTransform: "uppercase",
                color: scheme.textAccentSoft,
            },
            heroTitle: {
                fontSize: 38,
                fontWeight: "800",
                lineHeight: 41,
                color: scheme.textDarkest,
            },
            heroTitleAccent: {
                fontSize: 38,
                fontWeight: "800",
                lineHeight: 41,
                color: scheme.textAccent,
                marginBottom: 12,
            },
            heroText: {
                fontSize: 15,
                lineHeight: 22,
                color: scheme.textSubtle,
                maxWidth: "78%",
            },
            metaRow: {
                zIndex: 2,
                flexDirection: "row",
                flexWrap: "wrap",
            },
            metaChip: {
                backgroundColor: scheme.darkSurface,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 999,
                alignSelf: "flex-start",
            },
            metaChipText: {
                color: scheme.whiteSoft,
                fontWeight: "700",
                fontSize: 12.5,
            },
        },
    };

}

export const ASYNC_STORAGE_KEY_COLOR_SCHEME: string = "color-scheme";

// A global color scheme
export const useTheme = create((set, get) => ({
        scheme: COLOR_SCHEME_BROWN,
        reset: () => set((state) => ({ scheme: COLOR_SCHEME_BROWN })),
        setScheme: async (scheme: string) => {
            set({ scheme });
            await AsyncStorage.setItem(ASYNC_STORAGE_KEY_COLOR_SCHEME, JSON.stringify({ scheme: scheme }));
        },
        getScheme: () => { return MAP_COLOR_SCHEME[get().scheme] ?? colorSchemeBrown; },
        getCommonUi: () => useCommonUi(get().getScheme()),
        loadScheme: async () => {
            const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_COLOR_SCHEME);
            if (stored) {
                set(JSON.parse(stored));
            }
        },
    }),
)
