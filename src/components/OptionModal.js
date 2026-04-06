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
    const colorScheme = MAP_COLOR_SCHEME[scheme] ?? colorSchemeDefault;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={commonUi.modal.overlay}>
                <Pressable style={commonUi.modal.backdrop} onPress={onClose} />

                <View style={commonUi.modal.card}>
                    <View style={commonUi.modal.header}>
                        <Text style={commonUi.modal.title}>{title}</Text>

                        <Pressable onPress={onClose} style={commonUi.modal.closeButton}>
                            <Text style={commonUi.modal.closeText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={commonUi.modal.list}
                        contentContainerStyle={commonUi.modal.listContent}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {options.length === 0 ? (
                            <Text style={commonUi.modal.emptyText}>{emptyText}</Text>
                        ) : (
                            options.map((option) => {
                                const isSelected =
                                    option.value === selectedValue;

                                return (
                                    <Pressable
                                        key={String(option.value)}
                                        style={({ pressed }) => [
                                            commonUi.modal.optionRow,
                                            isSelected && commonUi.modal.optionRowSelected,
                                            pressed && commonUi.modal.optionRowPressed,
                                        ]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            onClose();
                                        }}
                                    >
                                        <View style={commonUi.modal.optionTextWrap}>
                                            <Text
                                                style={[
                                                    commonUi.modal.optionLabel,
                                                    isSelected && commonUi.modal.optionLabelSelected,
                                                ]}
                                            >
                                                {option.label}
                                            </Text>

                                            {!!option.subLabel && (
                                                <Text
                                                    style={[
                                                        commonUi.modal.optionSubLabel,
                                                        isSelected && commonUi.modal.optionSubLabelSelected,
                                                    ]}
                                                >
                                                    {option.subLabel}
                                                </Text>
                                            )}
                                        </View>

                                        {isSelected && (
                                            <Text style={commonUi.modal.optionCheck}>✓</Text>
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
