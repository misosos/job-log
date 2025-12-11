// app/src/components/layout/AppHeader.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../libs/firebase";
import { Ionicons } from "@expo/vector-icons";

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
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return unsubscribe;
    }, []);

    const currentRouteName = route.name as keyof RootStackParamList;

    const handleSignOut = async () => {
        try {
            await signOut(auth);
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
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {user.displayName ?? "로그인 계정"}
                            </Text>
                            <Text style={styles.userEmail} numberOfLines={1}>
                                {user.email}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleSignOut}
                            style={styles.profileButton}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.select({ ios: 32, android: 16 }),
        paddingBottom: 6,
        paddingHorizontal: 16,
        backgroundColor: "#020617", // slate-950 느낌
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logoText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#a5b4fc", // 포인트 색
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    userInfo: {
        marginRight: 8,
        maxWidth: 150,
    },
    userName: {
        fontSize: 12,
        color: "#e5e7eb",
    },
    userEmail: {
        fontSize: 10,
        color: "#9ca3af",
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
});