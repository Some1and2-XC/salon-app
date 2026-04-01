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

    containerCard: {
        borderRadius: "2.5px",
        borderWidth: "0.5px",
        borderColor: "black",
        marginTop: 6,
        marginBottom: 6,
        padding: 12,
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
