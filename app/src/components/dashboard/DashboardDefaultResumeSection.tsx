// app/src/components/dashboard/DashboardDefaultResumeSection.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../libs/firebase";
import { SectionCard } from "../common/SectionCard";

type DashboardResume = {
  id: string;
  title: string;
  target: string;
  updatedAt: string;
  note?: string;
  link?: string;
};

type ResumeDoc = {
  title?: string;
  target?: string;
  note?: string;
  link?: string | null;
  updatedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  isDefault?: boolean | null;
};

function formatDate(ts?: Timestamp | null): string {
  if (!ts) return "";
  const date = ts.toDate();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function DashboardDefaultResumeSection() {
  const [defaultResume, setDefaultResume] = useState<DashboardResume | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDefaultResume = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setDefaultResume(null);
        return;
      }

      const colRef = collection(db, "users", user.uid, "resumes");
      // updatedAt 기준으로 정렬해서 불러온 뒤, isDefault === true 인 것만 선택
      const q = query(colRef, orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);

      if (snap.empty) {
        setDefaultResume(null);
        return;
      }

      const targetDoc = snap.docs
        .map((docSnap) => {
          const data = docSnap.data() as ResumeDoc;
          return { id: docSnap.id, data };
        })
        .find(({ data }) => data.isDefault === true);

      if (!targetDoc) {
        setDefaultResume(null);
        return;
      }

      const { id, data } = targetDoc;

      setDefaultResume({
        id,
        title: data.title ?? "",
        target: data.target ?? "",
        note: data.note ?? undefined,
        link: (data.link as string | undefined) ?? undefined,
        updatedAt: formatDate(data.updatedAt ?? data.createdAt ?? null),
      });
    } catch (err) {
      console.error("기본 이력서 불러오기 실패:", err);
      setError("기본 이력서를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDefaultResume();
  }, []);

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("지원하지 않는 URL입니다:", url);
      }
    } catch (e) {
      console.error("링크 열기 실패:", e);
    }
  };

  return (
    <SectionCard title="기본 이력서">
      {loading ? (
        <View style={styles.skeleton} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !defaultResume ? (
        <Text style={styles.emptyText}>
          아직 기본 이력서가 설정되지 않았어요. 이력서 페이지에서 하나를 기본으로
          설정해 보세요.
        </Text>
      ) : (
        <View style={styles.resumeContainer}>
          <View style={styles.textBlock}>
            <Text
              style={styles.title}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {defaultResume.title}
            </Text>
            <Text style={styles.tagline} numberOfLines={2} ellipsizeMode="tail">
              기본 이력서 • 타겟: {defaultResume.target}
            </Text>
            <Text style={styles.updated}>
              마지막 수정: {defaultResume.updatedAt}
            </Text>
            {defaultResume.note ? (
              <Text
                style={styles.note}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                메모: {defaultResume.note}
              </Text>
            ) : null}
          </View>

          {defaultResume.link ? (
            <TouchableOpacity
              onPress={() => void handleOpenLink(defaultResume.link!)}
              style={styles.openButton}
              activeOpacity={0.8}
            >
              <Text style={styles.openButtonText}>열기</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 70,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.7)", // slate-800/60 느낌
  },
  errorText: {
    fontSize: 13,
    color: "#f87171", // red-400
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af", // slate-400
  },
  resumeContainer: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(15,23,42,0.85)", // slate-900/60
    flexDirection: "column", // 모바일에서는 세로 쌓기
  },
  textBlock: {
    width: "100%",
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    color: "#6ee7b7", // emerald-300
  },
  updated: {
    marginTop: 2,
    fontSize: 11,
    color: "#9ca3af", // slate-400
  },
  note: {
    marginTop: 6,
    fontSize: 12,
    color: "#d1d5db", // 조금 더 밝게
  },
  openButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#10b981", // emerald-500
    justifyContent: "center",
    alignItems: "center",
  },
  openButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#020617", // slate-900
  },
});