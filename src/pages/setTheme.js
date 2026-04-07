import { useTheme } from "../styles";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import { OptionModal } from "../components/OptionModal";
import { BackButton } from "../components/BackButton";
import { IconPalette } from "../icons";

import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function SetThemeScreen({ navigation }) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const colorSchemeName = useTheme((state) => state.scheme);
    const colorSchemeSet = useTheme((state) => state.setScheme);
    const colorScheme = MAP_COLOR_SCHEME[colorSchemeName] ?? colorSchemeDefault;

    const [showSelectionModal, setShowSelectionModal] = useState(false);

    const colorSchemeOptions = Object.keys(MAP_COLOR_SCHEME).map((k) => ({
        label: k,
        value: k,
    }));

    return (
        <ScrollView style={ commonUi.screen.pageMargins } contentContainerStyle={ commonUi.screen.pageInnerGaps }>

            <BackButton navigation={ navigation } />

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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={commonUi.auth.inlineCtaButtonText}>
                        Set Theme
                    </Text>
                    <IconPalette size={16} color={ colorScheme.textDefault } style={{ marginLeft: 6 }} />
                </View>
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
