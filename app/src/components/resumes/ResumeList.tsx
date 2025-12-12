import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import type { ResumeVersion } from "../../../../shared/features/resumes/types";

type ResumeItemProps = {
  resume: ResumeVersion;
  onSetDefault?: (id: string) => void;
};

function ResumeItem({ resume, onSetDefault }: ResumeItemProps) {
  const handleSetDefault = () => {
    if (!onSetDefault) return;
    onSetDefault(resume.id);
  };

  const handleOpenLink = async () => {
    if (!resume.link) return;

    try {
      const supported = await Linking.canOpenURL(resume.link);
      if (supported) {
        await Linking.openURL(resume.link);
      } else {
        console.warn("이 URL을 열 수 없습니다:", resume.link);
      }
    } catch (e) {
      console.warn("링크 열기 실패:", e);
    }
  };

  return (
    <View style={styles.itemContainer}>
      {/* 왼쪽 정보 영역 */}
      <View style={styles.itemLeft}>
        <Text style={styles.title} numberOfLines={1}>
          {resume.title}
        </Text>
        <Text style={styles.target} numberOfLines={1}>
          타겟: {resume.target}
        </Text>
        <Text style={styles.updatedAt}>
          마지막 수정: {resume.updatedAt}
        </Text>
        {resume.note ? (
          <Text style={styles.note} numberOfLines={2}>
            메모: {resume.note}
          </Text>
        ) : null}
      </View>

      {/* 오른쪽 태그 + 열기 / 기본설정 영역 */}
      <View style={styles.itemRight}>
        {resume.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>기본 이력서</Text>
          </View>
        ) : (
          onSetDefault && (
            <TouchableOpacity
              onPress={handleSetDefault}
              style={styles.setDefaultButton}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.setDefaultButtonText}>기본으로 설정</Text>
            </TouchableOpacity>
          )
        )}

        {resume.link ? (
          <TouchableOpacity
            onPress={handleOpenLink}
            style={styles.openButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.openButtonText}>열기</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

type ResumeListProps = {
  resumes: ResumeVersion[];
  loading: boolean;
  onSetDefault?: (id: string) => void;
};

export function ResumeList({
  resumes,
  loading,
  onSetDefault,
}: ResumeListProps) {
  const sortedResumes = useMemo(
    () =>
      [...resumes].sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      ),
    [resumes],
  );

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.skeletonItem}>
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        ))}
      </View>
    );
  }

  if (sortedResumes.length === 0) {
    return (
      <Text style={styles.emptyText}>
        아직 등록된 이력서 버전이 없어요. 위 폼에서 첫 이력서를 추가해 보세요.
      </Text>
    );
  }

  return (
    <View style={styles.listContainer}>
      {sortedResumes.map((resume, index) => (
        <View
          key={resume.id}
          style={[
            styles.listItemWrapper,
            index === sortedResumes.length - 1 && { marginBottom: 0 },
          ]}
        >
          <ResumeItem resume={resume} onSetDefault={onSetDefault} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 8,
  },
  listItemWrapper: {
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.9)", // slate-900/90
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.4)", // indigo-700/40 느낌
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }
      : {
          elevation: 2,
        }),
  },
  itemLeft: {
    flexShrink: 1,
    flex: 1,
    marginRight: 12,
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  target: {
    fontSize: 12,
    color: "#9ca3af", // slate-400
    marginTop: 2,
  },
  updatedAt: {
    fontSize: 11,
    color: "#6b7280", // slate-500
    marginTop: 4,
  },
  note: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },
  defaultBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#10b981", // emerald-500
    marginBottom: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#020617", // slate-900
  },
  setDefaultButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.7)", // emerald-400/70
    marginBottom: 4,
  },
  setDefaultButtonText: {
    fontSize: 11,
    color: "#6ee7b7", // emerald-300
  },
  openButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#10b981",
  },
  openButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#020617",
  },
  skeletonContainer: {
    marginTop: 8,
  },
  skeletonItem: {
    height: 60,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
});