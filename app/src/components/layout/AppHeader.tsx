// app/src/components/layout/AppHeader.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

import { auth } from "../../libs/firebase";
import { useAuth } from "../../libs/auth-context";

// App.tsx 에서 쓰는 스택 이름과 맞춰야 함
type RootStackParamList = {
    Dashboard: undefined;
    Applications: undefined;
    Planner: undefined;
    Resumes: undefined;
    Interviews: undefined;
    Login: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type NavItem = {
    label: string;
    routeName: keyof RootStackParamList;
};

const NAV_ITEMS: NavItem[] = [
    { label: "지원 현황", routeName: "Applications" },
    { label: "플래너", routeName: "Planner" },
    { label: "이력서", routeName: "Resumes" },
    { label: "면접 기록", routeName: "Interviews" },
];

export function AppHeader() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { user } = useAuth(); // ✅ 컨텍스트에서 로그인 유저 읽기
    const [menuVisible, setMenuVisible] = useState(false);

    // 유저가 없어지면(로그아웃) 메뉴 자동 닫기
    useEffect(() => {
        if (!user) {
            setMenuVisible(false);
        }
    }, [user]);

    const currentRouteName = route.name as keyof RootStackParamList;

    const toggleMenu = () => {
        setMenuVisible((prev) => !prev);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setMenuVisible(false);
            // 보통은 AuthProvider + App.tsx에서 user null로 바뀌면서
            // 스택이 Login 쪽으로 바뀌기 때문에 이 reset은 없어도 되지만,
            // 혹시 모를 경우를 위해 남겨둘 수 있음
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    const handleLogoPress = () => {
        navigation.navigate("Dashboard");
    };

    const renderNavItem = (item: NavItem) => {
        const isActive = currentRouteName === item.routeName;

        return (
            <TouchableOpacity
                key={item.routeName}
                onPress={() => navigation.navigate(item.routeName)}
                style={styles.navItem}
            >
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {item.label}
                </Text>
                {isActive && <View style={styles.navUnderline} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단: 로고 + 유저정보/아바타 */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={handleLogoPress}>
                    <Text style={styles.logoText}>준로그</Text>
                </TouchableOpacity>

                {user && (
                    <View style={styles.rightContainer}>
                        <TouchableOpacity
                            onPress={toggleMenu}
                            style={styles.profileButton}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="person" size={18} color="#e5e7eb" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* 하단: 네비게이션 탭 (가로 스크롤 가능) */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.navScroll}
            >
                {NAV_ITEMS.map(renderNavItem)}
            </ScrollView>

            {user && (
                <Modal
                    visible={menuVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={closeMenu}
                >
                    <TouchableWithoutFeedback onPress={closeMenu}>
                        <View style={styles.menuOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.menuContainer}>
                                    <View style={styles.menuHeader}>
                                        <Text style={styles.menuName} numberOfLines={1}>
                                            {user.displayName ?? "로그인 계정"}
                                        </Text>
                                        <Text style={styles.menuEmail} numberOfLines={1}>
                                            {user.email}
                                        </Text>
                                    </View>
                                    <View style={styles.menuDivider} />
                                    <TouchableOpacity
                                        onPress={handleSignOut}
                                        style={styles.menuItem}
                                    >
                                        <Text style={styles.menuItemText}>로그아웃</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.select({ ios: 32, android: 16 }),
        paddingBottom: 6,
        paddingHorizontal: 16,
        backgroundColor: "#020617",
        zIndex: 20,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logoText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#a5b4fc",
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#1f2937",
        marginTop: Platform.select({ ios: 4, android: 8, default: 4 }),
    },
    navScroll: {
        marginTop: 8,
        paddingBottom: 4,
    },
    navItem: {
        marginRight: 16,
        alignItems: "center",
        paddingBottom: 2,
    },
    navText: {
        fontSize: 13,
        color: "#9ca3af",
    },
    navTextActive: {
        color: "#22c55e",
        fontWeight: "600",
    },
    navUnderline: {
        marginTop: 2,
        height: 2,
        width: "100%",
        backgroundColor: "#22c55e",
        borderRadius: 999,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.3)",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingTop: Platform.select({ ios: 72, android: 56, default: 56 }),
        paddingRight: 16,
    },
    menuContainer: {
        width: 220,
        borderRadius: 12,
        backgroundColor: "#1f2937",
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 4,
        marginTop: 4,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    menuHeader: {
        paddingVertical: 4,
    },
    menuName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#f9fafb",
    },
    menuEmail: {
        marginTop: 2,
        fontSize: 11,
        color: "#e5e7eb",
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#4b5563",
        marginVertical: 8,
    },
    menuItem: {
        paddingVertical: 6,
    },
    menuItemText: {
        fontSize: 13,
        color: "#e5e7eb",
    },
});