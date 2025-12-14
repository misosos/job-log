import React, { memo, useCallback } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { colors, font, radius, space } from "../../styles/theme";

export type NavItem<RouteName extends string = string> = {
    label: string;
    routeName: RouteName;
};

export type NavTabProps<RouteName extends string> = {
    item: NavItem<RouteName>;
    active: boolean;
    onPress: (name: RouteName) => void;
};

function NavTabBase<RouteName extends string>({
                                                  item,
                                                  active,
                                                  onPress,
                                              }: NavTabProps<RouteName>) {
    const handlePress = useCallback(() => onPress(item.routeName), [onPress, item.routeName]);

    return (
        <TouchableOpacity onPress={handlePress} style={styles.navItem} accessibilityRole="button">
            <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            {active && <View style={styles.navUnderline} />}
        </TouchableOpacity>
    );
}

export const NavTab = memo(NavTabBase) as <RouteName extends string>(
    props: NavTabProps<RouteName>
) => React.ReactElement;

const styles = StyleSheet.create({
    navItem: { marginRight: space.lg, alignItems: "center", paddingBottom: 2 },
    navText: { fontSize: font.body, color: colors.placeholder, fontWeight: "700" },
    navTextActive: { color: colors.accent, fontWeight: "800" },
    navUnderline: { marginTop: 2, height: 2, width: "100%", backgroundColor: colors.accent, borderRadius: radius.pill },
});