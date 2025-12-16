import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

import { auth } from "../../libs/firebase";
import { useAuth } from "../../libs/auth-context";
import { colors,space } from "../../styles/theme";

import { NavTab, type NavItem } from "./NavTab";
import { AccountMenuModal } from "./AccountMenuModal";

type RootStackParamList = {
    Dashboard: undefined;
    Applications: undefined;
    Planner: undefined;
    Resumes: undefined;
    Interviews: undefined;
    Login: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type RouteName = keyof RootStackParamList;

const NAV_ITEMS: NavItem<RouteName>[] = [
    { label: "지원 현황", routeName: "Applications" },
    { label: "플래너", routeName: "Planner" },
    { label: "이력서", routeName: "Resumes" },
    { label: "면접 기록", routeName: "Interviews" },
];

export function AppHeader() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { user } = useAuth();

    const [menuVisible, setMenuVisible] = useState(false);
    const currentRouteName = route.name as RouteName;

    useEffect(() => {
        if (!user) setMenuVisible(false);
    }, [user]);

    const closeMenu = useCallback(() => setMenuVisible(false), []);
    const toggleMenu = useCallback(() => setMenuVisible((prev) => !prev), []);

    const handleLogoPress = useCallback(() => {
        navigation.navigate("Dashboard");
    }, [navigation]);

    const handleNavigate = useCallback(
        (name: RouteName) => {
            navigation.navigate(name);
        },
        [navigation],
    );

    const handleSignOut = useCallback(async () => {
        try {
            setMenuVisible(false);
            await signOut(auth);

        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    }, []);

    const navItems = useMemo(() => NAV_ITEMS, []);

    return (
        <View style={styles.container}>
            {/* 상단: 로고 + 프로필 */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={handleLogoPress} accessibilityRole="button">
                    <Text style={styles.logoText}>Job-Log</Text>
                </TouchableOpacity>

                {!!user && (
                    <View style={styles.rightContainer}>
                        <TouchableOpacity
                            onPress={toggleMenu}
                            style={styles.profileButton}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                            accessibilityLabel="계정 메뉴 열기"
                        >
                            <Ionicons name="person" size={18} color={colors.section} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* 하단: 네비 탭 */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
                {navItems.map((item) => (
                    <NavTab
                        key={item.routeName}
                        item={item}
                        active={currentRouteName === item.routeName}
                        onPress={handleNavigate}
                    />
                ))}
            </ScrollView>

            {!!user && (
                <AccountMenuModal
                    visible={menuVisible}
                    onClose={closeMenu}
                    onLogout={handleSignOut}
                    displayName={user.displayName ?? "로그인 계정"}
                    email={user.email ?? ""}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.select({ ios: 32, android: 16 }),
        paddingBottom: space.sm - 2,
        paddingHorizontal: space.lg,
        backgroundColor: colors.bg,
        zIndex: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    logoText: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.accent,
    },

    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    profileButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.placeholder,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: Platform.select({ ios: space.xs, android: space.sm, default: space.xs }),
    },

    navScroll: {
        marginTop: space.sm,
        paddingBottom: space.xs,
    },
});