import { useTheme } from "../styles";
import { MAP_COLOR_SCHEME } from "../colorScheme";
import { NAV_HOME } from "../consts";
// I knows this is sorta silly to do like this but it's fine
import { makeStyles as makeBookingStyles, OptionModal } from "./booking";

import { useState, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SetThemeScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorScheme = useTheme((state) => state.getScheme)();
    const colorSchemeSet = useTheme((state) => state.setScheme);
    const colorSchemeName = useTheme((state) => state.scheme);

    const styles = useMemo(() => makeBookingStyles(colorScheme), [colorScheme]);

    const [showSelectionModal, setShowSelectionModal] = useState(false);

    const colorSchemeOptions = Object.keys(MAP_COLOR_SCHEME).map((k) => ({
        label: k,
        value: k,
    }));

    return (
        <ScrollView style={ commonUi.screen.pageMargins } contentContainerStyle={ commonUi.screen.pageInnerGaps }>

            <View style={commonUi.auth.formCard}>
                <View style={commonUi.hero.heroTextBlock}>
                    <Text style={commonUi.hero.heroTitle}>Set the theme of the Application</Text>
                    <Text style={commonUi.hero.heroTitleAccent}>Application Teme</Text>
                    <Text style={commonUi.hero.heroText}>
                        Manage check-ins and book appointments in one clean, smooth
                        workspace.
                    </Text>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [
                    commonUi.auth.inlineCtaButton,
                    pressed && commonUi.auth.cardPressed,
                ]}
                onPress={() => setShowSelectionModal(true) }
            >
                <Text style={commonUi.auth.inlineCtaButtonText}>
                    Set Theme &#x1F3A8;
                </Text>
            </Pressable>

            {/* TODO replace this with the global back button after it is merged */}
            <Pressable
                style={({ pressed }) => [
                    commonUi.auth.inlineCtaButton,
                    pressed && commonUi.auth.cardPressed,
                ]}
                onPress={() => navigation.navigate(NAV_HOME) }
            >
                <Text style={commonUi.auth.inlineCtaButtonText}>
                    Back
                </Text>
            </Pressable>

            <OptionModal
                visible={showSelectionModal}
                title="Choose a color Scheme"
                options={colorSchemeOptions}
                selectedValue={colorSchemeName}
                onSelect={colorSchemeSet}
                onClose={() => setShowSelectionModal(false)}
                styles={styles}
            />

        </ScrollView>

    );

}
