import { StyleSheet } from 'react-native';

export const sty = StyleSheet.create({

    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
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
        color: '#222'
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

export const commonUi = {
    screen: {
        safeArea: {
            flex: 1,
            backgroundColor: "#f5efe9",
        },
        safeAreaWeb: {
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
        },
        scrollView: {
            flex: 1,
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
            color: "#2b1b15",
            marginBottom: 28,
            letterSpacing: 1,
        },
        formCard: {
            backgroundColor: "#fff8f2",
            borderRadius: 26,
            padding: 20,
            borderWidth: 1,
            borderColor: "#ead9ce",
        },
        formTitle: {
            fontSize: 22,
            fontWeight: "800",
            color: "#281c17",
            marginBottom: 6,
        },
        formDescription: {
            fontSize: 13.5,
            color: "#6a5348",
            marginBottom: 16,
        },
        inputGroup: {
            marginBottom: 14,
        },
        inputLabel: {
            fontSize: 12,
            fontWeight: "700",
            color: "#8b6d5e",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.8,
        },
        input: {
            backgroundColor: "#f3e7de",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 15,
            borderWidth: 1,
            borderColor: "#e5d2c5",
            fontSize: 15,
            fontWeight: "600",
            color: "#2b1b15",
        },
        feedbackText: {
            marginTop: 2,
            marginBottom: 10,
            fontSize: 13,
            fontWeight: "700",
        },
        feedbackError: {
            color: "#b3261e",
        },
        feedbackSuccess: {
            color: "#1d7a32",
        },
        primaryButton: {
            backgroundColor: "#241713",
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 6,
        },
        primaryButtonText: {
            color: "#fff8f3",
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
            backgroundColor: "#e3d2c7",
        },
        dividerText: {
            marginHorizontal: 12,
            fontSize: 12,
            fontWeight: "700",
            color: "#8b6d5e",
            letterSpacing: 0.8,
        },
        cardPressed: {
            opacity: 0.9,
            transform: [{ scale: 0.98 }],
        },
        inlineCtaButton: {
            backgroundColor: "#ead7ca",
            borderRadius: 999,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderWidth: 1,
            borderColor: "#e0cabc",
        },
        inlineCtaButtonText: {
            fontSize: 14,
            fontWeight: "800",
            color: "#2b1b15",
        },
        inlineCtaPromptText: {
            fontSize: 14,
            color: "#5e473c",
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
            backgroundColor: "#ead7ca",
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
            backgroundColor: "#f3e7de",
            borderTopLeftRadius: 100,
            borderTopRightRadius: 100,
            opacity: 0.72,
        },
        heroFadeSmall: {
            width: "56%",
            height: 14,
            backgroundColor: "#f3e7de",
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
            backgroundColor: "#d4ab93",
            right: -55,
            top: -45,
            opacity: 0.35,
        },
        blobTwo: {
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "#f6ece4",
            right: 48,
            bottom: -42,
            opacity: 0.95,
        },
        blobThree: {
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "#c7896b",
            top: 102,
            opacity: 0.12,
        },
        kicker: {
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 1.7,
            textTransform: "uppercase",
            color: "#7f5d4d",
        },
        heroTitle: {
            fontSize: 38,
            fontWeight: "800",
            lineHeight: 41,
            color: "#231712",
        },
        heroTitleAccent: {
            fontSize: 38,
            fontWeight: "800",
            lineHeight: 41,
            color: "#9b664d",
            marginBottom: 12,
        },
        metaRow: {
            zIndex: 2,
            flexDirection: "row",
            flexWrap: "wrap",
        },
        metaChip: {
            backgroundColor: "#241713",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 999,
            alignSelf: "flex-start",
        },
        metaChipText: {
            color: "#fffaf6",
            fontWeight: "700",
            fontSize: 12.5,
        },
    },
};

// TODO Make a global color pallet.