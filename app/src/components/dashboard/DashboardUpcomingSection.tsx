// app/components/dashboard/DashboardUpcomingSection.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

import { auth, db } from "../../libs/firebase";
import type { InterviewItem } from "../../features/interviews/interviews";

// Firestore 인터뷰 문서 타입
type InterviewDoc = {
  company?: string;
  role?: string;
  type?: string;
  scheduledAt?: Timestamp | null;
};

export function DashboardUpcomingSection() {
  const [items, setItems] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUpcomingInterviews = useCallback(async () => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setItems([]);
        return;
      }

      const now = new Date();
      const nowTs = Timestamp.fromDate(now);

      // users/{uid}/interviews 컬렉션에서
      // 현재 시각 이후(scheduledAt >= now) 면접만 가져오기 (가장 가까운 3개)
      const colRef = collection(db, "users", user.uid, "interviews");
      const q = query(
        colRef,
        where("scheduledAt", ">=", nowTs),
        orderBy("scheduledAt", "asc"),
        limit(3),
      );

      const snap = await getDocs(q);

      const mapped: InterviewItem[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as InterviewDoc;
        const ts = data.scheduledAt ?? null;
        const date = ts ? ts.toDate() : null;

        const month = date ? String(date.getMonth() + 1).padStart(2, "0") : "";
        const day = date ? String(date.getDate()).padStart(2, "0") : "";
        const hours = date ? String(date.getHours()).padStart(2, "0") : "";
        const minutes = date ? String(date.getMinutes()).padStart(2, "0") : "";

        const scheduledAtLabel = date
          ? `${month}.${day} ${hours}:${minutes}`
          : "일정 미정";

        return {
          id: docSnap.id,
          company: data.company ?? "",
          role: data.role ?? "",
          type: data.type,
          scheduledAt: ts,
          scheduledAtLabel,
          status: "예정",
          note: "",
        };
      });

      setItems(mapped);
    } catch (error) {
      console.error("다가오는 면접 불러오기 실패:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUpcomingInterviews();
  }, [loadUpcomingInterviews]);

  const renderItem = ({ item }: { item: InterviewItem }) => (
    <View style={styles.itemRow}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="event" size={18} color="#22c55e" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.timeText} numberOfLines={1}>
          {item.scheduledAtLabel}
        </Text>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.company || "회사 미입력"}
          {item.role ? ` · ${item.role}` : ""}
        </Text>
        <Text style={styles.subText} numberOfLines={1}>
          {item.type ? `${item.type} 면접` : "면접 유형 미입력"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>다가오는 면접</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingText}>면접 일정을 불러오는 중...</Text>
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>
          앞으로 예정된 면접이 없어요.
          {"\n"}
          인터뷰 페이지에서 새로운 면접 일정을 추가해보세요.
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#020617", // slate-950 느낌
    borderWidth: 1,
    borderColor: "#1e293b", // slate-800
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb", // slate-200
    marginBottom: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 12,
    color: "#9ca3af", // slate-400
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#e5e7eb",
  },
  subText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  separator: {
    height: 10,
  },
});