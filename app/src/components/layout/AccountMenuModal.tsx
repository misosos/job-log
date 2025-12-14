import React, { memo } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import { colors, font, radius, space } from "../../styles/theme";

type Props = {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
    displayName: string;
    email: string;
};

export const AccountMenuModal = memo(function AccountMenuModal({
                                                                   visible,
                                                                   onClose,
                                                                   onLogout,
                                                                   displayName,
                                                                   email,
                                                               }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.menuOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.menuContainer}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuName} numberOfLines={1}>
                                    {displayName}
                                </Text>
                                {!!email && (
                                    <Text style={styles.menuEmail} numberOfLines={1}>
                                        {email}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                onPress={onLogout}
                                style={styles.menuItem}
                                accessibilityRole="button"
                                accessibilityLabel="로그아웃"
                            >
                                <Text style={styles.menuItemText}>로그아웃</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
});

const styles = StyleSheet.create({
    menuOverlay: {
        flex: 1,
        backgroundColor: colors.accentSoft,
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingTop: Platform.select({ ios: 72, android: 56, default: 56 }),
        paddingRight: space.lg,
    },

    menuContainer: {
        width: 220,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        paddingVertical: space.sm,
        paddingHorizontal: space.md,
        marginRight: space.xs,
        marginTop: space.xs,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    menuHeader: {
        paddingVertical: space.xs,
    },

    menuName: {
        fontSize: font.body,
        fontWeight: "800",
        color: colors.text,
    },

    menuEmail: {
        marginTop: 2,
        fontSize: font.small,
        color: colors.placeholder,
        fontWeight: "700",
    },

    menuDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: space.sm,
    },

    menuItem: {
        paddingVertical: space.sm - 2,
    },

    menuItemText: {
        fontSize: font.body,
        color: colors.text,
        fontWeight: "600",
    },
});