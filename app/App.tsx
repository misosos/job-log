// App.tsx

import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { User } from "firebase/auth";
import * as AuthSession from "expo-auth-session";

import { auth } from "./src/libs/firebase";

import { LoginScreen } from "./src/screens/auth/LoginScreen";
import { DashboardScreen } from "./src/screens/dashboard/DashboardScreen";
import { ApplicationsScreen } from "./src/screens/applications/ApplicationsScreen";
import { PlannerScreen } from "./src/screens/planner/PlannerScreen";
import { ResumesScreen } from "./src/screens/resumes/ResumesScreen";
import { InterviewsScreen } from "./src/screens/interviews/InterviewsScreen";

// ✅ 헤더 컴포넌트 임포트
import { PageLayout } from "./src/components/layout/PageLayout";

export type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    Applications: undefined;
    Planner: undefined;
    Resumes: undefined;
    Interviews: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const redirectUri = AuthSession.makeRedirectUri();
console.log("redirectUri >>>", redirectUri);

function AppInner() {
    const [user, setUser] = useState<User | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setCheckingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    if (checkingAuth) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#22C55E" />
                <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator
                    initialRouteName="Dashboard"
                    screenOptions={{
                        contentStyle: { backgroundColor: "#020617" },
                    }}
                >
                    <Stack.Screen
                        name="Dashboard"
                        options={{ title: "대시보드", headerShown: false }}
                    >
                        {() => (
                            <PageLayout>
                                <DashboardScreen />
                            </PageLayout>
                        )}
                    </Stack.Screen>
                    <Stack.Screen
                        name="Applications"
                        options={{ title: "지원 현황", headerShown: false }}
                    >
                        {() => (
                            <PageLayout>
                                <ApplicationsScreen />
                            </PageLayout>
                        )}
                    </Stack.Screen>
                    <Stack.Screen
                        name="Planner"
                        options={{ title: "플래너", headerShown: false }}
                    >
                        {() => (
                            <PageLayout>
                                <PlannerScreen />
                            </PageLayout>
                        )}
                    </Stack.Screen>
                    <Stack.Screen
                        name="Resumes"
                        options={{ title: "이력서 관리", headerShown: false }}
                    >
                        {() => (
                            <PageLayout>
                                <ResumesScreen />
                            </PageLayout>
                        )}
                    </Stack.Screen>
                    <Stack.Screen
                        name="Interviews"
                        options={{ title: "면접 기록", headerShown: false }}
                    >
                        {() => (
                            <PageLayout>
                                <InterviewsScreen />
                            </PageLayout>
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
            ) : (
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "#020617" },
                    }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}

export default function App() {
    return <AppInner />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        backgroundColor: "#020617",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        color: "#E5E7EB",
        fontSize: 13,
    },
});