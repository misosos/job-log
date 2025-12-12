// app/screens/resumes/ResumesScreen.tsx

import React, { useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import { useResumesController } from "../../features/resumes/useResumesController";
import { useAuth } from "../../libs/auth-context";

export function ResumesScreen() {
    // 🔹 폼 입력용 로컬 상태
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    const { user } = useAuth();
    const userId = user?.uid ?? "app";

    // 🔹 데이터 로딩/저장/에러는 전부 훅에서 관리
    const {
        resumes,
        loading,
        saving,
        error,
        createResumeVersion,
        setDefaultResumeVersion,
    } = useResumesController(userId);

    const handleCreate = async () => {
        if (!isValid || saving) return;

        await createResumeVersion({
            title,
            target,
            note,
            link,
        });

        // 성공/실패 여부는 훅에서 error로 노출
        // 일단 입력은 초기화해 두자
        setTitle("");
        setTarget("");
        setNote("");
        setLink("");
    };

    const handleSetDefault = async (resumeId: string) => {
        if (saving) return;
        await setDefaultResumeVersion(resumeId);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <SectionCard title="이력서 버전 관리">
                <Text style={styles.description}>
                    회사/직무별로 다른 이력서 버전을 만들고, 공고에 맞게 골라 쓸 수 있어요.
                </Text>

                <ResumeForm
                    title={title}
                    target={target}
                    link={link}
                    note={note}
                    isValid={isValid && !saving}
                    onSubmit={handleCreate}
                    onChangeTitle={setTitle}
                    onChangeTarget={setTarget}
                    onChangeLink={setLink}
                    onChangeNote={setNote}
                />

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.listWrapper}>
                    <ResumeList
                        resumes={resumes}
                        loading={loading}
                        onSetDefault={handleSetDefault}
                    />
                </View>
            </SectionCard>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617", // slate-900 느낌
    },
    content: {
        padding: 16,
    },
    description: {
        fontSize: 13,
        color: "#CBD5F5", // text-slate-300 느낌
        marginBottom: 12,
    },
    error: {
        marginBottom: 8,
        fontSize: 11,
        color: "#FCA5A5", // red-300 정도
    },
    listWrapper: {
        marginTop: 4,
    },
});