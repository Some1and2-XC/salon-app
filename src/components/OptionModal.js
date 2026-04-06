import { useTheme } from "../styles";
import { apiFetch } from "../utils";
import { colorSchemeDefault, MAP_COLOR_SCHEME } from "../colorScheme";
import { AdminBackBar } from "../components/AdminBackBar";

import {
    Text,
    View,
    Modal,
    Pressable,
    ScrollView,
} from "react-native";

export function OptionModal({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
    emptyText = "No options available",
}) {

    const commonUi = useTheme((state) => state.getCommonUi)();
    const scheme = useTheme((state) => state.scheme);
    const styles = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >

            <View style={styles.formModalBackdrop}>

                <View style={[ styles.modalCard, {maxWidth: 420} ]}>
                    <Pressable style={ styles.modalBackdrop } onPress={onClose} />

                    <View style={styles.optionModalHeader}>
                        <Text style={styles.optionModalTitle}>{title}</Text>

                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.optionModalClose}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.optionModalList}
                        contentContainerStyle={styles.optionModalListContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {options.length === 0 ? (
                            <Text style={styles.emptyOptionText}>{emptyText}</Text>
                        ) : (
                            options.map((option) => {
                                const isSelected = option.value === selectedValue;

                                return (
                                    <Pressable
                                        key={String(option.value)}
                                        style={({ pressed }) => [
                                            styles.optionRow,
                                            isSelected && styles.optionRowSelected,
                                            pressed && styles.optionRowPressed,
                                        ]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            onClose();
                                        }}
                                    >
                                        <View style={styles.optionTextWrap}>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    isSelected && styles.optionLabelSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </Text>

                                            {!!option.subLabel && (
                                                <Text
                                                    style={[
                                                        styles.optionSubLabel,
                                                        isSelected &&
                                                            styles.optionSubLabelSelected,
                                                    ]}
                                                >
                                                    {option.subLabel}
                                                </Text>
                                            )}
                                        </View>

                                        {isSelected && (
                                            <Text style={styles.optionCheck}>✓</Text>
                                        )}
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
