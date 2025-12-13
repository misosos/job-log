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
        backgroundColor: "#fff1f2", // rose-50
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        ...(Platform.OS === "ios"
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.12,
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
        fontWeight: "700",
        color: "#881337", // rose-900
    },
    target: {
        fontSize: 12,
        color: "#9f1239", // rose-800
        opacity: 0.75,
        marginTop: 2,
    },
    updatedAt: {
        fontSize: 11,
        color: "#9f1239", // rose-800
        opacity: 0.55,
        marginTop: 4,
    },
    note: {
        fontSize: 12,
        color: "#9f1239", // rose-800
        opacity: 0.65,
        marginTop: 6,
    },

    // ✅ 기본 뱃지(포인트: rose-500)
    defaultBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#f43f5e", // rose-500
        marginBottom: 4,
    },
    defaultBadgeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#fff1f2", // rose-50
    },

    // ✅ 기본 설정 버튼(라인: rose-200, 포인트 텍스트: rose-500)
    setDefaultButton: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        backgroundColor: "#ffe4e6", // rose-100
        marginBottom: 4,
    },
    setDefaultButtonText: {
        fontSize: 11,
        color: "#f43f5e", // rose-500
        fontWeight: "700",
    },

    // ✅ 열기 버튼(포인트: rose-500)
    openButton: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#f43f5e", // rose-500
    },
    openButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#fff1f2", // rose-50
    },

    skeletonContainer: {
        marginTop: 8,
    },
    skeletonItem: {
        height: 60,
        borderRadius: 10,
        backgroundColor: "#ffe4e6", // rose-100
        borderWidth: 1,
        borderColor: "#fecdd3", // rose-200
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    emptyText: {
        fontSize: 13,
        color: "#9f1239", // rose-800
        opacity: 0.65,
        marginTop: 4,
    },
});