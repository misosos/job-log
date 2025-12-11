// app/screens/resumes/ResumesScreen.tsx (예시 경로)

import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";

import { SectionCard } from "../../components/common/SectionCard";
import { auth } from "../../libs/firebase";
import { ResumeForm } from "../../components/resumes/ResumeForm";
import { ResumeList } from "../../components/resumes/ResumeList";
import type { ResumeVersion } from "../../features/resumes/types";
import {
    createResume,
    fetchResumes,
    setDefaultResume,
} from "../../features/resumes/api";

export function ResumesScreen() {
    const [resumes, setResumes] = useState<ResumeVersion[]>([]);
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [note, setNote] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isValid = title.trim().length > 0 && target.trim().length > 0;

    const loadResumes = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setResumes([]);
                return;
            }

            const rows = await fetchResumes(user.uid);
            setResumes(rows);
        } catch (err) {
            console.error("이력서 버전 불러오기 실패:", err);
            setError("이력서 정보를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadResumes();
    }, []);

    // ✅ RN에서는 FormEvent 사용 X, 그냥 콜백으로 처리
    const handleCreate = async () => {
        if (!isValid) return;

        try {
            const user = auth.currentUser;
            if (!user) {
                setError("로그인이 필요합니다.");
                return;
            }

            await createResume(user.uid, {
                title: title.trim(),
                target: target.trim(),
                note: note.trim() ? note.trim() : undefined,
                link: link.trim() ? link.trim() : undefined,
            });

            setTitle("");
            setTarget("");
            setNote("");
            setLink("");

            await loadResumes();
        } catch (err) {
            console.error("이력서 버전 저장 실패:", err);
            setError("이력서 버전을 저장하는 중 문제가 발생했습니다.");
        }
    };

    const handleSetDefault = async (resumeId: string) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setError("로그인이 필요합니다.");
                return;
            }

            await setDefaultResume(user.uid, resumeId);
            await loadResumes();
        } catch (err) {
            console.error("기본 이력서 설정 실패:", err);
            setError("기본 이력서를 설정하는 중 문제가 발생했습니다.");
        }
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
                    isValid={isValid}
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

export default ResumesScreen;