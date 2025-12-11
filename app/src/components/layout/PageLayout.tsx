// src/components/layout/PageLayout.tsx
import React, { type ReactNode } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";

import { AppHeader } from "./AppHeader"; // 헤더 컴포넌트 경로/이름에 맞게 조정

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617", // slate-950
  },
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 16, // py-6 비슷하게
    paddingTop: Platform.select({ ios: 12, android: 8 }),
  },
});