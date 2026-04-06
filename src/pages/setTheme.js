import { useTheme } from "../styles";
import { MAP_COLOR_SCHEME } from "../colorScheme";
import { OptionModal } from "../components/OptionModal";

import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SetThemeScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorSchemeName = useTheme((state) => state.scheme);
    const colorSchemeSet = useTheme((state) => state.setScheme);

    const [showSelectionModal, setShowSelectionModal] = useState(false);

    const colorSchemeOptions = Object.keys(MAP_COLOR_SCHEME).map((k) => ({
        label: k,
        value: k,
    }));

    return (
        <ScrollView style={ commonUi.screen.pageMargins } contentContainerStyle={ commonUi.screen.pageInnerGaps }>

            <View style={commonUi.auth.formCard}>
                <View style={commonUi.hero.heroTextBlock}>
                    <Text style={commonUi.hero.heroTitle}>Set the</Text>
                    <Text style={commonUi.hero.heroTitleAccent}>Application Theme</Text>
                    <Text style={commonUi.hero.heroText}>
                        Customize the Color Scheme to whatever your heart desires.
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
                onPress={() => navigation.goBack() }
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
            />

        </ScrollView>
    );
}
