import { StyleSheet, Platform } from 'react-native';
import { colorScheme, colorSchemeGreens, COLOR_SCHEME_BROWN, COLOR_SCHEME_GREENS, MAP_COLOR_SCHEME } from "./colorScheme";

import { create } from "zustand";

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
                backgroundColor: scheme.pageBackground,
                ...(Platform.OS === "web" && {
                    height: "100vh",
                    overflow: "auto"
                })
            },
            pageMargins: {
                padding: 14,
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
                backgroundColor: scheme.accentTint,
                borderRadius: 999,
                paddingVertical: 12,
                paddingHorizontal: 18,
                borderWidth: 1,
                borderColor: scheme.borderAccentSoft,
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

// A global color scheme
export const useTheme = create((set, get) => ({
    scheme: COLOR_SCHEME_BROWN,
    reset: () => set((state) => ({ scheme: COLOR_SCHEME_BROWN })),
    set: (scheme: string) => set({ scheme }),
    getScheme: () => { return MAP_COLOR_SCHEME[get().scheme] ?? colorSchemeBrown; },
    getCommonUi: () => useCommonUi(get().getScheme()),
}))
