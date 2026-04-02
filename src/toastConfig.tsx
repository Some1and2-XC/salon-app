import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ToastCardProps = {
    text1?: string;
    text2?: string;
    accentColor: string;
};

function ToastCard({ text1, text2, accentColor }: ToastCardProps) {
    return (
        <View style={[styles.toastCard, { borderLeftColor: accentColor }]}>
            {!!text1 && <Text style={styles.toastTitle}>{text1}</Text>}
            {!!text2 && <Text style={styles.toastMessage}>{text2}</Text>}
        </View>
    );
}

export const toastConfig = {
    customInfo: ({ text1, text2 }: any) => (
        <ToastCard
            text1={text1}
            text2={text2}
            accentColor="#9b664d"
        />
    ),

    customWarning: ({ text1, text2 }: any) => (
        <ToastCard
            text1={text1}
            text2={text2}
            accentColor="#c68a2f"
        />
    ),

    customSuccess: ({ text1, text2 }: any) => (
        <ToastCard
            text1={text1}
            text2={text2}
            accentColor="#6d8b5a"
        />
    ),

    customError: ({ text1, text2 }: any) => (
        <ToastCard
            text1={text1}
            text2={text2}
            accentColor="#b85c5c"
        />
    ),
};

const styles = StyleSheet.create({
    toastCard: {
        width: "92%",
        backgroundColor: "#fff8f2",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderLeftWidth: 6,
        borderWidth: 1,
        borderColor: "#ead9ce",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 4,
    },

    toastTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#2b1b15",
        marginBottom: 4,
    },

    toastMessage: {
        fontSize: 13.5,
        lineHeight: 19,
        color: "#6a5348",
        fontWeight: "600",
    },
});