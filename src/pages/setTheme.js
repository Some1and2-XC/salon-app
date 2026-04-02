import { useTheme } from "../styles";
import { MAP_COLOR_SCHEME } from "../colorScheme";
import { NAV_HOME } from "../consts";
// I knows this is sorta silly to do like this but it's fine
import { makeStyles as makeBookingStyles, OptionModal } from "./booking";

import { useState, useMemo } from "react";
import { Button, ScrollView } from "react-native";

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
        <ScrollView style={commonUi.screen.pageMargins}>

            <Button
                title="Select Theme!"
                onPress={() => setShowSelectionModal(true)}
                />

            <Button
                title="Back!"
                onPress={() => navigation.navigate(NAV_HOME) }
                />

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
