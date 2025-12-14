// App.tsx
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "./src/screens/auth/LoginScreen";
import { DashboardScreen } from "./src/screens/dashboard/DashboardScreen";
import { ApplicationsScreen } from "./src/screens/applications/ApplicationsScreen";
import { PlannerScreen } from "./src/screens/planner/PlannerScreen";
import { ResumesScreen } from "./src/screens/resumes/ResumesScreen";
import { InterviewsScreen } from "./src/screens/interviews/InterviewsScreen";
import { PageLayout } from "./src/components/layout/PageLayout";
import { AuthProvider, useAuth } from "./src/libs/auth-context";

// 앱 쪽 Firebase 인스턴스
import { db, auth } from "./src/libs/firebase";

// shared features API 초기화
import { initApplicationsApi } from "../shared/features/applications/api";
import { initPlannerApi } from "../shared/features/planner/api";
import { initInterviewsApi } from "../shared/features/interviews/api";
import { initResumesApi } from "../shared/features/resumes/api";
import { initEmailAuthApi } from "../shared/features/auth/emailAuthApi";

export type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    Applications: undefined;
    Planner: undefined;
    Resumes: undefined;
    Interviews: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const UI = {
    bg: "#020617",
    spinner: "#22C55E",
    text: "#E5E7EB",
} as const;

// Fast Refresh에서도 1회만 init 되도록 가드
let _apisInited = false;
function initSharedApisOnce() {
    if (_apisInited) return;
    _apisInited = true;

    initApplicationsApi({ db, auth });
    initPlannerApi(db, auth); // 현재 시그니처가 (db, auth)
    initInterviewsApi(db);
    initResumesApi(db);
    initEmailAuthApi(auth);
}

initSharedApisOnce();

// Screen에 PageLayout을 깔끔하게 감싸는 래퍼(렌더 안에서 함수 생성 X)
function withPageLayout<TProps extends object>(
    Screen: React.ComponentType<TProps>,
) {
    return function Wrapped(props: TProps) {
        return (
            <PageLayout>
                <Screen {...props} />
            </PageLayout>
        );
    };
}

const DashboardWithLayout = withPageLayout(DashboardScreen);
const ApplicationsWithLayout = withPageLayout(ApplicationsScreen);
const PlannerWithLayout = withPageLayout(PlannerScreen);
const ResumesWithLayout = withPageLayout(ResumesScreen);
const InterviewsWithLayout = withPageLayout(InterviewsScreen);

function AppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: UI.bg } }}
        >
            <Stack.Screen name="Dashboard" component={DashboardWithLayout} />
            <Stack.Screen name="Applications" component={ApplicationsWithLayout} />
            <Stack.Screen name="Planner" component={PlannerWithLayout} />
            <Stack.Screen name="Resumes" component={ResumesWithLayout} />
            <Stack.Screen name="Interviews" component={InterviewsWithLayout} />
        </Stack.Navigator>
    );
}

function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: UI.bg } }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}

function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={UI.spinner} />
                <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        backgroundColor: UI.bg,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        color: UI.text,
        fontSize: 13,
    },
});